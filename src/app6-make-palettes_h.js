var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const rgb565_convert = require('./rgb565_convert');

const d3 = require('d3');
const color_tile_width = 200;
const color_tile_height = 50;

const content = fs.readFileSync(`output/colors2.json`)
const records = eval(content.toString())

let export_palettes = "";

let shades = records
    .flatMap(r => r.shades)
    .filter((value, index, categoryArray) => categoryArray.indexOf(value) === index);

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
let shadeToneLengths = [];

for (shadeIndex in shades) {
    let shade = shades[shadeIndex];
    let allTonesForShade =
        records
            .filter( r => r.shades.indexOf(shade) != -1 )
            .sort( (a,b) => a.variable_name.localeCompare( b.variable_name))

    export_palettes += `uint16_t ${shade}_shades[${allTonesForShade.length}] = {\n\t`;
    let count = 0;
    for (recordIndex in allTonesForShade) {
        let record = allTonesForShade[recordIndex];
        let needsComma = count !== (allTonesForShade.length - 1);
        export_palettes += `RGB565_${padding(record.variable_name + ((needsComma)?',' :''), 30)}`;

        console.log("toneName: ", record.name);
        //export_markdown += `| ![${record.name}](docs/tones/${record.variable_name}.svg)  | ${record.name}  | ${record.rgb565.toString(16)} | ${record.color} |\n`;
        count++;
        if (count % 4 === 0) export_palettes += "\n\t"
    }
    export_palettes += '};\n\n';
    export_palettes += `string ${shade}_shade_names[${allTonesForShade.length}] = {\n\t`;

    count = 0;
    for (recordIndex in allTonesForShade) {
        let record = allTonesForShade[recordIndex];
        let needsComma = count !== (allTonesForShade.length - 1);
        export_palettes += `"${padding(record.name.replaceAll('\"',"\\\"") + "\"" + ((needsComma)?',' :''), 40)}`;

        console.log("toneName: ", record.name);
        //export_markdown += `| ![${record.name}](docs/tones/${record.variable_name}.svg)  | ${record.name}  | ${record.rgb565.toString(16)} | ${record.color} |\n`;
        count++;
        if (count % 4 === 0) export_palettes += "\n\t"
    }
    export_palettes += '};\n\n';
    shadeToneLengths.push( count );
}


let tonesWithNoShade =
    records
        .filter( r => r.shades.length == 0 )
        .sort( (a,b) => a.variable_name.localeCompare( b.variable_name))

let shade = "misc";

export_palettes += `uint16_t ${shade}_shades[${tonesWithNoShade.length}] = {\n\t`;
let count = 0;
for (recordIndex in tonesWithNoShade) {
    let record = tonesWithNoShade[recordIndex];
    let needsComma = count !== (tonesWithNoShade.length - 1);
    export_palettes += `RGB565_${padding(record.variable_name + ((needsComma)?',' :''), 30)}`;

    count++;
    if (count % 4 === 0) export_palettes += "\n\t"
    console.log("toneName: ", record.name);
    //export_markdown += `| ![${record.name}](docs/tones/${record.variable_name}.svg)  | ${record.name}  | ${record.rgb565.toString(16)} | ${record.color} |\n`;
}
export_palettes += '};\n';
export_palettes += `string ${shade}_shade_names[${tonesWithNoShade.length}] = {\n\t`;
count = 0;
for (recordIndex in tonesWithNoShade) {
    let record = tonesWithNoShade[recordIndex];
    let needsComma = count !== (tonesWithNoShade.length - 1);
    export_palettes += `"${padding(record.name.replaceAll('\"',"\\\"") + "\"" + ((needsComma)?',' :''), 40)}`;

    console.log("toneName: ", record.name);
    //export_markdown += `| ![${record.name}](docs/tones/${record.variable_name}.svg)  | ${record.name}  | ${record.rgb565.toString(16)} | ${record.color} |\n`;
    count++;
    if (count % 4 === 0) export_palettes += "\n\t"
}
export_palettes += '};\n\n';
export_palettes +=
    `#define     num_shades ${shades.length + 1}\n`+
    `string      shade_names[num_shades] = {\"${shades.join('\", \"')}\", \"misc\"};\n`+
    `uint16_t*   shade_tone_colors[num_shades] = {${shades.join('_shades, ')}_shades, misc_shades};\n`+
    `string*     shade_tone_names[num_shades] = {${shades.join('_shade_names, ')}_shade_names, misc_shade_names};\n`+
    `uint16_t    num_tones[num_shades] = {${shadeToneLengths.join(', ')}, ${count}};\n`

fs.writeFileSync(`output/cpp/RGB565_palettes.h`, export_palettes);





