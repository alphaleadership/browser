let Parser = require('rss-parser');
let parser = new Parser({customFields: {
    item: [
      ['media', 'media:content', {keepArray: true,includeSnippet :true},],
    ]
  }});

(async () => {
    let url="https://www.reddit.com/r/nsfw/.rss"
  let feed = await parser.parseURL(url);
  

  console.log(feed.title);

  feed.items.forEach(item => {
    const fs = require('fs');
    const cheerio = require('cheerio');
    console.log(item)
    const $ = cheerio.load(item.content);
    const links = $('a').map((i, el) => $(el).attr('href')).get();
    const imageSources = $('img').map((i, el) => $(el).attr('src')).get();
    
    if (links.length > 0 || imageSources.length > 0) {
      let extractedContent = 'Liens:\n' + links.join('\n');
      extractedContent += '\n\nSources des images:\n' + imageSources.join('\n');
      fs.appendFileSync('extracted_content.txt', extractedContent + '\n\n', 'utf8');
      console.log('Liens et sources des images extraits et sauvegardés dans extracted_content.txt');
    }
  });

})();