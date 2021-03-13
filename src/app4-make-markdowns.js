var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const rgb565_convert = require('./rgb565_convert');

const d3 = require('d3');
const color_tile_width = 200;
const color_tile_height = 50;

const content = fs.readFileSync(`output/colors2.json`)
const records = eval(content.toString())

let shades = records
    .flatMap(r => r.shades)
    .filter((value, index, categoryArray) => categoryArray.indexOf(value) === index);

for (shadeIndex in shades) {
    let shade = shades[shadeIndex];
    let export_markdown = "|  Color | Name  | rgb565  |  rgb888 |\n" +
                          "|---|---|---|---|\n";
    let allTonesForShade =
        records
            .filter( r => r.shades.indexOf(shade) != -1 )
            .sort( (a,b) => a.variable_name.localeCompare( b.variable_name))

    for (recordIndex in allTonesForShade) {
        let record = allTonesForShade[recordIndex];

        console.log("toneName: ", record.name);
        export_markdown += `| ![${record.name}](docs/tones/${record.variable_name}.svg)  | ${record.name}  | ${record.rgb565.toString(16)} | ${record.color} |\n`;
    }

    fs.writeFileSync(`output/md/${shade}.md`, export_markdown);
}


let tonesWithNoShade =
    records
        .filter( r => r.shades.length == 0 )
        .sort( (a,b) => a.variable_name.localeCompare( b.variable_name))

let shade = "misc";
let export_markdown = "|  Color | Name  | rgb565  |  rgb888 |\n" +
    "|---|---|---|---|\n";

for (recordIndex in tonesWithNoShade) {
    let record = tonesWithNoShade[recordIndex];

    console.log("toneName: ", record.name);
    export_markdown += `| ![${record.name}](docs/tones/${record.variable_name}.svg)  | ${record.name}  | ${record.rgb565.toString(16)} | ${record.color} |\n`;
}

fs.writeFileSync(`output/md/${shade}.md`, export_markdown);





