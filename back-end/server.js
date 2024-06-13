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
  fs.appendFileSync("../log.txt",`${data}\n`)
}
var logger = require('morgan');

var rfs = require('rotating-file-stream'); 
const { hostname } = require('os');
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
  rejectUnauthorized: false
});
// Configuration du proxy
app.all('/proxy', async (req, res) => {
  const targetUrl = decodeURIComponent(req.query.url);
  try {
    require("url").parse(targetUrl)

  } catch (error) {
    log(error)
  }
 log(path.join(__dirname, './log3.txt'))
  fs.appendFileSync(path.join(__dirname, './log3.txt'),targetUrl+"\n")
  // Récupérer l'URL cible depuis les paramètres de requête
  log(targetUrl)
  try {
    const axiosConfig = {
      method: req.method,
      url: targetUrl,
      data:req.data,
      headers: req.headers,
      hostname:require("url").parse(targetUrl).hostname,
      host:require("url").parse(targetUrl).host,
      responseType: 'stream',
      httpsAgent:agent // Adapter selon le type de réponse attendue
    };
    try{
      const response = await axios(axiosConfig)
    }catch(error){
      console.log("erreur serveur "+JSON.stringify(error,null,2))
    }
    // Utilisation d'Axios pour envoyer la requête vers le domaine cible spécifié
    

    // Écriture de l'URL dans le fichier de journalisation
    logUrlToFile(targetUrl);

    // Envoi de la réponse du domaine cible au client
    response.data.pipe(res);
  } catch (error) {
    log('Error proxying request:', error);
    res.status(500).send('Proxying request failed');
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
