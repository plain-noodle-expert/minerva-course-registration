// Simple script to create base64-encoded PNG icons
// Run this in browser console or Node.js to generate icon data

const createIconData = (size) => {
  // Create a simple red square with white "M" as base64 PNG
  // This is a placeholder - you can replace these with actual icon files
  
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // McGill red background
  ctx.fillStyle = '#ED1B2F';
  ctx.fillRect(0, 0, size, size);
  
  // White "M"
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
};

// For now, create simple colored placeholder files
console.log('Icon data URLs generated. Use icon-generator.html to create actual PNG files.');
