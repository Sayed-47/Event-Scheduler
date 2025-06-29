#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🔧 Testing Multi-API Functionality...\n');

const BASE_URL = 'http://localhost:3000';

async function testMultiAPI() {
    try {
        console.log('1. Testing multi-API endpoint...');
        
        const response = await fetch(`${BASE_URL}/api/fetch-multi-external`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Multi-API endpoint responded successfully');
            console.log(`📊 Total events: ${data.totalEvents || 0}`);
            console.log(`🎯 Success: ${data.success}`);
            
            if (data.sourceBreakdown) {
                console.log('\n📈 Source breakdown:');
                Object.entries(data.sourceBreakdown).forEach(([source, count]) => {
                    console.log(`   ${source}: ${count} events`);
                });
            }
            
            if (data.apiStatuses) {
                console.log('\n🔗 API statuses:');
                Object.entries(data.apiStatuses).forEach(([api, status]) => {
                    console.log(`   ${api}: ${status}`);
                });
            }
            
            if (data.errors && data.errors.length > 0) {
                console.log('\n⚠️  Errors encountered:');
                data.errors.forEach(error => console.log(`   - ${error}`));
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Multi-API endpoint failed');
            console.log('Error response:', errorText);
        }

        // Test individual API services
        console.log('\n2. Testing Eventbrite endpoint...');
        const ebResponse = await fetch(`${BASE_URL}/api/fetch-external`);
        if (ebResponse.ok) {
            const ebData = await ebResponse.json();
            console.log(`✅ Eventbrite: ${ebData.totalEvents || 0} events`);
        } else {
            console.log('❌ Eventbrite endpoint failed');
        }

        // Test if events are being saved
        console.log('\n3. Testing event storage...');
        const eventsResponse = await fetch(`${BASE_URL}/api/events`);
        if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            console.log(`✅ Events storage: ${eventsData.total || 0} total events`);
        } else {
            console.log('❌ Events storage test failed');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testMultiAPI();
