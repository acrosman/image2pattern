#!/usr/bin/env node

const PrepImage = require('../src/prepImage.js');

const bwImagePath = 'AHC_2110.jpg';
const colorImagePath = 'AHC_4958.png';

const settings = {
  outputLocation: 'outputs',
  edgeMargin: 55,
  pageMargin: 60,
  boxSize: 11,
  imgMaxWidth: 400,
  imgMaxHeight: 300,
  colorMode: 'monochrome',
  colorCount: 64,
  darkColor: '#555555', // Dark square fill color.
  lightColor: '#FDFDFD', // Light square fill color.
  lineColor: '#111111', // Color of the grid.
  breakColor: '11000', // Value of light vs dark squares, probably poorly chosen
  fillOpacity: '0.4', // Opacity of the boxes.
};

console.log('Running Monochrome test');
PrepImage.prepImage(bwImagePath, settings, (value) => { console.log(value); });

console.log('Running Vibrant test');
settings.colorMode = 'vibrant';
settings.imgMaxWidth = 300;
settings.imgMaxHeight = 200;
PrepImage.prepImage(colorImagePath, settings, (value) => { console.log(value); });
