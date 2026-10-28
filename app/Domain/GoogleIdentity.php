<?php

namespace App\Domain;

use App\Models\AuthIdentity;
use App\Models\CmsContent;
use App\Models\Consent;
use App\Models\OwnerSetting;
use App\Models\PatientAccess;
use App\Models\PatientProfile;
use App\Models\User;
use Google\Auth\AccessToken;
use GuzzleHttp\Psr7\Response;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class GoogleIdentity
{
    public function ready(): bool
    {
        return (bool) config('integrations.google.enabled') && is_string(config('integrations.google.client_id')) && str_ends_with(config('integrations.google.client_id'), '.apps.googleusercontent.com');
    }

    public function ui(Request $request): array
    {
        $ready = $this->ready();
        $nonce = null;
        if ($ready && ! $request->user()) {
            if (! $request->session()->has('google_nonce') || $request->session()->get('google_nonce_expires', 0) < time()) {
                $request->session()->put(['google_nonce' => bin2hex(random_bytes(24)), 'google_nonce_expires' => time() + 600]);
            }
            $nonce = $request->session()->get('google_nonce');
        }

        return ['enabled' => $ready, 'client_id' => $ready ? config('integrations.google.client_id') : null, 'nonce' => $nonce, 'auto_select' => ! $request->cookie('google_signed_out'), 'profile_import' => filled(config('integrations.google.client_secret'))];
    }

    public function verify(string $token, string $nonce): array
    {
        Access::check($this->ready(), 'Google SSO memerlukan OAuth Client ID yang sah.');
        try {
            $handler = function ($request, $options) {
                $url = (string) $request->getUri();
                if ($url !== 'https://www.googleapis.com/oauth2/v3/certs') {
                    throw new \RuntimeException('Endpoint kunci tidak sah');
                }$json = Cache::remember('google-signin-jwks-v1', 300, fn () => Http::timeout(10)->acceptJson()->get($url)->throw()->body());

                return new Response(200, ['Content-Type' => 'application/json', 'Cache-Control' => 'public,max-age=300'], $json);
            };
            $claims = (new AccessToken($handler))->verify($token, ['audience' => config('integrations.google.client_id')]);
        } catch (\Throwable) {
            $claims = false;
        }
        Access::check(is_array($claims) && is_string($claims['sub'] ?? null) && filled($claims['sub']) && strlen($claims['sub']) <= 255 && is_numeric($claims['exp'] ?? null) && $claims['exp'] > time() && ($claims['email_verified'] ?? false) === true && is_string($claims['email'] ?? null) && filter_var($claims['email'], FILTER_VALIDATE_EMAIL) && is_string($claims['nonce'] ?? null) && hash_equals($nonce, $claims['nonce']), 'Identitas Google tidak sah atau kedaluwarsa. Coba masuk kembali.');

        return ['sub' => (string) $claims['sub'], 'email' => mb_strtolower($claims['email']), 'name' => mb_substr((string) ($claims['name'] ?? ''), 0, 150)];
    }

    public function prepare(Request $request, array $claims, array $profile = []): array
    {
        $identity = AuthIdentity::where('provider', 'GOOGLE')->where('subject', $claims['sub'])->first();
        if ($identity) {
            $user = User::findOrFail($identity->user_id);
            Access::check($user->status->value === 'ACTIVE', 'Akun ini tidak aktif. Hubungi pengelola.');
            $this->login($request, $user);

            return ['redirect' => route('dashboard')];
        }
        $existing = User::where('email', $claims['email'])->first();
        Access::check(! $existing || $existing->status->value === 'ACTIVE', 'Akun ini tidak aktif. Hubungi pengelola.');
        $request->session()->regenerate();
        $request->session()->put('google_pending', [...$claims, 'profile' => array_intersect_key($profile, array_flip(['phone', 'address'])), 'expires_at' => time() + 600, 'existing_user_id' => $existing?->id]);

        return ['redirect' => url('/auth/google/complete')];
    }

    public function pending(Request $request): array
    {
        $pending = $request->session()->get('google_pending');
        abort_unless(is_array($pending) && ($pending['expires_at'] ?? 0) >= time(), 419, 'Pendaftaran Google kedaluwarsa. Masuk kembali.');

        return $pending;
    }

    public function complete(Request $request, array $input): User
    {
        $pending = $this->pending($request);
        try {
            $user = DB::transaction(function () use ($pending, $input, $request) {
                OwnerSetting::query()->lockForUpdate()->first();
                Access::check(! AuthIdentity::where('provider', 'GOOGLE')->where('subject', $pending['sub'])->exists(), 'Identitas sudah tertaut. Ulangi login Google.');
                if ($pending['existing_user_id']) {
                    $user = User::whereKey($pending['existing_user_id'])->lockForUpdate()->firstOrFail();
                    Access::check($user->status->value === 'ACTIVE' && $user->email === $pending['email'] && filled($user->password_hash) && Hash::check($input['current_password'] ?? '', $user->password_hash), 'Kata sandi akun lama tidak cocok. Gunakan pemulihan kata sandi bila diperlukan.');
                    Access::check(! AuthIdentity::where('user_id', $user->id)->where('provider', 'GOOGLE')->exists(), 'Akun sudah tertaut ke identitas Google lain.');
                } else {
                    Access::check(! User::where('email', $pending['email'])->exists(), 'Email sudah terdaftar saat diproses. Ulangi login Google.');
                    $phone = Phone::normalize($input['phone']);
                    $user = User::create(['name' => $input['name'], 'email' => $pending['email'], 'phone' => $phone]);
                    $user->email_verified_at = now();
                    $user->save();
                    $patient = PatientProfile::create(['full_name' => $input['name'], 'phone' => $phone, 'address' => $input['address']]);
                    PatientAccess::create(['account_user_id' => $user->id, 'patient_id' => $patient->id, 'relationship' => 'SELF', 'verified_by' => $user->id, 'verified_at' => now()]);
                    if ($privacy = CmsContent::where('section_key', 'privacy')->where('status', 'PUBLISHED')->first()) {
                        Consent::create(['patient_id' => $patient->id, 'actor_user_id' => $user->id, 'recorded_by_user_id' => $user->id, 'accepted_by_name_snapshot' => $input['name'], 'document_key' => 'privacy', 'document_version' => $privacy->version, 'cms_content_id' => $privacy->id, 'accepted_at' => now(), 'acceptance_source' => 'SELF', 'ip_address' => $request->ip()]);
                    }
                }
                AuthIdentity::create(['user_id' => $user->id, 'provider' => 'GOOGLE', 'subject' => $pending['sub'], 'linked_at' => now()]);
                Transactions::audit($user, 'google.linked', 'users', $user->id);

                return $user->refresh();
            }, 5);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['email' => 'Akun telah tertaut saat diproses. Ulangi login Google.']);
        }
        $request->session()->forget('google_pending');
        $this->login($request, $user);

        return $user;
    }

    public function login(Request $request, User $user): void
    {
        DB::transaction(function () use ($request, $user) {
            OwnerSetting::query()->lockForUpdate()->first();
            $current = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            Access::check($current->status->value === 'ACTIVE', 'Akun ini tidak aktif.');
            $current->last_login_at = now();
            $current->save();
            Auth::guard('web')->setRememberDuration(43200);
            Auth::login($current,true);
            $request->session()->regenerate();
            $request->session()->put('auth_version',$current->auth_version);
        }, 5);
    }
}
