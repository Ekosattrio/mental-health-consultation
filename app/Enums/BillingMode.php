<?php

namespace App\Enums;

enum BillingMode: string
{
    case PerAppointment = 'PER_APPOINTMENT';
    case PerPackage = 'PER_PACKAGE';
    case PerSession = 'PER_SESSION';
}
