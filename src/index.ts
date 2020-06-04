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

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('https://ebook.online-convert.com/convert-to-epub');


  // const enterURL = await page.$('a#externalUrlButton.uploadbutton')
  // enterURL?.click({ clickCount: 3 })
  await page.$eval('a#externalUrlButton.uploadbutton', (e) => (e as unknown as puppeteer.ElementHandle<Element>).click());
  await page.$eval('input#externalUrlInput', el => (el as HTMLInputElement).value = link);

  await page.evaluate(_ => {
    window.scrollBy(0, window.innerHeight - 500);
  });


  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();

