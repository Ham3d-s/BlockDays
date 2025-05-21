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