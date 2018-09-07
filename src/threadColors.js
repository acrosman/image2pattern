const Vibrant = require('node-vibrant');

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

// Calculate the DeltaE between two RGB objects.
function colorDistance(rgb1, rgb2) {
  const lab1 = Vibrant.Util.rgbToCIELab(rgb1);
  const lab2 = Vibrant.Util.rgbToCIELab(rgb2);
  return Vibrant.Util.deltaE94(lab1, lab2);
}

function closestThreadColor(rgb) {
  const lab = Vibrant.Util.rgbToCIELab(rgb);
  let closest = {};
  let distance = 100;
  let testDist = -1;
  for (let i = 0; i < DMC.length; i += 1) {
    testDist = Vibrant.Util.deltaE94(lab, DMC[i].lab);
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
exports.colorDistance = colorDistance;
exports.closestThreadColor = closestThreadColor;
