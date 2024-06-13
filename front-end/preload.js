const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  makeRequest: (options) => ipcRenderer.invoke('make-request', options),
  getCookies: (url) => ipcRenderer.invoke('get-cookies', url),
  setCookie: (cookie) => ipcRenderer.invoke('set-cookie', cookie),
  removeCookie: (url, name) => ipcRenderer.invoke('remove-cookie', url, name),
  savePassword: (passwordData) => ipcRenderer.invoke('save-password', passwordData),
  getPasswords: (url) => ipcRenderer.invoke('get-passwords', url),

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
