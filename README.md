# scrape and generate colors
Using nodejs as a code generator to scrape colors from wikipedia and generate c++ header file definitions for 16-bit color names

* App1: scrape html from 'shades of...' wikipedia pages -> save as ```output/colors.json```  
* App2: scrape html from 'lists of colors...' wikipedia pages -> load ```output/colors.json``` -> save as ```output/colors2.json```
* App3: load ```output/colors2.json``` -> save ```output/tones/<tone_name>.svg``` for each tone
* App4: load ```output/colors2.json``` -> save ```output/md/<shade_name>.svg``` for each shade
* App5: load ```output/colors2.json``` -> save ```output/cpp/RGB565_colors.h```
* App6: load ```output/colors2.json``` -> save ```output/cpp/RGB565_palettes.h``` 

```javascript
let shades = ["azure","black","blue","brown","cyan","green","gray","magenta","orange","pink","purple","red","white","yellow","violet","misc"];
```
