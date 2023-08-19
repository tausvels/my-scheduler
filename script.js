import { CronJob } from 'cron'
import puppeteer from 'puppeteer';
import fs from 'fs'
import { promises as fsPromises } from 'fs';
import { parkOptions } from './constants.js'
import { solveMyCaptcha, displayDateAndTime, checkAvailibilityOfPass, dateValidator } from './helper.js'

async function automateReservation() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const page = await browser.newPage();

  const requestUrl = process.env.DAY_PASS_URL;

  // Input field values
  const firstName = process.env.FIRST_NAME;
  const lastName = process.env.LAST_NAME;
  const email = process.env.EMAIL;

  await page.goto(requestUrl, { waitUntil: 'load' })

  await page.click('#gatsby-focus-wrapper > div.static-content-container > div > div > div.page-content.col-md-9.col-12 > div.header-content > div > p:nth-child(5) > a')

  const parkOfInterest = await page.waitForSelector(`::-p-aria([name="Book a pass for ${process.env.NAME_OF_PROVENCIAL_PARK} Provincial Park"][role="button"])`);

  await parkOfInterest.click()

  // Pick Date
  const dp = await page.waitForSelector('button.date-input__calendar-btn.form-control')
  await dp.click()
  const dateElement = await page.waitForSelector(`.ngb-dp-day[aria-label="${process.env.DATE_OF_PASS}"]`);

  const isDisabled = await dateElement.evaluate((element) => {
    console.log('## element --> ', JSON.stringify(element, null, 4))
    return element.classList.contains('disabled')
  });

  if (isDisabled) {
    console.log('## DateElement is disabled and cannot be clicked');
    await browser.close();
    return false;
  }
  await dateElement.click();

  setTimeout(async () => {
    // Pick Pass type
    await page.waitForSelector('select#passType');
    // Click on the dropdown menu to open it
    await page.click('select#passType');
    // Wait for the option to become visible
    await page.waitForSelector('select#passType option:not([disabled])');
    // Option to select
    const selectedOption = process.env.OPTION;
    await page.select('select#passType', await page.$eval('select#passType', (select, options, selectedOption) => {
      const matchingOption = Array.from(select.options).find((option) => {
        return options.some((opt) => option.text.includes(opt)) && option.text.includes(selectedOption);
      });

      return matchingOption.value;
    }, parkOptions, selectedOption));
    // Wait for the element to be visible on the page
    const visitTimeDisabled = await page.$eval('#visitTimeDAY', (radioButton) => {
      return radioButton.hasAttribute('disabled');
    });

    if (visitTimeDisabled) {
      console.log('visitTimeDAY is disabled');
      await browser.close()
      return false
    } else {
      await page.waitForSelector('#visitTimeDAY:not([disabled])');
      await page.click('#visitTimeDAY');
    }

    // Pass count of more than 1 is only available for Joffre
    if (process.env.NAME_OF_PARK === 'Joffre') {
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
    }

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
      await page.waitForTimeout(2000);
      const captchaImage = await page.$('.captcha-image');

      await captchaImage.screenshot({ path: 'captcha.png' })

      // Wait for the captcha input field to be visible
      await page.waitForSelector('#answer');
      console.log('##0 answer selector found')
      const turnOffCaptcha = process.env.TURN_OFF_CAPTCHA;

      // if (!turnOffCaptcha) {
      const imagePath = './captcha.png';
      // Convert the image data to base64 format
      // const imageData = await fs.readFileSync(imagePath);
      // const base64Data = await imageData.toString('base64');
      // try {
      // const solvedCaptchaText = await solveMyCaptcha(base64Data)
      const captchaResult = await testCaptcha(imagePath)
      console.log('solved captcha text --> ', captchaResult.result)

      // Type the captcha text into the input field
      // if (captchaResult) {
      console.log('##1 reached answer')
      await page.type('#answer', captchaResult.result);
      console.log('##2 found answer selector')
      // Wait for the submit button to become enabled
      await page.waitForSelector('div.d-flex.justify-content-end button.btn-primary:not([disabled])');
      console.log('##3 submit button not disabled')
      // Click the submit button
      await page.click('div.d-flex.justify-content-end button.btn-primary');
      console.log('##4 submit button clicked')
      // Wait for the navigation to complete
      await page.waitForNavigation();

      const isSuccess = await page.evaluate(() => {
        const pageContent = document.documentElement.textContent;
        console.log('##5 page content received')
        return pageContent.includes('Success');
      });

      // Take a screenshot of the resulting page
      await page.screenshot({ path: 'qrCode.png' });
      console.log('## isSuccess --> ', isSuccess)
      // fs.unlink('./captcha.png', (err) => {
      //   if (err) {
      //     console.error('Error deleting the file: ', err)
      //   } else {
      //     console.log('Captcha image successfully deleted')
      //   }
      // })
      await browser.close();
      return isSuccess;
      // }
      // } catch (err) {
      //   console.log('error happened --> ', err)
      //   await browser.close();
      //   return false;
      // }
      // } 
      // else {
      //   // Close the browser if captcha is turned off
      //   await page.screenshot({ path: 'captcha_page.png' })
      //   console.log('## firing this else statement')
      //   await browser.close();
      //   return false;
      // }
    }, 1000)

  }, 2000)
}

