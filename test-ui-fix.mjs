#!/usr/bin/env node

// Test script to verify the UI issue is fixed
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testUIFix() {
    console.log('🧪 Testing UI Event Display Fix...\n');
    
    try {
        // First, check initial state
        console.log('1. Checking initial events state...');
        const initialResponse = await fetch(`${BASE_URL}/api/events`);
        const initialResult = await initialResponse.json();
        
        console.log(`   Initial events visible: ${initialResult.total}`);
        console.log(`   Hidden manual events: ${initialResult.hiddenManualEvents || 0}`);
        
        // Then fetch from multi-API
        console.log('\n2. Fetching from multi-API endpoint...');
        const apiResponse = await fetch(`${BASE_URL}/api/fetch-multi-external`);
        const apiResult = await apiResponse.json();
        
        console.log(`   API Success: ${apiResult.success}`);
        console.log(`   API Events Found: ${apiResult.totalEvents}`);
        console.log(`   API Sources: ${apiResult.enabledAPIs?.join(', ')}`);
        
        if (apiResult.success && apiResult.totalEvents > 0) {
            console.log('\n✅ Multi-API fetch successful!');
            console.log(`   Found ${apiResult.totalEvents} events from APIs`);
            
            // Show a few sample events
            console.log('\n📋 Sample API Events:');
            apiResult.data.slice(0, 3).forEach((event, i) => {
                console.log(`   ${i + 1}. ${event.title}`);
                console.log(`      📅 ${new Date(event.dateTime).toLocaleDateString()}`);
                console.log(`      🌐 ${event.sourceDisplayName}`);
                console.log(`      🏷️ ${event.category}`);
            });
            
            console.log('\n🎯 UI Fix Status: Events should now be visible in browser!');
            console.log('   💡 Refresh the page and click "🌐 Fetch CSE Events" to see them.');
            
        } else {
            console.log('\n⚠️ No events found from APIs');
        }
        
        console.log('\n✨ Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testUIFix();
