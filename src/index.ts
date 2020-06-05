import puppeteer, { Browser } from 'puppeteer'

let browser: Browser
let page: puppeteer.Page
const link: string = 'http://80.82.78.13/get.php?md5=92f44162cf334286dc07ce733d2237e9&key=7348HRDK0X6ABVWF&mirr=1'
let tickClock: NodeJS.Timeout

async function beforeAll() {
  browser = await puppeteer.launch({ args: ['--incognito'] });
  const context = await browser.createIncognitoBrowserContext();
  page = await context.newPage();
  await page.setViewport({ width: 3000, height: 1000 });
  scheduleSnapshots()
}

// take snapshots at regular intervals
function scheduleSnapshots(interval = 2000) {
  let snapshotIndex = 0;
  tickClock = setInterval(function () {

    const path = `snapshot${++snapshotIndex}-${interval / 1000 * snapshotIndex}s.png`
    console.log(path)

    page.screenshot({ path })
  }, interval);
}

async function doWork() {
  await page.goto('https://ebook.online-convert.com/convert-to-mobi')

  const clickOnElement = (query: string) => page.$eval(query, (e) => (e as unknown as puppeteer.ElementHandle<Element>).click())
  await clickOnElement('a#externalUrlButton')
  await clickOnElement('input#externalUrlInput')
  await page.focus('input#externalUrlInput')
  await page.keyboard.type(link)
  await page.screenshot({ path: 'snapshot1.png' });
  await clickOnElement('button#externalUrlDialogOkButton')
  await page.screenshot({ path: 'start1.png' });
  // await sleep(1000)

  // here we are at the part where we add the URL to our file
  await page.waitForSelector('div.deletebutton', { timeout: 20000 })
  await clickOnElement('button#multifile-submit-button-main')

  // wait for our download page to show up
  await page.waitForSelector('div#fallback-link', { timeout: 20000 })
  const client = await page.target().createCDPSession();

  await page.waitForSelector('button.zip-download.zip-download-single.zip-download-grey', { timeout: 100000 })
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: './download' })
  await page.waitFor(6000)

  console.log('success!')

}

async function wasBrowserKilled(browser) {
  const procInfo = await browser.process();
  return !!procInfo.signalCode;
}

async function afterAll() {
  clearInterval(tickClock)
  await page.screenshot({ path: 'end.png' });
  await browser.close()
  console.log(`Closed session safely: browser killed status: ${await wasBrowserKilled(browser)}`)
}



// thread that runs everything
(async () => {
  await beforeAll()
  try {
    await doWork()
  } catch (error) {
    console.error(error)
  } finally {
    await afterAll()

  }
})()  