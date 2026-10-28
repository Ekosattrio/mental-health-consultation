<?php

namespace App\Enums;

enum BookingSource: string
{
    case PatientOnline = 'PATIENT_ONLINE';
    case AdminWalkIn = 'ADMIN_WALK_IN';
    case AdminAssisted = 'ADMIN_ASSISTED';
    case OwnerExternal = 'OWNER_EXTERNAL';
}
