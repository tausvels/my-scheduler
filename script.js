// const puppeteer = require('puppeteer');

import puppeteer from 'puppeteer';

async function automateReservation() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false
  });
  const page = await browser.newPage();
  const testUrl = 'https://example.com'
  const testUrl2 = 'https://reserve.bcparks.ca/dayuse/'
  const testUrl3 = 'https://bcparks.ca/reservations/day-use-passes/'

  await page.goto(testUrl3, { waitUntil: 'load'})
  await page.screenshot({path: 'allItems.png'})

  await page.click('#gatsby-focus-wrapper > div:nth-child(5) > div > div > div.page-content.col-md-9.col-12 > div.header-content > div > p:nth-child(5) > a')

  const jp = await page.waitForSelector('::-p-aria([name="Book a pass for Joffre Lakes Provincial Park"][role="button"])');
  
  await jp.click()

  // Pick Date
  const dp = await page.waitForSelector('button.date-input__calendar-btn.form-control')
  await dp.click()
  const dateElement = await page.waitForSelector('.ngb-dp-day[aria-label="Saturday, July 1, 2023"]');
  await dateElement.click();

  // Pick Pass type
  await page.waitForSelector('select#passType');
  // Select the "Joffre Lakes - Trail" option
  await page.select('select#passType', '1: Object');

  // Select Booking Time if Not Disabled
  await page.waitForSelector('input#visitTimeDAY');
  // Check if the "ALL DAY" radio button is enabled
  const isAllDayEnabled = await page.$eval('input#visitTimeDAY', (radioButton) => !radioButton.disabled);
  if (isAllDayEnabled) {
    // Select the "ALL DAY" radio button
    await page.click('input#visitTimeDAY');
  } else {
    console.log('The "ALL DAY" option is disabled.');
    // Close the browser
    // await browser.close();
  }
  // await browser.close();
}

automateReservation()

