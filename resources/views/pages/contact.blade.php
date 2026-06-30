@extends('layouts.app')

@section('title', 'Contact')

@section('content')
    <h1>Contact</h1>

    @if (session('status'))
        <p style="color: green;">{{ session('status') }}</p>
    @endif

    <form method="POST" action="{{ route('contact.submit') }}">
        @csrf

        <div>
            <label>Name</label>
            <input type="text" name="name" value="{{ old('name') }}" required>
            @error('name') <div style="color:red">{{ $message }}</div> @enderror
        </div>

        <div>
            <label>Email</label>
            <input type="email" name="email" value="{{ old('email') }}" required>
            @error('email') <div style="color:red">{{ $message }}</div> @enderror
        </div>

        <div>
            <label>Message</label>
            <textarea name="message" required>{{ old('message') }}</textarea>
            @error('message') <div style="color:red">{{ $message }}</div> @enderror
        </div>

        <button type="submit">Submit</button>
    </form>
@endsection

