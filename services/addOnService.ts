// Add-on service for handling add-on-related API calls

export interface AddOnVariant {
  id?: number;
  addon_id?: number;
  name: string;
  price_modifier: number;
  sku: string;
  stock_quantity: number;
}

export interface AddOn {
  id: number;
  name: string;
  description: string;
  price: string;
  category: "meal" | "merchandise" | "service" | "other";
  is_active: boolean;
  has_variants: boolean;
  stock_quantity: number;
  sku: string;
  bundle_min_quantity: number;
  bundle_discount_percentage: string;
  created_at: string;
  updated_at: string;
  images: string[];
  variants: AddOnVariant[];
}

export interface CreateAddOnRequest {
  name: string;
  description: string;
  price: number;
  category: "meal" | "merchandise" | "service" | "other";
  images: string[];
  isActive: boolean;
  hasVariants: boolean;
  stock_quantity: number;
  sku: string;
  bundleDiscount?: {
    minQuantity: number;
    discountPercentage: number;
  };
  variants?: {
    name: string;
    price_modifier: number;
    sku: string;
    stock_quantity: number;
  }[];
}

export interface UpdateAddOnRequest {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "meal" | "merchandise" | "service" | "other";
  images: string[];
  isActive: boolean;
  hasVariants: boolean;
  stock_quantity: number;
  sku: string;
  bundleDiscount: {
    minQuantity: number;
    discountPercentage: number;
  };
  variants?: {
    name: string;
    price_modifier: number;
    sku: string;
    stock_quantity: number;
  }[];
}

/**
 * Get all add-ons
 * @returns Promise with array of add-ons
 */
export async function getAllAddOns(): Promise<AddOn[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('/api/add-ons/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. The server took too long to respond.");
    }
    throw error;
  }
}

/**
 * Get add-on by ID
 * @param addOnId Add-on ID
 * @returns Promise with add-on data
 */
export async function getAddOnById(addOnId: string | number): Promise<AddOn> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('/api/add-ons/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(addOnId) }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Add-on with ID ${addOnId} not found`);
      }
      throw new Error(`Failed to fetch add-on: ${response.status}`);
    }

    const data = await response.json();
    
    // API returns array, get first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    throw new Error(`Add-on with ID ${addOnId} not found`);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - the add-on service is taking too long to respond');
    }
    throw error;
  }
}

/**
 * Create a new add-on
 * @param addOnData The add-on data to create
 * @returns Promise with the created add-on data
 */
export async function createAddOn(addOnData: any): Promise<any> {
  try {
    const response = await fetch('/api/add-ons/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addOnData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Update an add-on
 * @param addOnData The add-on data to update
 * @returns Promise with the updated add-on data
 */
export async function updateAddOn(addOnData: UpdateAddOnRequest): Promise<AddOn> {
  try {
    const response = await fetch('/api/add-ons/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addOnData),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    
    // API returns array, get first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Delete an add-on
 * @param addOnId Add-on ID to delete
 * @returns Promise with success status
 */
export async function deleteAddOn(addOnId: number): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/add-ons/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: addOnId }),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    
    // API returns array, get first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Upload images for add-ons
 * @param files Array of files to upload
 * @returns Promise with array of uploaded file URLs
 */
export async function uploadAddOnImages(files: File[]): Promise<string[]> {
  try {
    const formData = new FormData();

    // Add all files to the form data
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch('/api/add-ons/upload-images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload images');
    }

    const result = await response.json();

    if (result && result.success && result.files) {
      // Return array of URLs
      return result.files.map((file: any) => file.url);
    } else {
      throw new Error(`Upload failed or no files in response. Response: ${JSON.stringify(result)}`);
    }
  } catch (error: any) {
    console.error('Error uploading add-on images:', error);
    throw error;
  }
}

/**
 * Get all add-ons from external API
 * @returns Promise with array of add-ons
 */
export async function fetchAllAddOnsFromExternalApi(): Promise<AddOn[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/addons/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`External API returned error status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    // Convert the external API response to match our internal AddOn format
    const formattedAddOns: AddOn[] = data.map((addon: any) => {
      // Transform variants to have camelCase property names
      const transformedVariants = (addon.variants || []).map((variant: any) => ({
        id: variant.id?.toString(),
        addon_id: variant.addon_id,
        name: variant.name,
        price_modifier: variant.price_modifier,
        sku: variant.sku,
        // Transform snake_case to camelCase for frontend components
        stockQuantity: variant.stock_quantity || 0
      }));

      return {
        id: addon.id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        category: addon.category as "meal" | "merchandise" | "service" | "other",
        is_active: addon.is_active,
        // Ensure has_variants is properly assigned and recognized
        has_variants: Boolean(addon.has_variants),
        hasVariants: Boolean(addon.has_variants), // Add camelCase version too for compatibility
        // Transform snake_case to camelCase for frontend components
        stockQuantity: addon.stock_quantity || 0,
        sku: addon.sku,
        // Transform bundle discount properties
        bundleDiscount: {
          minQuantity: addon.bundle_min_quantity || 0,
          discountPercentage: parseFloat(addon.bundle_discount_percentage || '0')
        },
        created_at: "", // These fields might not be available in the external API
        updated_at: "", // These fields might not be available in the external API
        images: addon.images || [],
        // Ensure variants are only included when has_variants is true
        variants: addon.has_variants ? transformedVariants : [],
        // Preserving original properties to satisfy type constraints
        stock_quantity: addon.stock_quantity || 0,
        bundle_min_quantity: addon.bundle_min_quantity || 0,
        bundle_discount_percentage: addon.bundle_discount_percentage || '0.00'
      };
    });

    return formattedAddOns;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. The external server took too long to respond.");
    }
    throw error;
  }
}
