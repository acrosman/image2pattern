#!/usr/bin/env node

const Jimp = require('jimp');
const fs = require('fs');

// function gcd(a, b) {
//   return (b === 0) ? a : gcd(b, a % b);
// }

Jimp.read('sample.png')
  .then((image) => {
    let height = image.getHeight();
    let width = image.getWidth();
    let pixColor = 0;

    // This is all for later when adjusting sizes.
    // const ratioGcd = gcd(width, height);
    // const ratioFloat = width / height;
    // let newHeight = (height / ratioGcd) * 100;
    // let newWidth = (originalWidth / ratioGcd) * 100;

    const preppedImage = image
      // .resize(newWidth, newHeight) // resize
      .quality(60) // set JPEG quality
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
            stream.write('o');
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
