async function automateReservation() {
  const screenshot = 'booking_results.png'
  try {
    (async () => {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto('https://booking.com')
      await page.type('.a5761ae4af', 'Berlin')
      await page.click('.fc63351294')
      await page.waitForSelector('div')
      // await page.screenshot({ path: screenshot })
      // const hotels = await page.$$eval('span.sr-hotel__name', anchors => {
      //   return anchors.map(anchor => anchor.textContent.trim()).slice(0, 10)
      // })
      // console.log(hotels)
      const test = await page.$eval('.dcf496a7b9', () => {
        console.log('Found it')
      })
      await browser.close()
      // console.log('See screenshot: ' + screenshot)
    })()
  } catch (err) {
    console.error(err)
  }
}