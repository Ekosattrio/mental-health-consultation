<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

trait HasDomainIdentity
{
    use HasUuids;

    public function newUniqueId(): string
    {
        return (string) Str::uuid();
    }

    public function getDateFormat(): string
    {
        return 'Y-m-d H:i:s.u';
    }
}
