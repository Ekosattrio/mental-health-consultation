<?php

namespace App\Enums;

enum BillingLineKind: string
{
    case BaseService = 'BASE_SERVICE';
    case GlobalPromo = 'GLOBAL_PROMO';
    case PersonalDiscount = 'PERSONAL_DISCOUNT';
    case AdditionalTime = 'ADDITIONAL_TIME';
    case FormalReport = 'FORMAL_REPORT';
    case CustomCharge = 'CUSTOM_CHARGE';
    case Correction = 'CORRECTION';
}
