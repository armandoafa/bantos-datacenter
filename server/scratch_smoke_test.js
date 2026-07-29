import { TrustonicClient } from './modules/trustonic-api-client/index.js';

const API_KEY = 'kWZSauLWJIwxJQXGRzFDoCqxC6IsW2lWwwEMHl9EP2ZatclgOcyicPGi3SOfasHvgUZQadf8VZLMAt4atJCL2g==';
const IMEI = '352433395700914';

async function runTest() {
  const report = [];
  report.push('### Smoke Test Execution Log');
  report.push('- **Start Time:** ' + new Date().toISOString());
  report.push('- **Target IMEI:** ' + IMEI);

  const client = new TrustonicClient(API_KEY, 'c-romel');

  try {
    report.push('- **Step 1: Authorization**');
    await client.authorize();
    report.push('  - ✅ Authorized successfully. Token acquired.');

    report.push('- **Step 2: Lock Device**');
    try {
      const lockRes = await client.device.lock(IMEI, 'TEST LOCK BY BANTOS SYSTEM');
      report.push('  - ✅ Lock command sent successfully.');
      report.push('  - 📄 Response: ' + JSON.stringify(lockRes));
      
      report.push('- **Step 3: Wait 5 Seconds**');
      await new Promise(r => setTimeout(r, 5000));
      
      report.push('- **Step 4: Reverting Lock (Unlock Device)**');
      try {
        const unlockRes = await client.device.unlock(IMEI);
        report.push('  - ✅ Unlock command sent successfully.');
        report.push('  - 📄 Response: ' + JSON.stringify(unlockRes));
      } catch (unlockErr) {
        report.push('  - ❌ Unlock command failed: ' + unlockErr.message);
      }
    } catch (lockErr) {
      report.push('  - ❌ Lock command failed: ' + lockErr.message);
    }
  } catch (err) {
    report.push('- ❌ Authorization failed: ' + err.message);
  }

  report.push('- **End Time:** ' + new Date().toISOString());
  
  console.log(JSON.stringify(report, null, 2));
}

runTest();
