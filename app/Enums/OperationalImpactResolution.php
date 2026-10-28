<?php

namespace App\Enums;

enum OperationalImpactResolution: string
{
    case Pending = 'PENDING';
    case Rescheduled = 'RESCHEDULED';
    case Cancelled = 'CANCELLED';
    case OwnerResolved = 'OWNER_RESOLVED';
}
