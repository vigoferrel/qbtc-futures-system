#!/usr/bin/env node

console.log('Debug test starting...');

async function basicTest() {
    console.log('Node.js version:', process.version);
    console.log('Platform:', process.platform);
    console.log('Current directory:', process.cwd());
    
    try {
        console.log('Testing ES modules...');
        const { performance } = await import('perf_hooks');
        console.log('ES modules working!');
        
        console.log('Testing file system...');
        const fs = await import('fs/promises');
        const files = await fs.readdir('.');
        console.log('Directory contains', files.length, 'items');
        
        console.log('Testing performance...');
        const start = performance.now();
        let sum = 0;
        for (let i = 0; i < 100000; i++) {
            sum += i;
        }
        const end = performance.now();
        console.log(`Performance test took ${(end - start).toFixed(2)}ms`);
        
        console.log('All basic tests passed!');
        
    } catch (error) {
        console.error('Error in basic test:', error);
    }
}

basicTest().then(() => {
    console.log('Debug test completed');
}).catch((error) => {
    console.error('Debug test failed:', error);
});
