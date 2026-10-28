<?php

namespace App\Enums;

enum NotificationStatus: string
{
    case Queued = 'QUEUED';
    case Sending = 'SENDING';
    case Retry = 'RETRY';
    case Sent = 'SENT';
    case Failed = 'FAILED';
    case Cancelled = 'CANCELLED';
}
