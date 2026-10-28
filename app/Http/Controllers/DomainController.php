<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Transactions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class DomainController extends Controller
{
    protected function execute(Request $request, string $scope, array $input, callable $callback): mixed
    {
        $result = app(Transactions::class)->run($request->user(), $scope, (string) $request->header('Idempotency-Key', $request->input('request_id', '')), $input, $callback);

        return $request->expectsJson() ? response()->json(['data' => $result]) : back()->with('status', 'Perubahan tersimpan.');
    }

    protected function version(Model $model, int $version): void
    {
        Access::check((int) $model->row_version === $version, 'Data sudah berubah. Muat ulang sebelum menyimpan.');
    }

    protected function reasonRules(): array
    {
        return ['reason' => 'required|string|min:3|max:500'];
    }
}
