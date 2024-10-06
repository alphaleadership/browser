// Importer les modules nécessaires

/*


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
;
  tab.id = tabId;
  tab.classList.add('tab', 'p-2', 'm-1', 'bg-gray-100', 'border', 'border-gray-300', 'cursor-pointer', 'flex', 'items-center');
    
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
  webview.classList.add('webview', 'absolute', 'top-0', 'left-0', 'w-full', 'h-full', 'border-none');
    
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
document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const newTabButton = document.getElementById('newTabButton');
  const multipleUrlsInput = document.getElementById('multipleUrlsInput');
  const openMultipleUrlsButton = document.getElementById('openMultipleUrlsButton');
  const tabsContainer = document.getElementById('tabsContainer');
  const webviewsContainer = document.getElementById('webviewsContainer');

  let tabCount = 0;

  const createTab = (url, shouldLoad = true) => {
    tabCount++;
    const tabId = `tab-${tabCount}`;
    const tab = document.createElement('div');
    tab.classList.add('tab', 'px-2', 'py-1', 'm-1', 'bg-gray-100', 'border', 'border-gray-300', 'cursor-pointer', 'flex', 'items-center', 'rounded-md', 'text-gray-800', 'whitespace-nowrap');
    tab.dataset.tab = tabId;

    const tabTitle = document.createElement('span');
    tabTitle.textContent = `Tab ${tabCount}`;
    tab.appendChild(tabTitle);

    const reloadButton = document.createElement('button');
    reloadButton.textContent = '↻';
    reloadButton.classList.add('ml-2', 'bg-gray-200', 'border', 'border-gray-300', 'rounded-md', 'text-gray-800', 'px-1');
    reloadButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent tab switch on button click
      const webview = document.querySelector(`.webview[data-tab="${tabId}"]`);
      if (!webview.src) {
        webview.src = webview.dataset.url; // Load the iframe content if not loaded
      } else {
        webview.src = webview.src; // Reload the iframe content
      }
    });
    tab.appendChild(reloadButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '✖';
    deleteButton.classList.add('ml-2', 'bg-gray-200', 'border', 'border-gray-300', 'rounded-md', 'text-gray-800', 'px-1');
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent tab switch on button click
      const webview = document.querySelector(`.webview[data-tab="${tabId}"]`);
      tab.remove();
      webview.remove();
      if (tab.classList.contains('bg-gray-300') && tabsContainer.firstChild) {
        tabsContainer.firstChild.click();
      }
    });
    tab.appendChild(deleteButton);

    const webview = document.createElement('webview');
    webview.classList.add('webview', 'absolute', 'top-0', 'left-0', 'w-full', 'h-full', 'border-none', 'hidden');
    webview.dataset.tab = tabId;
    webview.dataset.url = url;

    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('bg-gray-300'));
      document.querySelectorAll('.webview').forEach(w => w.classList.add('hidden'));

      tab.classList.add('bg-gray-300');
      webview.classList.remove('hidden');

      if (!webview.src && shouldLoad) {
        webview.src = webview.dataset.url;
      }
    });

    tabsContainer.appendChild(tab);
    webviewsContainer.appendChild(webview);

    tab.click();
  };

  newTabButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
      createTab(url);
      urlInput.value = '';
    }
  });

  openMultipleUrlsButton.addEventListener('click', () => {
    const urls = multipleUrlsInput.value.trim().split('\n').filter(url => url);
    urls.forEach(url => createTab(url,false));
    multipleUrlsInput.value = '';
  });
});*/
//const { ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const newTabButton = document.getElementById('newTabButton');
  const multipleUrlsInput = document.getElementById('multipleUrlsInput');
  const openMultipleUrlsButton = document.getElementById('openMultipleUrlsButton');
  const tabsContainer = document.getElementById('tabsContainer');
  const webviewsContainer = document.getElementById('webviewsContainer');
  newTabButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
      createTab(url);
      urlInput.value = '';
    }
  });

  openMultipleUrlsButton.addEventListener('click', () => {
    const urls = multipleUrlsInput.value.trim().split('\n').filter(url => url);
    urls.forEach(url => createTab(url,false));
    multipleUrlsInput.value = '';
  });
  const createTab = (url, shouldLoad = true) => {
    window.api.saveWebviewUrl(url);
    const tabId = `tab-${Date.now()}`; // Utiliser un ID unique basé sur le timestamp
    const tab = document.createElement('div');
    tab.classList.add('tab', 'px-2', 'py-1', 'm-1', 'bg-gray-100', 'border', 'border-gray-300', 'cursor-pointer', 'flex', 'items-center', 'rounded-md', 'text-gray-800', 'whitespace-nowrap');
    tab.dataset.tab = tabId;

    const tabTitle = document.createElement('span');
    tabTitle.textContent = ` ${tabId}`;
    tab.appendChild(tabTitle);

    const reloadButton = document.createElement('button');
    reloadButton.textContent = '↻';
    reloadButton.classList.add('ml-2', 'bg-gray-200', 'border', 'border-gray-300', 'rounded-md', 'text-gray-800', 'px-1');
    reloadButton.addEventListener('click', (event) => {
      //event.stopPropagation(); // Prevent tab switch on button click
      const webview = document.querySelector(`.webview[data-tab="${tabId}"]`);
      if (!webview.src) {
        webview.src = webview.dataset.url; // Load the iframe content if not loaded
      } else {
        webview.src = webview.src; // Reload the iframe content
      }
    });
    tab.appendChild(reloadButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '✖';
    deleteButton.classList.add('ml-2', 'bg-gray-200', 'border', 'border-gray-300', 'rounded-md', 'text-gray-800', 'px-1');
    deleteButton.addEventListener('click', (event) => {
      //event.stopPropagation(); // Prevent tab switch on button click
      const webview = document.querySelector(`.webview[data-tab="${tabId}"]`);
      window.api.removeWebviewUrl(webview.dataset.url); // Supprimer l'URL lors de la fermeture de l'onglet
      tab.remove();
      webview.remove();
      if (tab.classList.contains('bg-gray-300') && tabsContainer.firstChild) {
        tabsContainer.firstChild.click();
      }
    });
    tab.appendChild(deleteButton);

    const webview = document.createElement('webview');
    webview.classList.add('webview', 'absolute', 'top-0', 'left-0', 'w-full', 'h-full', 'border-none', 'hidden');
    webview.dataset.tab = tabId;
    webview.dataset.url = url;
    webview.addEventListener('context-menu', (e) => {
      e.preventDefault();
      window.electron.sendContextMenuEvent({
          x: e.x,
          y: e.y,
          linkURL: webview.getURL()
      });
    });

    // Vérifier si l'URL est un flux RSS
    function isRssUrl(url) {
      return url.endsWith('.rss') || url.endsWith('.xml') || url.includes('feed');
    }
    
    if (isRssUrl(url)) {
      // Traiter l'URL comme un flux RSS
      webview.addEventListener('dom-ready', () => {
        webview.executeJavaScript(`
          const rssContent = document.body.innerText;
          window.electron.sendRssContentEvent({
            url: '${url}',
            content: rssContent
          });
        `);
      });
    } else {
      // Détecter les liens RSS sur les pages web normales
      webview.addEventListener('dom-ready', () => {
        webview.executeJavaScript(`
          const rssLink = document.querySelector('link[type="application/rss+xml"]');
          if (rssLink) {
            window.electron.sendRssDetectedEvent({
              url: '${url}',
              rssUrl: rssLink.href
            });
          }
        `);
      });
    }
 
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('bg-gray-300'));
      document.querySelectorAll('.webview').forEach(w => w.classList.add('hidden'));

      tab.classList.add('bg-gray-300');
      webview.classList.remove('hidden');

      if (!webview.src && shouldLoad) {
        webview.src = webview.dataset.url;
         // Sauvegarder l'URL lorsqu'elle est chargée dans la webview
      }
    });

    tabsContainer.appendChild(tab);
    webviewsContainer.appendChild(webview);

    tab.click();
  };

  // Charger les URLs des webviews sauvegardées et créer les onglets
  window.api.loadWebviewUrls().then((data)=>{
   // console.log(data)
    data.forEach(url => {
      createTab(url, false);
    });
  });
  
});