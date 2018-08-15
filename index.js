#!/usr/bin/env node

const Jimp = require('jimp');
const fs = require('fs');

// TODO: make this an input.
const maxWidth = 150;
const maxHeigh = 150;

// function gcd(a, b) {
//   return (b === 0) ? a : gcd(b, a % b);
// }

Jimp.read('sample.png')
  .then((image) => {
    let height = image.getHeight();
    let width = image.getWidth();
    let pixColor = 0;

    const preppedImage = image
      .scaleToFit(maxWidth, maxHeigh) // Scale to fit the limits.
      .contrast(1) // Max out the contrast.
      .greyscale(); // set greyscale

    height = preppedImage.getHeight();
    width = preppedImage.getWidth();

    // For each pixal if it is dark save an X otherwise and O.
    const stream = fs.createWriteStream('pattern.txt');
    stream.once('open', () => {
      const map = new Array(width);
      for (let i = 0; i < width; i += 1) {
        map[i] = new Array(height);
        for (let j = 0; j < height; j += 1) {
          pixColor = preppedImage.getPixelColor(i, j);
          if (pixColor < 10000) {
            stream.write('x');
            map[i][j] = 'x';
          } else {
            stream.write(' ');
            map[i][j] = 'o';
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
