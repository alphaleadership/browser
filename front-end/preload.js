const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

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
