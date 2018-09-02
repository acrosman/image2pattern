const Jimp = require('jimp');

const defaultSettings = {
  maxWidth: 100,
  maxHeigh: 100,
  outputLocation: 'outputs',
};

function prepImage(imagePath, settings, callback) {
  const config = Object.assign(settings, defaultSettings);

  Jimp.read(imagePath)
    .then((image) => {
      // TODO: Handle more than monochrome patterns
      // TODO: Trim White space from edges
      // TODO: Make image processing more variable.
      const preppedImage = image
        .scaleToFit(config.maxWidth, config.maxHeigh) // Scale to fit the limits.
        .contrast(1) // Max out the contrast.
        .greyscale() // set greyscale.
        .write(`${config.outputLocation}/images/processed.jpg`);

      return callback(preppedImage, config);
    })
    .catch((err) => {
      console.error(err);
    });
}

exports.prepImage = prepImage;
