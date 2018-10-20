const fs = require('fs');
const PdfKit = require('pdfkit');
const Svg2Pdf = require('svg-to-pdfkit');
const window = require('svgdom');
const SVG = require('svgjs')(window);
const Jimp = require('jimp');
const ColorUtils = require('./colorUtils.js');
const threads = require('./threadColors.js');

const defaultSettings = {
  outputLocation: './outputs', // Directory for all program output.
  edgeMargin: 50, // PDF Points reserved for right or left page margin.
  pageMargin: 50, // PDF Points reserved for top and bottom page margin.
  boxSize: 10, // Size of the boxes in the pattern (in PDF Points).
  colorMode: 'monochrome', // Whether the pattern is meant to be B&W or color.
  colorCount: 64, // If in full color mode, how many colors to target (powers of two).
  darkColor: '#444444', // Dark square fill color.
  lightColor: '#FFFF33', // Light square fill color.
  lineColor: '#000000', // Color of the grid.
  breakColor: '10000', // Value of light vs dark squares.
  fillOpacity: '0.3', // Opacity of the boxes.
  saveSvgFiles: true, // Save the SVG files used for PDF content.
};

// Draw one page of a pattern.
async function drawPatternPage(image, startX, startY, width, height, settings, colorIndex) {
  const config = Object.assign(defaultSettings, settings);

  const drawingWidth = config.boxSize * width;
  const drawingHeight = config.boxSize * height;

  let rx; let ry;
  let currentColor = config.lightColor;

  console.log(`Creating image starting at ${startX}x${startY} to cover ${width}x${height}`);

  const draw = SVG(window.document).size(drawingWidth, drawingHeight);

  image.scan(startX, startY, width, height, (x, y) => {
    // TODO: Add bold line every 10 rows and columns.
    currentColor = ColorUtils.int2CssHex(image.getPixelColor(x, y));
    if (settings.colorMode !== 'monochrome') {
      const color = ColorUtils.hex2Rgb(currentColor);
      if (color === null) {
        console.log(`wtf with ${currentColor} from ${image.getPixelColor(x, y)}`);
      }
      const thread = threads.closestThreadColor(color);
      // TODO: Refactor to remove hasOwnProperty and param reassignment.
      if (Object.prototype.hasOwnProperty.call(thread, 'DMC')) {
        colorIndex.addThread(thread);
      }
      currentColor = thread.Hex;
    }
    // Determine the location of this box, and draw.
    rx = (x - startX) * config.boxSize;
    ry = (y - startY) * config.boxSize;
    draw.rect(config.boxSize, config.boxSize)
      .move(rx, ry)
      .fill(currentColor)
      .stroke(config.lineColor)
      .opacity(config.fillOpacity);

    // Draw bold grid
    const countSize = 10;
    if (rx % (countSize * config.boxSize) === 0 && ry % (countSize * config.boxSize) === 0) {
      draw.rect(config.boxSize * countSize, config.boxSize * countSize)
        .move(rx - (startX % countSize) * config.boxSize,
          ry - (startY % countSize) * config.boxSize)
        .fill({ color: '#FFF', opacity: 0 })
        .stroke({ color: config.lineColor, opacity: 1, width: 2 })
        .opacity(1);
    }
    // console.log(`Pixel ${x}x${y}: printed at: ${rx}x${ry} as ${side}`);
  });

  if (config.saveSvgFiles) {
    const imageFilePath = (process.platform === 'win32')
      ? `${config.outputLocation}\\images\\page-${startX}x${startY}.svg`
      : `${config.outputLocation}/images/page-${startX}x${startY}.svg`;
    fs.writeFile(
      imageFilePath,
      draw.svg(),
      (err) => {
        if (err) {
          return console.log(err);
        }
        console.log(`${imageFilePath} saved!`);
        return err;
      },
    );
  }

  return draw;
}

