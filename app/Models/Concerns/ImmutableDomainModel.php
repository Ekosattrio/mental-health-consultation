<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use LogicException;

abstract class ImmutableDomainModel extends Model
{
    use ChecksDomainRelations, HasDomainIdentity;

    public const UPDATED_AT = null;

    protected static function booted(): void
    {
        static::updating(function (): never {
            throw new LogicException('Record terbit bersifat immutable; tambahkan koreksi/revisi baru.');
        });
        static::deleting(function (): never {
            throw new LogicException('Histori domain bersifat append-only dan tidak dihapus.');
        });
    }
}
