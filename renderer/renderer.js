// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { remote } = require('electron');
const { dialog } = require('electron').remote;
const ColorPicker = require('electron-color-picker');

const PrepImage = remote.require('./src/prepImage.js');
const I2P = remote.require('./src/image2pattern.js');

const getColor = async () => {
  // color may be `#0099ff` or `` (pick cancelled)
  const color = await ColorPicker.getColorHexRGB().catch((error) => {
    console.warn('[ERROR] getColor', error);
    return ''
  });

  console.log(`getColor: ${color}`);
};

document.getElementById('color-button').addEventListener('click', getColor);

// Reroute console messages to the messages div.
// Hat Tip: https://stackoverflow.com/a/6604660/24215
// Hap Tip: https://code.sololearn.com/Wn395PKwfxJ4/#html
// TODO: Create module for this function.
if (typeof console !== 'undefined') {
  if (typeof console.log !== 'undefined') {
    console.olog = console.log;
  } else {
    console.olog = function olog() {};
  }
}
console.log = function olog(message) {
  console.olog(message);
  const logger = document.getElementById('console-message-list');
  const element = document.createElement('li');
  const txt = document.createTextNode(message);

  element.appendChild(txt);
  logger.appendChild(element);
};
console.error = console.log;
console.debug = console.log;
console.info = console.log;

document.getElementById('select-file').addEventListener('click', () => {
  dialog.showOpenDialog({
    filters: { name: 'Images', extensions: ['png', 'jpg', 'gif', 'tiff', 'jpeg'] },
  }, (fileNames) => {
    if (fileNames === undefined) {
      console.log('No file selected');
    } else {
      document.getElementById('actual-file').value = fileNames[0];
      console.log(fileNames[0]);
    }
  });
}, false);

document.getElementById('select-output-folder').addEventListener('click', () => {
  dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
  }, (fileNames) => {
    if (fileNames === undefined) {
      console.log('No file selected');
    } else {
      document.getElementById('output-folder').value = fileNames[0];
      console.log(fileNames[0]);
    }
  });
}, false);


document.getElementById('generate-pattern').addEventListener('click', () => {

  const settings = {
    outputLocation: document.getElementById('output-folder').value,
    edgeMargin: document.getElementById('edge-margin').value,
    pageMargin: document.getElementById('page-margin').value,
    boxSize: document.getElementById('box-size').value,
    darkColor: document.getElementById('dark-color').value,
    lightColor: document.getElementById('light-color').value,
    lineColor: document.getElementById('grid-color').value, // Color of the grid.
    breakColor: document.getElementById('break-color').value, // Value of light vs dark squares.
    fillOpacity: document.getElementById('opacity-level').value, // Opacity of the boxes.
  };
  PrepImage.prepImage(document.getElementById('actual-file').value, settings, I2P.generatePattern);
}, false);

// Basic instantiation of color pickers:
// TODO: change color picker library, or similar approach to remove jQuery and
// bootstrap dependencies at some point.
$('#dark-color-swatch').colorpicker({
  format: 'hex',
  color: '#444444',
  container: true,
  inline: true,
});

// Example using an event, to change the color of the .jumbotron background:
$('#dark-color-swatch').on('colorpickerChange', (event) => {
  $('#dark-color').val(event.color.toString());
});

// Basic instantiation of color pickers:
$('#light-color-swatch').colorpicker({
  format: 'hex',
  color: '#FFFF22',
  container: true,
  inline: true,
});

// Example using an event, to change the color of the .jumbotron background:
$('#light-color-swatch').on('colorpickerChange', (event) => {
  $('#light-color').val(event.color.toString());
});

// Basic instantiation of color pickers:
$('#grid-color-swatch').colorpicker({
  format: 'hex',
  color: '#000000',
  container: true,
  inline: true,
});

// Example using an event, to change the color of the .jumbotron background:
$('#grid-color-swatch').on('colorpickerChange', (event) => {
  $('#grid-color').val(event.color.toString());
});
