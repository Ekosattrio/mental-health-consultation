<?php

namespace App\Enums;

enum PaymentEntryType: string
{
    case Receipt = 'RECEIPT';
    case Reversal = 'REVERSAL';
}
