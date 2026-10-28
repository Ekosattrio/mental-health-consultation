<?php

namespace App\Enums;

enum AllocationEntryType: string
{
    case Allocation = 'ALLOCATION';
    case Reversal = 'REVERSAL';
}
