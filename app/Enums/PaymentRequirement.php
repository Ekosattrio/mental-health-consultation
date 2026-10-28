<?php

namespace App\Enums;

enum PaymentRequirement: string
{
    case Required = 'REQUIRED';
    case Included = 'INCLUDED';
    case NotRequired = 'NOT_REQUIRED';
}
