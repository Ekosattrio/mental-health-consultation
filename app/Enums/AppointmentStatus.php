<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case WaitingPayment = 'WAITING_PAYMENT';
    case WaitingVerification = 'WAITING_VERIFICATION';
    case Confirmed = 'CONFIRMED';
    case ConfirmedAutoSla = 'CONFIRMED_AUTO_SLA';
    case CheckedIn = 'CHECKED_IN';
    case InConsultation = 'IN_CONSULTATION';
    case Completed = 'COMPLETED';
    case NoShow = 'NO_SHOW';
    case Cancelled = 'CANCELLED';
    case Expired = 'EXPIRED';
}
