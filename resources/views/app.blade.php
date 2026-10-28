<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Layanan konseling, asesmen dan psikoterapi JiwaSehat." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    @viteReactRefresh
    @vite('resources/js/main.tsx')
    <x-inertia::head>
      <title>{{ config('app.name') }}</title>
    </x-inertia::head>
  </head>
  <body class="font-sans antialiased text-slate-800 bg-slate-50">
    <x-inertia::app />
  </body>
</html>

