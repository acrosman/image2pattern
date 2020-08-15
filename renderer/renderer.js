// This file is loaded by the index.html file and will
// be executed in the renderer process for that window.

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
  window.api.send('Dialog', {
    request: 'image',
  });
}, false);

window.api.receive('DialogResponse', (data) => {
  if (data.file) {
    document.getElementById('actual-file').value = data.file;
    showMessage(data.file);
  } else {
    showMessage(data.message);
  }
});

// Setup Output folder processing.
document.getElementById('select-output-folder').addEventListener('click', () => {
  window.api.send('Dialog', {
    request: 'outputTarget',
  });
}, false);

window.api.receive('DialogResponse', (data) => {
  if (data.file) {
    document.getElementById('output-folder').value = data.file;
    showMessage(data.file);
  } else {
    showMessage(data.message);
  }
});

document.getElementById('generate-image').addEventListener('click', () => {
  window.api.send('PrepImage', {
    file: document.getElementById('actual-file').value,
    settings: loadSettings(),
  });
}, false);

window.api.receive('PrepImageResponse', (data) => {
  if (data.file) {
    showGeneratedImage(data.file);
    showMessage('Image Prepped');
  } else {
    showMessage(data.message);
  }
});

document.getElementById('generate-pattern').addEventListener('click', () => {
  window.api.send('I2P', {
    file: document.getElementById('image-file').value,
    settings: loadSettings(),
  });
}, false);

window.api.receive('I2PResponse', (data) => {
  if (data.file) {
    // TODO Need to do something with the response!
    showMessage('Image Prepped');
  } else {
    showMessage(data.message);
  }
});
