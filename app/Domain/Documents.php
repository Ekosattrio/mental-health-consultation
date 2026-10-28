<?php

namespace App\Domain;

use App\Enums\UserRole;
use App\Models\BillingAccount;
use App\Models\BillingLineItem;
use App\Models\Invoice;
use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\User;
use Carbon\CarbonImmutable;
use Dompdf\Dompdf;
use Dompdf\Options;

final class Documents
{
    public function invoice(User $actor, Invoice $invoice): string
    {
        $bill = BillingAccount::findOrFail($invoice->billing_account_id);
        Access::patient($actor, $bill->patient_id);
        $this->cutoff($actor, $bill);
        $lines = BillingLineItem::where('invoice_id', $invoice->id)->get()->map(fn ($l) => ['label' => $l->label, 'amount' => ($l->direction->value === 'MINUS' ? '-' : '').'Rp '.number_format($l->amount, 0, ',', '.')])->all();

        return $this->render('Invoice '.$invoice->invoice_number, $invoice->issued_at->setTimezone('Asia/Jakarta')->format('d/m/Y'), $invoice->identity_snapshot, $lines, ['Total dokumen' => 'Rp '.number_format($invoice->net_amount, 0, ',', '.')]);
    }

    public function receipt(User $actor, Receipt $receipt): string
    {
        abort_if($actor->role === UserRole::Admin, 403);
        $payment = PaymentTransaction::findOrFail($receipt->payment_transaction_id);
        $bill = BillingAccount::findOrFail($payment->billing_account_id);
        Access::patient($actor, $bill->patient_id);
        $this->cutoff($actor, $bill);
        $snapshot = $receipt->snapshot;

        return $this->render('Receipt '.$receipt->receipt_number, $receipt->issued_at->setTimezone('Asia/Jakarta')->format('d/m/Y'), ['practice' => $snapshot['practice'] ?? []],
            [['label' => 'Penerimaan '.($snapshot['method'] ?? ''), 'amount' => 'Rp '.number_format($snapshot['amount'], 0, ',', '.')]],
            ['Tanggal penerimaan' => CarbonImmutable::parse($snapshot['received_at'])->setTimezone('Asia/Jakarta')->format('d/m/Y H:i').' WIB', 'Status' => 'Penerimaan terverifikasi pada saat dokumen terbit', 'Transaksi' => $payment->id]);
    }

    private function cutoff(User $actor, BillingAccount $bill): void
    {
        if ($actor->role === UserRole::Patient) {
            abort_if($bill->download_until?->isPast(), 403, 'Masa unduh dokumen tujuh hari telah berakhir. Ringkasan tetap tersedia.');
        }
    }

    public function render(string $title, string $date, array $identity, array $lines, array $summary): string
    {
        $options = new Options(['isRemoteEnabled' => false, 'isPhpEnabled' => false, 'isJavascriptEnabled' => false, 'defaultFont' => 'DejaVu Sans', 'chroot' => resource_path('views/documents')]);
        $pdf = new Dompdf($options);
        $pdf->loadHtml(view('documents.invoice', compact('title', 'date', 'identity', 'lines', 'summary'))->render(), 'UTF-8');
        $pdf->setPaper('A4');
        $pdf->render();

        return $pdf->output();
    }
}
