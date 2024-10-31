import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/generate-pdf", async (req, res) => {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    const webUrl = "https://example.com/";

    await page.goto(webUrl, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
      printBackground: true,
      format: "A4",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": "attachment; filename=result.pdf", // Changed to "inline" to preview before download or "attachment" to download it directly
      "Cache-Control": "no-cache",
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({
      error: "Error generating PDF",
      message: error.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
