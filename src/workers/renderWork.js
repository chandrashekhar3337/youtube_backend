import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import renderQueue from '../queue/renderQueue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

renderQueue.process(async (job) => {
  const { htmlContent, outputType, fileName } = job.data;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const outputPath = path.join(__dirname, '..', 'outputs', fileName);

  if (outputType === 'pdf') {
    await page.pdf({ path: outputPath, format: 'A4' });
  } else if (outputType === 'png') {
    await page.screenshot({ path: outputPath, fullPage: true });
  }

  await browser.close();
  return { filePath: outputPath };
});
