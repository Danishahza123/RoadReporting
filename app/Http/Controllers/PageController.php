<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{
    public function showIndex()
    {
        return view('pages.legacy');
    }

    public function showAbout()
    {
        return view('pages.about');
    }

    public function showContact(Request $request)
    {
        return view('pages.contact');
    }

    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        return redirect()
            ->route('contact')
            ->with('status', 'Message submitted successfully!');
    }
}