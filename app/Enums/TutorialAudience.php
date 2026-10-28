<?php

namespace App\Enums;

enum TutorialAudience: string
{
    case Guest = 'GUEST';
    case Patient = 'PATIENT';
    case Admin = 'ADMIN';
    case Psychologist = 'PSYCHOLOGIST';
}
