<?php

namespace App\Domain;

use App\Jobs\GenerateExport;
use App\Models\Appointment;
use App\Models\Expense;
use App\Models\ExportJob;
use App\Models\PaymentTransaction;
use App\Models\User;
use Carbon\CarbonImmutable;

final class Reports
{
    public function finance(User $actor, string $from, string $to, ?string $asOf = null): array
    {
        Access::requireOwner($actor);
        $calendar = app(Calendar::class);
        $start = $calendar->instant($from.' 00:00');
        $end = $calendar->instant($to.' 00:00')->addDay();
        $cutoff = $asOf ? $calendar->instant($asOf) : CarbonImmutable::now();
        Access::check($cutoff->lessThanOrEqualTo(CarbonImmutable::now()), 'Cutoff tidak boleh di masa depan.');
        $cash = PaymentTransaction::where('status', 'VERIFIED')->where('verified_at', '<=', $cutoff)->where('received_at', '>=', $start)->where('received_at', '<', $end)->orderBy('received_at')->get();
        $expenses = Expense::where('created_at', '<=', $cutoff)->whereBetween('expense_date', [$from, $to])->orderBy('expense_date')->get();
        $cashTotal = $cash->sum(fn ($p) => $p->entry_type->value === 'RECEIPT' ? $p->amount : -$p->amount);
        $expenseTotal = $expenses->sum(fn ($e) => $e->entry_type->value === 'EXPENSE' ? $e->amount : -$e->amount);

        return ['from' => $from, 'to' => $to, 'as_of' => $cutoff->toIso8601String(), 'cash_received' => $cashTotal, 'expenses' => $expenseTotal, 'surplus' => $cashTotal - $expenseTotal,
            'rows' => $cash->map(fn ($p) => ['date' => $p->received_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'), 'type' => $p->entry_type->value, 'amount' => $p->entry_type->value === 'RECEIPT' ? $p->amount : -$p->amount, 'reference' => $p->reference ?? '', 'payment_id' => $p->id, 'appointment_id' => $p->appointment_id ?? '', 'billing_account_id' => $p->billing_account_id, 'late_verified' => $p->verified_at->setTimezone('Asia/Jakarta')->toDateString() > $p->received_at->setTimezone('Asia/Jakarta')->toDateString()])->all(),
            'expense_rows' => $expenses->map(fn ($e) => ['date' => $e->expense_date->toDateString(), 'type' => $e->category->value, 'amount' => $e->entry_type->value === 'EXPENSE' ? $e->amount : -$e->amount, 'description' => $e->description, 'expense_id' => $e->id])->all()];
    }

    public function export(User $actor, array $input): ExportJob
    {
        $kind = $input['kind'];
        if ($kind === 'FINANCE') {
            $dataset = $this->finance($actor, $input['from'], $input['to'], $input['as_of'] ?? null);
            $rows = [...$dataset['rows'], ...array_map(fn ($r) => ['date' => $r['date'], 'type' => 'EXPENSE '.$r['type'], 'amount' => -$r['amount'], 'reference' => $r['description'], 'payment_id' => $r['expense_id'], 'appointment_id' => '', 'billing_account_id' => '', 'late_verified' => false], $dataset['expense_rows'])];
        } else {
            Access::requireStaff($actor);
            $calendar = app(Calendar::class);
            $rows = Appointment::where('start_at', '>=', $calendar->instant($input['from'].' 00:00'))->where('start_at', '<', $calendar->instant($input['to'].' 00:00')->addDay())->orderBy('start_at')->limit(10001)->get()->map(fn ($a) => ['booking' => $a->booking_code, 'date' => $a->start_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'), 'patient' => $a->identity_snapshot['full_name'] ?? '', 'package' => $a->packageVersion?->name ?? $a->custom_label, 'contact' => $a->identity_snapshot['phone'] ?? '', 'status' => $a->status->value, 'initial_payment_requirement_met' => app(Billing::class)->initialMet($a) ? 'YA' : 'BELUM', 'payment_requirement' => $a->payment_requirement->value, 'end' => $a->end_at->setTimezone('Asia/Jakarta')->format('H:i')])->all();
        }
        Access::check(count($rows) <= 10000, 'Ekspor maksimal10.000baris; perkecil rentang.');
        $job = ExportJob::create(['requested_by' => $actor->id, 'kind' => $kind, 'filters' => $input, 'as_of' => $dataset['as_of'] ?? now(), 'dataset_snapshot' => ['rows' => $rows, 'format' => $input['format']], 'status' => 'QUEUED']);
        GenerateExport::dispatch($job->id)->afterCommit();

        return $job;
    }

    public static function csv(array $rows): string
    {
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, "\xEF\xBB\xBF");
        if ($rows) {
            fputcsv($stream, array_keys($rows[0]), ',', '"', '');
            foreach ($rows as $row) {
                fputcsv($stream, array_map(fn ($value) => is_string($value) && preg_match('/^[\s]*[=+\-@]/u', $value) ? "'".$value : $value, array_values($row)), ',', '"', '');
            }
        }
        rewind($stream);
        $result = stream_get_contents($stream);
        fclose($stream);

        return $result;
    }

    public static function xlsx(array $rows): string
    {
        $path = tempnam(sys_get_temp_dir(), 'jiwasehat-xlsx-');
        $zip = new \ZipArchive;
        if ($zip->open($path, \ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Gagal membuat XLSX.');
        }
        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
        $zip->addFromString('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
        $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>');
        $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
        $xml = '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
        $all = $rows ? [array_keys($rows[0]), ...array_map('array_values', $rows)] : [];
        foreach ($all as $index => $row) {
            $xml .= '<row r="'.($index + 1).'">';
            foreach ($row as $value) {
                if (is_int($value) || is_float($value)) {
                    $xml .= '<c><v>'.$value.'</v></c>';
                } else {
                    $safe = preg_replace('/[^\x{9}\x{A}\x{D}\x{20}-\x{D7FF}\x{E000}-\x{FFFD}\x{10000}-\x{10FFFF}]/u', '', (string) $value);
                    $xml .= '<c t="inlineStr"><is><t xml:space="preserve">'.htmlspecialchars($safe ?? '', ENT_XML1 | ENT_QUOTES, 'UTF-8').'</t></is></c>';
                }
            }$xml .= '</row>';
        }
        $xml .= '</sheetData></worksheet>';
        $zip->addFromString('xl/worksheets/sheet1.xml', $xml);
        $zip->close();
        $bytes = file_get_contents($path);
        unlink($path);

        return $bytes;
    }
}
