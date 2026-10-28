<?php

namespace App\Enums;

enum AssessmentRole: string
{
    case Testing = 'TESTING';
    case Evaluation = 'EVALUATION';
    case FollowUp = 'FOLLOW_UP';
}
