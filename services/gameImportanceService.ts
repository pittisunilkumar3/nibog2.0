export interface GameImportanceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface GameImportanceData {
  title: string;
  description: string;
  items: GameImportanceItem[];
}

/**
 * Fetch game importance data
 */
export async function getGameImportanceData(): Promise<GameImportanceData> {
  try {
    console.log('Fetching game importance data...');
    
    const response = await fetch('/api/game-importance/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch game importance data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched game importance data');
    return data;
  } catch (error) {
    console.error('Error fetching game importance data:', error);
    throw error;
  }
}

/**
 * Save game importance data
 */
export async function saveGameImportanceData(data: GameImportanceData): Promise<any> {
  try {
    console.log('Saving game importance data...');
    
    const response = await fetch('/api/game-importance/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to save game importance data: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully saved game importance data');
    return result;
  } catch (error) {
    console.error('Error saving game importance data:', error);
    throw error;
  }
}

/**
 * Upload icon for game importance
 */
export async function uploadGameImportanceIcon(file: File): Promise<string> {
  try {
    console.log('Uploading game importance icon...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'game-importance');
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload icon: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully uploaded game importance icon');
    return result.url || result.path;
  } catch (error) {
    console.error('Error uploading game importance icon:', error);
    throw error;
  }
}
