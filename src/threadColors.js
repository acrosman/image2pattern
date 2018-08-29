// Derived from https://gimplearn.net/dmc_color_picker.php
// Rleased under MIT license with permission.
const DMC = require('./colors.json');

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function component2Hex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function rgb2Hex(rgb) {
  return `#${component2Hex(rgb.r)}${component2Hex(rgb.g)}${component2Hex(rgb.b)}`;
}

// This code found at https://github.com/antimatter15/rgb-lab/blob/master/color.js
// license of code unclear, may require future re-write from origina algorythms
// found here: https://www.easyrgb.com/en/math.php.

function lab2Rgb(lab) {
  let y = (lab.L + 16) / 116;
  let x = lab.a / 500 + y;
  let z = y - lab.b / 200;
  let r; let g; let b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787);

  r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  b = x * 0.0557 + y * -0.2040 + z * 1.0570;

  r = (r > 0.0031308) ? (1.055 * (r ** (1 / 2.4)) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * (g ** (1 / 2.4)) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * (b ** (1 / 2.4)) - 0.055) : 12.92 * b;

  return {
    r: Math.max(0, Math.min(1, r)) * 255,
    g: Math.max(0, Math.min(1, g)) * 255,
    b: Math.max(0, Math.min(1, b)) * 255,
  };
}

function rgb2Lab(rgb) {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;
  let x; let y; let z;

  r = (r > 0.04045) ? (((r + 0.055) / 1.055) ** 2.4) : r / 12.92;
  g = (g > 0.04045) ? (((g + 0.055) / 1.055) ** 2.4) : g / 12.92;
  b = (b > 0.04045) ? (((b + 0.055) / 1.055) ** 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? x ** (1 / 3) : (7.787 * x) + 16 / 116;
  y = (y > 0.008856) ? y ** (1 / 3) : (7.787 * y) + 16 / 116;
  z = (z > 0.008856) ? z ** (1 / 3) : (7.787 * z) + 16 / 116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

function deltaE(labA, labB) {
  const deltaL = labA[0] - labB[0];
  const deltaA = labA[1] - labB[1];
  const deltaB = labA[2] - labB[2];
  const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  const deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  const sc = 1.0 + 0.045 * c1;
  const sh = 1.0 + 0.015 * c1;
  const deltaLKlsl = deltaL / (1.0);
  const deltaCkcsc = deltaC / (sc);
  const deltaHkhsh = deltaH / (sh);
  const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

// Calculate the DeltaE between two RGB objects.
function colorDistance(rgb1, rgb2) {
  const lab1 = rgb2Lab(rgb1);
  const lab2 = rgb2Lab(rgb2);
  return deltaE(lab1, lab2);
}

function closestThreadColor(rgb) {
  const lab = rgb2Lab(rgb);
  let closest = {};
  let distance = 100;
  let testDist = -1;
  for (let i = 0; i < DMC.length; i += 1) {
    testDist = deltaE(lab, DMC[i].lab);
    if (testDist < distance) {
      distance = testDist;
      closest = DMC[i];
    }
    if (distance < 1) {
      break;
    }
  }
  return closest;
}

exports.rgb2Hex = rgb2Hex;
exports.component2Hex = component2Hex;
exports.hex2Rgb = hexToRgb;
exports.lab2Rgb = lab2Rgb;
exports.rbg2Lab = rgb2Lab;
exports.detlaE = deltaE;
exports.colorDistance = colorDistance;
exports.closestThreadColor = closestThreadColor;
