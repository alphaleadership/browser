const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
var logger = require('morgan');
const fs=require("fs")
var rfs = require('rotating-file-stream') 
const temp={}
const clean=(url)=>{
  console.log("url est "+url)
  console.log("le type de url est "+typeof url)
  
    console.log("test")
    url.replace("/\"",'')
  
  console.log(url)
  return url
}
// Fonction pour créer la fenêtre principale
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    
    webPreferences: {
      devTools:true,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL("http://localhost:3000/")
}

// Initialisation de l'application Electron
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Intercepter les requêtes sortantes et les rediriger vers le backend
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    console.log("temp est "+temp)
    if(details.url.startsWith("devtools:")){
      callback({})
      return
    }
    if (!details.url.startsWith('http://localhost')) {
      // Rediriger les requêtes sortantes vers le backend
      if(details.url.startsWith("http://localhost:3000/%22/")){
        details.url=details.webContents.navigationHistory.getEntryAtIndex(details.id-1)+details.url.replace("http://localhost:3000/%22/",'').replace('/"','')
      }
      callback({ redirectURL: `http://localhost:3000/proxy?url=${encodeURIComponent(details.url)}` });
    } else {
     // console.log(details.url)
      // Laisser passer les requêtes locales
      if(details.url.startsWith("http://localhost:3000/%22/")){
        details.url=temp.host+details.url.replace("http://localhost:3000/%22/",'/')
        callback({ redirectURL: `http://localhost:3000/proxy?url=${encodeURIComponent(details.url)}` });
      return
      }
      callback({});
    }
  });
});

// Réception des requêtes HTTP
ipcMain.handle('make-request', async (event, options) => {
  temp.host=options
  console.log(temp.host)
  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
});
const express = require('express');

const server = express();
server.use(logger('dev'));
// Route pour la proxy
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})
var errorLogStream = rfs.createStream('error.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

server.use(logger('combined', {stream: accessLogStream}));
server.use(logger('combined', {skip: function (req, res) { return res.statusCode < 400 }, stream: errorLogStream}));


server.get('/proxy', async (req, res) => {
  try {
    const url = clean(decodeURIComponent(req.query.url));
    
    fs.appendFileSync("./log2.txt",url+"\n")
    console.log(url)
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: error.message });
  }
});
server.use(express.static("./public"))
// Autres routes de votre application
// ...

const port = 3000;
server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
