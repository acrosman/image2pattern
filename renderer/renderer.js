// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { remote } = require('electron');
const { dialog } = require('electron').remote;

const PrepImage = remote.require('./src/prepImage.js');
const I2P = remote.require('./src/image2pattern.js');

function showMessage(message) {
  const logger = document.getElementById('console-message-list');
  const element = document.createElement('li');
  const txt = document.createTextNode(message);

  element.appendChild(txt);
  logger.appendChild(element);
}

// Pull the settings from various controls on the interface.
function loadSettings() {
  return {
    outputLocation: document.getElementById('output-folder').value,
    edgeMargin: document.getElementById('edge-margin').value,
    pageMargin: document.getElementById('page-margin').value,
    boxSize: document.getElementById('box-size').value,
    imgMaxWidth: document.getElementById('image-max-width').value,
    imgMaxHeight: document.getElementById('image-max-height').value,
    colorMode: document.getElementById('color-mode-selector').value,
    colorCount: document.getElementById('color-count-limit').value,
    darkColor: document.getElementById('dark-color').value,
    lightColor: document.getElementById('light-color').value,
    lineColor: document.getElementById('grid-color').value, // Color of the grid.
    breakColor: document.getElementById('break-color').value, // Value of light vs dark squares.
    fillOpacity: document.getElementById('opacity-level').value, // Opacity of the boxes.
  };
}

function showGeneratedImage(filePath) {
  document.getElementById('image-file').value = filePath;
  document.getElementById('image-file-display').src = filePath;
  document.getElementById('generate-pattern').removeAttribute('disabled');
}

// Setup select file handler.
document.getElementById('select-file').addEventListener('click', () => {
  dialog.showOpenDialog({
    filters: { name: 'Images', extensions: ['png', 'jpg', 'gif', 'tiff', 'jpeg'] },
  }, (fileNames) => {
    if (fileNames === undefined) {
      showMessage('No file selected');
    } else {
      document.getElementById('actual-file').value = fileNames[0];
      showMessage(fileNames[0]);
    }
  });
}, false);

// Setup Output folder processing.
document.getElementById('select-output-folder').addEventListener('click', () => {
  dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
  }, (fileNames) => {
    if (fileNames === undefined) {
      showMessage('No file selected');
    } else {
      document.getElementById('output-folder').value = fileNames[0];
      showMessage(fileNames[0]);
    }
  });
}, false);

document.getElementById('generate-image').addEventListener('click', () => {
  const settings = loadSettings();
  PrepImage.prepImage(document.getElementById('actual-file').value, settings, showGeneratedImage);
}, false);

document.getElementById('generate-pattern').addEventListener('click', () => {
  const settings = loadSettings();
  I2P.generatePattern(document.getElementById('image-file').value, settings);
}, false);
