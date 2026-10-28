<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Transfer = 'TRANSFER';
    case Qr = 'QR';
    case Cash = 'CASH';
    case Edc = 'EDC';
    case Other = 'OTHER';
}
