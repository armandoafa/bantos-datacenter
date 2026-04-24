const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://manage.upya.io/login', { waitUntil: 'networkidle2' });
    
    await page.type('input[type="text"], input[name="username"], input[name="email"], input[id="email"]', 'armando.afa');
    await page.type('input[type="password"]', '123456!');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Inject a script to fetch the tickets directly using the browser's context
    const tickets = await page.evaluate(async () => {
      try {
        // Try to get userId from somewhere in localStorage if needed, or just omit it
        const res = await fetch('https://api.upya.io/api/tickets/search/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            // Cookies are sent automatically by fetch in the browser context
          },
          body: JSON.stringify({
            query: { status: "Active" },
            limit: 100,
            page: 1
          })
        });
        const json = await res.json();
        return json;
      } catch (err) {
        return { error: err.toString() };
      }
    });

    console.log('Tickets fetch result:', tickets);
    
    if (tickets && tickets.data) {
      fs.writeFileSync('tickets_dump.json', JSON.stringify(tickets.data, null, 2));
      console.log(`Saved ${tickets.data.length} actions.`);
    }

  } catch (e) {
    console.error('Error during puppeteer script:', e);
  } finally {
    await browser.close();
  }
})();
