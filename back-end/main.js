const { app, BrowserWindow, session, ipcMain, Menu, dialog,MenuItem,webContents } = require('electron');
const { loadChromeExtension, addExtension, removeExtension } = require('electron-chrome-extension');

const path = require('path');
const axios = require('axios');
const fs =require("fs")
const https=require("https")
;
const extract = require('extract-zip');
const log=(data)=>{
  console.log(data)
  fs.appendFileSync("../log.txt",`${data}\n`)
}
const saveUrlsFile = './loaded_urls.json';

// Fonction pour sauvegarder les URLs chargées
const saveLoadedUrl = (url) => {
  let loadedUrls = [];
  if (fs.existsSync(saveUrlsFile)) {
    loadedUrls = JSON.parse(fs.readFileSync(saveUrlsFile, 'utf8'));
  }
  if (!loadedUrls.includes(url)) {
    loadedUrls.push(url);
    fs.writeFileSync(saveUrlsFile, JSON.stringify(loadedUrls, null, 2));
  }
};

// Fonction pour charger les URLs sauvegardées
const loadSavedUrls = () => {
  if (fs.existsSync(saveUrlsFile)) {
    return JSON.parse(fs.readFileSync(saveUrlsFile, 'utf8'));
  }
  return [];
};

ipcMain.handle('save-webview-url', (event, url) => {
//  console.log(url)
  saveLoadedUrl(url);
});
const removeWebviewUrl = (url) => {
  if (fs.existsSync(saveUrlsFile)) {
    let webviewUrls = JSON.parse(fs.readFileSync(saveUrlsFile, 'utf8'));
    webviewUrls = webviewUrls.filter(savedUrl => savedUrl !== url);
    fs.writeFileSync(saveUrlsFile, JSON.stringify(webviewUrls, null, 2));
  }
};
ipcMain.handle('remove-webview-url', (event, url) => {
 // console.log(url)
  removeWebviewUrl(url);
});

ipcMain.handle('load-webview-urls', () => {
  return loadSavedUrls();
});

//const { savePassword, getPasswords } = require('./database');
const gen=(o)=>{
var options ={...o}
return options
}
try {
  fs.mkdirSync("./logs")
 
} catch (error) {
 // if(!error.includes("EEXIST")){
    console.log(error)
 // }
  
}
try {

  fs.mkdirSync("./extensions")
} catch (error) {
  //if(!error.includes("EEXIST")){
    console.log(error)
 // }
  
}
proxyUrl="http://localhost:3000/"
// Démarrer le serveur
require('./server');

let mainWindow;

// Fonction pour télécharger et extraire les extensions
const downloadAndLoadExtension = async (url) => {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });

    const zipPath = path.join(__dirname, 'temp_extension.zip');
    fs.writeFileSync(zipPath, response.data);

    const extractPath = path.join("./", 'extensions', path.basename(url, '.zip'));
    await extract(zipPath, { dir: extractPath });

    loadChromeExtension(extractPath)
      .then((extension) => {
        console.log(`Extension loaded: ${extension.name}`);
      })
      .catch((err) => {
        console.error(`Failed to load extension: ${path.basename(url, '.zip')}`, err);
      });

    fs.unlinkSync(zipPath); // Supprimer le fichier zip après extraction
  } catch (error) {
    console.error('Failed to download and load extension:', error);
  }
};


