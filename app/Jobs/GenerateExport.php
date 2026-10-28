<?php

namespace App\Jobs;

use App\Domain\Reports;
use App\Domain\Transactions;
use App\Models\ExportJob;
use App\Models\PrivateFile;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class GenerateExport implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(public string $exportId) {}

    public function handle(): void
    {
        DB::transaction(function () {
            $job = ExportJob::whereKey($this->exportId)->lockForUpdate()->firstOrFail();
            if ($job->status->value === 'READY') {
                return;
            }
            $snapshot = $job->dataset_snapshot;
            $xlsx = $snapshot['format'] === 'XLSX';
            $bytes = $xlsx ? Reports::xlsx($snapshot['rows']) : Reports::csv($snapshot['rows']);
            $key = 'exports/'.Str::uuid();
            if (! Storage::disk('local')->put($key, $bytes)) {
                throw new \RuntimeException('Gagal menyimpan ekspor.');
            }
            $file = PrivateFile::create(['storage_key' => $key, 'mime_type' => $xlsx ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv', 'size_bytes' => strlen($bytes), 'uploaded_by' => $job->requested_by, 'uploaded_at' => now(), 'expires_at' => now()->addDay(), 'purpose' => 'EXPORT', 'checksum_sha256' => hash('sha256', $bytes)]);
            $job->update(['status' => 'READY', 'file_id' => $file->id, 'expires_at' => now()->addDay(), 'error' => null]);
            Transactions::outbox('EXPORT_READY', 'export_jobs', $job->id, ['recipient_user_id' => $job->requested_by]);
        }, 5);
    }

    public function failed(?\Throwable $error): void
    {
        $job = ExportJob::find($this->exportId);
        $job?->update(['status' => 'FAILED', 'error' => 'Pembuatan ekspor gagal. Coba kembali atau hubungi pengelola.']);
    }
}
