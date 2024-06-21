
const { contextBridge, ipcRenderer } = require('electron');
//contextBridge.exposeInMainWorld('electronAPI', {
 const  saveWebviewUrl= (url) => ipcRenderer.invoke('save-webview-url', url),
  removeWebviewUrl= (url) => ipcRenderer.invoke('remove-webview-url', url),
  loadWebviewUrls= () => ipcRenderer.invoke('load-webview-urls')
//});
//const fs = require('node:fs');
//c//onst path = require('path');
/*
const saveUrlsFile = path.join(__dirname, 'webview_urls.json');

// Fonction pour sauvegarder les URLs des webviews
const saveWebviewUrl = (url) => {
  let webviewUrls = [];
  if (fs.existsSync(saveUrlsFile)) {
    webviewUrls = JSON.parse(fs.readFileSync(saveUrlsFile, 'utf8'));
  }
  if (!webviewUrls.includes(url)) {
    webviewUrls.push(url);
    fs.writeFileSync(saveUrlsFile, JSON.stringify(webviewUrls, null, 2));
  }
};

// Fonction pour charger les URLs des webviews sauvegardées
const loadWebviewUrls = () => {
  if (fs.existsSync(saveUrlsFile)) {
    return JSON.parse(fs.readFileSync(saveUrlsFile, 'utf8'));
  }
  return [];
};

// Exposer les fonctions au contexte de la page web
contextBridge.exposeInMainWorld('electronAPI', {
  saveWebviewUrl: (url) => saveWebviewUrl(url),
  loadWebviewUrls: () => loadWebviewUrls()
});*/
contextBridge.exposeInMainWorld('api', {
  saveWebviewUrl: (url) => ipcRenderer.invoke('save-webview-url', url),
  removeWebviewUrl: (url) => ipcRenderer.invoke('remove-webview-url', url),
  loadWebviewUrls: () => ipcRenderer.invoke('load-webview-urls'),
  // Fonction pour ouvrir une nouvelle webview pour les popups généraux
  openPopup: (url) => {
    const webview = document.createElement('webview');
    webview.classList.add('webview');
    webview.src = url;
    webview.setAttribute('webpreferences', 'contextIsolation=yes, nodeIntegration=no');
    document.getElementById('webviewsContainer').appendChild(webview);
  },

  // Fonction pour ouvrir une nouvelle webview pour les popups de login
  openLoginPopup: (url) => {
    const webview = document.createElement('webview');
    webview.classList.add('webview');
    webview.src = url;
    webview.setAttribute('webpreferences', 'contextIsolation=yes, nodeIntegration=no');
    webview.setAttribute('name', 'loginPopup');
    document.getElementById('webviewsContainer').appendChild(webview);
  }
});
contextBridge.exposeInMainWorld('electron', {
  sendContextMenuEvent: (params) => ipcRenderer.send('show-context-menu', params),
});

console.log(contextBridge)