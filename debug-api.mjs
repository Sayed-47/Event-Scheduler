#!/usr/bin/env node

// Debug script to test the improved API fetching
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function debugMultiAPI() {
    console.log('🔧 Debug Multi-API Event Fetching...\n');
    
    try {
        console.log('1. Testing improved multi-API endpoint...');
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/api/fetch-multi-external`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        const endTime = Date.now();
        
        console.log('\n📊 Improved Multi-API Results:');
        console.log(`✅ Success: ${result.success}`);
        console.log(`📈 Total Events: ${result.totalEvents}`);
        console.log(`🔗 Enabled APIs: ${result.enabledAPIs?.join(', ')}`);
        console.log(`⏱️ Processing Time: ${endTime - startTime}ms`);
        
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
        
        // Show sample events if any were found
        if (result.data && result.data.length > 0) {
            console.log('\n🎯 Sample Events Found:');
            result.data.slice(0, 3).forEach((event, i) => {
                console.log(`\n  ${i + 1}. ${event.title}`);
                console.log(`     📅 Date: ${new Date(event.dateTime).toLocaleDateString()}`);
                console.log(`     📍 Location: ${event.location}`);
                console.log(`     🏷️ Category: ${event.category}`);
                console.log(`     🌐 Source: ${event.sourceDisplayName}`);
                if (event.url) {
                    console.log(`     🔗 URL: ${event.url}`);
                }
            });
            
            if (result.data.length > 3) {
                console.log(`     ... and ${result.data.length - 3} more events`);
            }
        }
        
        console.log('\n✨ Debug test completed!');
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
        process.exit(1);
    }
}

debugMultiAPI();
