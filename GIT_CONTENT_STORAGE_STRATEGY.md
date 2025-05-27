# Git-based Content Storage Strategy

This document outlines the implementation details for the Git-based content storage strategy.

## 1. File Structure

The content will be stored in multiple specific JSON files within the `public/content/` directory. This approach promotes modularity and easier management of different content sections.

Key JSON files in `public/content/` will include:

*   `global.json`: For site-wide settings, metadata, etc.
*   `header.json`: For header content (e.g., logo, navigation links).
*   `footer.json`: For footer content (e.g., copyright, social media links).
*   `hero.json`: For the hero section of the homepage.
*   `contactForm.json`: For labels, placeholders, and settings related to the contact form.
*   `faq.json`: For Frequently Asked Questions (existing).
*   `gallery.json`: For image gallery content (existing).
*   Other files as needed for specific pages or components (e.g., `aboutPage.json`, `servicesPage.json`).

Each file will adhere to the comprehensive content schema defined previously.

## 2. Backend Script/Serverless Function Responsibilities

A backend script (or a serverless function) will be responsible for receiving content updates from the admin panel, saving them to the appropriate JSON files, and committing these changes to the Git repository.

**Responsibilities:**

1.  **Receive Data:**
    *   Accept a JSON payload via an HTTP POST request.
    *   The payload will contain two main parts:
        *   `filePath`: A string indicating the target JSON file within `public/content/` (e.g., `header.json`, `faq.json`).
        *   `content`: A JSON object representing the new content for that file.

2.  **Authentication and Authorization:**
    *   Verify an authentication token (e.g., a Bearer token) sent in the request header.
    *   The token should be pre-shared and configured securely on both the admin panel and the backend script.
    *   This confirms that the request is from a legitimate admin panel instance.

3.  **Identify Target File Path:**
    *   Construct the full path to the target JSON file based on the received `filePath` (e.g., `/app/public/content/header.json`).
    *   Validate that the `filePath` is a permitted path (i.e., it must be one of the known content files and not try to traverse directories like `../../etc/passwd`). This can be done by checking against a predefined list of allowed filenames or by ensuring the path resolves to within the `public/content/` directory.

4.  **Write Content to File:**
    *   Deserialize the `content` JSON object.
    *   Write the new content to the specified JSON file, overwriting the existing file.
    *   Ensure proper JSON formatting (e.g., pretty-printing for readability in the repository).

5.  **Execute Git Commands:**
    *   Change the current directory to the root of the Git repository.
    *   Stage the changes: `git add public/content/[filePath]` (e.g., `git add public/content/header.json`).
    *   Commit the changes: `git commit -m "CMS: Update [contentSection]"`, where `[contentSection]` is derived from the `filePath` (e.g., "CMS: Update header.json").
    *   Push the changes to the remote repository: `git push`.

6.  **Error Handling:**
    *   **File Write Errors:** If writing to the JSON file fails (e.g., permissions issues, disk full), return an appropriate HTTP error code (e.g., 500 Internal Server Error) with an error message.
    *   **Git Command Errors:** If any Git command fails:
        *   Log the error details.
        *   Attempt to revert any staged changes if the commit fails (`git reset HEAD public/content/[filePath]`).
        *   Return an appropriate HTTP error code (e.g., 500 Internal Server Error) with a message indicating the Git operation failure.
    *   **Authentication Errors:** If authentication fails, return a 401 Unauthorized error.
    *   **Invalid FilePath:** If `filePath` is invalid or points outside the allowed directory, return a 400 Bad Request error.

7.  **Security Considerations:**
    *   **Authentication:** As mentioned, use a strong, securely managed token for authenticating requests from the admin panel.
    *   **Git Credentials:** Git credentials (e.g., a GitHub Deploy Key with write access or a Personal Access Token with `repo` scope) must be securely available to the backend script's environment (e.g., as environment variables). These credentials should not be hardcoded in the script.
    *   **Input Validation:** Strictly validate the `filePath` to prevent directory traversal attacks. Only allow updates to files within the `public/content/` directory and potentially only from an allowlist of filenames.
    *   **Rate Limiting:** Consider implementing rate limiting on the API endpoint to prevent abuse.
    *   **Logging:** Maintain detailed logs of operations, including successful updates and any errors encountered, for auditing and debugging.

## 3. API Endpoint for Admin Panel

The admin panel will use the following API endpoint to send content updates to the backend script:

*   **URL Path:** `/api/update-content`
*   **HTTP Method:** `POST`
*   **Request Headers:**
    *   `Content-Type: application/json`
    *   `Authorization: Bearer [YOUR_SECRET_TOKEN]`

*   **Sample Request Body:**

    ```json
    {
      "filePath": "header.json",
      "content": {
        "siteName": "My Awesome Website",
        "logoUrl": "/images/logo.png",
        "navigation": [
          { "text": "Home", "link": "/" },
          { "text": "About", "link": "/about" },
          { "text": "Services", "link": "/services" },
          { "text": "Contact", "link": "/contact" }
        ]
      }
    }
    ```

    Another example for a different file:

    ```json
    {
      "filePath": "hero.json",
      "content": {
        "title": "Welcome to the Future",
        "subtitle": "Experience innovation like never before.",
        "ctaButton": {
          "text": "Learn More",
          "link": "/learn-more"
        },
        "backgroundImageUrl": "/images/hero-background.jpg"
      }
    }
    ```

## Next Steps

This document provides the specification for the Git-based content storage strategy. The next step would be to implement the backend script/serverless function and integrate it with the admin panel.
