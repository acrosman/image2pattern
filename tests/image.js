#!/usr/bin/env node

const PrepImage = require('../src/prepImage.js');

const bwImagePath = 'AHC_2110.jpg';
const colorImagePath = 'AHC_4958.png';

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

console.log('Running Monochrome test');
PrepImage.prepImage(bwImagePath, settings, (value) => { console.log(value); });

console.log('Running Vibrant test');
settings.colorMode = 'vibrant';
PrepImage.prepImage(colorImagePath, settings, (value) => { console.log(value); });
