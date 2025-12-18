/**
 * Homepage Section Service
 * Handles API calls for homepage hero slider sections
 */

export interface HomepageSection {
    id: number;
    image_path: string;
    priority: number;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}

export interface HomepageSectionPayload {
    image_path: string;
    priority?: number;
    status?: 'active' | 'inactive';
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
 * Get all homepage sections
 */
export async function getAllHomepageSections(): Promise<HomepageSection[]> {
    try {
        const response = await fetch('/api/homepage-sections', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch homepage sections: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching homepage sections:', error);
        throw error;
    }
}

/**
 * Get single homepage section
 */
export async function getHomepageSectionById(id: number): Promise<HomepageSection | null> {
    try {
        const response = await fetch(`/api/homepage-sections/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Failed to fetch homepage section ${id}: ${response.status}`);
        }

        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.error(`Error fetching homepage section ${id}:`, error);
        throw error;
    }
}

/**
 * Create homepage section
 */
export async function createHomepageSection(payload: HomepageSectionPayload): Promise<HomepageSection> {
    try {
        const token = getAuthToken();
        const response = await fetch('/api/homepage-sections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to create homepage section: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error creating homepage section:', error);
        throw error;
    }
}

/**
 * Update homepage section
 */
export async function updateHomepageSection(id: number, payload: Partial<HomepageSectionPayload>): Promise<boolean> {
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/homepage-sections/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update homepage section ${id}: ${response.status}`);
        }

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error(`Error updating homepage section ${id}:`, error);
        throw error;
    }
}

/**
 * Delete homepage section
 */
export async function deleteHomepageSection(id: number): Promise<boolean> {
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/homepage-sections/${id}`, {
            method: 'DELETE',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to delete homepage section ${id}: ${response.status}`);
        }

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error(`Error deleting homepage section ${id}:`, error);
        throw error;
    }
}
