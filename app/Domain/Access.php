<?php

namespace App\Domain;

use App\Enums\UserRole;
use App\Models\PatientAccess;
use App\Models\User;
use Illuminate\Validation\ValidationException;

final class Access
{
    public static function staff(User $user): bool
    {
        return in_array($user->role, [UserRole::Admin, UserRole::Superadmin], true);
    }

    public static function requireStaff(User $user): void
    {
        abort_unless(self::staff($user), 403);
    }

    public static function requireOwner(User $user): void
    {
        abort_unless($user->role === UserRole::Superadmin, 403);
    }

    public static function requireCashier(User $user): void
    {
        abort_unless($user->role === UserRole::Admin, 403);
    }

    public static function patient(User $user, string $patient): void
    {
        abort_unless(self::staff($user) || PatientAccess::where('account_user_id', $user->id)->where('patient_id', $patient)->where('status', 'ACTIVE')->exists(), 404);
    }

    public static function check(bool $condition, string $message, string $field = 'action'): void
    {
        if (! $condition) {
            throw ValidationException::withMessages([$field => $message]);
        }
    }
}
