<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Admin User', 'email' => 'danishparadox448@gmail.com', 'role' => 'admin'],
            ['name' => 'Test User', 'email' => 'test@example.com', 'role' => 'user'],
            ['name' => 'danishahza', 'email' => 'danishahza404@gmail.com', 'role' => 'user'],
            ['name' => 'Arifah Nadiah', 'email' => 'arifahnadiah04@gmail.com', 'role' => 'user'],
        ];

        foreach ($users as $user) {
            \App\Models\User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role' => $user['role'],
                ]
            );
        }
    }
}
