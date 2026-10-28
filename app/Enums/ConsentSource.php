<?php

namespace App\Enums;

enum ConsentSource: string
{
    case Self = 'SELF';
    case AssistedOffline = 'ASSISTED_OFFLINE';
}
