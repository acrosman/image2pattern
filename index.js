#!/usr/bin/env node

const PrepImage = require('./src/prepImage.js');
const I2P = require('./src/image2pattern.js');

const imagePath = 'sample.png';

PrepImage.prepImage(imagePath, {}, I2P.generatePattern);
