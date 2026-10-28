<?php

namespace App\Models;

use App\Models\Concerns\DomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** tutorial_progress: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class TutorialProgress extends DomainModel
{
    protected $attributes = ['last_step' => 0, 'row_version' => 1];

    protected $table = 'tutorial_progress';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'row_version' => 'integer',
            'last_step' => 'integer',
            'completed_at' => 'immutable_datetime',
            'skipped_at' => 'immutable_datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tutorialContent(): BelongsTo
    {
        return $this->belongsTo(TutorialContent::class, 'tutorial_content_id');
    }
}
