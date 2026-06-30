<?php

namespace App\Models;

// IMPORTANT: add Sanctum
use Laravel\Sanctum\HasApiTokens;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    /**
     * Hidden fields
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // 👮 ROLE CHECK FUNCTION
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}