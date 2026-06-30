<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>@yield('title', config('app.name'))</title>

    {{-- If you keep CSS in public/, reference it with asset('...') --}}
    <link rel="stylesheet" href="{{ asset('index.css') }}">
    {{-- If you move to resources/css + Vite later, we can switch to @vite(...) --}}

    @stack('styles')
</head>
<body>
    @include('partials.nav')

    <main>
        @yield('content')
    </main>

    {{-- Legacy pages control their own JS. Avoid double-loading public/app.js. --}}

    @stack('scripts')
</body>
</html>

