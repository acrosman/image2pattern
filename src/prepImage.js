const Jimp = require('jimp');

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
  console.log(config);
  const filePath = `${config.outputLocation}/images/processed.jpg`;
  Jimp.read(imagePath)
    .then((image) => {
      // TODO: Handle more than monochrome patterns
      // TODO: Trim White space from edges
      // TODO: Make image processing more variable.
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
