#!/usr/bin/env node

// Test script for multi-API functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testMultiAPI() {
    console.log('🧪 Testing Multi-API Event Fetching...\n');
    
    try {
        console.log('1. Testing multi-API endpoint...');
        const response = await fetch(`${BASE_URL}/api/fetch-multi-external`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        console.log('\n📊 Multi-API Results:');
        console.log(`✅ Success: ${result.success}`);
        console.log(`📈 Total Events: ${result.totalEvents}`);
        console.log(`🔗 Enabled APIs: ${result.enabledAPIs?.join(', ')}`);
        console.log(`⏱️ Processing Time: ${result.processingTime}`);
        
        console.log('\n📊 Source Breakdown:');
        Object.entries(result.sourceBreakdown || {}).forEach(([api, count]) => {
            console.log(`  ${api}: ${count} events`);
        });
        
        console.log('\n📋 Categories:');
        Object.entries(result.categories || {}).forEach(([category, count]) => {
            if (count > 0) {
                console.log(`  ${category}: ${count} events`);
            }
        });
        
        console.log('\n🔧 API Statuses:');
        Object.entries(result.apiStatuses || {}).forEach(([api, status]) => {
            const statusIcon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
            console.log(`  ${statusIcon} ${api}: ${status}`);
        });
        
        if (result.errors && Object.keys(result.errors).length > 0) {
            console.log('\n❌ Errors:');
            Object.entries(result.errors).forEach(([api, error]) => {
                console.log(`  ${api}: ${error}`);
            });
        }
        
        console.log(`\n💬 Message: ${result.message}`);
        
        // Test events endpoint to see if manual events are hidden
        console.log('\n2. Testing events endpoint (API events only)...');
        const eventsResponse = await fetch(`${BASE_URL}/api/events`);
        const eventsResult = await eventsResponse.json();
        
        console.log(`📊 Total visible events: ${eventsResult.total}`);
        console.log(`🔒 Hidden manual events: ${eventsResult.hiddenManualEvents || 0}`);
        console.log(`📋 Showing manual: ${eventsResult.showingManual}`);
        
        // Test with manual events included
        console.log('\n3. Testing events endpoint (including manual)...');
        const allEventsResponse = await fetch(`${BASE_URL}/api/events?showManual=true`);
        const allEventsResult = await allEventsResponse.json();
        
        console.log(`📊 Total events (with manual): ${allEventsResult.total}`);
        console.log(`📋 Showing manual: ${allEventsResult.showingManual}`);
        
        const apiEvents = allEventsResult.data.filter(e => e.sourceType === 'api_pulled');
        const manualEvents = allEventsResult.data.filter(e => e.sourceType === 'manual_input');
        
        console.log(`🌐 API Events: ${apiEvents.length}`);
        console.log(`👤 Manual Events: ${manualEvents.length}`);
        
        console.log('\n✨ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testMultiAPI();
