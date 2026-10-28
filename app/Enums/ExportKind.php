<?php

namespace App\Enums;

enum ExportKind: string
{
    case Schedule = 'SCHEDULE';
    case Finance = 'FINANCE';
}
