const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuration - supports both local and CI environments
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SELENIUM_URL = process.env.SELENIUM_URL || ''; // Empty = use local Chrome
const TIMEOUT = 15000;

// Generate unique test user for each run
const timestamp = Date.now();
const TEST_USER = {
  name: 'Test User',
  email: `testuser${timestamp}@example.com`,
  password: 'TestPassword123',
};

function getDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');

  const builder = new Builder().forBrowser('chrome').setChromeOptions(options);

  // If SELENIUM_URL is set (CI environment), use remote Selenium
  if (SELENIUM_URL) {
    builder.usingServer(SELENIUM_URL);
  }

  return builder.build();
}

// Helper: wait for element and return it
async function waitForElement(driver, locator, timeout = TIMEOUT) {
  await driver.wait(until.elementLocated(locator), timeout);
  const el = await driver.findElement(locator);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

// Helper: wait for text to appear anywhere on page
async function waitForText(driver, text, timeout = TIMEOUT) {
  await driver.wait(
    until.elementLocated(By.xpath(`//*[contains(text(), '${text}')]`)),
    timeout
  );
}

// ============================================================
// TEST SUITE
// ============================================================
let driver;
let passed = 0;
let failed = 0;
const results = [];

function logResult(name, success, error = null) {
  if (success) {
    passed++;
    results.push(`  ✅ PASS: ${name}`);
    console.log(`  ✅ PASS: ${name}`);
  } else {
    failed++;
    results.push(`  ❌ FAIL: ${name} — ${error}`);
    console.log(`  ❌ FAIL: ${name} — ${error}`);
  }
}

(async function runTests() {
  console.log('==============================================');
  console.log('  Selenium E2E Test Suite');
  console.log(`  Target: ${APP_URL}`);
  console.log('==============================================\n');

  driver = await getDriver();

  try {
    // ----------------------------------------------------------
    // TEST 1: App loads and shows Login form
    // ----------------------------------------------------------
    try {
      await driver.get(APP_URL);
      await waitForText(driver, 'Sign In');
      const heading = await driver.findElement(
        By.xpath("//h1[contains(text(), 'Sign In')]")
      );
      const text = await heading.getText();
      logResult('App loads and shows Login form', text.includes('Sign In'));
    } catch (e) {
      logResult('App loads and shows Login form', false, e.message);
    }

    // ----------------------------------------------------------
    // TEST 2: Navigate from Login to Signup
    // ----------------------------------------------------------
    try {
      const signupLink = await waitForElement(
        driver,
        By.xpath("//*[contains(text(), 'Sign up here') or contains(text(), 'sign up here')]")
      );
      await signupLink.click();
      await waitForText(driver, 'Create Account');
      logResult('Navigate from Login to Signup', true);
    } catch (e) {
      logResult('Navigate from Login to Signup', false, e.message);
    }

    // ----------------------------------------------------------
    // TEST 3: Signup validation — empty form submission
    // ----------------------------------------------------------
    try {
      const submitBtn = await waitForElement(
        driver,
        By.xpath("//button[contains(text(), 'Create Account')]")
      );
      await submitBtn.click();

      // Should show validation error
      await waitForText(driver, 'Name is required');
      logResult('Signup validation — empty form shows error', true);
    } catch (e) {
      logResult('Signup validation — empty form shows error', false, e.message);
    }

    // ----------------------------------------------------------
    // TEST 4: Signup validation — password mismatch
    // ----------------------------------------------------------
    try {
      // Fill in name
      const nameField = await waitForElement(driver, By.id('name'));
      await nameField.clear();
      await nameField.sendKeys(TEST_USER.name);

      // Fill in email
      const emailField = await waitForElement(driver, By.id('email'));
      await emailField.clear();
      await emailField.sendKeys(TEST_USER.email);

      // Fill in mismatched passwords
      const pwField = await waitForElement(driver, By.id('password'));
      await pwField.clear();
      await pwField.sendKeys(TEST_USER.password);

      const confirmPwField = await waitForElement(driver, By.id('confirmPassword'));
      await confirmPwField.clear();
      await confirmPwField.sendKeys('WrongPassword');

      // Submit
      const submitBtn = await driver.findElement(
        By.xpath("//button[contains(text(), 'Create Account')]")
      );
      await submitBtn.click();

      await waitForText(driver, 'Passwords do not match');
      logResult('Signup validation — password mismatch', true);
    } catch (e) {
      logResult('Signup validation — password mismatch', false, e.message);
    }

    // ----------------------------------------------------------
    // TEST 5: Successful Registration
    // ----------------------------------------------------------
    try {
      // Fix the confirm password field
      const confirmPwField = await waitForElement(driver, By.id('confirmPassword'));
      await confirmPwField.clear();
      await confirmPwField.sendKeys(TEST_USER.password);

      // Submit
      const submitBtn = await driver.findElement(
        By.xpath("//button[contains(text(), 'Create Account')]")
      );
      await submitBtn.click();

      // After successful registration, the app should show the main PDF signing UI
      await waitForText(driver, 'PDF Signature App', 20000);
      await waitForText(driver, 'Upload PDF');
      logResult('Successful registration redirects to main app', true);
    } catch (e) {
      // Diagnostic: Check if there's a visible error alert on the screen
      let onScreenError = '';
      try {
        const errorEl = await driver.findElement(By.css('.MuiAlert-message, [role="alert"]'));
        onScreenError = await errorEl.getText();
      } catch (err) {
        onScreenError = 'No error alert visible';
      }
      logResult('Successful registration redirects to main app', false, `${e.message} (On-screen error: ${onScreenError})`);
    }

    // ----------------------------------------------------------
    // TEST 6: Main app UI elements are present after auth
    // ----------------------------------------------------------
    try {
      await waitForText(driver, 'Upload PDF');
      await waitForText(driver, 'Type Your Signature');
      await waitForText(driver, 'Download Signed PDF');

      // Check welcome message
      await waitForText(driver, `Welcome, ${TEST_USER.name}!`);
      logResult('Main app shows all UI sections after login', true);
    } catch (e) {
      logResult('Main app shows all UI sections after login', false, e.message);
    }

    // ----------------------------------------------------------
    // TEST 7: Logout flow
    // ----------------------------------------------------------
    try {
      // Click the logout button (icon button with LogoutIcon)
      const logoutBtn = await waitForElement(
        driver,
        By.css('button[aria-label="logout"], button svg[data-testid="LogoutIcon"]')
      ).catch(async () => {
        // Fallback: find button near the welcome text
        const buttons = await driver.findElements(By.css('button'));
        for (const btn of buttons) {
          const html = await btn.getAttribute('innerHTML');
          if (html.includes('Logout') || html.includes('logout')) {
            return btn;
          }
        }
        throw new Error('Logout button not found');
      });

      // Click the button or its parent
      try {
        await logoutBtn.click();
      } catch {
        // If we found the SVG icon, click its parent button
        const parent = await logoutBtn.findElement(By.xpath('./ancestor::button'));
        await parent.click();
      }

      // Should return to login form
      await waitForText(driver, 'Sign In');
      logResult('Logout returns to Login screen', true);
    } catch (e) {
      logResult('Logout returns to Login screen', false, e.message);
    }

    // ----------------------------------------------------------
    // TEST 8: Login with registered user
    // ----------------------------------------------------------
    try {
      // We should now be on the Login page
      const emailField = await waitForElement(driver, By.id('email'));
      await emailField.clear();
      await emailField.sendKeys(TEST_USER.email);

      const pwField = await waitForElement(driver, By.id('password'));
      await pwField.clear();
      await pwField.sendKeys(TEST_USER.password);

      const submitBtn = await driver.findElement(
        By.xpath("//button[contains(text(), 'Sign In')]")
      );
      await submitBtn.click();

      // Should redirect to main app
      await waitForText(driver, 'PDF Signature App', 20000);
      await waitForText(driver, `Welcome, ${TEST_USER.name}!`);
      logResult('Login with registered user succeeds', true);
    } catch (e) {
      logResult('Login with registered user succeeds', false, e.message);
    }

    // ----------------------------------------------------------
    // TEST 9: Login validation — invalid credentials
    // ----------------------------------------------------------
    try {
      // Navigate to login page first (logout if needed)
      await driver.get(APP_URL);

      // Clear any stored auth
      await driver.executeScript('localStorage.clear()');
      await driver.get(APP_URL);
      await waitForText(driver, 'Sign In');

      const emailField = await waitForElement(driver, By.id('email'));
      await emailField.clear();
      await emailField.sendKeys('nonexistent@example.com');

      const pwField = await waitForElement(driver, By.id('password'));
      await pwField.clear();
      await pwField.sendKeys('badpassword123');

      const submitBtn = await driver.findElement(
        By.xpath("//button[contains(text(), 'Sign In')]")
      );
      await submitBtn.click();

      // Should show error
      await driver.wait(
        until.elementLocated(By.css('.MuiAlert-standardError, [role="alert"]')),
        TIMEOUT
      );
      logResult('Login with invalid credentials shows error', true);
    } catch (e) {
      logResult('Login with invalid credentials shows error', false, e.message);
    }

    // ----------------------------------------------------------
    // TEST 10: Navigate back from Signup to Login
    // ----------------------------------------------------------
    try {
      await driver.get(APP_URL);
      await driver.executeScript('localStorage.clear()');
      await driver.get(APP_URL);
      await waitForText(driver, 'Sign In');

      // Go to signup
      const signupLink = await waitForElement(
        driver,
        By.xpath("//*[contains(text(), 'Sign up here') or contains(text(), 'sign up here')]")
      );
      await signupLink.click();
      await waitForText(driver, 'Create Account');

      // Go back to login
      const loginLink = await waitForElement(
        driver,
        By.xpath("//*[contains(text(), 'Sign in here') or contains(text(), 'sign in here')]")
      );
      await loginLink.click();
      await waitForText(driver, 'Sign In');
      logResult('Navigate Signup → Login', true);
    } catch (e) {
      logResult('Navigate Signup → Login', false, e.message);
    }
  } finally {
    await driver.quit();

    // Print summary
    console.log('\n==============================================');
    console.log('  Test Results Summary');
    console.log('==============================================');
    results.forEach((r) => console.log(r));
    console.log(`\n  Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('==============================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  }
})();
