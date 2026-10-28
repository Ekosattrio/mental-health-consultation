<?php

namespace App\Enums;

enum RescheduleStatus: string
{
    case Requested = 'REQUESTED';
    case Approved = 'APPROVED';
    case SlotSelectionRequired = 'SLOT_SELECTION_REQUIRED';
    case Applied = 'APPLIED';
    case Rejected = 'REJECTED';
    case Expired = 'EXPIRED';
    case Cancelled = 'CANCELLED';
}
