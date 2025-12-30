/**
 * Gallery Image Service
 * Handles API calls for gallery images
 */

export interface GalleryImage {
    id: number;
    image_path: string;
    created_at?: string;
    updated_at?: string;
}

export interface GalleryImagePayload {
    image_path: string;
}

/**
 * Helper to get authentication token from storage or cookies
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Try localStorage and sessionStorage
    let token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

    // Try auth-token cookie
    if (!token) {
        const cookies = document.cookie.split(';');
        const authTokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
        if (authTokenCookie) {
            token = authTokenCookie.split('=')[1];
        }
    }

    // Try superadmin-token cookie
    if (!token) {
        const cookies = document.cookie.split(';');
        const superadminCookie = cookies.find(c => c.trim().startsWith('superadmin-token='));
        if (superadminCookie) {
            try {
                const cookieValue = decodeURIComponent(superadminCookie.split('=')[1]);
                const userData = JSON.parse(cookieValue);
                if (userData && userData.token) {
                    token = userData.token;
                }
            } catch (e) {
                console.warn('Failed to parse superadmin-token cookie:', e);
            }
        }
    }

    return token;
}

/**
 * Get all gallery images
 */
export async function getAllGalleryImages(): Promise<GalleryImage[]> {
    try {
        const response = await fetch('/api/gallery-images', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch gallery images: ${response.status}`);
        }

        const result = await response.json();
        // API returns array directly according to documentation
        if (Array.isArray(result)) {
            return result;
        }
        // Fallback if wrapped in success object
        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        throw error;
    }
}

/**
 * Create gallery image
 */
export async function createGalleryImage(payload: GalleryImagePayload): Promise<GalleryImage> {
    try {
        const token = getAuthToken();
        const response = await fetch('/api/gallery-images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to create gallery image: ${response.status}`);
        }

        const result = await response.json();
        return result.galleryImage;
    } catch (error) {
        console.error('Error creating gallery image:', error);
        throw error;
    }
}

/**
 * Delete gallery image
 */
export async function deleteGalleryImage(id: number): Promise<boolean> {
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/gallery-images/${id}`, {
            method: 'DELETE',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to delete gallery image ${id}: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error(`Error deleting gallery image ${id}:`, error);
        throw error;
    }
}
