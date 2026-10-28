<?php

namespace App\Jobs;

use App\Domain\Notifications;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class SendNotification implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 30;

    public int $uniqueFor = 180;

    public function __construct(public string $notificationId) {}

    public function uniqueId(): string
    {
        return $this->notificationId;
    }

    public function backoff(): array
    {
        return [30, 120, 300];
    }

    public function handle(Notifications $notifications): void
    {
        $notifications->send($this->notificationId);
    }

    public function failed(?\Throwable $error): void
    {
        Notification::whereKey($this->notificationId)->whereNotIn('status',['SENT','CANCELLED'])->update(['status' => 'FAILED', 'last_error' => 'Pengiriman gagal setelah percobaan terbatas.']);
    }
}
