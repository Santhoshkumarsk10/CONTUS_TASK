<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user registration successfully.
     */
    public function test_user_can_register_successfully(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Santhosh Kumar',
            'email' => 'santhosh@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'user',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'created_at'],
                    'access_token',
                    'token_type'
                ]
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'name' => 'Santhosh Kumar',
                        'email' => 'santhosh@example.com',
                        'role' => 'user',
                    ]
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'santhosh@example.com',
            'role' => 'user',
        ]);
    }

    /**
     * Test registration validation errors.
     */
    public function test_registration_validation_errors(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => ['name', 'email', 'password']
            ])
            ->assertJson([
                'success' => false
            ]);
    }

    /**
     * Test user login successfully.
     */
    public function test_user_can_login_successfully(): void
    {
        $user = User::create([
            'name' => 'Santhosh Kumar',
            'email' => 'santhosh@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'santhosh@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'created_at'],
                    'access_token',
                    'token_type'
                ]
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'santhosh@example.com',
                        'role' => 'admin',
                    ]
                ]
            ]);
    }

    /**
     * Test user login fails with incorrect credentials.
     */
    public function test_user_login_fails_with_incorrect_credentials(): void
    {
        User::create([
            'name' => 'Santhosh Kumar',
            'email' => 'santhosh@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'santhosh@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
    }

    /**
     * Test getting authenticated user.
     */
    public function test_can_fetch_authenticated_user_profile(): void
    {
        $user = User::create([
            'name' => 'Santhosh Kumar',
            'email' => 'santhosh@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'santhosh@example.com',
                    'name' => 'Santhosh Kumar'
                ]
            ]);
    }

    /**
     * Test getting profile without token throws unauthenticated JSON response.
     */
    public function test_unauthenticated_request_returns_json_error(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated or session expired.'
            ]);
    }

    /**
     * Test logging out.
     */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::create([
            'name' => 'Santhosh Kumar',
            'email' => 'santhosh@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);

        $this->assertEquals(0, $user->tokens()->count());
    }

    /**
     * Test forgot password functionality.
     */
    public function test_forgot_password_logs_token(): void
    {
        User::create([
            'name' => 'Santhosh Kumar',
            'email' => 'santhosh@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'santhosh@example.com'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'debug_token',
                'debug_reset_url'
            ])
            ->assertJson([
                'success' => true
            ]);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'santhosh@example.com'
        ]);
    }

    /**
     * Test token refresh / rotation endpoint.
     */
    public function test_authenticated_user_can_rotate_token(): void
    {
        $user = User::create([
            'name' => 'Santhosh Kumar',
            'email' => 'santhosh@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/refresh');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'created_at'],
                    'access_token',
                    'token_type'
                ]
            ]);
    }

    /**
     * Test admin user can access administrative stats.
     */
    public function test_admin_user_can_fetch_admin_stats(): void
    {
        $user = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Administrative statistics fetched successfully',
            ])
            ->assertJsonStructure([
                'data' => ['total_users', 'active_sessions', 'system_status', 'laravel_version', 'server_time']
            ]);
    }

    /**
     * Test non-admin user cannot access administrative stats (403 forbidden).
     */
    public function test_non_admin_user_cannot_fetch_admin_stats(): void
    {
        $user = User::create([
            'name' => 'Standard User',
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/stats');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Access denied. You do not have the required role permissions.'
            ]);
    }

    /**
     * Test mockup social login endpoint.
     */
    public function test_user_can_authenticate_via_mock_social_login(): void
    {
        $response = $this->postJson('/api/social-login', [
            'email' => 'google.user@example.com',
            'name' => 'Google Explorer',
            'provider' => 'google',
            'provider_id' => 'g_123456789'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'created_at'],
                    'access_token',
                    'token_type'
                ]
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'google.user@example.com',
                        'name' => 'Google Explorer',
                        'role' => 'user'
                    ]
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'google.user@example.com',
            'role' => 'user'
        ]);
    }
}
