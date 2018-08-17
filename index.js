#!/usr/bin/env node

const Jimp = require('jimp');
const fs = require('fs');
const PdfKit = require('pdfkit');

// TODO: make this an input.
const maxWidth = 150;
const maxHeigh = 150;

// TODO: make image location an input.
Jimp.read('sample.png')
  .then((image) => {
    let height = image.getHeight();
    let width = image.getWidth();
    let pixColor = 0;

    const preppedImage = image
      .scaleToFit(maxWidth, maxHeigh) // Scale to fit the limits.
      .contrast(1) // Max out the contrast.
      .greyscale() // set greyscale.
      .write('outputs/images/processed.jpg');

    height = preppedImage.getHeight();
    width = preppedImage.getWidth();

    const pdfFile = new PdfKit();
    pdfFile.pipe(fs.createWriteStream('outputs/pattern.pdf'));
    pdfFile.fontSize(25)
      .text('This is a PDF meant to become a stitchable pattern.', 100, 80);
    pdfFile.addPage({ layout: 'landscape' });
    pdfFile.font('Courier').fontSize(12);
    // For each pixal if it is dark save an X otherwise and O.
    const map = new Array(height);
    let row;
    for (let i = 0; i < height; i += 1) {
      map[i] = new Array(width);
      row = '';
      for (let j = 0; j < width; j += 1) {
        pixColor = preppedImage.getPixelColor(j, i);
        if (pixColor < 10000) {
          row += 'x';
          map[i][j] = 1;
        } else {
          row += '_';
          map[i][j] = 0;
        }
      }
      pdfFile.text(row);
    }
    pdfFile.end();
  })
  .catch((err) => {
    console.error(err);
  });
