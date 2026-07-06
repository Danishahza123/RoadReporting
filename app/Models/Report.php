<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'location',
        'latitude',
        'longitude',
        'proof_photo_path',
        'description',
        'severity',
        'status'
    ];

    protected $appends = [
        'proof_photo_url',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function getProofPhotoUrlAttribute(): ?string
    {
        return $this->proof_photo_path
            ? asset('storage/'.$this->proof_photo_path)
            : null;
    }

}
