<?php

namespace App\Models\Concerns;

use App\Exceptions\StaleDomainRecord;
use Illuminate\Database\Eloquent\Builder;

trait UsesRowVersion
{
    public static function bootUsesRowVersion(): void
    {
        static::creating(function ($model): void {
            $model->setAttribute('row_version', 1);
        });
    }

    protected function performUpdate(Builder $query)
    {
        if ($this->fireModelEvent('updating') === false) {
            return false;
        }

        if (! $this->isDirty()) {
            return true;
        }

        $expected = (int) $this->getRawOriginal('row_version');
        if ($expected < 1) {
            throw new StaleDomainRecord;
        }

        if ($this->usesTimestamps()) {
            $this->updateTimestamps();
        }
        $this->setAttribute('row_version', $expected + 1);

        $affected = $this->setKeysForSaveQuery($query)
            ->where('row_version', $expected)->update($this->getDirtyForUpdate());
        if ($affected !== 1) {
            throw new StaleDomainRecord;
        }

        $this->refreshSavedAttributes();
        $this->syncChanges();
        $this->fireModelEvent('updated', false);

        return true;
    }
}
