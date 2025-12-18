/**
 * Get refund policy from API
 * @returns Promise with refund policy data
 */
export async function getRefundPolicy(): Promise<any> {
    try {
        const response = await fetch('/api/refund-policy', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`API returned error status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch refund policy:", error);
        throw error;
    }
}

/**
 * Update refund policy via API
 * @param policyText - The new refund policy text
 * @returns Promise with the update result
 */
export async function updateRefundPolicy(policyText: string): Promise<any> {
    try {
        // Get auth token from localStorage or sessionStorage (same as footer/privacy service)
        let token: string | null = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

            // If not in storage, try to get from auth-token cookie first
            if (!token) {
                const cookies = document.cookie.split(';');
                const authTokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
                if (authTokenCookie) {
                    token = authTokenCookie.split('=')[1];
                }
            }

            // If still no token, try to get from superadmin-token cookie
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
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('✅ Using authentication token for refund policy update');
        } else {
            console.warn('⚠️ No authentication token found for refund policy update');
        }

        const response = await fetch('/api/refund-policy', {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                policy_text: policyText
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API returned error status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to update refund policy:", error);
        throw error;
    }
}
