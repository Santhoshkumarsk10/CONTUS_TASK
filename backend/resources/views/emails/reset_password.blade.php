<x-mail::message>
# Hello, {{ $name }}!

We received a request to reset your password for your Contus Auth Platform account.

To establish a new password, click the secure reset link below:

<x-mail::button :url="$resetUrl">
Reset Account Password
</x-mail::button>

If you did not initiate this request, no action is required and your active credentials remain secure. 

For security reasons, this single-use link will expire shortly.

Thanks,<br>
The {{ config('app.name') }} Team
</x-mail::message>
