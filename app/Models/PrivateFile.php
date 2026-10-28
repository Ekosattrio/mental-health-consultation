<?php

namespace App\Models;

use App\Enums\PrivateFilePurpose;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** private_files: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class PrivateFile extends DomainModel
{
    protected $attributes = ['row_version' => 1];

    protected $table = 'private_files';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['storage_key', 'checksum_sha256'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'size_bytes' => 'integer',
            'uploaded_at' => 'immutable_datetime',
            'expires_at' => 'immutable_datetime',
            'purged_at' => 'immutable_datetime',
            'purpose' => PrivateFilePurpose::class,
        ];
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function paymentProofs(): HasMany
    {
        return $this->hasMany(PaymentProof::class, 'file_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'attachment_file_id');
    }

    public function exportJobs(): HasMany
    {
        return $this->hasMany(ExportJob::class, 'file_id');
    }
}
