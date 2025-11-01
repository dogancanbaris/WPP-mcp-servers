/**
 * Quick test to verify ad creative tools can be imported
 */

import { createAdTool, listAdsTool, updateAdTool } from './src/ads/tools/ads/index.ts';

console.log('✅ Ad creative tools imported successfully:');
console.log('  - create_ad:', createAdTool.name);
console.log('  - list_ads:', listAdsTool.name);
console.log('  - update_ad:', updateAdTool.name);

console.log('\n📊 Tool Details:');
console.log('\n1. create_ad:');
console.log('   Description:', createAdTool.description.split('\n')[0]);
console.log('   Input Schema Properties:', Object.keys(createAdTool.inputSchema.properties));

console.log('\n2. list_ads:');
console.log('   Description:', listAdsTool.description);
console.log('   Input Schema Properties:', Object.keys(listAdsTool.inputSchema.properties));

console.log('\n3. update_ad:');
console.log('   Description:', updateAdTool.description);
console.log('   Input Schema Properties:', Object.keys(updateAdTool.inputSchema.properties));

console.log('\n✅ All ad creative tools are properly configured!');
