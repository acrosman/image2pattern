const fs = require('fs');
const PdfKit = require('pdfkit');
const Svg2Pdf = require('svg-to-pdfkit');
const window = require('svgdom');
const SVG = require('svgjs')(window);
const Jimp = require('jimp');
const threads = require('./threadColors.js');
const symbolList = require('./symbols.js');

const defaultSettings = {
  outputLocation: './outputs',
  edgeMargin: 50,
  pageMargin: 50,
  boxSize: 10,
  colorMode: 'monochrome',
  colorCount: 64,
  darkColor: '#444444', // Dark square fill color.
  lightColor: '#FFFF33', // Light square fill color.
  lineColor: '#000000', // Color of the grid.
  breakColor: '10000', // Value of light vs dark squares.
  fillOpacity: '0.3', // Opacity of the boxes.
  saveSvgFiles: true, // Save the SVG files used for PDF content.
};

async function drawPatternPage(image, startX, startY, width, height, settings) {
  const config = Object.assign(defaultSettings, settings);

  const drawingWidth = config.boxSize * width;
  const drawingHeight = config.boxSize * height;

  let rx; let ry;
  let currentColor = config.lightColor;

  console.log(`Creating image starting at ${startX}x${startY} to cover ${width}x${height}`);

  const draw = SVG(window.document).size(drawingWidth, drawingHeight);

  image.scan(startX, startY, width, height, (x, y) => {
    // TODO: Add bold line every 10 rows and columns.
    // TODO: Add color support.
    // TODO: Replace with solution that assumes it should use the pixel color's
    //       closest thread match.
    if (image.getPixelColor(x, y) < config.breakColor) {
      currentColor = config.darkColor;
      // side = 'dark';
    } else {
      currentColor = config.lightColor;
      // side = 'light';
    }
    // Determine the location of this box, and draw.
    rx = (x - startX) * config.boxSize;
    ry = (y - startY) * config.boxSize;
    draw.rect(config.boxSize, config.boxSize)
      .move(rx, ry)
      .fill(currentColor)
      .stroke(config.lineColor)
      .opacity(config.fillOpacity);
    // console.log(`Pixel ${x}x${y}: printed at: ${rx}x${ry} as ${side}`);
  });

  if (config.saveSvgFiles) {
    const imageFilePath = `${config.outputLocation}/images/page-${startX}x${startY}.svg`;
    fs.writeFile(
      imageFilePath,
      draw.svg(),
      (err) => {
        if (err) {
          return console.log(err);
        }
        console.log(`${imageFilePath} saved!`);
        return err;
      },
    );
  }

  return draw;
}

async function patternGen(image, pageBoxCountWidth, pageBoxCountHeight, pdfFile, config) {
  // We have to break the pattern into a series of pages that fit the boxes
  // for the mapped image.
  const width = image.getWidth();
  const height = image.getHeight();
  const pagesWide = Math.ceil(width / pageBoxCountWidth);
  const pagesTall = Math.ceil(height / pageBoxCountHeight);
  const totalPages = pagesTall * pagesWide;

  pdfFile.text(`This image is ${width} x ${height}.`);
  pdfFile.text(`Each page can hold ${pageBoxCountWidth} boxes across and ${pageBoxCountHeight} down.`);
  pdfFile.text(`So this file is ${pagesWide} pages wide and ${pagesTall} pages tall.`);

  let pageHeight; let pageWidth;
  let pageStartX = 0;
  let pageStartY = 0;
  let page = 1; let pages = [];
  let promisedPage;

  while (page <= totalPages) {
    if (pageStartX >= width) {
      pageStartX = 0;
      pageStartY += pageHeight;
    }

    // Set the pixal range for this page.
    pageHeight = Math.min(pageBoxCountHeight, height - pageStartY);
    pageWidth = Math.min(pageBoxCountWidth, width - pageStartX);
    promisedPage = drawPatternPage(image, pageStartX, pageStartY, pageWidth, pageHeight, config);
    promisedPage.pageNumber = page;
    pages.push(promisedPage);
    // Carry the current X position over as the start of the next page.
    pageStartX += pageWidth;
    page += 1;
  }
  try {
    pages = await Promise.all(pages);
    console.log('Done generating page images');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  pages.sort((a, b) => {
    const keyA = new Date(a.pageNumber);
    const keyB = new Date(b.pageNumber);
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  for (let i = 0; i < pages.length; i += 1) {
    pdfFile.addPage({
      margins: {
        top: config.pageMargin,
        bottom: config.pageMargin,
        left: config.edgeMargin,
        right: config.edgeMargin,
      },
    }).text(`Page: ${i + 1} of ${pages.length}. File: ${pages[i]}`, 50, 20);

    Svg2Pdf(pdfFile, pages[i].svg(), config.edgeMargin, config.pageMargin);
    console.log(`Page ${i} generated`);
    pages[i] = null;
  }

  pdfFile.end();

  console.log('Generation complete');
}

function createPattern(imagePath, settings) {
  const config = Object.assign({}, defaultSettings, settings);

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

  Jimp.read(imagePath)
    .then((image) => {
      patternGen(image, pageBoxCountWidth, pageBoxCountHeight, pdfFile, config);
    })
    .catch((err) => {
      console.error(err);
    });
}

exports.generatePattern = createPattern;
