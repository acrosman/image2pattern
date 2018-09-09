#!/usr/bin/env node

const PrepImage = require('../src/prepImage.js');
const I2P = require('../src/image2pattern.js');

const imagePath = 'sample.png';

const settings = {
  outputLocation: 'outputs',
  edgeMargin: 55,
  pageMargin: 60,
  boxSize: 11,
  imgMaxWidth: 200,
  imgMaxHeight: 200,
  colorMode: 'vibrant',
  colorCount: 64,
  darkColor: '#222', // Dark square fill color.
  lightColor: '#FF3', // Light square fill color.
  lineColor: '#000', // Color of the grid.
  breakColor: '11000', // Value of light vs dark squares.
  fillOpacity: '0.4', // Opacity of the boxes.
};

PrepImage.prepImage(imagePath, settings, I2P.generatePattern);
