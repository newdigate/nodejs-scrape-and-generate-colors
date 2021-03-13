const fs = require('fs');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const rgb565_convert = require('./rgb565_convert');

const https = require('https');
const utf8 = require('utf8');
var count = 0;

let my_shades = ["azure","black","blue","brown","cyan","green","gray","magenta","orange","pink","purple","red","white","yellow","violet"];
let my_urls = my_shades.map( (s) => `https://en.wikipedia.org/wiki/Shades_of_${s}`);

function getAllUrlsColorData(urls, shades, endaction) {
    var i = 0;
    let url = "";
    let data = [];
    let shade = "";

    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    function callNext() {
            url = urls[i];
            shade = shades[i];
            let s = "";
            var req = https.get(url, (res) => {
                console.log('statusCode:', res.statusCode);
                //console.log('headers:', res.headers);

                res.on('data', (d) => {
                    s += d.toString();
                    count++;
                    //console.log(count + ": " + d.toString());
                });

                res.on('end', () => {

                    const dom = new JSDOM(s);

                    let shade_tone_variables = [];
                    let shade_tone_names = [];

                    let infoBox_tableBodys = dom.window.document.querySelectorAll(
                        `#mw-content-text > div.mw-parser-output > table.infobox > tbody`);
                    for (let infoBox_tableBodyIndex in infoBox_tableBodys){
                        let shadeInfoBox = infoBox_tableBodys[infoBox_tableBodyIndex];
                        const shadeInfoBoxfrag = JSDOM.fragment(shadeInfoBox.outerHTML);
                        let row1_tableheader = shadeInfoBoxfrag.querySelector("tbody > tr:nth-child(1) > th");
                        let row2_tableheader = shadeInfoBoxfrag.querySelector("tbody > tr:nth-child(2) > td");
                        let isShadeInfoBox = (row1_tableheader !== undefined && row2_tableheader !== undefined && row1_tableheader != null && row2_tableheader !== null);
                        if (!isShadeInfoBox)
                            continue;
                        if (row1_tableheader.innerHTML.indexOf("Shades of ") != -1)
                            continue;
                        isShadeInfoBox = (row1_tableheader.colSpan === 2 && row2_tableheader.colSpan === 2);
                        if (isShadeInfoBox) {
                            let body = shadeInfoBoxfrag.querySelectorAll(`tr:nth-child(1) > th`)
                            if (body.length === 0) {
                                continue;
                            }

                            let toneNameBody = body[0];
                            while (toneNameBody.childNodes !== undefined && toneNameBody.childNodes.length > 0) {
                                toneNameBody = toneNameBody.childNodes[0];
                            }

                            let tone_name = toneNameBody.wholeText.replaceAll("<br>", "").trim();
                            let variable_name =
                                capitalize(
                                    utf8.encode(tone_name
                                        .replaceAll(" ", "_")
                                        .replaceAll("-", "_")
                                        .replaceAll("&", "")
                                        .replaceAll("(", "")
                                        .replaceAll(")", "")
                                        .replaceAll("/", "")
                                        .replaceAll("\\", "")
                                        .replaceAll(".", "")
                                        .replaceAll("’", "")
                                        .replaceAll("#", "")
                                        .replaceAll("é", "e")
                                        .replaceAll("'", "")
                                        .replaceAll(";", "")
                                        .replaceAll(":", "")
                                        .replaceAll(",", "")
                                        .replaceAll("<br>", "")
                                        .replaceAll("\"", "")
                                        .toLowerCase()));

                            let infoBoxRows = shadeInfoBoxfrag.querySelectorAll(`tbody > tr`)
                            let hexTripletRow = null;
                            for (infoBoxRowIndex in infoBoxRows) {
                                let infoBoxRow  = infoBoxRows[infoBoxRowIndex];
                                if (infoBoxRow.innerHTML === undefined)
                                    break;
                                if (infoBoxRow.innerHTML.toLowerCase().indexOf("hex") != -1) {
                                    hexTripletRow = infoBoxRow;
                                    break;
                                }
                            }

                            if (hexTripletRow != null) {
                                let hexTripletCell = hexTripletRow.cells[1];

                                const colorValue = hexTripletCell.innerHTML.replaceAll('\n','');
                                let xxx = "0x"+ rgb565_convert.convert24to16(colorValue).toUpperCase().replace('0X','');

                                data.push({color:colorValue, rgb565:xxx, url:url + "#" + capitalize(variable_name), name:tone_name, variable_name:variable_name, shade:shade})
                                shade_tone_variables.push(variable_name)
                                shade_tone_names.push(tone_name)
                                console.log("'" + url + "#" + capitalize(variable_name) + "','" + tone_name + "','" + colorValue+"','"+xxx+"','"+variable_name+"'");
                            }



                        }
                    }

                    let exportShadeTones = `const c = require('../rgb565_colors');\n`
                        + `exports.${shade}_tones = [\n\t\tc.RGB565_${shade_tone_variables.join(',\n\t\t c.RGB565_')}]\n`
                        + `exports.${shade}_tone_names = ${JSON.stringify(shade_tone_names)};\n`;
                    fs.writeFileSync(`shades/${shade}.js`, exportShadeTones);

                    if (i < urls.length) {
                        callNext();
                    } else {
                        requestEnded();
                    };

                });


            }).on('error', (e) => {
                console.error(e);
            });

            req.end();
            i++;

    }

    callNext();

    requestEnded = function()
    {
        endaction(data);
    }
}

getAllUrlsColorData(my_urls, my_shades,(data) => {
    let mapped = data.map( d => d.variable_name);
    let distincts = mapped
        .filter((value, index, categoryArray) => categoryArray.indexOf(value) === index)
        .sort( (a,b) => a.localeCompare( b ));

    let exportData = [];
    for (distinctIndex in distincts){
        let distinct = distincts[distinctIndex];
        let dataForTone = data.filter( d => d.variable_name === distinct);
        if (dataForTone.length > 0) {
            let exportTone = {
                color:dataForTone[0].color,
                rgb565:dataForTone[0].rgb565,
                url:dataForTone[0].url,
                name:dataForTone[0].name,
                variable_name:dataForTone[0].variable_name,
                shades:dataForTone.map( t => t.shade ).filter((value, index, categoryArray) => categoryArray.indexOf(value) === index)
            }
            exportData.push(exportTone);
            //export_colors_js += `exports.RGB565_${dataForTone[0].variable_name} = ${dataForTone[0].rgb565};\t\t\t// ${dataForTone[0].color} : ${dataForTone[0].name} : ${dataForTone[0].url}\n`;
        }
    }
    fs.writeFileSync('output/colors.json', JSON.stringify(exportData, null, 1));
})





