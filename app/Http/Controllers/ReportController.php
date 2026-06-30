<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /* CREATE */
    public function store(Request $request)
    {
        $request->validate([
            'location' => 'required',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'proof_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'description' => 'required',
            'severity' => 'required'
        ]);

        $proofPhotoPath = $request->hasFile('proof_photo')
            ? $request->file('proof_photo')->store('report-proofs', 'public')
            : null;

        $report = Report::create([
            'user_id' => $request->user()->id,
            'location' => $request->location,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'proof_photo_path' => $proofPhotoPath,
            'description' => $request->description,
            'severity' => $request->severity,
            'status' => 'new'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report created',
            'data' => $report
        ]);
    }

    /* USER REPORTS */
    public function myReports(Request $request)
    {
        $reports = Report::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    /* ALL REPORTS */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => Report::latest()->get()
        ]);
    }

    /* UPDATE */
    public function update(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'admin' && $report->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $rules = [
            'location' => 'sometimes|required|string|max:255',
            'latitude' => 'sometimes|nullable|numeric|between:-90,90',
            'longitude' => 'sometimes|nullable|numeric|between:-180,180',
            'proof_photo' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'description' => 'sometimes|required|string',
            'severity' => 'sometimes|required|string|in:low,medium,high,critical',
        ];

        if ($user->role === 'admin') {
            $rules['status'] = 'sometimes|required|string|in:new,pending,approved,rejected,resolved';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('proof_photo')) {
            if ($report->proof_photo_path) {
                Storage::disk('public')->delete($report->proof_photo_path);
            }

            $validated['proof_photo_path'] = $request->file('proof_photo')->store('report-proofs', 'public');
        }

        unset($validated['proof_photo']);

        if ($user->role !== 'admin') {
            unset($validated['status']);
        }

        if (empty($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'No editable fields were provided'
            ], 422);
        }

        $report->fill($validated);
        $report->save();

        return response()->json([
            'success' => true,
            'message' => 'Updated',
            'data' => $report
        ]);
    }

    /* DELETE */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $report = Report::findOrFail($id);

        if ($report->proof_photo_path) {
            Storage::disk('public')->delete($report->proof_photo_path);
        }

        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deleted'
        ]);
    }
}