let runCount = 1;
const job = new CronJob(
  process.env.CRON_RUN_TIME,
  async function () {
    const byPass = false; // change to true if you want to bypass the isAvailable flag
    if (!dateValidator(process.env.DATE_OF_PASS)) {
      throw new Error('Date must be of correct format, e.g.- Friday, August 4, 2023')
    }
    console.log(`Cron runs remaining -> ${process.env.CRON_RUN_COUNT - runCount}`)
    try {
      const passIsAvailable = await checkAvailibilityOfPass({
        nameOfPark: process.env.NAME_OF_PARK,
        option: process.env.OPTION,
        visitDate: process.env.DATE_OF_PASS,
        passType: process.env.PASS_TYPE,
        noOfPassRerequired: process.env.NO_OF_PASS_REQUIRED
      })
      console.log(displayDateAndTime())
      console.log(`Pass available for ${process.env.DATE_OF_PASS}: `, passIsAvailable)
      if (passIsAvailable || byPass) {
        const isSuccess = await automateReservation()
        if (isSuccess) {
          job.stop()
        } else if (runCount >= process.env.CRON_RUN_COUNT) { // continue with cron
          job.stop()
          console.log('Stopping cron job')
        }
      } else {
        if (runCount >= process.env.CRON_RUN_COUNT) {
          job.stop()
          console.log('Stopping cron job')
        }
      }
      runCount++
    } catch (error) {
      console.log('Error --> ', error)
      job.stop()
    }
  },
  null,
  false,
  'America/Los_Angeles'
);

job.start()

// EXAMPLES
// checkAvailibilityOfPass({ 
//   nameOfPark: 'Garibaldi',
//   option: 'Rubble Creek',
//   visitDate: process.env.DATE_OF_PASS,
//   passType: 'Day',
//   noOfPassRerequired: 1
// });

// checkAvailibilityOfPass({ 
//   nameOfPark: process.env.NAME_OF_PARK,
//   option: process.env.OPTION,
//   visitDate: process.env.DATE_OF_PASS,
//   passType: process.env.PASS_TYPE,
//   noOfPassRerequired: process.env.NO_OF_PASS_REQUIRED
// }).then((isAvailable) => console.log('isAvailable ', isAvailable))

// automateReservation()

async function testCaptcha(imagePath) {
  console.log('## inside test')
  try {
    const imageData = await fsPromises.readFile(imagePath);
    const base64Data = await imageData.toString('base64');
    const captchaResult = await solveMyCaptcha(base64Data);
    console.log('## test function captcha result -> ', captchaResult)
    return captchaResult;
  } catch (error) {
    console.error(error);
    throw new Error(`Error happend from test function, ${error}`)
  }
}