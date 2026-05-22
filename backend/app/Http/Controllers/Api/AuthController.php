<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserCreated;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Log in an existing user.
     */
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        // Revoke old tokens optionally for security, but keeping it simple and secure:
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 200);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($request->user())
        ], 200);
    }

    /**
     * Log out the authenticated user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out'
        ], 200);
    }

    /**
     * Refresh the user's active token (Token Rotation).
     */
    public function refresh(Request $request)
    {
        $user = $request->user();

        // Revoke current active token
        $user->currentAccessToken()->delete();

        // Issue a fresh token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token rotated successfully',
            'data' => [
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 200);
    }

    /**
     * Get mocked administrative statistics (Role-restricted).
     */
    public function adminStats(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Administrative statistics fetched successfully',
            'data' => [
                'total_users' => User::count(),
                'active_sessions' => DB::table('personal_access_tokens')->count(),
                'system_status' => 'HEALTHY',
                'laravel_version' => app()->version(),
                'server_time' => now()->toIso8601String()
            ]
        ], 200);
    }

    /**
     * Authenticate or register a user via OAuth mockup (Social Login).
     */
    public function socialLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
            'provider' => 'required|string|in:google,github',
            'provider_id' => 'required|string'
        ]);

        // Find or create the user
        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name' => $request->name,
                'password' => Hash::make(\Illuminate\Support\Str::random(16)), // Dummy password
                'role' => 'user' // Default to user for social registrations
            ]
        );

        // Clear existing tokens and create a new one
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Social login successful via ' . ucfirst($request->provider),
            'data' => [
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 200);
    }

    /**
     * List all registered users (Admin only).
     */
    public function listUsers(Request $request)
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'message' => 'Users listed successfully',
            'data' => UserResource::collection($users)
        ], 200);
    }

    /**
     * Create a new user (Admin only) and trigger SMTP mail.
     */
    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                \Illuminate\Validation\Rules\Password::min(8)
                    ->letters()
                    ->numbers()
                    ->symbols()
            ],
            'role' => 'required|string|in:user,admin',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Trigger the SMTP email notification
        try {
            Mail::to($user->email)->send(new UserCreated($user, $request->password));
            $mailSent = true;
            $mailMessage = 'Email notification sent successfully via SMTP.';
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('SMTP Mail failed: ' . $e->getMessage());
            $mailSent = false;
            $mailMessage = 'User created but SMTP mail failed: ' . $e->getMessage();
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'mail_sent' => $mailSent,
            'mail_message' => $mailMessage,
            'data' => new UserResource($user)
        ], 201);
    }
}
