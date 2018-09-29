#!/usr/bin/env node

const path = require('path');
const PrepImage = require('../src/prepImage.js');
const I2P = require('../src/image2pattern.js');

//const ImagePath = 'sample_images/sample.png';
const ImagePath = 'sample_images/AHC_4958.png';

const settings = {
  outputLocation: './outputs',
  edgeMargin: 55,
  pageMargin: 60,
  boxSize: 11,
  imgMaxWidth: 100,
  imgMaxHeight: 100,
  colorMode: 'monochrome',
  colorCount: 64,
  darkColor: '#555555', // Dark square fill color.
  lightColor: '#EEEEEE', // Light square fill color.
  lineColor: '#111111', // Color of the grid.
  breakColor: '11000', // Value of light vs dark squares.
  fillOpacity: '0.4', // Opacity of the boxes.
  saveSvgFiles: true, // Save the SVG files used for PDF content.
};

// console.log('Running Monochrome generation test');
// PrepImage.prepImage(ImagePath, settings, (value) => { console.log(value); });

console.log('Running Vibrant generation test');
settings.colorMode = 'vibrant';
PrepImage.prepImage(ImagePath, settings, (value) => { console.log(value); });

I2P.generatePattern(path.join(settings.outputLocation, 'images', ImagePath), settings);
