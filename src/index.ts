import express from 'express'
import puppeteer from 'puppeteer'

// const app = express()
// const port = process.env.port || 3000


// app.get('/', (req: express.Request, res: express.Response) => {
//   console.log(req)
//   res.send('render server side stuff?');
// });


// app.listen(port, () => {
//   return console.log(`server is listening on ${port}`);
// });

const link = 'link that we are trying to put in ';

(async (link) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1000 });
  await page.goto('https://ebook.online-convert.com/convert-to-mobi');

  const clickOnElement = (query: string) => page.$eval(query, (e) => (e as unknown as puppeteer.ElementHandle<Element>).click())
  const sleep = (dur: number) => new Promise(r => setTimeout(r, dur))

  // // await page.$eval('a#externalUrlButton.uploadbutton', (e) => (e as unknown as puppeteer.ElementHandle<Element>).click());
  await clickOnElement('a#externalUrlButton.uploadbutton')
  await page.$eval('input#externalUrlInput', el => (el as HTMLInputElement).value = 'wefjiowjeofiwefweiofjowjeiofjwioefiwej');

  await page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight);
  });

  await page.screenshot({ path: 'start.png' });

  await clickOnElement('button#externalUrlDialogOkButton.addUrlButton')
  await sleep(400)

  await clickOnElement('button#multifile-submit-button-main.multifile-submit-button')

  await sleep(3000)

  await page.screenshot({ path: 'end.png' });

  await browser.close();
})(link);

