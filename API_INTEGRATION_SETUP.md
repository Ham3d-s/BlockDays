# API Integration Setup for Content Updates

To enable the Admin Panel to save content changes directly to the server via the backend API, an authentication token must be configured. This token is used to verify that requests to the content update endpoint are legitimate.

## Setup Instructions

1.  **Environment Variable Name:** `VITE_API_AUTH_TOKEN`

2.  **Purpose:** This token is sent as a Bearer token in the `Authorization` header when the Admin Panel makes a `POST` request to the `/api/update-content` endpoint. The backend script/serverless function responsible for handling this endpoint must be configured to validate this token.

3.  **Generating the Token:**
    *   Generate a strong, unique, and random string to serve as the secret token. You can use a password generator for this.
    *   Example (do NOT use this value, generate your own): `your_very_secure_and_random_api_token_string`

4.  **Local Development:**
    *   Add the token to your `.env.local` file in the root directory of the project:
        ```env
        VITE_API_AUTH_TOKEN="your_very_secure_and_random_api_token_string"
        ```
    *   Ensure `.env.local` is in your `.gitignore` file.

5.  **Deployment Environment (e.g., Netlify, Vercel, Docker):**
    *   Set the `VITE_API_AUTH_TOKEN` environment variable in your deployment platform's settings.
    *   The backend service that handles `/api/update-content` must also have access to this *same token* to validate incoming requests. Configure this token securely in your backend environment.

## Important Considerations

*   **Security:** This token is a secret. Treat it like a password. Do not hardcode it into your application or commit it to version control.
*   **Backend Configuration:** The backend API endpoint (`/api/update-content`) must be programmed to:
    *   Expect an `Authorization: Bearer <token>` header.
    *   Compare the received token with the value it has configured (ideally from its own environment variables).
    *   Reject requests that do not have a valid token with a `401 Unauthorized` or `403 Forbidden` status.
*   **If `VITE_API_AUTH_TOKEN` is not set in the Admin Panel's environment:**
    *   The functionality to "Save to Server" will be disabled or will result in an error, as the Admin Panel will not be able to authenticate its requests. The `updateContentFile` utility function will throw an error if the token is missing.

By correctly configuring this token in both the frontend (Admin Panel) and backend environments, you establish a secure channel for content updates.
