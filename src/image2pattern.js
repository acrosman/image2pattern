const fs = require('fs');
const PdfKit = require('pdfkit');
const Svg2Pdf = require('svg-to-pdfkit');
//const window = require('svgdom');
const SVG = require('svgjs');

const defaultSettings = {
  outputLocation: 'outputs',
  edgeMargin: 50,
  pageMargin: 50,
  boxSize: 10,
  darkColor: '#444', // Dark square fill color.
  lightColor: '#FF3', // Light square fill color.
  lineColor: '#000', // Color of the grid.
  breakColor: '10000', // Value of light vs dark squares.
  fillOpacity: '0.3', // Opacity of the boxes.
};

function drawPatternPage(image, startX, startY, width, height, settings) {
  const config = Object.assign(defaultSettings, settings);

  // TODO: allow these to be inputs.
  const drawingWidth = config.boxSize * width;
  const drawingHeight = config.boxSize * height;

  let rx; let ry; let pixColor;
  let currentX = startX;
  let currentY = startY;
  let currentColor = config.lightColor;

  console.log(`Creating image starting at ${startX}x${startY} to cover ${width}x${height}`)

  const draw = SVG(document).size(drawingWidth, drawingHeight);

  for (let i = 0; i < height; i += 1) {
    ry = i * config.boxSize;
    currentX = startX;

    // console.log(`Starting row: ${i}`);

    for (let j = 0; j < width; j += 1) {
      // Get the current pixal color and map to box background.
      pixColor = image.getPixelColor(currentX, currentY);
      // TODO: Handle more than monochrome patterns.
      // let side = '';
      if (pixColor < config.breakColor) {
        currentColor = config.darkColor;
        // side = 'dark';
      } else {
        currentColor = config.lightColor;
        // side = 'light';
      }
      // Determine the location of this box, and draw.
      rx = j * config.boxSize;
      draw.rect(config.boxSize, config.boxSize)
        .move(rx, ry)
        .fill(currentColor)
        .stroke(config.lineColor)
        .opacity(config.fillOpacity);
      // console.log(`Pixel ${currentX}x${currentY}: printed at: ${rx}x${ry} as ${side}`);
      currentX += 1;
    }
    currentY += 1;
  }

  return draw;
}

function createPattern(image, settings) {
  const config = Object.assign(defaultSettings, settings);
  const height = image.getHeight();
  const width = image.getWidth();

  // TODO: Add support for picking page size.
  const pdfFile = new PdfKit();
  pdfFile.pipe(fs.createWriteStream(`${config.outputLocation}/pattern.pdf`));
  pdfFile.fontSize(25)
    .text('This is a PDF meant to become a stitchable pattern.', 100, 80);
  pdfFile.font('Courier').fontSize(12);

  // Determine the number of boxes on a page. This assumes all future pages
  // will be the same size. Not sure why that would change but might be an
  // interesting feature in the future.
  const pageBoxCountWidth = Math.floor(
    (pdfFile.page.width - (config.edgeMargin * 2)) / config.boxSize,
  );
  const pageBoxCountHeight = Math.floor(
    (pdfFile.page.height - (config.pageMargin * 2)) / config.boxSize,
  );

  // We have to break the pattern into a series of pages that fit the boxes
  // for the mapped image.
  const pagesWide = Math.ceil(width / pageBoxCountWidth);
  const pagesTall = Math.ceil(height / pageBoxCountHeight);
  const totalPages = pagesTall * pagesWide;

  pdfFile.text(`This image is ${width} x ${height}.`);
  pdfFile.text(`Each page can hold ${pageBoxCountWidth} boxes across and ${pageBoxCountHeight} down.`);
  pdfFile.text(`So this file is ${pagesWide} pages wide and ${pagesTall} pages tall.`);

  let pageHeight; let pageWidth;
  let pageStartX = 0;
  let pageStartY = 0;
  let page = 1;

  let pageSvg;

  while (page <= totalPages) {
    if (pageStartX >= width) {
      pageStartX = 0;
      pageStartY += pageHeight;
    }

    // Set the pixal range for this page.
    pageHeight = Math.min(pageBoxCountHeight, height - pageStartY);
    pageWidth = Math.min(pageBoxCountWidth, width - pageStartX);

    // Create an image for just this page.
    pageSvg = drawPatternPage(image, pageStartX, pageStartY, pageWidth, pageHeight, config);

    console.log(`================ Page break ${page} ================`);

    // TODO: stream pages to disk.
    pdfFile.addPage({
      margins: {
        top: config.pageMargin,
        bottom: config.pageMargin,
        left: config.edgeMargin,
        right: config.edgeMargin,
      },
    }).text(`Page: ${page}.  ${pageWidth} X ${pageHeight} starting ${pageStartX} x ${pageStartY} box size ${config.boxSize}`, 50, 20);

    const imageFilePath = `${config.outputLocation}/images/page-${page}.svg`;
    fs.writeFile(
      imageFilePath,
      pageSvg.svg(),
      (err) => {
        if (err) {
          return console.log(err);
        }
        console.log(`${imageFilePath} saved!`);
        return err;
      },
    );

    Svg2Pdf(pdfFile, pageSvg.svg(), config.edgeMargin, config.pageMargin);

    // Carry the current X position over as the start of the next page.
    pageStartX += pageWidth;
    page += 1;
  }

  pdfFile.end();
}

exports.generatePattern = createPattern;
