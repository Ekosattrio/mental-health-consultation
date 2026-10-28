<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Administration;
use App\Domain\Phone;
use App\Domain\Transactions;
use App\Models\CmsContent;
use App\Models\ConsultationPackage;
use App\Models\OwnerSetting;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

final class ManagementController extends DomainController
{
    public function package(Request $request): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['package_id' => 'nullable|uuid', 'service_code' => 'required_without:package_id|nullable|regex:/^[A-Z][A-Z0-9_]{2,79}$/', 'category' => 'required_without:package_id|nullable|in:COUNSELING,ASSESSMENT,PSYCHOTHERAPY', 'name' => 'required|string|max:180', 'description' => 'required|string|max:5000',
            'delivery_mode' => 'required|in:OFFLINE,TELE_SERVICE', 'duration_minutes' => 'nullable|integer|min:1|max:480', 'normal_price' => 'required|integer|min:1|max:1000000000', 'promo_price' => 'nullable|integer|min:1|max:1000000000', 'promo_starts_at' => 'nullable|date', 'promo_ends_at' => 'nullable|date',
            'additional_time_price_basis' => 'nullable|in:NORMAL_PRICE,FINAL_PRICE', 'benefits' => 'required|array|max:30', 'benefits.*' => 'string|max:300', 'is_bookable' => 'required|boolean', 'reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'catalog.version', $input, function () use ($request, $input) {
            OwnerSetting::query()->lockForUpdate()->firstOrFail();

            return ['id' => app(Administration::class)->package($request->user(), $input)->id];
        });
    }

    public function togglePackage(Request $request, string $package): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['is_active' => 'required|boolean', 'expected_version' => 'required|integer|min:1', 'reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'catalog.toggle.'.$package, $input, function () use ($request, $package, $input) {
            $record = ConsultationPackage::whereKey($package)->lockForUpdate()->firstOrFail();
            $this->version($record, $input['expected_version']);
            $record->update(['is_active' => $input['is_active']]);
            Transactions::audit($request->user(), 'catalog.toggle', 'consultation_packages', $package, [], $input['reason']);

            return ['id' => $package];
        });
    }

    private function calendarRules(): array
    {
        return ['calendar_version_id' => 'required|uuid', 'reason' => 'required|string|min:3|max:500', 'preview_token' => 'sometimes|string|max:128', 'weekly' => 'required|array|size:7', 'weekly.*.day_of_week' => 'required|integer|min:1|max:7',
            'weekly.*.daily_limit' => 'required|integer|min:0|max:100', 'weekly.*.intervals' => 'required|array|max:8', 'weekly.*.intervals.*' => 'array|size:2', 'weekly.*.intervals.*.*' => 'string|max:5',
            'overrides' => 'sometimes|array|max:366', 'overrides.*.local_date' => 'required|date_format:Y-m-d|after_or_equal:'.CarbonImmutable::now('Asia/Jakarta')->toDateString().'', 'overrides.*.mode' => 'required|in:OPEN,CLOSED', 'overrides.*.daily_limit' => 'required|integer|min:0|max:100',
            'overrides.*.intervals' => 'required|array|max:8', 'overrides.*.intervals.*' => 'array|size:2', 'overrides.*.intervals.*.*' => 'string|max:5', 'overrides.*.reason' => 'required|string|max:500'];
    }

    public function calendarPreview(Request $request): mixed
    {
        Access::requireStaff($request->user());

        return response()->json(['data' => app(Administration::class)->calendar($request->user(), $request->validate($this->calendarRules()))]);
    }

    public function calendarApply(Request $request): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate([...$this->calendarRules(), 'preview_token' => 'required|string']);

        return $this->execute($request, 'calendar.apply', $input, function () use ($request, $input) {
            OwnerSetting::query()->lockForUpdate()->firstOrFail();

            return app(Administration::class)->calendar($request->user(), $input, true);
        });
    }

    public function cms(Request $request): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['section_key' => 'required|string|max:80', 'payload' => 'required|array|max:50', 'publish' => 'required|boolean', 'expected_published_id' => 'present|nullable|uuid']);
        Access::check(strlen(json_encode($input['payload'])) <= 100000, 'Konten terlalu besar.');

        return $this->execute($request, 'cms.version', $input, function () use ($request, $input) {
            OwnerSetting::query()->lockForUpdate()->firstOrFail();

            return ['id' => app(Administration::class)->cms($request->user(), $input)->id];
        });
    }

    public function preview(Request $request, string $cms): mixed
    {
        Access::requireStaff($request->user());
        $content = CmsContent::findOrFail($cms);
        if ($content->section_key === 'landing') {
            return app(HomeController::class)->preview($content);
        }

        return Inertia::render('Practice/ContentPreview', ['content' => ['section_key' => $content->section_key, 'version' => $content->version, 'payload' => $content->payload, 'status' => $content->status]]);
    }

    public function publish(Request $request, string $cms): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['expected_published_id' => 'present|nullable|uuid']);

        return $this->execute($request, 'cms.publish.'.$cms, $input, function () use ($request, $cms, $input) {
            OwnerSetting::query()->lockForUpdate()->firstOrFail();
            $record = CmsContent::findOrFail($cms);

            return ['id' => app(Administration::class)->cms($request->user(), [...$input, 'section_key' => $record->section_key, 'payload' => $record->payload, 'publish' => true])->id];
        });
    }

    public function settings(Request $request): mixed
    {
        Access::requireOwner($request->user());
        $input = $request->validate(['expected_version' => 'required|integer|min:1', 'practice_identity' => 'required|array|max:20', 'practice_identity.*' => 'nullable|string|max:1000',
            'initial_payment_mode' => 'required|in:PERCENT,FIXED', 'initial_payment_fixed_amount' => 'required|integer|min:1|max:1000000000', 'initial_payment_basis_points' => 'required|integer|min:1|max:10000',
            'grace_minutes' => 'required|integer|min:1|max:120', 'selection_window_hours' => 'required|integer|min:1|max:168', 'proof_correction_hours' => 'required|integer|min:1|max:72', 'reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'settings.update', $input, function () use ($request, $input) {
            $settings = OwnerSetting::query()->lockForUpdate()->firstOrFail();
            $this->version($settings, $input['expected_version']);
            $reason = $input['reason'];
            $input['practice_identity'] = array_replace($settings->practice_identity ?? [], $input['practice_identity']);
            unset($input['reason'],$input['expected_version']);
            $settings->update($input);
            Transactions::audit($request->user(), 'settings.update', 'owner_settings', $settings->id, [], $reason);

            return ['id' => $settings->id];
        });
    }

    public function user(Request $request, ?string $user = null): mixed
    {
        Access::requireOwner($request->user());
        $rules = $user ? ['name' => 'required|string|max:150', 'status' => 'required|in:ACTIVE,BLOCKED', 'expected_version' => 'required|integer|min:1', 'reason' => 'required|string|min:3|max:500'] :
            ['name' => 'required|string|max:150', 'email' => 'required|email|max:254|unique:users,email', 'phone' => 'nullable|string|max:25', 'password' => ['required', Password::min(12)->mixedCase()->numbers()]];
        $input = $request->validate($rules);

        return $this->execute($request, 'users.save.'.($user ?? 'new'), $input, function () use ($request, $user, $input) {
            if ($user) {
                $record = User::whereKey($user)->lockForUpdate()->firstOrFail();
                Access::check($record->role->value !== 'PSYCHOLOGIST', 'Owner tunggal tidak dapat dinonaktifkan di sini.');
                $this->version($record, $input['expected_version']);
                $record->forceFill(['name' => $input['name'], 'status' => $input['status'], 'auth_version' => $record->auth_version + 1, 'remember_token' => Str::random(60)])->save();
                DB::table('sessions')->where('user_id', $record->id)->delete();
            } else {
                $record = new User;
                $record->forceFill(['name' => $input['name'], 'email' => $input['email'], 'phone' => $input['phone'] ?? null, 'password_hash' => $input['password'], 'role' => 'ADMIN'])->save();
            }
            Transactions::audit($request->user(), 'user.admin', 'users', $record->id, [], $input['reason'] ?? null);

            return ['id' => $record->id];
        });
    }

    public function account(Request $request): mixed
    {
        $input = $request->validate(['name' => 'required|string|max:150', 'phone' => 'nullable|string|max:25', 'email' => 'required|email|max:254|unique:users,email,'.$request->user()->id, 'current_password' => 'nullable|string', 'password' => ['nullable', 'confirmed', Password::min(12)->mixedCase()->numbers()], 'revoke_sessions' => 'sometimes|boolean', 'expected_version' => 'required|integer|min:1']);

        return $this->execute($request, 'account.update', $input, function () use ($request, $input) {
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $this->version($user, $input['expected_version']);
            $sensitive = $input['email'] !== $user->email || filled($input['password'] ?? null) || ($input['revoke_sessions'] ?? false);
            if ($sensitive) {
                Access::check(Hash::check($input['current_password'] ?? '', $user->password_hash ?? ''), 'Kata sandi sekarang tidak cocok.');
            }
            $phone = Phone::normalize($input['phone'] ?? null);
            if ($phone !== $user->phone) {
                Transactions::audit($user, 'account.contact_changed', 'users', $user->id);
            }
            $user->fill(['name' => $input['name'], 'phone' => $phone, 'email' => $input['email']]);
            if (filled($input['password'] ?? null)) {
                $user->password_hash = $input['password'];
            }
            if ($sensitive) {
                $user->auth_version++;
                $user->remember_token = Str::random(60);
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }
            $user->save();
            $request->session()->put('auth_version', $user->auth_version);

            return ['id' => $user->id];
        });
    }
}
