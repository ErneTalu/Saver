document.addEventListener('DOMContentLoaded', function() {

  var sun = document.getElementById('sun');
  var moon = document.getElementById('moon');
  var content = document.getElementById('content');
  var root = document.documentElement;
  var body = document.body; 

  var savedUrlName = document.getElementById('savedUrlName');
  var saveButton = document.getElementById('saveButton');
  var nameInput = document.getElementById('nameInput');
  saveButton.className = 'save-button';
  nameInput.className = 'name-input';

  var darkMode = localStorage.getItem('darkMode') === 'true';
  
  moon.style.display = 'inline-block';
  sun.style.display = 'none';

  if (darkMode) activateDarkMode();
  else activateLightMode();

  moon.addEventListener('click', function() {
    activateDarkMode();
  });
  sun.addEventListener('click', function() {
    activateLightMode();
  });
  
  function activateDarkMode() {
    root.style.setProperty('--scrollbar-color', 'goldenrod');
    root.style.setProperty('--scrollbar-bg', 'rgb(10, 10, 10)');
    content.style.backgroundColor = 'black'; 
    body.style.backgroundColor = 'black'; 
    body.style.color = 'white'; 
    moon.style.display = 'none';
    sun.style.display = 'inline-block'; 
    localStorage.setItem('darkMode', 'true');
  }
  function activateLightMode() {
    root.style.setProperty('--scrollbar-color', 'lightgray');
    root.style.setProperty('--scrollbar-bg', 'rgb(240, 240, 240)');
    content.style.backgroundColor = 'white'; 
    body.style.backgroundColor = 'white'; 
    body.style.color = 'black';
    sun.style.display = 'none';
    moon.style.display = 'inline-block'; 
    localStorage.setItem('darkMode', 'false');
  }

 function CreateSavedUrl(savedURL) {
  var urlObject = document.createElement('div');
  urlObject.className = 'saved-url';

  var urlIcon = document.createElement('img'); 
  urlIcon.src = 'https://www.google.com/s2/favicons?sz=64&domain_url=' + savedURL.url; 
  urlIcon.alt = 'Icon';
  urlIcon.style.width = '30px'; 
  urlIcon.style.height = '30px'; 
  urlIcon.style.marginRight = '10px'; 

  var urlName = document.createElement('p');
  urlName.innerText = savedURL.name;
  urlName.setAttribute('data-url', savedURL.url);
  urlName.style.display = 'inline-block';
  urlName.style.width = '60%';

  var updateButton = document.createElement('button');
  updateButton.innerText = 'Update';
  updateButton.style.backgroundColor = 'green';
  updateButton.style.color = 'white';

  var editButton = document.createElement('button');
  editButton.innerText = '✎';
  editButton.style.display = 'inline-block';
  editButton.style.backgroundColor = 'lightblue';
  editButton.style.width = '18%';

  var deleteButton = document.createElement('button');
  deleteButton.innerText = '🗑️'; 
  deleteButton.style.display = 'inline-block';
  deleteButton.style.width = '18%';
  deleteButton.style.backgroundColor = 'red';
  deleteButton.style.color = 'white';

  urlObject.appendChild(urlIcon);
  urlObject.appendChild(urlName);
  urlObject.appendChild(updateButton);
  urlObject.appendChild(editButton);
  urlObject.appendChild(deleteButton);
  savedUrlName.appendChild(urlObject);

  urlName.addEventListener('click', function() {
    var url = this.getAttribute('data-url');
    chrome.tabs.create({ url: url });
  });
  
  updateButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
      var updatedUrl = tabs[0].url; 

      if (updatedUrl !== null && updatedUrl.trim() !== '') {
        savedURL.url = updatedUrl; 

        chrome.storage.sync.get({ savedURLs: [] }, function(data) {
          var savedURLs = data.savedURLs;

          var index = savedURLs.findIndex(function(item) {
            return item.name === savedURL.name;
          });

          if (index !== -1) {
            savedURLs[index] = savedURL;
            chrome.storage.sync.set({ savedURLs: savedURLs }, function() {
              RefreshUrlName(); 
            });
          }
        });
      }
    });
  });

  editButton.addEventListener('click', function() {
    var newName = prompt('New Name:', savedURL.name);
  
    if (newName !== null && newName.trim() !== '') {
      var updatedSavedURL = { ...savedURL, name: newName }; 
  
      chrome.storage.sync.get({ savedURLs: [] }, function(data) {
        var savedURLs = data.savedURLs.map(url => {
          if (url.name === savedURL.name && url.url === savedURL.url) {
            return updatedSavedURL;
          }
          return url;
        });
  
        chrome.storage.sync.set({ savedURLs: savedURLs }, function() {
          RefreshUrlName(); 
        });
      });
    }
  });
  

 
  deleteButton.addEventListener('click', function() {
    chrome.storage.sync.get({ savedURLs: [] }, function(data) {
      var savedURLs = data.savedURLs.filter(url => url.name !== savedURL.name);

      chrome.storage.sync.set({ savedURLs: savedURLs }, function() {
        RefreshUrlName(); 
      });
    });
  });
}
  

  function RefreshUrlName() {
    chrome.storage.sync.get({ savedURLs: [] }, function(data) {
      savedUrlName.innerHTML = '';

      var savedURLs = data.savedURLs;
      if (savedURLs.length > 0) {
        savedURLs.forEach(function(savedURL) {
          CreateSavedUrl(savedURL);
        });
      }
    });
  }

  saveButton.addEventListener('click', function() {
    var name = nameInput.value.trim();
    nameInput.value = '';

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
      var url = tabs[0].url;

      chrome.storage.sync.get({ savedURLs: [] }, function(data) {
        var savedURLs = data.savedURLs;

       
        var existingUrl = savedURLs.find(function(savedURL) { return savedURL.name === name; });

        if (existingUrl) existingUrl.url = url; 
        else savedURLs.push({ name: name, url: url });

        chrome.storage.sync.set({ savedURLs: savedURLs }, function() {
          RefreshUrlName(); 
        });
      });
    });
  });

  
  RefreshUrlName();
});
