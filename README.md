# Kindle Book Sender
---

Find a deployed version [here](https://linkkindle.herokuapp.com/). 

This website just lets you specify a file URL (ie. google.com/corona.pdf) emails you a mobi version of it. Most file formats (.epub, .pdf, .doc, .docx, .txt, and others) are supported.

## Motivation
I just got really tired of doing these steps for every book I send to my Kindle.
1. Access the eBook website.
2. Download the file (usually epub or pdf)
3. Go to a conversion website & locate then upload the file
4. Download the converted file
5. Email an attachment of this file to your designated Amazon Kindle email address
6. Wait for Amazon's verification email and confirm.

With this small tool, you should be able to save at least 3 of these steps. This whole took took me around 8 hours to build, so it probably didn't save me any time on the whole, but since some friends displayed interest in this tool, I thought it'd be worth the endeavor. 

Plus, I got to play around with [puppeteer](https://github.com/puppeteer/puppeteer).

## What It Does

Just enter the URL of your desired file format (.epub, .pdf, .doc, .docx, .txt, and so on) and it'll convert it to a mobi file and email it back to you from `kindle.email.service@gmail.com`.

This email can be your kindle email address, but be sure to add `kindle.email.service@gmail.com` to your approved e-mail address list. More on that [here](https://www.amazon.com/gp/help/customer/display.html?nodeId=GX9XLEVV8G4DB28H). This is irrelevant if your email does not directly connect to your Kindle (or doesn't end in `xxxx@kindle.com`)

## Other Things
- No user information is stored. There's no database or storage involved. The only things that are kept are download files (eviction through LRU cache), screenshots of the most recent Puppeteer session (deleted after each session though). 
- It seems like the deploy can't really handle multiple loads at once. This comes down to the fact that Node.js is single-threaded, and due to organizations around puppeteer & the time length of the workload, it's quite difficult to deal with issues of concurrency. A future update may support multiple workloads through spawning new processes.
- Vercel should support Docker Containers
- I don't advocate any illegal uses of the product

