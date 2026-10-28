<?php

namespace App\Enums;

enum PatientRelationship: string
{
    case Self = 'SELF';
    case Parent = 'PARENT';
    case Responsible = 'RESPONSIBLE';
    case Other = 'OTHER';
}
