<?php

namespace App\Http\Controllers\Auth;

use App\Domain\Access;
use App\Domain\GoogleIdentity;
use App\Domain\Phone;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

final class GoogleController extends Controller
{
    public function credential(Request $request, GoogleIdentity $google): mixed
    {
        $input = $request->validate(['credential' => 'required|string|max:16000']);
        $nonce = $request->session()->get('google_nonce');
        Access::check(is_string($nonce) && $request->session()->get('google_nonce_expires', 0) >= time(), 'Sesi Google kedaluwarsa. Muat ulang halaman.');
        $claims = $google->verify($input['credential'], $nonce);
        $request->session()->forget(['google_nonce', 'google_nonce_expires']);

        return response()->json(['data' => $google->prepare($request, $claims)])->withoutCookie('google_signed_out');
    }

    public function form(Request $request, GoogleIdentity $google): mixed
    {
        $pending = $google->pending($request);

        return Inertia::render('Auth/GoogleComplete', ['identity' => ['email' => $pending['email'], 'name' => $pending['name'], 'phone' => $pending['profile']['phone'] ?? '', 'address' => $pending['profile']['address'] ?? '', 'link_existing' => (bool) $pending['existing_user_id'], 'profile_import' => filled(config('integrations.google.client_secret'))]]);
    }

    public function complete(Request $request, GoogleIdentity $google): mixed
    {
        $pending = $google->pending($request);
        $input = $request->validate($pending['existing_user_id'] ? ['current_password' => 'required|string|max:255'] : ['name' => 'required|string|max:150', 'phone' => 'required|string|max:25', 'address' => 'required|string|max:1000', 'privacy_accepted' => 'accepted', 'role' => 'prohibited']);
        $google->complete($request, $input);

        return redirect()->route('dashboard')->withoutCookie('google_signed_out');
    }

    public function redirect(Request $request, GoogleIdentity $google): mixed
    {
        if (! $google->ready() || ! filled(config('integrations.google.client_secret'))) {
            return redirect()->route('login')->withErrors(['email' => 'Konfigurasi OAuth Google belum lengkap. Isi Client ID/Secret di konfigurasi privat.']);
        }
        $details = $request->boolean('details');
        $state = bin2hex(random_bytes(24));
        $nonce = bin2hex(random_bytes(24));
        $verifier = bin2hex(random_bytes(32));
        $request->session()->put('google_oauth', ['state' => $state, 'nonce' => $nonce, 'verifier' => $verifier, 'expires_at' => time() + 600, 'details' => $details]);
        $params = ['client_id' => config('integrations.google.client_id'), 'redirect_uri' => route('google.callback'), 'response_type' => 'code', 'scope' => 'openid email profile'.($details ? ' https://www.googleapis.com/auth/user.phonenumbers.read https://www.googleapis.com/auth/user.addresses.read' : ''), 'state' => $state, 'nonce' => $nonce, 'code_challenge' => rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '='), 'code_challenge_method' => 'S256'];

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query($params));
    }

    public function callback(Request $request, GoogleIdentity $google): mixed
    {
        $oauth = $request->session()->pull('google_oauth');
        Access::check(is_array($oauth) && $oauth['expires_at'] >= time() && is_string($request->query('state')) && hash_equals($oauth['state'], $request->query('state')), 'State OAuth tidak sah. Mulai kembali dari login.');
        if ($request->has('error')) {
            return redirect()->route('login')->withErrors(['email' => 'Izin Google dibatalkan. Login biasa tetap tersedia.']);
        }$request->validate(['code' => 'required|string|max:4000']);
        try {
            $token = Http::asForm()->timeout(15)->post('https://oauth2.googleapis.com/token', ['grant_type' => 'authorization_code', 'code' => $request->query('code'), 'client_id' => config('integrations.google.client_id'), 'client_secret' => config('integrations.google.client_secret'), 'redirect_uri' => route('google.callback'), 'code_verifier' => $oauth['verifier']])->throw()->json();
        } catch (\Throwable) {
            return redirect()->route('login')->withErrors(['email' => 'Google belum dapat dihubungi. Coba kembali.']);
        }
        $claims = $google->verify($token['id_token'] ?? '', $oauth['nonce']);
        $profile = [];
        if ($oauth['details'] && ! empty($token['access_token'])) {
            try {
                $person = Http::withToken($token['access_token'])->timeout(10)->get('https://people.googleapis.com/v1/people/me', ['personFields' => 'phoneNumbers,addresses', 'sources' => 'READ_SOURCE_TYPE_PROFILE'])->throw()->json();
                $phone = collect($person['phoneNumbers'] ?? [])->firstWhere('metadata.primary', true) ?? ($person['phoneNumbers'][0] ?? []);
                try {
                    $profile['phone'] = Phone::normalize($phone['canonicalForm'] ?? $phone['value'] ?? null);
                } catch (\Throwable) {
                }$address = collect($person['addresses'] ?? [])->firstWhere('metadata.primary', true) ?? ($person['addresses'][0] ?? []);
                $profile['address'] = mb_substr((string) ($address['formattedValue'] ?? ''), 0, 1000);
            } catch (\Throwable) {/* Optional profile data never blocks login. */
            }
        }
        $result = $google->prepare($request, $claims, $profile);

        return redirect($result['redirect'])->withoutCookie('google_signed_out');
    }
}
