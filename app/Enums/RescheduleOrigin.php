<?php

namespace App\Enums;

enum RescheduleOrigin: string
{
    case Patient = 'PATIENT';
    case Clinic = 'CLINIC';
    case Owner = 'OWNER';
}
