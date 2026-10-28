<?php

namespace App\Models;

use App\Enums\PretestStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** pretest_submissions: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PretestSubmission extends DomainModel
{
    protected $attributes = ['status' => 'DRAFT', 'row_version' => 1];

    protected $table = 'pretest_submissions';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['answers'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'status' => PretestStatus::class,
            'answers' => 'encrypted:array',
            'submitted_at' => 'immutable_datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(PatientProfile::class, 'patient_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(PretestTemplate::class, 'template_id');
    }

    public function authorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_user_id');
    }

    public function supersedes(): BelongsTo
    {
        return $this->belongsTo(PretestSubmission::class, 'supersedes_id');
    }

    public function pretestSubmissions(): HasMany
    {
        return $this->hasMany(PretestSubmission::class, 'supersedes_id');
    }
}
