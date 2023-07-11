import { CronJob } from 'cron'

import puppeteer from 'puppeteer';
import fs from 'fs'
import { solveMyCaptcha, displayDateAndTime, checkAvailibilityOfPass } from './helper.js'

async function automateReservation() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const page = await browser.newPage();
  const requestUrl = process.env.dayPassUrl;

  // Input field values
  const firstName = 'Tausif';
  const lastName = 'Khan';
  const email = 'tausif_1206@yahoo.com';

  await page.goto(requestUrl, { waitUntil: 'load' })
  await page.screenshot({ path: 'allItems.png' })

  await page.click('#gatsby-focus-wrapper > div:nth-child(5) > div > div > div.page-content.col-md-9.col-12 > div.header-content > div > p:nth-child(5) > a')

  const jp = await page.waitForSelector('::-p-aria([name="Book a pass for Joffre Lakes Provincial Park"][role="button"])');

  await jp.click()

  // Pick Date
  const dp = await page.waitForSelector('button.date-input__calendar-btn.form-control')
  await dp.click()
  const dateElement = await page.waitForSelector(`.ngb-dp-day[aria-label="${process.env.dateOfPass}"]`);
  await dateElement.click();


  setTimeout(async () => {
    // Pick Pass type
    await page.waitForSelector('select#passType');
    // Click on the dropdown menu to open it
    await page.click('select#passType');
    // Wait for the option to become visible
    await page.waitForSelector('select#passType option:not([disabled])');
    // Select the only available option
    await page.select('select#passType', await page.$eval('select#passType option:not([disabled])', (option) => option.value));
    // Wait for the element to be visible on the page
    const visitTimeDisabled = await page.$eval('#visitTimeDAY', (radioButton) => {
      return radioButton.hasAttribute('disabled');
    });

    if (visitTimeDisabled) {
      console.log('visitTimeDAY is disabled');
    } else {
      await page.waitForSelector('#visitTimeDAY:not([disabled])');
      await page.click('#visitTimeDAY');
    }

    await page.waitForSelector('#passCount');
    const maxOptionValue = await page.$eval('#passCount', (select) => {
      const options = Array.from(select.options);
      const maxOption = options.reduce((max, option) => {
        const optionValue = parseInt(option.value);
        return optionValue > max ? optionValue : max;
      }, 0);
      return maxOption.toString();
    });

    await page.select('#passCount', maxOptionValue);

    // Click next button
    await page.waitForSelector('button.btn-primary');
    await page.click('button.btn-primary');

    // Fill the form fields
    await page.type('#firstName', firstName);
    await page.type('#lastName', lastName);
    await page.type('#email', email);
    await page.type('#emailCheck', email);
    await page.click('input[type="checkbox"]');
    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

    // -----------------------
    //* CAPTCHA PART //
    // -----------------------
    // Wait for the captcha section to be visible
    await page.waitForSelector('app-captcha');

    setTimeout(async () => {
      // Wait for the CAPTCHA image to load
      await page.waitForSelector('.captcha-image');

      // Wait for the CAPTCHA image to load
      await page.waitForSelector('.captcha-image');
      await page.waitForTimeout(2000);
      const captchaImage = await page.$('.captcha-image');

      await captchaImage.screenshot({ path: 'captcha.png' })

      // Wait for the captcha input field to be visible
      await page.waitForSelector('#answer');

      await browser.close(); //! <-- REMOVE THIS LINE ONCE TEST IS COMPLETE
      /*
      const imagePath = './captcha.png';
      // Convert the image data to base64 format
      const imageData = await fs.readFileSync(imagePath);
      const base64Data = await imageData.toString('base64');
      try {
        const solvedCaptchaText = await solveMyCaptcha(base64Data)
        console.log('solved captcha text --> ', solvedCaptchaText.result)

        // Type the captcha text into the input field
        if (solvedCaptchaText.result) {
          await page.type('#answer', solvedCaptchaText.result);
          // Wait for the submit button to become enabled
          await page.waitForSelector('div.d-flex.justify-content-end button.btn-primary:not([disabled])');
          // Click the submit button
          await page.click('div.d-flex.justify-content-end button.btn-primary');

          // Wait for the navigation to complete
          await page.waitForNavigation();

          // Take a screenshot of the resulting page
          await page.screenshot({ path: 'screenshot.png' });
          const isSuccess = await page.evaluate(() => {
            const qrCodeElement = document.querySelector('#qr-code .d-none');
            return qrCodeElement !== null;
          });
          await browser.close();
        }
      } catch (err) {
        console.log('error happened --> ', err)
        await browser.close();
      }
      */

    }, 1000)

  }, 2000)


}

// automateReservation()

let runCount = 0;
const job = new CronJob(
  '*/10 05 3 * * *',
  // '*/2 * * * * *',
  async function () {
    // await delay(5000)
    // await automateReservation();
    console.log(displayDateAndTime())
    if (runCount >= 3) {
      job.stop()
      console.log('Stopping cron job')
    }
    runCount++
  },
  null,
  false,
  'America/Los_Angeles'
);

// job.start()

// checkAvailibilityOfPass({ 
//   nameOfPark: 'Garibaldi',
//   option: 'Rubble Creek',
//   visitDate: process.env.dateOfPass,
//   passType: 'Day',
//   noOfPassRerequired: 1
// });
checkAvailibilityOfPass({ 
  nameOfPark: process.env.nameOfPark,
  option: process.env.option,
  visitDate: process.env.dateOfPass,
  passType: process.env.passType,
  noOfPassRerequired: process.env.noOfPassRerequired
}).then((isAvailable) => console.log('isAvailable ', isAvailable))
