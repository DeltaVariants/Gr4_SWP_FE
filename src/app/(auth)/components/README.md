# Auth Components

This folder contains all components specific to the authentication routes.

## Structure

```
components/
├── login/              # Login page components
├── register/           # Registration components
├── forgotpassword/     # Forgot password flow
├── resetpassword/      # Reset password with code
└── newpassword/        # Set new password
```

## Usage

These components are only used within the `(auth)` route group and should not be imported from other parts of the application.

For shared UI components, use `@/presentation/components/ui/`.
