const fs = require('fs');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const rgb565_convert = require('./rgb565_convert');

const https = require('https');
const utf8 = require('utf8');
var count = 0;

let my_urls = [
    'https://en.wikipedia.org/wiki/List_of_colors:_A%E2%80%93F',
    'https://en.wikipedia.org/wiki/List_of_colors:_G%E2%80%93M',
    'https://en.wikipedia.org/wiki/List_of_colors:_N%E2%80%93Z',
];
let my_shades = ["azure","black","blue","brown","cyan","green","gray","magenta","orange","pink","purple","red","white","yellow","violet"];

function getAllUrlsColorData(urls, endaction) {
    var i = 0;
    let url = "";
    let data = [];

    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    function callNext() {
            url = urls[i];

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

                    let tableRows = dom.window.document.querySelectorAll("#mw-content-text > div.mw-parser-output > table > tbody > tr")
                    var first = true;

                    for (let tableRowIndex in tableRows){

                        if (first) {
                            first = false;
                            continue;
                        }

                        let tableRow = tableRows[tableRowIndex];
                        if (tableRow.outerHTML !== undefined) {
                            const frag = JSDOM.fragment(tableRow.outerHTML);
                            let aaa = frag.querySelector("a");
                            let href = "https://en.wikipedia.org" +
                                aaa.attributes['href'].value
                                    .replaceAll('\n','')
                                    .replaceAll("'","")
                                    .replaceAll("\"","");
                            let tone_name = aaa.text
                                .replaceAll("'","");

                            if (tone_name == "") {
                                debugger;
                            }

                            let variable_name =
                                capitalize(
                                    utf8.encode(tone_name
                                        .trim()
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

                            let colorValueCell = tableRow.cells[1];
                            if (colorValueCell !== undefined && colorValueCell.innerHTML !== undefined ) {
                                const colorValue = colorValueCell.innerHTML.replaceAll('\n','');;
                                let xxx = "0x"+ rgb565_convert.convert24to16(colorValue).toUpperCase().replace('0X','');

                                //exportOutput += "\"" + href + "\",\"" + tone_name + "\",\"" + colorValue+"\",\""+ xxx+"\",\""+variable_name+"\"\n";
                                data.push({color:colorValue, rgb565:xxx, url:href, name:tone_name, variable_name:variable_name, shade:null})
                                //console.log("'" + href + "','" + tone_name + "','" + colorValue+"','"+xxx+"','"+variable_name+"'");
                            }
                            else {
                                console.log("WARNING: '" + href + "','" + tone_name);
                            }
                        }

                    }

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

getAllUrlsColorData(my_urls,(data) => {
    let mapped = data.map( d => d.variable_name);
    let distincts = mapped
        .filter((value, index, categoryArray) => categoryArray.indexOf(value) === index)
        .sort( (a,b) => a.localeCompare( b ));

    // Read the content
    const content = fs.readFileSync(`output/colors.json`)
    // Parse the CSV content
    const records = eval(content.toString())

    for (distinctIndex in distincts) {
        let distinct = distincts[distinctIndex];

        let alreadyExists = records.filter( (r) => r.variable_name == distinct).length > 0;
        if (!alreadyExists) {

            let dataForTone = data.filter( d => d.variable_name === distinct);



            if (dataForTone.length > 0) {

                let shades_for_tone = [];
                my_shades.forEach( the_shade => {
                    if (dataForTone[0].variable_name.toLowerCase().indexOf( the_shade) != -1) {
                        shades_for_tone.push(the_shade)
                    }
                })

                let exportTone = {
                    color:dataForTone[0].color,
                    rgb565:dataForTone[0].rgb565,
                    url:dataForTone[0].url,
                    name:dataForTone[0].name,
                    variable_name:dataForTone[0].variable_name,
                    shades:shades_for_tone
                }
                records.push( exportTone )
                console.log(JSON.stringify(exportTone, null, 1))
            }

        }



    }
    let records2 = records.sort(  (a,b) => a.variable_name.localeCompare( b.variable_name ))
    fs.writeFileSync(`output/colors2.json`, JSON.stringify(records2, null, 1))
/*
    let export_colors_js = "";

    let exportData = [];
    for (distinctIndex in distincts){
        let distinct = distincts[distinctIndex];

    }
    fs.writeFileSync('output/colors.json', JSON.stringify(exportData, null, 1));
    fs.writeFileSync('output/rgb565_colors.js', export_colors_js);


 */
    //console.log(JSON.stringify(data));
})





