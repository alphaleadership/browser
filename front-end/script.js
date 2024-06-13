document.getElementById('newTabButton').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value;
  const tabId = `tab-${Date.now()}`;
  const webviewId = `webview-${Date.now()}`;

  const tab = document.createElement('div');
  tab.classList.add('tab');
  tab.id = tabId;
  tab.textContent = url;
  tab.addEventListener('click', () => {
    setActiveTab(tabId, webviewId);
  });

  const webview = document.createElement('webview');
  webview.classList.add('webview');
  webview.id = webviewId;
  webview.src = url;
  webview.setAttribute('webpreferences', 'contextIsolation=yes, nodeIntegration=no');

  webview.addEventListener('did-stop-loading', async () => {
    const cookies = await window.api.getCookies(url);
    const passwords = await window.api.getPasswords(url);
    if (passwords.length > 0) {
      // Injecter les mots de passe sauvegardés dans le formulaire de connexion
      const script = `
        document.querySelectorAll('input[type="password"]').forEach((input, index) => {
          input.value = '${passwords[0].password}';
        });
        document.querySelectorAll('input[type="text"], input[type="email"]').forEach((input, index) => {
          input.value = '${passwords[0].username}';
        });
      `;
      webview.executeJavaScript(script);
    }
  });

  document.getElementById('tabsContainer').appendChild(tab);
  document.getElementById('webviewsContainer').appendChild(webview);

  setActiveTab(tabId, webviewId);
});

function setActiveTab(tabId, webviewId) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('.webview').forEach(webview => {
    webview.classList.remove('active');
  });

  document.getElementById(tabId).classList.add('active');
  document.getElementById(webviewId).classList.add('active');
}
window.addEventListener('modal_show', function (e) { /* ... */ }, false);
document.getElementById('getCookies').addEventListener('click', async () => {
  const url = document.getElementById('cookieUrl').value;
  const cookies = await window.api.getCookies(url);
  document.getElementById('cookiesOutput').textContent = JSON.stringify(cookies, null, 2);
});
document.getElementById('openPopupButton').addEventListener('click', () => {
  const popupUrl = document.getElementById('popupUrlInput').value;
  window.api.openWebView(popupUrl);
});

document.getElementById('openModalButton').addEventListener('click', () => {
  const modalUrl = document.getElementById('modalUrlInput').value;
  window.api.openWebView(modalUrl);
});

// Ouvrir les popups généraux dans une nouvelle webview


