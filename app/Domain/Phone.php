<?php

namespace App\Domain;

final class Phone
{
    public static function normalize(?string $value): ?string
    {
        if (! filled($value)) {
            return null;
        }
        $value = preg_replace('/[\s().-]+/', '', trim($value));
        if (str_starts_with($value, '08')) {
            $value = '+62'.substr($value, 1);
        } elseif (str_starts_with($value, '62')) {
            $value = '+'.$value;
        }
        Access::check((bool) preg_match('/^\+[1-9][0-9]{7,14}$/D', $value), 'Nomor WhatsApp harus memakai format08…,62… atau+kode negara.', 'phone');

        return $value;
    }
}
