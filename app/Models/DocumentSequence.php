<?php

namespace App\Models;

use App\Enums\DocumentKind;
use App\Models\Concerns\DomainModel;

/** document_sequences: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class DocumentSequence extends DomainModel
{
    protected $attributes = ['next_value' => 1, 'row_version' => 1];

    protected $table = 'document_sequences';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'document_kind' => DocumentKind::class,
            'local_date' => 'immutable_date',
            'next_value' => 'integer',
        ];
    }
}
