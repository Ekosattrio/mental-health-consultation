<?php

namespace App\Enums;

enum PrivateFilePurpose: string
{
    case PaymentProof = 'PAYMENT_PROOF';
    case Expense = 'EXPENSE';
    case Export = 'EXPORT';
}
