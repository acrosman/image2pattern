#!/usr/bin/env node

const Jimp = require('jimp');
const fs = require('fs');
const PdfKit = require('pdfkit');
const Svg2Pdf = require('svg-to-pdfkit');
const window = require('svgdom');
const SVG = require('svgjs')(window);

// TODO: make these inputs.
const maxWidth = 150;
const maxHeigh = 150;
const outputLocation = 'outputs';
const edgeMargin = 50;
const pageMargin = 50;
const boxSize = 10;

function drawPatternPage(image, startX, startY, width, height) {
  // TODO: allow these to be inputs.
  const darkColor = '#444'; // Dark square fill color.
  const lightColor = '#FF3'; // Light square fill color.
  const lineColor = '#000'; // Color of the grid.
  const breakColor = '10000'; // Value of light vs dark squares.
  const fillOpacity = '0.3'; // Opacity of the boxes.
  const drawingWidth = boxSize * width;
  const drawingHeight = boxSize * height;

  let rx; let ry; let pixColor;
  let currentX = startX;
  let currentY = startY;
  let currentColor = lightColor;

  // console.log(`Creating image starting at ${startX}x${startY} to cover ${width}x${height}`)

  const draw = SVG(window.document).size(drawingWidth, drawingHeight);

  for (let i = 0; i < height; i += 1) {
    ry = i * boxSize;
    currentX = startX;

    // console.log(`Starting row: ${i}`);

    for (let j = 0; j < width; j += 1) {
      // Get the current pixal color and map to box background.
      pixColor = image.getPixelColor(currentX, currentY);
      // TODO: Handle more than monochrome patterns.
      let side = '';
      if (pixColor < breakColor) {
        currentColor = darkColor;
        side = 'dark';
      } else {
        currentColor = lightColor;
        side = 'light';
      }
      // Determine the location of this box, and draw.
      rx = j * boxSize;
      draw.rect(boxSize, boxSize)
        .move(rx, ry)
        .fill(currentColor)
        .stroke(lineColor)
        .opacity(fillOpacity);
      // console.log(`Pixel ${currentX}x${currentY}: printed at: ${rx}x${ry} as ${side}`);
      currentX += 1;
    }
    currentY += 1;
  }

  return draw;
}

// TODO: make image location an input.
Jimp.read('sample.png')
  .then((image) => {
    let height = image.getHeight();
    let width = image.getWidth();

    // TODO: Handle more than monochrome patterns
    const preppedImage = image
      .scaleToFit(maxWidth, maxHeigh) // Scale to fit the limits.
      .contrast(1) // Max out the contrast.
      .greyscale() // set greyscale.
      .write(`${outputLocation}/images/processed.jpg`);

    height = preppedImage.getHeight();
    width = preppedImage.getWidth();

    // TODO: Add support for picking page size.
    const pdfFile = new PdfKit();
    pdfFile.pipe(fs.createWriteStream(`${outputLocation}/pattern.pdf`));
    pdfFile.fontSize(25)
      .text('This is a PDF meant to become a stitchable pattern.', 100, 80);
    pdfFile.font('Courier').fontSize(12);

    // Determine the number of boxes on a page. This assumes all future pages
    // will be the same size. Not sure why that would change but might be an
    // interesting feature in the future.
    const pageBoxCountWidth = Math.floor((pdfFile.page.width - (edgeMargin * 2)) / boxSize);
    const pageBoxCountHeight = Math.floor((pdfFile.page.height - (pageMargin * 2)) / boxSize);

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
      pageSvg = drawPatternPage(preppedImage, pageStartX, pageStartY, pageWidth, pageHeight);

      // console.log(`================ Page break ${page} ================`);

      pdfFile.addPage({
        margins: {
          top: pageMargin,
          bottom: pageMargin,
          left: edgeMargin,
          right: edgeMargin,
        },
      }).text(`Page: ${page}.  ${pageWidth} X ${pageHeight} starting ${pageStartX} x ${pageStartY} box size ${boxSize}`, 50, 20);

      const imageFilePath = `${outputLocation}/images/page-${page}.svg`;
      fs.writeFile(
        imageFilePath,
        pageSvg.svg(),
        (err) => {
          if (err) {
            return console.log(err);
          }
          // console.log(`${imageFilePath} saved!`);
          return err;
        },
      );

      Svg2Pdf(pdfFile, pageSvg.svg(), edgeMargin, pageMargin);

      // Carry the current X position over as the start of the next page.
      pageStartX += pageWidth;
      page += 1;
      // if (page > 2) {
      //   break;
      // }
    }

    pdfFile.end();
  })
  .catch((err) => {
    console.error(err);
  });
