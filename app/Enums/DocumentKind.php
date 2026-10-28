<?php

namespace App\Enums;

enum DocumentKind: string
{
    case Invoice = 'INVOICE';
    case Receipt = 'RECEIPT';
}
