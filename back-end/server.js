const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const url = require('url');
const axios=require("axios")
const app = express();
const port = 3000;
const https=require("https")
const log=(data)=>{
  console.log(data)
  fs.appendFileSync("./log.txt",`${data}\n`)
}
const {google} = require('googleapis');
const customsearch = google.customsearch('v1');
var logger = require('morgan');
const gapikey=" AIzaSyBpNP8SGDFLGN8a2AuR7WvVmGRFaIy26V0 "
var rfs = require('rotating-file-stream'); 
const { hostname } = require('os');
var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});
app.use(limiter)
app.use(logger('dev'));
// Route pour la proxy
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})
var errorLogStream = rfs.createStream('error.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})
app.use(express.json())
app.use(logger('combined', {stream: accessLogStream}));
app.use(logger('combined', {skip: function (req, res) { return res.statusCode < 400 }, stream: errorLogStream}));

app.use(express.static(path.join(__dirname, '../front-end')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/index.html'));
});
log(path.join(__dirname, 'logs'))
// Fonction de journalisation
function logUrlToFile(requestUrl) {
  fs.appendFileSync(path.join(__dirname, '../log3.txt'),requestUrl+"\n")
  log(requestUrl)
  const parsedUrl = url.parse(requestUrl);
  const domain = parsedUrl.hostname;
  const logFilePath = path.join(__dirname, 'logs', `${domain}.log`);
  
  // Créer le répertoire 'logs' s'il n'existe pas
  if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));
  }

  // Ajouter l'URL au fichier de log
  fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${requestUrl}\n`);
}
const agent = new https.Agent({  
  //rejectUnauthorized: false
});
// Configuration du proxy

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    parseExtensions(query).then((extension)=>{
      console.log(extension)
      res.json(extension);
    })
  
  } catch (error) {
    log('Error fetching search results:', error);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

// Route pour télécharger et installer une extension
app.post('/api/install', async (req, res) => {
  console.log(req)
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    log("https://clients2.google.com/service/update2/crx?response=redirect&prodversion=69.0.3497.100&x=id%3D"+url.split("/")[url.split("/").length-1])
    const response = await axios.get("https://clients2.google.com/service/update2/crx?response=redirect&prodversion=69.0.3497.100&x=id%3D"+url.split("/")[url.split("/").length-1], { responseType: 'arraybuffer' }).catch((error)=>{log(JSON.stringify(error,null,2))});
    const zipPath = path.join(__dirname, 'temp_extension.zip');
    fs.writeFileSync(zipPath, response.data);

    const extractPath = path.join(__dirname, 'extensions', path.basename(url, '.zip'));
    await extract(zipPath, { dir: extractPath });

    fs.unlinkSync(zipPath); // Supprimer le fichier zip après extraction

    res.json({ success: true });
  } catch (error) {
    log('Error installing extension:', JSON.stringify(error,null,2));
    res.status(500).json({ error: 'Failed to install extension' });
  }
});

// Fonction pour parser les résultats de recherche
async function parseExtensions(html) {
 // console.log(html)
fs.writeFileSync("./indx.html",html)
const res = await customsearch.cse.list({
  cx: "10b9b7895de1e43ae",
  q:"chrome extension "+ html,
  auth: gapikey,
});
//console.log(res.data);
fs.writeFileSync("./data.json",JSON.stringify(res,null,2))
return res.data.items.map((item)=>{
  return {
    name: item.title, url: item.link, icon: '' 
  }
});
  // Cette fonction doit être implémentée pour extraire les détails des extensions à partir du HTML retourné par le Chrome Web Store
  // Exemple:
  // return [
  //   { name: 'Extension 1', url: 'https://...', icon: 'https://...' },
  //   { name: 'Extension 2', url: 'https://...', icon: 'https://...' },
  // ];
}


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
