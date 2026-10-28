<?php

namespace App\Enums;

enum InvoiceKind: string
{
    case Base = 'BASE';
    case Addendum = 'ADDENDUM';
    case Adjustment = 'ADJUSTMENT';
}
