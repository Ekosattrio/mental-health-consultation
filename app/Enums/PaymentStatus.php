<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PendingVerification = 'PENDING_VERIFICATION';
    case PendingReconciliation = 'PENDING_RECONCILIATION';
    case Verified = 'VERIFIED';
    case Rejected = 'REJECTED';
}
