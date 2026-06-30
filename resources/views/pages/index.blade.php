{{-- Migrated legacy page (converted from public/index.html) --}}
@extends('layouts.app')

@section('title', 'Road Report')

@section('content')
    {{-- This page uses its own full HTML (legacy). Keep it as-is by embedding via iframe-style approach.
         If you prefer true Blade integration, we can refactor next to remove duplicate <html>/<body> tags. --}}
    <div style="display:none"></div>

    {{-- Render legacy page content directly: for correctness, we include a separate Blade file.
         NOTE: layouts.app already includes <html>/<head> which legacy file also includes.
         Easiest safe approach is to bypass layouts wrapper by not extending it. So we keep legacy file separate.
         Replace this content with @include('pages.legacy') if you remove layout wrapper next. --}}

    @include('pages.legacy')
@endsection


