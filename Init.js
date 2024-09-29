chrome.tabs.onActivated.addListener(tab=>{
    chrome.tabs.get(tab.tabId , current_tab_info =>{
            chrome.tabs.executeScript(null , {file:'./popup.html'});
    })
})