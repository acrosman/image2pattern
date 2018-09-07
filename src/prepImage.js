const Jimp = require('jimp');

// TODO: Trim White space from edges

const defaultSettings = {
  imgMaxWidth: 100,
  imgMaxHeight: 100,
  outputLocation: './outputs',
  colorMode: 'monochrome',
  colorCount: 64,
};

function monochromeProcess(image, outputPath, settings) {
  image
    .scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight) // Scale to fit the limits.
    .contrast(1) // Max out the contrast.
    .greyscale() // set greyscale.
    .write(outputPath);
}

function vibrantProcess(image, outputPath, settings) {
  image
    .scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight) // Scale to fit the limits.
    .write(outputPath);
}

function prepImage(imagePath, settings, callback) {
  const config = Object.assign(defaultSettings, settings);
  const filePath = `${config.outputLocation}/images/${imagePath}`;
  // JIMP is picky about types, so make sure the sizes are integers.
  config.imgMaxHeight *= 1;
  config.imgMaxWidth *= 1;
  console.log(config);

  Jimp.read(imagePath)
    .then((image) => {
      if (config.colorMode === 'monochrome') {
        monochromeProcess(image, filePath, config);
      } else {
        vibrantProcess(image, filePath, config);
      }
      return callback(filePath);
    })
    .catch((err) => {
      console.error(err);
    });
}

exports.prepImage = prepImage;
