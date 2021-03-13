
exports.convert24to16 = (input) =>
{
    let RGB888 = parseInt(input.toString().replace(/^#/, ''), 16);
    let r = (RGB888 & 0xFF0000) >> 16;
    let g = (RGB888 & 0xFF00) >> 8;
    let b = RGB888 & 0xFF;

    r = (r * 249 + 1014) >> 11;
    g = (g * 253 + 505) >> 10;
    b = (b * 249 + 1014) >> 11;
    let RGB565 = 0;
    RGB565 = RGB565 | (r << 11);
    RGB565 = RGB565 | (g << 5);
    RGB565 = RGB565 | b;

    return "0x"+padLeadingZeros(RGB565.toString(16),4);
};

function padLeadingZeros(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

exports.convert16to24 = (input) =>
{
    let RGB565 = parseInt(input.toString().replace(/^#/, ''));
    let r = (RGB565 & 0xF800) >> 11;
    let g = (RGB565 & 0x07E0) >> 5;
    let b = RGB565 & 0x1F;

    r = (r * 527 + 23) >> 6;
    g = (g * 259 + 33) >> 6;
    b = (b * 527 + 23) >> 6;

    let RGB888 = 0;
    RGB888 = RGB888 | (r << 16);
    RGB888 = RGB888 | (g << 8);
    RGB888 = RGB888 | (b);

    return padLeadingZeros(RGB888.toString(16), 6);
};