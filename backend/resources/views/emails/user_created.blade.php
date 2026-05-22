<x-mail::message>
# Welcome to Contus Task Platform, {{ $name }}!

An administrator has successfully provisioned a new user account for you. Here are your secure access credentials:

<x-mail::panel>
**Email Address:** {{ $email }}
**Temporary Password:** `{{ $password }}`
**Assigned Role:** {{ ucfirst($role) }}
</x-mail::panel>

You can now log in securely using the portal dashboard link below:

<x-mail::button :url="'http://localhost:5173/login'">
Access Portal Dashboard
</x-mail::button>

> **Important Security Notice:**
> For your protection, please update your temporary password immediately under your profile settings after logging in.

Thanks,<br>
The {{ config('app.name') }} Team
</x-mail::message>
