<?php

namespace App\Enums;

enum ProofDecision: string
{
    case Pending = 'PENDING';
    case Approved = 'APPROVED';
    case Rejected = 'REJECTED';
    case Superseded = 'SUPERSEDED';
}
