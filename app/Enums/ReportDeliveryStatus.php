<?php

namespace App\Enums;

enum ReportDeliveryStatus: string
{
    case Requested = 'REQUESTED';
    case Ready = 'READY';
    case Delivered = 'DELIVERED';
}
