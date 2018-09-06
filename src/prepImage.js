const Jimp = require('jimp');

const defaultSettings = {
  imgMaxWidth: 100,
  imgMaxHeight: 100,
  outputLocation: './outputs',
  colorMode: 'monochrome',
  colorCount: 64,
};

function prepImage(imagePath, settings, callback) {
  const config = Object.assign(defaultSettings, settings);
  console.log(config);
  const filePath = `${config.outputLocation}/images/processed.jpg`;
  Jimp.read(imagePath)
    .then((image) => {
      // TODO: Handle more than monochrome patterns
      // TODO: Trim White space from edges
      // TODO: Make image processing more variable.
      const preppedImage = image
        .scaleToFit(config.imgMaxWidth, config.imgMaxHeight) // Scale to fit the limits.
        .contrast(1) // Max out the contrast.
        .greyscale() // set greyscale.
        .write(filePath);

      return callback(filePath);
    })
    .catch((err) => {
      console.error(err);
    });
}

exports.prepImage = prepImage;
