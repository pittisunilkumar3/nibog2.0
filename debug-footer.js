// Debug script to test footer component data flow
// Run this in browser console on a page with the footer

console.log('🔍 Debugging Footer Component...\n');

// Test the footer settings service directly
const testFooterService = async () => {
  try {
    console.log('📡 Testing API call...');
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/footer_setting/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        const footerData = data[0];
        console.log('📋 Footer Data:');
        console.log('  Company Name:', footerData.company_name);
        console.log('  Company Description:', footerData.company_description);
        console.log('  Address:', footerData.address);
        console.log('  Phone:', footerData.phone);
        console.log('  Email:', footerData.email);
        console.log('  Newsletter Enabled:', footerData.newsletter_enabled);
        console.log('  Copyright Text:', footerData.copyright_text);
        console.log('  Social Media URLs:');
        console.log('    Facebook:', footerData.facebook_url);
        console.log('    Instagram:', footerData.instagram_url);
        console.log('    LinkedIn:', footerData.linkedin_url);
        console.log('    YouTube:', footerData.youtube_url);
      }
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Service Test Error:', error);
  }
};

// Check DOM elements in the footer
const checkFooterDOM = () => {
  console.log('\n🔍 Checking Footer DOM Elements...');
  
  const footer = document.querySelector('footer');
  if (!footer) {
    console.log('❌ Footer element not found');
    return;
  }
  
  console.log('✅ Footer element found');
  
  // Look for company name element
  const companyNameElement = footer.querySelector('h3');
  if (companyNameElement) {
    console.log('✅ Company name element found:');
    console.log('  Text content:', companyNameElement.textContent);
    console.log('  Inner HTML:', companyNameElement.innerHTML);
    console.log('  Classes:', companyNameElement.className);
    console.log('  Computed styles:');
    const styles = window.getComputedStyle(companyNameElement);
    console.log('    Display:', styles.display);
    console.log('    Visibility:', styles.visibility);
    console.log('    Opacity:', styles.opacity);
    console.log('    Color:', styles.color);
    console.log('    Background:', styles.background);
    console.log('    Font size:', styles.fontSize);
    console.log('    Font weight:', styles.fontWeight);
  } else {
    console.log('❌ Company name element (h3) not found');
  }
  
  // Look for company description
  const descriptionElement = footer.querySelector('p');
  if (descriptionElement) {
    console.log('✅ Company description element found:');
    console.log('  Text content:', descriptionElement.textContent);
  } else {
    console.log('❌ Company description element (p) not found');
  }
  
  // Check for social media icons
  const socialIcons = footer.querySelectorAll('svg');
  console.log(`📱 Found ${socialIcons.length} social media icons`);
  
  // Check for newsletter section
  const newsletterSection = footer.querySelector('input[type="email"]');
  if (newsletterSection) {
    console.log('✅ Newsletter section found');
  } else {
    console.log('❌ Newsletter section not found');
  }
};

// Check for React component state (if accessible)
const checkReactState = () => {
  console.log('\n⚛️ Checking React Component State...');
  
  const footer = document.querySelector('footer');
  if (footer && footer._reactInternalFiber) {
    console.log('✅ React fiber found');
    // This would require more complex inspection
  } else {
    console.log('ℹ️ React internal state not directly accessible');
  }
};

// Main debug function
const debugFooter = async () => {
  console.log('🚀 Starting Footer Debug...\n');
  
  await testFooterService();
  checkFooterDOM();
  checkReactState();
  
  console.log('\n✨ Footer Debug Complete!');
  console.log('\n📝 Instructions:');
  console.log('1. Check if the company name appears in the DOM');
  console.log('2. Verify the API is returning correct data');
  console.log('3. Look for any styling issues (opacity, visibility, color)');
  console.log('4. Check browser console for any React errors');
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  debugFooter();
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { debugFooter, testFooterService, checkFooterDOM };
}
