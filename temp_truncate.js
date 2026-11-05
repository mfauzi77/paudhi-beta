const fs = require('fs');
const filePath = 'd:\\Project\\2025\\New folder (2)\\paudhi7\\backend\\routes\\ranpaud.js';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const truncatedLines = lines.slice(0, 687);
  const newContent = truncatedLines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('File truncated successfully to 687 lines.');
} catch (err) {
  console.error('Error truncating file:', err);
}
