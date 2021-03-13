var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const rgb565_convert = require('./rgb565_convert');

const d3 = require('d3');
const color_tile_width = 120;
const color_tile_height = 30;

const content = fs.readFileSync(`output/colors2.json`)
const records = eval(content.toString())

for (recordIndex in records) {
    let record = records[recordIndex];

    console.log("toneName: ", record.name);

    const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
    let body = d3.select(dom.window.document.querySelector("body"))
    let svg = body
        .append('svg')
        .attr('width', color_tile_width + 'px')
        .attr('height', color_tile_height + 'px')
        .attr('xmlns', 'http://www.w3.org/2000/svg');

    let xxx = rgb565_convert.convert16to24(record.rgb565);

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", color_tile_width)
        .attr("height", color_tile_height)
        .attr('rx', '5px')
        .attr('ry', '5px')
        .style("fill", "#" + xxx);
    fs.writeFileSync('output/tones/'+record.variable_name + '.svg', body.html());
}





