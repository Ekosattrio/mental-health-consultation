<?php

namespace App\Enums;

enum TreatmentPlanStatus: string
{
    case Active = 'ACTIVE';
    case AwaitingSettlement = 'AWAITING_SETTLEMENT';
    case Completed = 'COMPLETED';
    case Discontinued = 'DISCONTINUED';
}
