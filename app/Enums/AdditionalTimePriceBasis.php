<?php

namespace App\Enums;

enum AdditionalTimePriceBasis: string
{
    case NormalPrice = 'NORMAL_PRICE';
    case FinalPrice = 'FINAL_PRICE';
}
