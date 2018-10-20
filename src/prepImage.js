const Jimp = require('jimp');
const ColorUtils = require('./colorUtils.js');
const path = require('path');

const defaultSettings = {
  imgMaxWidth: 100,
  imgMaxHeight: 100,
  outputLocation: './outputs',
  colorMode: 'monochrome',
  colorCount: 64,
  darkColor: '#444444', // Dark square fill color.
  lightColor: '#FFFF33', // Light square fill color.
};

async function ColorProcess(image, outputPath, settings) {
  const level = Math.log2(settings.colorCount);
  image.scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight) // Scale to fit the limits.
    .posterize(level)
    .write(outputPath);
}

function MonochromeProcess(image, outputPath, settings) {
  image
    .scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight) // Scale to fit the limits.
    .contrast(1) // Max out the contrast.
    .greyscale() // Go black and white.
    .scan(0, 0, image.getWidth(), image.getHeight(), (x, y) => {
      let currentColor = ColorUtils.hex2Rgb(ColorUtils.int2CssHex(image.getPixelColor(x, y)));
      if (ColorUtils.isDarkColor(currentColor)) {
        currentColor = settings.darkColor;
      } else {
        currentColor = settings.lightColor;
      }
      image.setPixelColor(currentColor, x, y);
    })
    .write(outputPath);
}

async function prepImage(imagePath, settings, callback) {
  const config = Object.assign({}, defaultSettings, settings);
  const filePath = path.join(config.outputLocation, 'images', imagePath);

  // TODO: Trim White space from edges.

  // JIMP is picky about types, so make sure the sizes are integers.
  config.imgMaxHeight *= 1;
  config.imgMaxWidth *= 1;
  config.darkColor = ColorUtils.cssHex2JimpInt(config.darkColor);
  config.lightColor = ColorUtils.cssHex2JimpInt(config.lightColor);

  console.log(config);

  try {
    // DEBUG: During this await prepImage gets recalled while promise being
    // handled. That then updates the values of config which throws off the
    // processing when execution returns.  Proper promise may be needed.
    const image = await Jimp.read(imagePath);
    if (settings.colorMode === 'monochrome') {
      MonochromeProcess(image, filePath, config);
    } else {
      ColorProcess(image, filePath, config);
    }
    callback(filePath);
  } catch (err) {
    console.log(err);
  }
}

exports.prepImage = prepImage;
