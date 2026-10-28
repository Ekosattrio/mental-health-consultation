<?php

namespace App\Enums;

enum PatientAccessStatus: string
{
    case Active = 'ACTIVE';
    case Revoked = 'REVOKED';
}
