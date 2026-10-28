<?php

namespace App\Enums;

enum InitialPaymentMode: string
{
    case Fixed = 'FIXED';
    case Percent = 'PERCENT';
}