async function patternGen(image, pageBoxCountWidth, pageBoxCountHeight, pdfFile, config) {
  // We have to break the pattern into a series of pages that fit the boxes
  // for the mapped image.
  const width = image.getWidth();
  const height = image.getHeight();
  const pagesWide = Math.ceil(width / pageBoxCountWidth);
  const pagesTall = Math.ceil(height / pageBoxCountHeight);
  const totalPages = pagesTall * pagesWide;
  // TODO: Find a cleaner way to handle this.
  const threadIndex = {
    threads: {},
    symbols: [],
    genSymbol() {
      const fullSet = ['x'];
      const symbolRanges = [
        { start: 0x003C, stop: 0x005C }, // Capital letters and a few marks.
        { start: 0x00A1, stop: 0x00B7 }, // Standard signs and symbols.
        { start: 0x03A8, stop: 0x03EE }, // Greek letters.
        { start: 0x0531, stop: 0x0556 }, // Armenian letters.
        // TODO: find an font that includes these marks and revisit if they could be used.
        // { start: 0x2600, stop: 0x26AF }, // Miscellanious Symbols.
        { start: 0x2200, stop: 0x22FF }, // Math Operators.
        // { start: 0x2B00, stop: 0x2B2F }, // Miscellanious Symbols and arrows.
      ];

      // Some symbols are too similar to others, or are political in nature and so are
      // removed to avoid frustrtion of confusion.
      const skipSymbols = [
        String.fromCodePoint(0x00AD), String.fromCodePoint(0x03D3),
        String.fromCodePoint(0x03D4), String.fromCodePoint(0x03D9),
        String.fromCodePoint(0x03DB), String.fromCodePoint(0x03DD),
        String.fromCodePoint(0x03DF), String.fromCodePoint(0x03E0),
        String.fromCodePoint(0x03E3), String.fromCodePoint(0x03E4),
        String.fromCodePoint(0x03E9), String.fromCodePoint(0x03E8),
        String.fromCodePoint(0x03EB), String.fromCodePoint(0x03EC),
        // TODO: When the rest of the code points above are restored, restore these as well.
        // String.fromCodePoint(0x2620), String.fromCodePoint(0x262D),
        // String.fromCodePoint(0x2673), String.fromCodePoint(0x2674),
        // String.fromCodePoint(0x2675), String.fromCodePoint(0x2676),
        // String.fromCodePoint(0x2677), String.fromCodePoint(0x2678),
        // String.fromCodePoint(0x2679), String.fromCodePoint(0x267C),
        // String.fromCodePoint(0x269D), String.fromCodePoint(0x269E),
        // String.fromCodePoint(0x269F),
      ];
      let point = '';
      let range = {};

      for (let i = 0; i < symbolRanges.length; i += 1) {
        range = symbolRanges[i];
        for (let k = range.start; k < range.stop; k += 1) {
          point = String.fromCodePoint(k);
          if (!skipSymbols.includes(point) && !this.symbols.includes(point)) {
            fullSet.push(point);
          }
        }
      }
      const selected = fullSet[Math.floor(Math.random() * fullSet.length)];
      this.symbols.push(selected);
      return selected;
    },
    addThread(thread) {
      if (!Object.prototype.hasOwnProperty.call(this.threads, thread.DMC)) {
        this.threads[thread.DMC] = Object.assign({}, thread);
        this.threads[thread.DMC].symbol = this.genSymbol();
      }
    },
  };

  pdfFile.text(`This image is ${width} x ${height}.`);
  pdfFile.text(`Each page can hold ${pageBoxCountWidth} boxes across and ${pageBoxCountHeight} down.`);
  pdfFile.text(`So this file is ${pagesWide} pages wide and ${pagesTall} pages tall.`);

  let pageHeight; let pageWidth;
  let pageStartX = 0;
  let pageStartY = 0;
  let page = 1; let pages = [];
  let promisedPage;

  while (page <= totalPages) {
    if (pageStartX >= width) {
      pageStartX = 0;
      pageStartY += pageHeight;
    }

    // Set the pixal range for this page.
    pageHeight = Math.min(pageBoxCountHeight, height - pageStartY);
    pageWidth = Math.min(pageBoxCountWidth, width - pageStartX);
    promisedPage = drawPatternPage(image, pageStartX, pageStartY, pageWidth,
      pageHeight, config, threadIndex);
    promisedPage.pageNumber = page;
    pages.push(promisedPage);
    // Carry the current X position over as the start of the next page.
    pageStartX += pageWidth;
    page += 1;
  }
  try {
    pages = await Promise.all(pages);
    console.log('Done generating page images');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  pages.sort((a, b) => {
    const keyA = new Date(a.pageNumber);
    const keyB = new Date(b.pageNumber);
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  for (let i = 0; i < pages.length; i += 1) {
    pdfFile.addPage({
      margins: {
        top: config.pageMargin,
        bottom: config.pageMargin,
        left: config.edgeMargin,
        right: config.edgeMargin,
      },
    }).text(`Page: ${i + 1} of ${pages.length}. File: ${pages[i]}`, 50, 20);

    Svg2Pdf(pdfFile, pages[i].svg(), config.edgeMargin, config.pageMargin, { assumePt: true });
    console.log(`Page ${i} generated`);
    pages[i] = null;
  }

  if (Object.keys(threadIndex.threads).length > 2) {
    // Add key page to the end.
    pdfFile.addPage({
      margins: {
        top: config.pageMargin,
        bottom: config.pageMargin,
        left: config.edgeMargin,
        right: config.edgeMargin,
      },
    }).text('Adding color key here...', 50, 20);

    pdfFile.registerFont('DejaVuSans', 'fonts/dejavu-fonts/ttf/DejaVuSans.ttf');
    pdfFile.font('DejaVuSans').fontSize(12);
    const colors = Object.values(threadIndex.threads);
    for (let i = 0; i < colors.length; i += 1) {
      const colorInfo = `${colors[i].symbol} DMC: ${colors[i].DMC} – ${colors[i].Name} `;
      pdfFile.fillColor('black')
      .text(colorInfo,{ continued: true }).fillColor(colors[i].Hex).text(`‎■`);
    }

    console.log(threadIndex.threads);
  }

  pdfFile.end();

  console.log('Generation complete');
}

function createPattern(imagePath, settings) {
  const config = Object.assign({}, defaultSettings, settings);

  // TODO: Add support for picking page size.
  const pdfFile = new PdfKit();
  pdfFile.pipe(fs.createWriteStream(`${config.outputLocation}/pattern.pdf`));
  pdfFile.fontSize(25)
    .text('This is a PDF meant to become a stitchable pattern.', 100, 80);
  pdfFile.font('Courier').fontSize(12);

  // Determine the number of boxes on a page. This assumes all future pages
  // will be the same size. Not sure why that would change but might be an
  // interesting feature in the future.
  const pageBoxCountWidth = Math.floor(
    (pdfFile.page.width - (config.edgeMargin * 2)) / config.boxSize,
  );
  const pageBoxCountHeight = Math.floor(
    (pdfFile.page.height - (config.pageMargin * 2)) / config.boxSize,
  );

  Jimp.read(imagePath)
    .then((image) => {
      patternGen(image, pageBoxCountWidth, pageBoxCountHeight, pdfFile, config);
    })
    .catch((err) => {
      console.error(err);
    });
}

exports.generatePattern = createPattern;
