<?php

namespace App\Enums;

enum ExportStatus: string
{
    case Queued = 'QUEUED';
    case Ready = 'READY';
    case Failed = 'FAILED';
    case Expired = 'EXPIRED';
}
