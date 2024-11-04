import express from "express";
import puppeteer from "puppeteer";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";

dotenv.config();

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

app.get("/generate-pdf-to-cloudinary", async (req, res) => {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const browser = await puppeteer.launch();
  const pdfDirectory = path.join(__dirname, "..", "public", "pdf");

  try {
    await fs.mkdir(pdfDirectory, { recursive: true });
  } catch (error) {
    console.error("Error creating directory:", error);
    return res.status(500).json({ error: "Error creating directory" });
  }

  const pdfPath = path.join(
    __dirname,
    "..",
    "public",
    "pdf",
    `result-${new Date().getTime()}`
  );

  try {
    const page = await browser.newPage();
    const webUrl = "https://example.com/";

    await page.goto(webUrl, { waitUntil: "networkidle0" });

    await page.pdf({
      path: pdfPath, // Save PDF to local path
      margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
      printBackground: true,
      format: "A4",
    });

    const cloudinaryResponse = await cloudinary.v2.uploader.upload(pdfPath, {
      folder: "pdfs",
      resource_type: "auto",
    });

    res.status(201).json({
      ok: true,
      message: "Web has been converted to PDF and stored on Cloudinary",
      pdfUrl: cloudinaryResponse.secure_url,
    });
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

    try {
      await fs.rm(pdfDirectory, { recursive: true, force: true });
    } catch (error) {
      console.error("Error deleting directory:", error);
    }
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
