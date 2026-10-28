<?php

namespace App\Enums;

enum CollectionStatus: string
{
    case Open = 'OPEN';
    case ClosedPaid = 'CLOSED_PAID';
    case ClosedUnserved = 'CLOSED_UNSERVED';
}
