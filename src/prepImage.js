const Jimp = require('jimp');
const Vibrant = require('node-vibrant');

const defaultSettings = {
  imgMaxWidth: 100,
  imgMaxHeight: 100,
  outputLocation: './outputs',
  colorMode: 'monochrome',
  colorCount: 64,
};

async function vibrantProcess(image, outputPath, settings) {
  // TODO: all the actual vibrant related "stuff".
  image
    .scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight) // Scale to fit the limits.
    .write(outputPath);
}

function Process(image, outputPath, settings) {
  if (settings.colorMode === 'monochrome') {
    image
      .scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight) // Scale to fit the limits.
      .contrast(1) // Max out the contrast.
      .greyscale() // set greyscale.
      .write(outputPath);
  } else {
    vibrantProcess(image, outputPath, settings);
  }
}

async function prepImage(imagePath, settings, callback) {
  const config = Object.assign(defaultSettings, settings);
  const filePath = `${config.outputLocation}/images/${imagePath}`;

  // TODO: Trim White space from edges.
  // TODO: Consider Potrace https://www.npmjs.com/package/potrace (GPL)

  // JIMP is picky about types, so make sure the sizes are integers.
  config.imgMaxHeight *= 1;
  config.imgMaxWidth *= 1;
  console.log(config);

  try {
    const image = await Jimp.read(imagePath);
    const svgFile = await Process(image, filePath, config);
    callback(svgFile);
  } catch (err) {
    console.log(err);
  }
}

exports.prepImage = prepImage;
