const Vibrant = require('node-vibrant');

// Derived from https://gimplearn.net/dmc_color_picker.php
// Rleased under MIT license with permission.
const DMC = require('./colors.json');

// Very similar to the general ColorUtils closest color but with some improvment
// to ease the handling of the thread list.
// TODO: Try to replace with a use of ColorUtils.closestColor().
function closestThreadColor(rgb) {
  const lab = Vibrant.Util.rgbToCIELab(rgb.r, rgb.g, rgb.b);
  let closest = {};
  let distance = 0;
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

exports.closestThreadColor = closestThreadColor;
