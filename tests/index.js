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
  colorMode: 'monochrome',
  colorCount: 64,
  darkColor: '#555', // Dark square fill color.
  lightColor: '#F33', // Light square fill color.
  lineColor: '#111', // Color of the grid.
  breakColor: '11000', // Value of light vs dark squares.
  fillOpacity: '0.4', // Opacity of the boxes.
};

PrepImage.prepImage(imagePath, settings, I2P.generatePattern);
