/**
 * jQuery interactions. Events that need main thread processing are in renderer.js.
 */

function showColorControls(mode) {
  const full = '.control-set--full-color';
  const mono = '.control-set--monochrome';

  if (mode === 'fullcolor') {
    $(full).show();
    $(mono).hide();
  } else {
    $(full).hide();
    $(mono).show();
  }
}

$('#color-mode-selector').on('change', (event) => {
  showColorControls($('#color-mode-selector').val());
});
showColorControls($('#color-mode-selector').val());

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
