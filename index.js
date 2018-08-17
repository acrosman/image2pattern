#!/usr/bin/env node

const Jimp = require('jimp');
const fs = require('fs');
const PdfKit = require('pdfkit');

// TODO: make these inputs.
const maxWidth = 150;
const maxHeigh = 150;
const outputLocation = 'outputs';
const edgeMargin = 50;
const pageMargin = 50;
const boxSize = 10;

// TODO: make image location an input.
Jimp.read('sample.png')
  .then((image) => {
    let height = image.getHeight();
    let width = image.getWidth();
    let pixColor = 0;

    // TODO: Handle more than monochrome patterns
    const preppedImage = image
      .scaleToFit(maxWidth, maxHeigh) // Scale to fit the limits.
      .contrast(1) // Max out the contrast.
      .greyscale() // set greyscale.
      .write(`${outputLocation}/images/processed.jpg`);

    height = preppedImage.getHeight();
    width = preppedImage.getWidth();

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
    const pagesWide = Math.ceil(preppedImage.getWidth() / pageBoxCountWidth);
    const pagesTall = Math.ceil(preppedImage.getHeight() / pageBoxCountHeight);
    const totalPages = pagesTall * pagesWide;

    pdfFile.text(`This image is ${preppedImage.getWidth()} x ${preppedImage.getHeight()}.`);
    pdfFile.text(`Each page can hold ${pageBoxCountWidth} boxes across and ${pageBoxCountHeight} down.`);
    pdfFile.text(`So this file is ${pagesWide} pages wide and ${pagesTall} pages tall.`);

    let rx; let ry; let pageHeight; let pageWidth;
    let pageStartX = 0;
    let pageStartY = 0;
    let currentX = 0;
    let currentY = 0;
    let page = 1;

    // Yikes! Tripple nested loop
    // TODO: untangle this a bit.
    while (page <= totalPages) {
      if (pageStartX >= preppedImage.getWidth()) {
        pageStartX = 0;
        pageStartY = currentY;
      } else {
        currentY = pageStartY;
      }

      // Set the pixal range for this page.
      pageHeight = Math.min(pageBoxCountHeight, preppedImage.getHeight() - currentY);
      pageWidth = Math.min(pageBoxCountWidth, preppedImage.getWidth() - pageStartX);

      pdfFile.addPage()
        .text(`Page: ${page}.  ${pageWidth} X ${pageHeight} starting ${pageStartX} x ${currentY}`, 50, 20);

      for (let i = 0; i < pageHeight; i += 1) {
        ry = (i * boxSize) + pageMargin;
        currentX = pageStartX;
        for (let j = 0; j < pageWidth; j += 1) {
          // Get the current pixal color and map to box background.
          pixColor = preppedImage.getPixelColor(currentX, currentY);
          // TODO: Handle more than monochrome patterns.
          if (pixColor < 10000) {
            pdfFile.fillAndStroke('#000', '#000');
          } else {
            pdfFile.fillAndStroke('#FF6600', '#000');
          }

          // Determine the location of this box, and draw.
          rx = (j * boxSize) + edgeMargin;
          pdfFile.rect(rx, ry, boxSize, boxSize);

          currentX += 1;
        }

        currentY += 1;
      }

      // Carry the current X position over as the start of the next page.
      pageStartX = currentX;
      page += 1;
    }

    pdfFile.end();
  })
  .catch((err) => {
    console.error(err);
  });
