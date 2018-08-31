// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { dialog } = require('electron').remote;
const PrepImage = require('./prepImage.js');
const I2P = require('./image2pattern.js');

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
  dialog.showOpenDialog((fileNames) => {
    if (fileNames === undefined) {
      console.log('No file selected');
    } else {
      document.getElementById('actual-file').value = fileNames[0];
      console.log(fileNames[0]);
    }
  });
}, false);

document.getElementById('generate-pattern').addEventListener('click', () => {
  PrepImage.prepImage(document.getElementById('actual-file').value, {}, I2P.generatePattern);
}, false);

$(() => {
  // Basic instantiation of color pickers:
  $('#dark-color-picker').colorpicker();

  // Example using an event, to change the color of the .jumbotron background:
  $('#dark-color-picker').on('colorpickerChange', (event) => {
    $('.jumbotron').css('background-color', event.color.toString());
  });

  // Basic instantiation of color pickers:
  $('#light-color-picker').colorpicker();

  // Example using an event, to change the color of the .jumbotron background:
  $('#light-color-picker').on('colorpickerChange', (event) => {
    $('.jumbotron').css('background-color', event.color.toString());
  });

  // Basic instantiation of color pickers:
  $('#grid-color-picker').colorpicker();

  // Example using an event, to change the color of the .jumbotron background:
  $('#grid-color-picker').on('colorpickerChange', (event) => {
    $('.jumbotron').css('background-color', event.color.toString());
  });
});