const createMenu = () => {
  const menu = Menu.buildFromTemplate([
    {
      label: 'extension',
      submenu: [
        {
          label: 'Download Extension',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'CRX Files', extensions: ['crx'] }
              ]
            });

            if (!canceled && filePaths.length > 0) {
              await downloadAndLoadExtension(`file://${filePaths[0]}`);
            }
          }
        },
        { role: 'quit' }
      ]
    },{
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: createAboutWindow
        },
        {
          label: 'Configuration',
          click: createConfigWindow
        },
        {
          label: 'Extension Store',
          click: createStoreWindow 
        }
      ]},...Menu.getApplicationMenu().items
  ]);
  console.log(Menu)
  Menu.setApplicationMenu(menu);
};
function loadExtensions() {
  const extensionsPath = path.join(
    "./", 'extensions');
  const extensionNames = fs.readdirSync(extensionsPath);

  extensionNames.forEach((extensionName) => {
    const extensionPath = path.join(extensionsPath, extensionName);
    loadChromeExtension(extensionPath)
      .then((extension) => {
        console.log(`Extension loaded: ${extension.name}`);
      })
      .catch((err) => {
        console.log(`Failed to load extension: ${extensionName}`, err);
      });
  });
}
// Fonction pour créer la fenêtre principale
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../front-end/preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
      webviewTag: true // Activer l'utilisation des webviews
    }
  });

  mainWindow.loadURL('http://localhost:3000');
  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({
      label: 'Back',
      click: () => {
          if (mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack();
          }
      }
  }));
  contextMenu.append(new MenuItem({
      label: 'Forward',
      click: () => {
          if (mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward();
          }
      }
  }));
  contextMenu.append(new MenuItem({ type: 'separator' }));
  contextMenu.append(new MenuItem({
      label: 'Reload',
      click: () => {
          mainWindow.webContents.reload();
      }
  }));
  contextMenu.append(new MenuItem({
      label: 'Open Link in New Window',
      click: () => {
          if (rightClickUrl) {
            saveLoadedUrl(rightClickUrl);
          }
      }
  }));
  contextMenu.append(new MenuItem({ type: 'separator' }));
  contextMenu.append(new MenuItem({
      label: 'Cut',
      role: 'cut'
  }));
  contextMenu.append(new MenuItem({
      label: 'Copy',
      role: 'copy'
  }));
  contextMenu.append(new MenuItem({
      label: 'Paste',
      role: 'paste'
  }));
  contextMenu.append(new MenuItem({ type: 'separator' }));
  contextMenu.append(new MenuItem({
      label: 'Select All',
      role: 'selectAll'
  }));
  contextMenu.append(new MenuItem({
      label: 'Inspect Element',
      click: () => {
          let url = rightClickUrl || mainWindow.webContents.getURL();
          webContents.getAllWebContents().map((item)=>{
            console.log(item)
            item.executeJavaScript(`
            var html = document.documentElement.outerHTML;
              document.title = 'Source Code';
              console.log(html)
              new Promise((ok,nok)=>{ok(html)})
            `).then((data)=>{console.log(data)
              let file =new Date
              fs.appendFileSync(`d:\\browser\\source_code_${file.getTime().toString()}.html`,data)
            })
          })
          //webContents.downloadURL(url)
         
          mainWindow.webContents.executeJavaScript(`
          var html = document.documentElement.outerHTML;
            document.title = 'Source Code';
            console.log(html)
            new Promise((ok,nok)=>{ok(html)})
          `).then((data)=>{console.log(data)
            let file =new Date
            fs.appendFileSync(`d:\\browser\\source_code_${file.getTime().toString()}.html`,data)
          })
      }
  }));

  let rightClickPosition = null;
  let rightClickUrl = null;

  mainWindow.webContents.on('context-menu', (e, params) => {
      rightClickPosition = { x: params.x, y: params.y };
      rightClickUrl = params.linkURL;
      contextMenu.popup(mainWindow, params.x, params.y);
  });
  ipcMain.on('show-context-menu', (event, params) => {
    rightClickPosition = { x: params.x, y: params.y };
    rightClickUrl = params.linkURL;
    contextMenu.popup(BrowserWindow.fromWebContents(event.sender), params.x, params.y);
});
  // Charger les URLs sauvegardées et créer les onglets
  
  
  // Intercepter l'événement new-window pour ouvrir les popups dans une nouvelle webview
}
app.on('ready', () => {
  console.log("ready")
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    let url = new URL(details.url);
    
    // Supprimer les paramètres de suivi courants
    url.searchParams.delete('utm_source');
    url.searchParams.delete('utm_medium');
    url.searchParams.delete('utm_campaign');
    url.searchParams.delete('fbclid');
    url.searchParams.delete('gclid');
    url.searchParams.delete('signature')
    // Convertir l'URL nettoyée en chaîne
    const cleanUrl = url.toString();
    
    //saveLoadedUrl(cleanUrl);
    fs.appendFileSync("./logs/global.txt", cleanUrl + "\n")
    if(cleanUrl.startsWith("devtools")){
      fs.appendFileSync("./logs/devtool.txt", cleanUrl + "\n")
    } else {
      const req = require("node:url").parse(cleanUrl)
      fs.appendFileSync(`./logs/${req.hostname}.txt`, cleanUrl + "\n")
    }
    callback({})
    // Vérifier si la requête n'est pas destinée à votre propre proxy et est HTTP ou HTTPS
    
  });
session.defaultSession.webRequest.onResponseStarted((details,callback)=>{
 // log(JSON.stringify(details,null,2))
  callback({})
})
session.defaultSession.webRequest.onCompleted((details,callback)=>{
 // log(JSON.stringify(details,null,2))
  callback({})
})


})
  https.globalAgent.options.rejectUnauthorized = false;
// Initialisation de l'application Electron
app.whenReady().then(() => {
  createMenu()
  loadExtensions();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
const agent = new https.Agent({  
 // rejectUnauthorized: false
});
// Gestion des requêtes HTTP GET via le proxy


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
})
ipcMain.handle('download-and-load-extension', async (event, url) => {
  await downloadAndLoadExtension(url);
});
const createStoreWindow = () => {
  const storeWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegration:true,
    }
  });

  storeWindow.loadFile(path.join(__dirname, '../front-end/store.html'));
};


// Fonction pour créer une nouvelle fenêtre "About"
const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    }
  });

  aboutWindow.loadFile(path.join(__dirname, '../front-end/about.html'));
};

// Fonction pour ouvrir une fenêtre de configuration
const createConfigWindow = () => {
  const configWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    }
  });

  configWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Configuration</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
      </style>
    </head>
    <body>
      <h1>Configuration</h1>
      <p>Configuration options go here.</p>
    </body>
    </html>
  `));
};
/*
// Gestion des mots de passe
ipcMain.handle('save-password', (event, passwordData) => {
  const { url, username, password } = passwordData;
  savePassword(url, username, password);
});

ipcMain.handle('get-passwords', (event, url) => {
  return getPasswords(url);
});*/
