<?php

namespace App\Domain;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

final class WhatsAppBridge
{
    public function request(string $path, array $payload = []): Response
    {
        Access::check(config('integrations.whatsapp.driver') === 'baileys' && strlen(config('integrations.whatsapp.bridge_secret') ?? '') >= 32, 'Bridge WhatsApp belum dikonfigurasi.');
        $base = rtrim(config('integrations.whatsapp.bridge_url'), '/');
        Access::check((bool) preg_match('~^http://127\.0\.0\.1:\d{2,5}$~D', $base), 'Bridge wajib menggunakan loopback.');
        $body = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        $timestamp = (string) time();

        return Http::timeout(20)->withHeaders(['X-Jiwa-Timestamp' => $timestamp, 'X-Jiwa-Signature' => hash_hmac('sha256', $timestamp.'.'.$body, config('integrations.whatsapp.bridge_secret'))])->withBody($body, 'application/json')->post($base.$path);
    }
}
