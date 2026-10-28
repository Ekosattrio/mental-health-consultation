<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Concerns\HasDomainIdentity;
use App\Models\Concerns\UsesRowVersion;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password_hash', 'phone'])]
#[Hidden(['password_hash', 'remember_token'])]
class User extends Authenticatable
{
    protected $attributes = ['role' => 'PATIENT', 'status' => 'ACTIVE', 'row_version' => 1, 'auth_version' => 1];

    /** @use HasFactory<UserFactory> */
    use HasDomainIdentity, HasFactory, Notifiable, UsesRowVersion;

    protected function email(): Attribute
    {
        return Attribute::make(set: fn (?string $value) => filled($value) ? mb_strtolower(trim($value)) : null);
    }

    public function patientAccesses(): HasMany
    {
        return $this->hasMany(PatientAccess::class, 'account_user_id');
    }

    public function authIdentities(): HasMany
    {
        return $this->hasMany(AuthIdentity::class, 'user_id');
    }

    public function bookedAppointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'booked_by_user_id');
    }

    public function practiceAppointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'psychologist_id');
    }

    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    public function getAuthPassword(): string
    {
        // Laravel's recaller requires a string, including for Google-only users.
        // An empty hash is rejected by the password hasher; it is not a password.
        return $this->password_hash ?? '';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
            'role' => UserRole::class,
            'status' => UserStatus::class,
            'row_version' => 'integer',
            'auth_version' => 'integer',
            'last_login_at' => 'datetime',
        ];
    }
}
