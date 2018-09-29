const Jimp = require('jimp');
const Vibrant = require('node-vibrant');
const ColorUtils = require('./colorUtils.js');

const defaultSettings = {
  imgMaxWidth: 100,
  imgMaxHeight: 100,
  outputLocation: './outputs',
  colorMode: 'monochrome',
  colorCount: 64,
  darkColor: 0x444444, // Dark square fill color.
  lightColor: 0xFFFF33, // Light square fill color.
};

async function vibrantProcess(image, outputPath, settings) {
  // TODO: all the actual vibrant related "stuff".
  image.scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight); // Scale to fit the limits.
  try {
    const vibrant = new Vibrant(image, settings.colorCount, 3);
    const swatches = vibrant.swatches();
    image.scan(0, 0, image.getWidth(), image.getHeight(), (x, y) => {

    });
  } catch (err) {
    console.log(`Error running vibrant ${err}`);
  }
  image.write(outputPath);
}

function Process(image, outputPath, settings) {
  if (settings.colorMode === 'monochrome') {
    image
      .scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight) // Scale to fit the limits.
      .contrast(1) // Max out the contrast.
      .greyscale() // Go black and white.
      .scan(0, 0, image.getWidth(), image.getHeight(), (x, y) => {
        let currentColor;
        if (image.getPixelColor(x, y) < settings.breakColor) {
          currentColor = settings.darkColor;
        } else {
          currentColor = settings.lightColor;
        }
        image.setPixelColor(currentColor, x, y);
      })
      .write(outputPath);
  } else {
    vibrantProcess(image, outputPath, settings);
  }
}

async function prepImage(imagePath, settings, callback) {
  const config = Object.assign({}, defaultSettings, settings);
  const filePath = `${config.outputLocation}/images/${imagePath}`;

  // TODO: Trim White space from edges.
  // TODO: Consider Potrace https://www.npmjs.com/package/potrace (GPL)

  // JIMP is picky about types, so make sure the sizes are integers.
  config.imgMaxHeight *= 1;
  config.imgMaxWidth *= 1;
  console.log(config);

  try {
    // DEBUG: During this await prepImage gets recalled while promise being
    // handled. That then updates the values of config which throws off the
    // processing when execution returns.  Proper promise may be needed.
    const image = await Jimp.read(imagePath);
    Process(image, filePath, config);
    callback(filePath);
  } catch (err) {
    console.log(err);
  }
}

exports.prepImage = prepImage;
