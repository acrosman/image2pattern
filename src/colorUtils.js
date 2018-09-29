const Vibrant = require('node-vibrant');

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

// Convert an rgb object into a css-style hex value
function rgb2Hex(rgb) {
  return `#${component2Hex(rgb.r)}${component2Hex(rgb.g)}${component2Hex(rgb.b)}`;
}

// Convert a standard CSS style hex color value to the integer value that JIMP
// expects. Assumes the CSS value is in the form '#[RR][GG][BB]' and adds unless
// an alpha is provided produces an totally solid color.
function cssHex2JimpInt(cssValue, alphaChannel = 'FF') {
  const color = `0x${cssValue.slice(-6)}${alphaChannel}`;
  return parseInt(color, 16); // Done it two steps to ease debugging.
}

// Calculate the DeltaE between two RGB objects.
function colorDistance(rgb1, rgb2) {
  const lab1 = Vibrant.Util.rgbToCIELab(rgb1);
  const lab2 = Vibrant.Util.rgbToCIELab(rgb2);
  return Vibrant.Util.deltaE94(lab1, lab2);
}

// Calculate the closest color from a list of options.
function closestColor(labColor, labColorList) {
  let closest = {};
  let distance = 100;
  let testDist = -1;
  for (let i = 0; i < labColorList.length; i += 1) {
    testDist = Vibrant.Util.deltaE94(labColor, labColorList[i]);
    if (testDist < distance) {
      distance = testDist;
      closest = labColorList[i];
    }
    if (distance < 1) {
      break;
    }
  }
  return closest;
}

// Convert int color to css hex without Alpha channel.
function int2CssHex(intColor) {
  const hexString = `#${intColor.toString(16).toUpperCase()}`;
  return hexString.slice(0, -2);
}

// Uses the W3C guideline for a dark color vs light.
function isDarkColor(rgb) {
  // See https://www.w3.org/TR/AERT/#color-contrast
  return (((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000) >= 128;
}

exports.cssHex2JimpInt = cssHex2JimpInt;
exports.rgb2Hex = rgb2Hex;
exports.component2Hex = component2Hex;
exports.hex2Rgb = hexToRgb;
exports.colorDistance = colorDistance;
exports.closestColor = closestColor;
exports.int2CssHex = int2CssHex;
exports.isDarkColor = isDarkColor;
