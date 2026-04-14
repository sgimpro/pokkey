// Run: node scripts/generate-icons.js
// Requires: npm install canvas (one-time)
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Orange gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#FF8C42");
  gradient.addColorStop(1, "#FF5E1A");

  // Rounded rect
  const r = size * 0.21;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Letter P
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${size * 0.58}px Arial, Helvetica, sans-serif`;
  ctx.fillText("P", size * 0.48, size * 0.52);

  // Notification dot
  ctx.beginPath();
  ctx.arc(size * 0.72, size * 0.27, size * 0.082, 0, Math.PI * 2);
  ctx.fillStyle = "#FFE0CC";
  ctx.fill();

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath} (${size}x${size})`);
}

const publicDir = path.join(__dirname, "..", "public");
generateIcon(192, path.join(publicDir, "icon-192.png"));
generateIcon(512, path.join(publicDir, "icon-512.png"));
console.log("Done! Icons generated in public/");
