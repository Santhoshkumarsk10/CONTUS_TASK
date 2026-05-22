<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Clean existing users to avoid unique constraint violations on re-seed
        User::query()->delete();

        // Seed Default Admin User (Satisfies strict password rules)
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('Admin@123'),
            'role' => 'admin',
        ]);

        // Seed Default Regular User (Satisfies strict password rules)
        User::create([
            'name' => 'Regular User',
            'email' => 'user@gmail.com',
            'password' => Hash::make('User@123'),
            'role' => 'user',
        ]);
    }
}
