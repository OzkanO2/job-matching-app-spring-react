const fs = require('fs');
const path = require('path');

const from = path.join(__dirname, '../public/_redirects');
const to = path.join(__dirname, '../dist/_redirects');

fs.copyFile(from, to, (err) => {
  if (err) {
    console.error('❌ Failed to copy _redirects:', err);
    process.exit(1);
  }
  console.log('✅ _redirects copied successfully.');
});
