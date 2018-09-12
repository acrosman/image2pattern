const Jimp = require('jimp');
const Vibrant = require('node-vibrant');
const window = require('svgdom');
const SVG = require('svgjs')(window);

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

function generateSvg(image, outputPath, settings) {
  if (settings.colorMode === 'monochrome') {
    image
      .scaleToFit(settings.imgMaxWidth, settings.imgMaxHeight) // Scale to fit the limits.
      .contrast(1) // Max out the contrast.
      .greyscale() // set greyscale.
      .write(outputPath);
  } else {
    vibrantProcess(image, outputPath, settings);
  }

  // Convert the file to an SVG with just a bit map of the image.
  const newImage = SVG(window.document);

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    // Get the color we need, drop any alpha.
    const red = image.bitmap.data[idx + 0];
    const green = image.bitmap.data[idx + 1];
    const blue = image.bitmap.data[idx + 2];

    newImage.rect(1, 1).attr({
      x,
      y,
      stroke: `rgb(${red}, ${green}, ${blue})`,
    }).addClass(`col-${x}`).addClass(`row-${y}`);
  });

  return newImage;
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
    const svgFile = await generateSvg(image, filePath, config);
    callback(svgFile);
  } catch (err) {
    console.log(err);
  }
}

exports.prepImage = prepImage;
