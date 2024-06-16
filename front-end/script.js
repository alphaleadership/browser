

// Ajouter un nouvel onglet et une nouvelle webview
document.getElementById('newTabButton').addEventListener('click', () => addNewTab());

// Fonction pour ajouter un nouvel onglet
function addNewTab(url = null) {
  if (!url) {
    url = document.getElementById('urlInput').value.trim();
    if (!url) {
      alert('Veuillez entrer une URL valide.');
      return;
    }
  }

  const tabId = `tab-${Date.now()}`;
  const webviewId = `webview-${Date.now()}`;

  createTabElement(tabId, url);
  createWebviewElement(webviewId, url);
  
  setActiveTab(tabId, webviewId);
}

// Créer un élément d'onglet avec un bouton de fermeture
function createTabElement(tabId, url) {
  const tab = document.createElement('div');
  tab.classList.add('tab');
  tab.id = tabId;
  
  const tabContent = document.createElement('span');
  tabContent.textContent = url;
  tabContent.addEventListener('click', () => setActiveTab(tabId, `webview-${tabId.split('-')[1]}`));
  
  const closeButton = document.createElement('button');
  closeButton.textContent = 'x';
  closeButton.addEventListener('click', (event) => closeTab(event, tabId, `webview-${tabId.split('-')[1]}`));

  tab.appendChild(tabContent);
  tab.appendChild(closeButton);

  document.getElementById('tabsContainer').appendChild(tab);
}

// Créer un élément webview
function createWebviewElement(webviewId, url) {
  const webview = document.createElement('webview');
  webview.classList.add('webview');
  webview.id = webviewId;
  webview.src = url;
  webview.setAttribute('webpreferences', 'contextIsolation=yes, nodeIntegration=no');

  // Intercepter les popups
  webview.addEventListener('new-window', (event) => {
    event.preventDefault();
    addNewTab(event.url);
  });

  document.getElementById('webviewsContainer').appendChild(webview);
}

// Définir l'onglet actif
function setActiveTab(tabId, webviewId) {
  // Désactiver tous les onglets
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Masquer toutes les webviews
  document.querySelectorAll('.webview').forEach(webview => {
    webview.style.display = 'none';
  });

  // Activer l'onglet et afficher la webview correspondants
  document.getElementById(tabId).classList.add('active');
  document.getElementById(webviewId).style.display = 'block';
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

// Ajouter un événement pour afficher les cookies
document.getElementById('getCookies').addEventListener('click', displayCookies);

// Fonction pour afficher les cookies
async function displayCookies() {
  const url = document.getElementById('cookieUrl').value.trim();
  
  if (!url) {
    alert('Veuillez entrer une URL valide.');
    return;
  }

  try {
    const cookies = await api.getCookies(url);
    document.getElementById('cookiesOutput').textContent = JSON.stringify(cookies, null, 2);
  } catch (error) {
    console.error('Erreur lors de la récupération des cookies:', error);
    alert('Une erreur est survenue lors de la récupération des cookies.');
  }
}

// Écouter l'événement modal_show pour afficher un modal
window.addEventListener('modal_show', function (e) {
  // Logique pour afficher un modal
  console.log('Modal show event triggered:', e);
}, false);
