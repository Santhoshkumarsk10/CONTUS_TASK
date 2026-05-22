<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use \Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller
{
    /**
     * Send a password reset link/token.
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'exists' => 'We could not find a user with that email address.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $token = Str::random(60);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Save token to DB
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token), // Hash token for security
            'created_at' => now()
        ]);

        // Construct SPA reset URL
        $resetUrl = "http://localhost:5173/reset-password?token={$token}&email=" . urlencode($email);

        // Log the email and reset URL locally (Laravel standard fallback when mailer is 'log')
        Log::info("Password reset requested for {$email}. Token: {$token}. Reset URL: {$resetUrl}");

        return response()->json([
            'success' => true,
            'message' => 'We have emailed your password reset link! (Checked laravel.log)',
            'debug_token' => $token, // Return token for easy API / manual testing without opening logs!
            'debug_reset_url' => $resetUrl
        ], 200);
    }

    /**
     * Reset the user's password.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->numbers()
                    ->symbols()
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred',
                'errors' => $validator->errors()
            ], 422);
        }

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired password reset token.',
            ], 400);
        }

        // Check if token is older than 60 mins
        if (now()->subMinutes(60)->gt($record->created_at)) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'The password reset link has expired.',
            ], 400);
        }

        // Validate token hash
        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired password reset token.',
            ], 400);
        }

        // Reset password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Optional: Revoke all existing tokens for the user to force re-login on all devices
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Your password has been successfully reset! You can now log in.',
        ], 200);
    }
}
