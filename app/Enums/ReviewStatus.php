<?php

namespace App\Enums;

enum ReviewStatus: string
{
    case PendingModeration = 'PENDING_MODERATION';
    case Approved = 'APPROVED';
    case Rejected = 'REJECTED';
}
