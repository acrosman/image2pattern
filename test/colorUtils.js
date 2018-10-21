const Chai = require('chai');
const Chance = require('chance');
const ColorUtils = require('../src/colorUtils');

describe('Color Utils', () => {
  const chance = new Chance();
  describe('Convert hext to RGB', () => {
    it('should black hex to RGB', () => {
      const black = '#000000';

      const actualRGB = ColorUtils.hex2Rgb(black);
      Chai.expect(actualRGB.r).to.equal(0);
      Chai.expect(actualRGB.g).to.equal(0);
      Chai.expect(actualRGB.b).to.equal(0);
    });

    it('should white hex to RGB', () => {
      const white = '#ffffff';

      const actualRGB = ColorUtils.hex2Rgb(white);
      Chai.expect(actualRGB.r).to.equal(255);
      Chai.expect(actualRGB.g).to.equal(255);
      Chai.expect(actualRGB.b).to.equal(255);
    });

    it('should blue hex to RGB', () => {
      const blue = '#0000FF';

      const actualRGB = ColorUtils.hex2Rgb(blue);
      Chai.expect(actualRGB.r).to.equal(0);
      Chai.expect(actualRGB.g).to.equal(0);
      Chai.expect(actualRGB.b).to.equal(255);
    });

    it('should return null for string', () => {
      const randomString = chance.string();

      const actualRGB = ColorUtils.hex2Rgb(randomString);
      Chai.expect(actualRGB).to.equal(null);
    });
  });

  describe('Convert RGB to hex', () => {
    it('should black RGB to hex', () => {
      const black = {
        r: 0,
        g: 0,
        b: 0,
      };

      const actualHex = ColorUtils.rgb2Hex(black);
      Chai.expect(actualHex).to.equal('#000000');
    });

    it('should white RGB to hex', () => {
      const white = {
        r: 255,
        g: 255,
        b: 255,
      };

      const actualHex = ColorUtils.rgb2Hex(white);
      Chai.expect(actualHex).to.equal('#ffffff');
    });

    it('should blue RGB to hex', () => {
      const blue = {
        r: 0,
        g: 0,
        b: 255,
      };

      const actualHex = ColorUtils.rgb2Hex(blue);
      Chai.expect(actualHex).to.equal('#0000ff');
    });
  });

  describe('Convert Hex to Jimp Integer', () => {
    it('should convert black to Jimp Int with solid alpha', () => {
      const black = '#000000';

      const actualInt = ColorUtils.cssHex2JimpInt(black);

      Chai.expect(actualInt).to.equal(255);
    });

    it('should convert black to Jimp Int with alpha transparent', () => {
      const black = '#000000';

      const actualInt = ColorUtils.cssHex2JimpInt(black, '00');

      Chai.expect(actualInt).to.equal(0);
    });

    it('should convert white to Jimp Int with solid alpha', () => {
      const white = '#ffffff';

      const actualInt = ColorUtils.cssHex2JimpInt(white);

      Chai.expect(actualInt).to.equal(4294967295);
    });

    it('should convert blue to Jimp Int with solid alpha', () => {
      const blue = '#0000FF';

      const actualInt = ColorUtils.cssHex2JimpInt(blue);

      Chai.expect(actualInt).to.equal(65535);
    });
  });

  describe('Convert Jimp Integer to Hex', () => {
    it('should convert blue Jimp Int to blue hex', () => {
      const blue = 0x0000FFFF;

      const actualHex = ColorUtils.int2CssHex(blue);

      Chai.expect(actualHex).to.equal('#0000FF');
    });

    it('should convert red Jimp Int to red hex', () => {
      const red = 0xFF0000FF;

      const actualHex = ColorUtils.int2CssHex(red);

      Chai.expect(actualHex).to.equal('#FF0000');
    });

    it('should convert green Jimp Int to green hex', () => {
      const green = 0x00FF00FF;

      const actualHex = ColorUtils.int2CssHex(green);

      Chai.expect(actualHex).to.equal('#00FF00');
    });

    it('should convert white Jimp Int to white hex', () => {
      const white = 0xFFFFFFFF;

      const actualHex = ColorUtils.int2CssHex(white);

      Chai.expect(actualHex).to.equal('#FFFFFF');
    });

    it('should convert black Jimp Int to black hex', () => {
      const black = 0x00000000FF;

      const actualHex = ColorUtils.int2CssHex(black);

      Chai.expect(actualHex).to.equal('#000000');
    });
  });

  describe('Color Distance', () => {
    it('Should calculate distance between two colors', () => {
      const rgbColor1 = {
        r: 0,
        g: 0,
        b: 0,
      };
      const rgbColor2 = {
        r: 255,
        g: 255,
        b: 255,
      };

      const actualDistance = ColorUtils.colorDistance(rgbColor1, rgbColor2);

      Chai.expect(actualDistance).to.be.equal(95.58064652484387);
    });

    it('Should calculate distance between two closely related colors', () => {
      const rgbColor1 = {
        r: 242,
        g: 0,
        b: 0,
      };
      const rgbColor2 = {
        r: 253,
        g: 0,
        b: 0,
      };

      const actualDistance = ColorUtils.colorDistance(rgbColor1, rgbColor2);

      Chai.expect(actualDistance).to.be.equal(2.3906196073816792);
    });
  });

  describe('Closest Color', () => {
    it('should pick closest black if given a black color', () => {
      const rgb = {
        r: 0,
        g: 0,
        b: 0,
      };

      const closestColor = ColorUtils.closestColor(rgb);

      Chai.expect(closestColor.Name).to.eql("Black");
    });

    it('should pick closest white if given a white color', () => {
      const rgb = {
        r: 255,
        g: 255,
        b: 255,
      };

      const closestColor = ColorUtils.closestColor(rgb);

      Chai.expect(closestColor.Name).to.eql("White");
    });

    it('should pick closest color if given a color', () => {
      const rgb = {
        r: 12,
        g: 232,
        b: 44,
      };

      const closestColor = ColorUtils.closestColor(rgb);

      Chai.expect(closestColor.Name).to.eql("Parrot Green - LT");
    });
  });

  describe('Is Dark Color', () => {
    it('should return true if YIQ brightness value is equal to or over 128', () => {
      const color = {
        r: 128,
        g: 128,
        b: 128,
      };

      const actualYIQ = ColorUtils.isDarkColor(color);

      Chai.expect(actualYIQ).to.equal(true);
    });

    it('should return false if YIQ brightness value is less than 128', () => {
      const color = {
        r: 127,
        g: 127,
        b: 127,
      };

      const actualYIQ = ColorUtils.isDarkColor(color);

      Chai.expect(actualYIQ).to.equal(false);
    });
  });
});
