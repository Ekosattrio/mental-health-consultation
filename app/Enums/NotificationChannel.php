<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case InApp = 'IN_APP';
    case Whatsapp = 'WHATSAPP';
    case Email = 'EMAIL';
}
