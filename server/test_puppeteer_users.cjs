const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
    
    await page.type('input[type="text"], input[name="username"], input[name="email"], input[id="email"]', 'armando.bantoshub');
    await page.type('input[type="password"]', '123456!');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    const users = await page.evaluate(async () => {
      try {
        const res = await fetch('https://api.upya.io/data/search/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ query: {} })
        });
        return await res.json();
      } catch (err) { return { error: err.toString() }; }
    });

    console.log('Users fetch result:', users);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();
