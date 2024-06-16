const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const fs =require("fs")
const https=require("https")
const log=(data)=>{
  console.log(data)
  fs.appendFileSync("../log.txt",`${data}\n`)
}
//const { savePassword, getPasswords } = require('./database');
const gen=(o)=>{
var options ={...o}
return options
}
try {
  fs.mkdirSync("./logs")
} catch (error) {
  console.log(error)
}
proxyUrl="http://localhost:3000/"
// Démarrer le serveur
require('./server');

let mainWindow;

// Fonction pour créer la fenêtre principale
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../front-end/preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      webviewTag: true // Activer l'utilisation des webviews
    }
  });

  mainWindow.loadURL('http://localhost:3000');

  // Intercepter l'événement new-window pour ouvrir les popups dans une nouvelle webview
  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    event.preventDefault();
    
    const webview = new BrowserWindow({
      width: 600,
      height: 400,
      webPreferences: {
        preload: path.join(__dirname, '../front-end/preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false,
      }
    });

    webview.loadURL(url);
    event.newGuest = webview;
  });
}
app.on('ready', () => {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    if(url.startsWith("devtools")){
      fs.appendFileSync("./logs/devtool.txt",url+"\n")
    }else{
      const req=require("node:url").parse(url)
      fs.appendFileSync(`./logs/${req.hostname}.txt`,url+"\n")
    }
    callback({})
    // Vérifier si la requête n'est pas destinée à votre propre proxy et est HTTP ou HTTPS
    
  });})
  https.globalAgent.options.rejectUnauthorized = false;
// Initialisation de l'application Electron
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
const agent = new https.Agent({  
  rejectUnauthorized: false
});
// Gestion des requêtes HTTP GET via le proxy
ipcMain.handle('make-request', async (event, options) => {
  log(JSON.stringify(...options),null,2)
  log(JSON.stringify(...event),null,2)

  if (options.method && options.method.toLowerCase() !== 'get') {
    return { error: 'Only GET method is supported.' };
  }
  log(JSON.stringify(...options),null,2)

  try {
  log(JSON.stringify(...options),null,2)
    const response = await axios({
      ...gen(options),
      httpsAgent: agent,
      url: `http://localhost:3000/proxy?url=${options.url}`
    });
    log(response)
    return response.data;
  } catch (error) {
   log("erreur cotée serveur "+error)
    return { error: error.message };
  }
});

// Gestion des cookies
ipcMain.handle('get-cookies', async (event, url) => {
  return await session.defaultSession.cookies.get({ url });
});

ipcMain.handle('set-cookie', async (event, cookie) => {
  await session.defaultSession.cookies.set(cookie);
  return true;
});

ipcMain.handle('remove-cookie', async (event, url, name) => {
  await session.defaultSession.cookies.remove(url, name);
  return true;
});
/*
// Gestion des mots de passe
ipcMain.handle('save-password', (event, passwordData) => {
  const { url, username, password } = passwordData;
  savePassword(url, username, password);
});

ipcMain.handle('get-passwords', (event, url) => {
  return getPasswords(url);
});*/
