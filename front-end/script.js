// Importer les modules nécessaires



// Ajouter un nouvel onglet et une nouvelle webview
document.getElementById('newTabButton').addEventListener('click', () => addNewTab());

// Ajouter plusieurs onglets
document.getElementById('openMultipleUrlsButton').addEventListener('click', () => addMultipleTabs());

// Fonction pour ajouter un nouvel onglet
function addNewTab(url = null) {
  if (!url) {
    url = document.getElementById('urlInput').value.trim();
    if (!url) {
      alert('Veuillez entrer une URL valide.');
      return;
    }
  }

  const timestamp = Date.now();
  const tabId = `tab-${timestamp}`;
  const webviewId = `webview-${timestamp}`;

  createTabElement(tabId, webviewId, url);
  createWebviewElement(webviewId, url);

  setActiveTab(tabId, webviewId);
}

// Fonction pour ajouter plusieurs onglets
function addMultipleTabs() {
  const urls = document.getElementById('multipleUrlsInput').value.trim();
  if (!urls) {
    alert('Veuillez entrer des URLs valides.');
    return;
  }

  urls.split('\n').forEach(url => {
    addNewTab(url.trim());
  });
}

// Créer un élément d'onglet avec un bouton de fermeture et de rechargement
function createTabElement(tabId, webviewId, url) {
  const tab = document.createElement('div');
  tab.classList.add('tab');
  tab.id = tabId;

  const tabContent = document.createElement('span');
  tabContent.textContent = extractHostname(url);
  tabContent.addEventListener('click', () => setActiveTab(tabId, webviewId));

  const reloadButton = document.createElement('button');
  reloadButton.textContent = '⟳';
  reloadButton.addEventListener('click', (event) => reloadTab(event, webviewId));

  const closeButton = document.createElement('button');
  closeButton.textContent = 'x';
  closeButton.addEventListener('click', (event) => closeTab(event, tabId, webviewId));

  tab.appendChild(tabContent);
  tab.appendChild(reloadButton);
  tab.appendChild(closeButton);

  document.getElementById('tabsContainer').appendChild(tab);
}

// Créer un élément webview
function createWebviewElement(webviewId, url) {
  const webview = document.createElement('webview');
  webview.classList.add('webview');
  webview.id = webviewId;
  webview.src = url;
  webview.setAttribute('allowpopups',true)
  webview.setAttribute('webpreferences', 'contextIsolation=yes, nodeIntegration=no ');

  // Intercepter les popups
  webview.addEventListener('new-window', (event) => {
    event.preventDefault();
    addNewTab(event.url);
  });

  // Mettre à jour le nom de domaine dans l'onglet lorsque la page est chargée
  webview.addEventListener('did-finish-load', () => {
    const tab = document.getElementById(`tab-${webviewId.split('-')[1]}`);
    const tabContent = tab.querySelector('span');
    tabContent.textContent = extractHostname(webview.getURL());
  });

  document.getElementById('webviewsContainer').appendChild(webview);
}

// Extraire le nom de domaine d'une URL
function extractHostname(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    hostname = url;
  }
  return hostname;
}

// Définir l'onglet actif
function setActiveTab(tabId, webviewId) {
  // Désactiver tous les onglets
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Masquer toutes les webviews
  document.querySelectorAll('.webview').forEach(webview => {
    webview.classList.remove('active');
  });

  // Activer l'onglet et afficher la webview correspondants
  document.getElementById(tabId).classList.add('active');
  document.getElementById(webviewId).classList.add('active');
}

// Recharger un onglet
function reloadTab(event, webviewId) {
  event.stopPropagation();
  const webview = document.getElementById(webviewId);
  webview.reload();
}

// Fermer un onglet et sa webview correspondante
function closeTab(event, tabId, webviewId) {
  event.stopPropagation();

  const tab = document.getElementById(tabId);
  const webview = document.getElementById(webviewId);

  if (tab.classList.contains('active')) {
    // Si l'onglet actif est fermé, activer un autre onglet
    const nextTab = tab.nextElementSibling || tab.previousElementSibling;
    if (nextTab) {
      const nextTabId = nextTab.id;
      const nextWebviewId = `webview-${nextTabId.split('-')[1]}`;
      setActiveTab(nextTabId, nextWebviewId);
    }
  }

  tab.remove();
  webview.remove();
}


// Écouter l'événement modal_show pour afficher un modal
window.addEventListener('modal_show', function (e) {
  // Logique pour afficher un modal
  console.log('Modal show event triggered:', e);
}, false);
