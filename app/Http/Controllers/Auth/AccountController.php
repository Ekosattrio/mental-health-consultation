<?php

namespace App\Http\Controllers\Auth;

use App\Domain\Transactions;
use App\Http\Controllers\Controller;
use App\Models\CmsContent;
use App\Models\Consent;
use App\Models\PatientAccess;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

final class AccountController extends Controller
{
    public function registerForm(): mixed
    {
        return Inertia::render('Auth/Account', ['mode' => 'register']);
    }

    public function forgotForm(): mixed
    {
        return Inertia::render('Auth/Account', ['mode' => 'forgot']);
    }

    public function resetForm(Request $request, string $token): mixed
    {
        return Inertia::render('Auth/Account', ['mode' => 'reset', 'token' => $token, 'email' => $request->query('email', '')]);
    }

    public function register(Request $request): mixed
    {
        $input = $request->validate(['name' => 'required|string|max:150', 'email' => 'required|email|max:254|unique:users,email', 'phone' => 'required|string|max:25', 'password' => ['required', 'confirmed', PasswordRule::min(12)->mixedCase()->numbers()],
            'role' => 'prohibited', 'status' => 'prohibited', 'privacy_accepted' => 'accepted']);
        try {
            $user = DB::transaction(function () use ($input) {
                $user = User::create(['name' => $input['name'], 'email' => $input['email'], 'phone' => $input['phone'], 'password_hash' => $input['password']]);
                $profile = PatientProfile::create(['full_name' => $input['name'], 'phone' => $input['phone']]);
                PatientAccess::create(['account_user_id' => $user->id, 'patient_id' => $profile->id, 'relationship' => 'SELF', 'verified_by' => $user->id, 'verified_at' => now()]);
                $privacy = CmsContent::where('section_key', 'privacy')->where('status', 'PUBLISHED')->first();
                if ($privacy) {
                    Consent::create(['patient_id' => $profile->id, 'actor_user_id' => $user->id, 'accepted_by_name_snapshot' => $input['name'], 'recorded_by_user_id' => $user->id, 'document_key' => 'privacy', 'document_version' => $privacy->version, 'accepted_at' => now(), 'acceptance_source' => 'SELF', 'ip_address' => request()->ip(), 'cms_content_id' => $privacy->id]);
                }
                Transactions::audit($user, 'account.register', 'users', $user->id);

                return $user->refresh();
            });
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['email' => 'Email sudah digunakan. Silakan masuk atau gunakan email lain.']);
        }
        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put('auth_version', $user->auth_version);

        return redirect()->route('dashboard');
    }

    public function forgot(Request $request): mixed
    {
        $request->validate(['email' => 'required|email|max:254']);
        Password::sendResetLink($request->only('email'));

        return back()->with('status', 'Jika akun terdaftar, petunjuk reset dikirim melalui email.');
    }

    public function reset(Request $request): mixed
    {
        $input = $request->validate(['email' => 'required|email', 'token' => 'required|string', 'password' => ['required', 'confirmed', PasswordRule::min(12)->mixedCase()->numbers()]]);
        $status = Password::reset($input, function (User $user, string $password) {
            $user->forceFill(['password_hash' => Hash::make($password), 'auth_version' => $user->auth_version + 1, 'remember_token' => Str::random(60)])->save();
            DB::table('sessions')->where('user_id', $user->id)->delete();
        });

        return $status === Password::PASSWORD_RESET ? redirect()->route('login')->with('status', 'Kata sandi diperbarui. Silakan masuk kembali.') : back()->withErrors(['email' => 'Token tidak valid atau kedaluwarsa.']);
    }
}
