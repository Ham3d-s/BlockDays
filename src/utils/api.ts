/**
 * Fetches content from JSON files
 * @param filename The JSON file name in the content directory
 * @returns The parsed JSON data
 */
export const fetchContent = async <T>(filename: string): Promise<T> => {
  try {
    const response = await fetch(`./content/${filename}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    throw error;
  }
};

/**
 * Updates a content file on the server.
 * @param sectionKey The key for the content section (e.g., "faq", "gallery"). This will be used to derive the filename.
 * @param content The new content to save.
 * @returns A promise that resolves if the update is successful, or rejects with an error.
 */
export const updateContentFile = async (sectionKey: string, content: any): Promise<void> => {
  const token = import.meta.env.VITE_API_AUTH_TOKEN;

  if (!token) {
    const errorMessage = "API authentication token is not configured. Please set VITE_API_AUTH_TOKEN.";
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }

  const fileName = `${sectionKey}.json`;
  const apiEndpoint = '/api/update-content'; // Make sure this matches your backend endpoint

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fileName, content }),
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Try to get more details from the response body
      throw new Error(`Failed to save content: Server responded with status ${response.status}. Details: ${errorBody}`);
    }

    // If response is OK, resolve the promise (no specific content needed for a successful PUT/POST ack)
    return Promise.resolve();

  } catch (error) {
    console.error(`Error updating ${fileName}:`, error);
    // Ensure the error is an Error object
    if (error instanceof Error) {
      return Promise.reject(error);
    } else {
      return Promise.reject(new Error(String(error)));
    }
  }
};