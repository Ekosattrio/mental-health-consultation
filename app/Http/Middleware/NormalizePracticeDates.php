<?php

namespace App\Http\Middleware;

use Carbon\CarbonImmutable;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

final class NormalizePracticeDates
{
    public function handle(Request $request, Closure $next): mixed
    {
        // datetime-local HTML tidak membawa offset. Hanya field waktu kontrak yang ditafsirkan WIB;
        // payload CMS/jawaban klinis tidak disentuh oleh normalisasi generik.
        foreach (['start_at', 'received_at', 'delivered_at', 'external_agreed_at', 'promo_starts_at', 'promo_ends_at', 'as_of'] as $key) {
            $value = $request->input($key);
            if (! is_string($value) || ! preg_match('/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?$/D', $value)) {
                continue;
            }
            $local = str_replace(' ', 'T', $value);
            $format = strlen($local) === 16 ? 'Y-m-d\TH:i' : 'Y-m-d\TH:i:s';
            try {
                $date = CarbonImmutable::createFromFormat('!'.$format, $local, 'Asia/Jakarta');
                if (! $date || $date->format($format) !== $local) {
                    throw new \InvalidArgumentException;
                }
            } catch (\Throwable) {
                throw ValidationException::withMessages([$key => 'Tanggal atau waktu WIB tidak valid.']);
            }
            $request->merge([$key => $date->utc()->toIso8601String()]);
        }

        return $next($request);
    }
}
