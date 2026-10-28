<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use LogicException;

abstract class DomainModel extends Model
{
    use ChecksDomainRelations, HasDomainIdentity, UsesRowVersion;

    protected static function booted(): void
    {
        static::deleting(function (): never {
            throw new LogicException('Data domain tidak dihapus permanen. Gunakan status/kejadian koreksi.');
        });
    }
}
