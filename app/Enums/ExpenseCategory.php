<?php

namespace App\Enums;

enum ExpenseCategory: string
{
    case Rent = 'RENT';
    case Electricity = 'ELECTRICITY';
    case Internet = 'INTERNET';
    case Supplies = 'SUPPLIES';
    case Operations = 'OPERATIONS';
    case Staff = 'STAFF';
    case Other = 'OTHER';
}
