/**
 * WhatsApp Configuration Service
 * Manages WhatsApp integration settings and feature flags
 */

export interface WhatsAppSettings {
  enabled: boolean;
  apiUrl: string;
  apiToken: string;
  fallbackEnabled: boolean;
  retryAttempts: number;
  timeoutMs: number;
  debugMode: boolean;
}

/**
 * Get WhatsApp configuration with fallbacks and validation
 */
export function getWhatsAppSettings(): WhatsAppSettings {
  const settings: WhatsAppSettings = {
    enabled: process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true',
    apiUrl: process.env.ZAPTRA_API_URL || 'https://demo.zaptra.in/api/wpbox',
    apiToken: process.env.ZAPTRA_API_TOKEN || '',
    fallbackEnabled: process.env.WHATSAPP_FALLBACK_ENABLED !== 'false', // Default to true
    retryAttempts: parseInt(process.env.WHATSAPP_RETRY_ATTEMPTS || '3'),
    timeoutMs: parseInt(process.env.WHATSAPP_TIMEOUT_MS || '10000'),
    debugMode: process.env.NODE_ENV === 'development' || process.env.WHATSAPP_DEBUG === 'true'
  };

  // Validate settings
  if (settings.enabled && !settings.apiToken) {
    console.warn('⚠️ WhatsApp notifications enabled but API token not configured');
    settings.enabled = false;
  }

  if (settings.debugMode) {
    console.debug('📱 WhatsApp Settings:', {
      ...settings,
      apiToken: settings.apiToken ? '***HIDDEN***' : 'NOT_SET'
    });
  }

  return settings;
}

/**
 * Check if WhatsApp integration is healthy
 */
export async function checkWhatsAppHealth(): Promise<{
  healthy: boolean;
  error?: string;
  settings: WhatsAppSettings;
}> {
  const settings = getWhatsAppSettings();

  if (!settings.enabled) {
    return {
      healthy: false,
      error: 'WhatsApp notifications are disabled',
      settings
    };
  }

  if (!settings.apiToken) {
    return {
      healthy: false,
      error: 'API token not configured',
      settings
    };
  }

  try {
    // Test API connectivity (optional - can be expensive)
    if (settings.debugMode) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), settings.timeoutMs);

      const response = await fetch(`${settings.apiUrl}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          healthy: false,
          error: `API health check failed: ${response.status}`,
          settings
        };
      }
    }

    return {
      healthy: true,
      settings
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown health check error',
      settings
    };
  }
}

/**
 * Log WhatsApp integration events for monitoring
 */
export function logWhatsAppEvent(
  event: 'attempt' | 'success' | 'failure' | 'disabled' | 'config_error',
  details: {
    bookingId?: number;
    phone?: string;
    error?: string;
    messageId?: string;
    duration?: number;
  }
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    service: 'whatsapp',
    event,
    ...details,
    // Mask phone number for privacy
    phone: details.phone ? `***${details.phone.slice(-4)}` : undefined
  };

  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'development') {
    console.debug('📱 WhatsApp Event:', logData);
  }

  // You can extend this to send to external monitoring services
  // Example: send to DataDog, New Relic, etc.
}

/**
 * Circuit breaker pattern for WhatsApp API calls
 */
class WhatsAppCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly maxFailures = 5;
  private readonly resetTimeMs = 60000; // 1 minute

  isOpen(): boolean {
    if (this.failures >= this.maxFailures) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.resetTimeMs) {
        return true; // Circuit is open
      } else {
        // Reset circuit breaker
        this.failures = 0;
        return false;
      }
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  getStatus(): { failures: number; isOpen: boolean; resetIn?: number } {
    const isOpen = this.isOpen();
    const resetIn = isOpen ? this.resetTimeMs - (Date.now() - this.lastFailureTime) : undefined;
    
    return {
      failures: this.failures,
      isOpen,
      resetIn
    };
  }
}

// Global circuit breaker instance
export const whatsappCircuitBreaker = new WhatsAppCircuitBreaker();

/**
 * Safe wrapper for WhatsApp API calls with circuit breaker
 */
export async function safeWhatsAppCall<T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  // Check circuit breaker
  if (whatsappCircuitBreaker.isOpen()) {
    const status = whatsappCircuitBreaker.getStatus();
    logWhatsAppEvent('failure', {
      error: `Circuit breaker open. Failures: ${status.failures}, Reset in: ${status.resetIn}ms`
    });
    
    if (fallback) {
      return fallback();
    }
    throw new Error('WhatsApp service temporarily unavailable (circuit breaker open)');
  }

  try {
    const result = await operation();
    whatsappCircuitBreaker.recordSuccess();
    return result;
  } catch (error) {
    whatsappCircuitBreaker.recordFailure();
    logWhatsAppEvent('failure', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (fallback) {
      return fallback();
    }
    throw error;
  }
}
