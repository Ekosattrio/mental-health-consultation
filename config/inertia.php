<?php

return [
    'ssr' => ['enabled' => false],
    'devtools' => ['enabled' => false],
    'history' => ['encrypt' => (bool) env('INERTIA_ENCRYPT_HISTORY', true)],
    'pages' => [
        'ensure_pages_exist' => true,
        'paths' => [resource_path('js/pages')],
        'extensions' => ['tsx'],
    ],
];
