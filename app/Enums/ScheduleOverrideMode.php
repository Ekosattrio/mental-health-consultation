<?php

namespace App\Enums;

enum ScheduleOverrideMode: string
{
    case Open = 'OPEN';
    case Closed = 'CLOSED';
}
