<?php

namespace App\Enums;

enum IdempotencyStatus: string
{
    case Processing = 'PROCESSING';
    case Completed = 'COMPLETED';
}
