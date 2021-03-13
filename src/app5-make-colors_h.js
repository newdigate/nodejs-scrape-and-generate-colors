var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const d3 = require('d3');
const fs = require('fs');
const palettes = require('../old/rgb565_palettes');
const rgb565_convert = require('./rgb565_convert');
const namespace_prefix = "TEENSY_EURORACK_";
const content = fs.readFileSync(`output/colors2.json`)
const records = eval(content.toString())

let export_RGB565_colors_h =
    `#ifndef ${namespace_prefix}_RGB565_COLORS_H\n` +
    `#define ${namespace_prefix}_RGB565_COLORS_H\n\n` +
    `// https://en.wikipedia.org/wiki/Lists_of_colors\n` +
    `// got these values from here: https://forum.arduino.cc/index.php?topic=451297.0\n`;

padding = function(val, n, c)
{
    if ( Math.abs(n) <= val.length ) {
        return val;
    }
    var m = Math.max((Math.abs(n) - val.length) || 0, 0);
    var pad = Array(m + 1).join(String(c || ' ').charAt(0));
//      var pad = String(c || ' ').charAt(0).repeat(Math.abs(n) - this.length);
    return (n < 0) ? pad + val : val + pad;
//      return (n < 0) ? val + pad : pad + val;
};

for (let i=0; i < palettes.shade_names.length; i++) {
    let shadeName = palettes.shade_names[i];
    console.log("shadeName: ", shadeName);

    for (recordIndex in records) {
        let record = records[recordIndex];
        console.log("toneName: ", record.name);
        export_RGB565_colors_h += `#define RGB565_${padding(`${record.variable_name}`,60)}\t\t${padding(`${record.rgb565}`, 10)}     // ${padding(record.name, 40)}\t${record.color}\t\t\t${record.url}\n`;
    }
}
export_RGB565_colors_h +=
    `#endif //${namespace_prefix}_RGB565_COLORS_H\n`
fs.writeFileSync('output/cpp/RGB565_colors.h', export_RGB565_colors_h);


