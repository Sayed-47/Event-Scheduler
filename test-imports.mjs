#!/usr/bin/env node

// Test individual service imports
try {
    console.log('Testing eventbriteService import...');
    const eventbrite = await import('./src/services/eventbriteService.js');
    console.log('✅ EventbriteService imported successfully');
    console.log('Default export available:', !!eventbrite.default);
} catch (error) {
    console.error('❌ EventbriteService import failed:', error.message);
}

try {
    console.log('Testing ticketmasterService import...');
    const ticketmaster = await import('./src/services/ticketmasterService.js');
    console.log('✅ TicketmasterService imported successfully');
    console.log('Default export available:', !!ticketmaster.default);
} catch (error) {
    console.error('❌ TicketmasterService import failed:', error.message);
}

try {
    console.log('Testing multiAPIService import...');
    const multiAPI = await import('./src/services/multiAPIService.js');
    console.log('✅ MultiAPIService imported successfully');
    console.log('Default export available:', !!multiAPI.default);
} catch (error) {
    console.error('❌ MultiAPIService import failed:', error.message);
}
