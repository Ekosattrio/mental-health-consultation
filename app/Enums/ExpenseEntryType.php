<?php

namespace App\Enums;

enum ExpenseEntryType: string
{
    case Expense = 'EXPENSE';
    case Reversal = 'REVERSAL';
}
