<?php

return [
    'google' => ['enabled' => env('GOOGLE_ENABLED', false), 'client_id' => env('GOOGLE_CLIENT_ID'), 'client_secret' => env('GOOGLE_CLIENT_SECRET')],
    'whatsapp' => ['driver' => env('WHATSAPP_DRIVER', 'placeholder'), 'sender_phone' => env('WHATSAPP_SENDER_PHONE'),
        'bridge_url' => env('WHATSAPP_BRIDGE_URL', 'http://127.0.0.1:3210'), 'bridge_secret' => env('WHATSAPP_BRIDGE_SECRET')],
];
