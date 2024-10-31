import puppeteer from "puppeteer";

async function getPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const webUrl = "https://purwadhika.com/";

  await page.goto(webUrl, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");

  const pdf = await page.pdf({
    path: "public/pdf/result.pdf",
    margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
    printBackground: true,
    format: "A4",
  });

  await browser.close();
}

getPDF();
