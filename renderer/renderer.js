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
