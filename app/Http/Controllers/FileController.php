<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Documents;
use App\Domain\Transactions;
use App\Enums\UserRole;
use App\Models\BillingAccount;
use App\Models\ExportJob;
use App\Models\Invoice;
use App\Models\PaymentProof;
use App\Models\PaymentTransaction;
use App\Models\PrivateFile;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class FileController extends DomainController
{
    public function store(Request $request): mixed
    {
        $input = $request->validate(['file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:10240', 'purpose' => 'required|in:PAYMENT_PROOF,EXPENSE']);
        if ($input['purpose'] === 'EXPENSE') {
            Access::requireOwner($request->user());
        }
        $upload = $request->file('file');
        $mime = $upload->getMimeType();
        Access::check(in_array($mime, ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], true), 'Jenis isi file tidak didukung.');
        if (str_starts_with($mime, 'image/')) {
            Access::check(@getimagesize($upload->getRealPath()) !== false, 'Gambar tidak valid.');
        }
        $hash = hash_file('sha256', $upload->getRealPath());
        $safe = ['purpose' => $input['purpose'], 'checksum' => $hash, 'size' => $upload->getSize()];

        return $this->execute($request, 'file.upload', $safe, function () use ($request, $input, $upload, $mime, $hash) {
            $key = 'uploads/'.Str::uuid();
            Access::check(Storage::disk('local')->put($key, file_get_contents($upload->getRealPath())), 'Berkas gagal disimpan.');
            try {
                $file = PrivateFile::create(['storage_key' => $key, 'mime_type' => $mime, 'size_bytes' => $upload->getSize(), 'uploaded_by' => $request->user()->id, 'uploaded_at' => now(), 'expires_at' => now()->addYear(), 'purpose' => $input['purpose'], 'checksum_sha256' => $hash]);
            } catch (\Throwable $error) {
                Storage::disk('local')->delete($key);
                throw $error;
            }

            return ['id' => $file->id];
        });
    }

    public function download(Request $request, string $file): mixed
    {
        $record = PrivateFile::findOrFail($file);
        abort_if($record->purged_at || $record->expires_at->isPast(), 404);
        $actor = $request->user();
        $allowed = false;
        if ($record->purpose->value === 'PAYMENT_PROOF') {
            $proof = PaymentProof::where('file_id', $file)->first();
            if ($proof) {
                $payment = PaymentTransaction::findOrFail($proof->payment_transaction_id);
                $bill = BillingAccount::findOrFail($payment->billing_account_id);
                Access::patient($actor, $bill->patient_id);
                $allowed = true;
            } else {
                $allowed = $record->uploaded_by === $actor->id;
            }
        } elseif ($record->purpose->value === 'EXPENSE') {
            $allowed = $actor->role === UserRole::Superadmin;
        } elseif ($record->purpose->value === 'EXPORT') {
            $export = ExportJob::where('file_id', $file)->first();
            $allowed = $export && ($export->requested_by === $actor->id || $actor->role === UserRole::Superadmin) && ($export->kind->value !== 'FINANCE' || $actor->role === UserRole::Superadmin);
        }
        abort_unless($allowed, 404);
        abort_unless(Storage::disk('local')->exists($record->storage_key), 404);
        Transactions::audit($actor, 'file.download', 'private_files', $file);
        $extension = match ($record->mime_type) {
            'application/pdf' => 'pdf','image/png' => 'png','image/jpeg' => 'jpg','image/webp' => 'webp','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',default => 'csv'
        };

        $headers = ['Content-Type' => $record->mime_type, 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'no-store, private'];
        if ($request->boolean('inline') && $record->purpose->value === 'PAYMENT_PROOF') {
            return Storage::disk('local')->response($record->storage_key, 'bukti.'.$extension, $headers, 'inline');
        }
        return Storage::disk('local')->download($record->storage_key, 'dokumen-'.$record->id.'.'.$extension, $headers);
    }

    public function invoice(Request $request, string $invoice): mixed
    {
        return response(app(Documents::class)->invoice($request->user(), Invoice::findOrFail($invoice)), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="invoice.pdf"', 'Cache-Control' => 'no-store, private', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function receipt(Request $request, string $receipt): mixed
    {
        return response(app(Documents::class)->receipt($request->user(), Receipt::findOrFail($receipt)), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="receipt.pdf"', 'Cache-Control' => 'no-store, private', 'X-Content-Type-Options' => 'nosniff']);
    }
}
