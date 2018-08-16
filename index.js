#!/usr/bin/env node

const Jimp = require('jimp');
const fs = require('fs');

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
      .write('images/processed.jpg');

    height = preppedImage.getHeight();
    width = preppedImage.getWidth();

    // For each pixal if it is dark save an X otherwise and O.
    const stream = fs.createWriteStream('pattern.txt');
    stream.once('open', () => {
      const map = new Array(height);
      for (let i = 0; i < height; i += 1) {
        map[i] = new Array(width);
        for (let j = 0; j < width; j += 1) {
          pixColor = preppedImage.getPixelColor(j, i);
          if (pixColor < 10000) {
            stream.write('x');
            map[i][j] = 1;
          } else {
            stream.write('o');
            map[i][j] = 0;
          }
        }
        stream.write('\n');
      }
      stream.end();
    });
  })
  .catch((err) => {
    console.error(err);
  });
