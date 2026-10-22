<?php

namespace App\Enums;

enum UserRole: string
{
    case Patient = 'PATIENT';
    case Admin = 'ADMIN';
    case Superadmin = 'PSYCHOLOGIST';
}
