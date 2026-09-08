const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve(__dirname, 'presentation_slides.html');
const pdfPath = path.resolve(__dirname, 'BACKLOX_15_Days_Learning_And_Growth.pdf');

console.log('HTML path:', htmlPath);
console.log('PDF path:', pdfPath);

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--run-all-compositor-stages-before-draw',
  '--virtual-time-budget=5000',
  `--print-to-pdf=${pdfPath}`,
  `file://${htmlPath.replace(/\\/g, '/')}`
];

try {
  const result = execFileSync(chromePath, args, { stdio: 'pipe' });
  console.log('Execution completed');
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`✅ Success! Generated PDF: ${pdfPath} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.error('❌ PDF file was not created.');
  }
} catch (err) {
  console.error('Error generating PDF:', err);
}
