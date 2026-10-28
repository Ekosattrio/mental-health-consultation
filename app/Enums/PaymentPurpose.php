<?php

namespace App\Enums;

enum PaymentPurpose: string
{
    case Dp = 'DP';
    case Settlement = 'SETTLEMENT';
    case AddOn = 'ADD_ON';
    case Correction = 'CORRECTION';
}
