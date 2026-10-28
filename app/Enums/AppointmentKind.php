<?php

namespace App\Enums;

enum AppointmentKind: string
{
    case StandardService = 'STANDARD_SERVICE';
    case Custom = 'CUSTOM';
}
