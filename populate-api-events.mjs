#!/usr/bin/env node

// Simple script to fetch and save API events for testing
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function fetchAndSaveAPIEvents() {
    try {
        console.log('🔄 Fetching API events...');
        
        // Fetch from multi-API endpoint
        const response = await fetch(`${BASE_URL}/api/fetch-multi-external`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            console.log(`✅ Found ${result.data.length} API events`);
            
            // Save each event via the events API with proper sourceType
            let savedCount = 0;
            
            for (const event of result.data) {
                try {
                    const eventData = {
                        title: event.title,
                        dateTime: event.dateTime,
                        location: event.location,
                        description: event.description,
                        source: event.sourceDisplayName || 'API',
                        sourceType: 'api_pulled',
                        sourceAPI: event.sourceAPI,
                        category: event.category
                    };
                    
                    const saveResponse = await fetch(`${BASE_URL}/api/events`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(eventData)
                    });
                    
                    if (saveResponse.ok) {
                        savedCount++;
                        console.log(`💾 Saved: ${event.title}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to save ${event.title}:`, error.message);
                }
            }
            
            console.log(`🎉 Successfully saved ${savedCount}/${result.data.length} events`);
        } else {
            console.log('📅 No API events found');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fetchAndSaveAPIEvents();
