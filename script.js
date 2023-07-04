// const puppeteer = require('puppeteer');

import puppeteer from 'puppeteer-extra';
import Tesseract from 'node-tesseract-ocr';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import pkg from 'svg2img'
import fs from 'fs'

const { svg2img } = pkg

async function yourOCRFunction(imageBuffer) {
  try {
    // Set up the Tesseract options
    const config = {
      lang: 'eng', // Specify the language
      oem: 1, // Use LSTM OCR Engine
      psm: 7, // Treat the image as a single line of text
    };

    // Perform OCR using node-tesseract-ocr
    const captchaSolution = await Tesseract.recognize(imageBuffer, config);

    // Clean up the OCR output
    const cleanedText = captchaSolution.replace(/[^a-zA-Z0-9]/g, '');

    // Return the solved captcha as a string
    return cleanedText;
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
}

async function solveCaptcha(page) {
  try {
    // Select the captcha element
    const captchaElement = await page.$('#captcha');

    // Get the captcha image source
    const captchaImageSrc = await page.evaluate((element) => {
      return element.getAttribute('src');
    }, captchaElement);

    // Download the captcha image
    const imageBuffer = await page.evaluate(async (src) => {
      const response = await fetch(src);
      const buffer = await response.arrayBuffer();
      return buffer;
    }, captchaImageSrc);

    // Solve the captcha using node-tesseract-ocr
    const captchaSolution = await yourOCRFunction(imageBuffer);

    // Return the solved captcha as a string
    return captchaSolution;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function automateReservation() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const page = await browser.newPage();
  const testUrl = 'https://example.com'
  const testUrl2 = 'https://reserve.bcparks.ca/dayuse/'
  const testUrl3 = 'https://bcparks.ca/reservations/day-use-passes/'

  // Input field values
  const firstName = 'John';
  const lastName = 'Doe';
  const email = 'johndoe@example.com';

  await page.goto(testUrl3, { waitUntil: 'load' })
  await page.screenshot({ path: 'allItems.png' })

  await page.click('#gatsby-focus-wrapper > div:nth-child(5) > div > div > div.page-content.col-md-9.col-12 > div.header-content > div > p:nth-child(5) > a')

  const jp = await page.waitForSelector('::-p-aria([name="Book a pass for Joffre Lakes Provincial Park"][role="button"])');

  await jp.click()

  // Pick Date
  const dp = await page.waitForSelector('button.date-input__calendar-btn.form-control')
  await dp.click()
  const dateElement = await page.waitForSelector('.ngb-dp-day[aria-label="Wednesday, July 5, 2023"]');
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

    // Wait for the captcha section to be visible
    await page.waitForSelector('app-captcha');

    setTimeout(async () => {
      // Capture a screenshot of the captcha section
      const captchaElement = await page.$('app-captcha');
      // Get the captcha SVG content
      const captchaSVGContent = await page.$eval('app-captcha svg', (element) => element.outerHTML);
      svg2img(captchaSVGContent, { format: 'png' }, (error, buffer) => {
        if (error) {
          console.error('Error converting SVG to PNG:', error);
          return;
        }

        // Save the PNG image to a file
        fs.writeFileSync('captcha.png', buffer);
        console.log('Captcha image saved as captcha.png');
      });

    }, 1000)

  }, 2000)


}

automateReservation()

