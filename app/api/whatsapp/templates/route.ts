import { NextResponse } from 'next/server';
import { getWhatsAppTemplates } from '@/services/whatsappService';
import { getWhatsAppSettings } from '@/services/whatsappConfigService';

export async function GET() {
  try {
    console.log('📱 WhatsApp Templates API: Fetching available templates');

    // Check if WhatsApp is enabled
    const settings = getWhatsAppSettings();
    if (!settings.enabled) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'WhatsApp notifications are disabled' 
        },
        { status: 400 }
      );
    }

    // Get templates from Zaptra
    const result = await getWhatsAppTemplates();

    if (result.success) {
      console.log(`✅ WhatsApp Templates API: Found ${result.templates?.length || 0} templates`);
      return NextResponse.json({
        success: true,
        templates: result.templates,
        message: 'Templates retrieved successfully'
      });
    } else {
      console.error(`❌ WhatsApp Templates API: Failed to get templates: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('📱 WhatsApp Templates API: Error fetching templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch WhatsApp templates' 
      },
      { status: 500 }
    );
  }
}
