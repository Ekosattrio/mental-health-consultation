<?php

namespace App\Models;

use App\Enums\ExportKind;
use App\Enums\ExportStatus;
use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** export_jobs: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class ExportJob extends DomainModel
{
    protected $attributes = ['status' => 'QUEUED', 'row_version' => 1];

    protected $table = 'export_jobs';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected $hidden = ['dataset_snapshot'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'kind' => ExportKind::class,
            'filters' => 'array',
            'as_of' => 'immutable_datetime',
            'dataset_snapshot' => 'array',
            'status' => ExportStatus::class,
            'expires_at' => 'immutable_datetime',
        ];
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(PrivateFile::class, 'file_id');
    }
}
