<?php

namespace App\Enums;

enum AssessmentCaseStatus: string
{
    case Open = 'OPEN';
    case InProgress = 'IN_PROGRESS';
    case ReadyForReport = 'READY_FOR_REPORT';
    case Closed = 'CLOSED';
}
