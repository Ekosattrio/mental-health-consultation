<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Layanan konseling, asesmen dan psikoterapi JiwaSehat." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preload" href="{{ asset('fonts/plus-jakarta-sans-latin-variable.woff2') }}" as="font" type="font/woff2" crossorigin>
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

