import { NextResponse } from 'next/server';
import { checkWhatsAppHealth, whatsappCircuitBreaker } from '@/services/whatsappConfigService';

export async function GET() {
  try {
    console.log('📱 WhatsApp Health API: Checking WhatsApp integration health');

    // Check WhatsApp health
    const healthResult = await checkWhatsAppHealth();
    
    // Get circuit breaker status
    const circuitStatus = whatsappCircuitBreaker.getStatus();

    // Prepare response
    const response = {
      healthy: healthResult.healthy,
      enabled: healthResult.settings.enabled,
      circuitBreaker: {
        isOpen: circuitStatus.isOpen,
        failures: circuitStatus.failures,
        resetIn: circuitStatus.resetIn
      },
      error: healthResult.error,
      timestamp: new Date().toISOString()
    };

    // Return health status
    return NextResponse.json(response, { 
      status: healthResult.healthy ? 200 : 503 
    });

  } catch (error: any) {
    console.error('📱 WhatsApp Health API: Error checking health:', error);
    return NextResponse.json(
      { 
        healthy: false, 
        error: error.message || 'Unknown error checking WhatsApp health',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
