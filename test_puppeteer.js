const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    try {
        await page.goto('file:///c:/Users/User/Desktop/BrawlClone3D/index.html', { waitUntil: 'networkidle0' });
        console.log('Page loaded successfully');
        
        // Try clicking the start button
        const startBtn = await page.$('#start-btn');
        if (startBtn) {
            console.log('Start button found, clicking...');
            await startBtn.click();
            console.log('Clicked!');
            // Wait a bit to see if anything happens
            await new Promise(r => setTimeout(r, 1000));
        } else {
            console.log('Start button NOT found!');
        }
    } catch (e) {
        console.error('Error during test:', e);
    } finally {
        await browser.close();
    }
})();
