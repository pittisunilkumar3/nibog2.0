import { SPORTS_IMPORTANCE_API } from '@/config/api';

export interface SportsImportanceItem {
  id: string;
  name: string;
  age: string;
  image: string;
}

export interface SportsImportanceData {
  title: string;
  description: string;
  items: SportsImportanceItem[];
}

/**
 * Fetch sports importance data
 */
export async function getSportsImportanceData(): Promise<SportsImportanceData> {
  try {
    console.log('Fetching sports importance data...');
    
    const response = await fetch('/api/sports-importance/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sports importance data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched sports importance data');
    return data;
  } catch (error) {
    console.error('Error fetching sports importance data:', error);
    throw error;
  }
}

/**
 * Save sports importance data
 */
export async function saveSportsImportanceData(data: SportsImportanceData): Promise<any> {
  try {
    console.log('Saving sports importance data...');
    
    const response = await fetch('/api/sports-importance/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to save sports importance data: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully saved sports importance data');
    return result;
  } catch (error) {
    console.error('Error saving sports importance data:', error);
    throw error;
  }
}

/**
 * Upload image for sports importance
 */
export async function uploadSportsImportanceImage(file: File): Promise<string> {
  try {
    console.log('Uploading sports importance image...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'sports-importance');
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully uploaded sports importance image');
    return result.url || result.path;
  } catch (error) {
    console.error('Error uploading sports importance image:', error);
    throw error;
  }
}
