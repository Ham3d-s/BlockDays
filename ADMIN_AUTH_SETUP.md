# Admin Panel Authentication Setup

To enhance security, the Admin Panel now uses an environment variable for password authentication instead of a hardcoded password.

## Setup Instructions

1.  **Environment Variable Name:** `VITE_ADMIN_PASSWORD`

2.  **Local Development:**
    *   Create a file named `.env.local` in the root directory of your project (if it doesn't already exist).
    *   Add the following line to your `.env.local` file, replacing `your_secure_password_here` with a strong, unique password:
        ```
        VITE_ADMIN_PASSWORD="your_secure_password_here"
        ```
    *   **Important:** Ensure `.env.local` is listed in your `.gitignore` file to prevent committing it to the repository.

3.  **Deployment Environment (e.g., Netlify, Vercel, Docker):**
    *   You must configure the `VITE_ADMIN_PASSWORD` environment variable in your deployment platform's settings.
    *   Refer to your deployment provider's documentation for instructions on how to set environment variables for your deployed application.

## Important Considerations

*   **If `VITE_ADMIN_PASSWORD` is not set:**
    *   The login functionality will be disabled, and users will not be able to log in to the Admin Panel.
    *   The component is designed to handle this scenario gracefully by preventing login attempts.
*   Choose a strong and unique password for the admin panel.

By following these steps, you will ensure that the admin panel authentication is configured securely.
