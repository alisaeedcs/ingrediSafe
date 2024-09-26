chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Checktionary installed for the first time.');
        // Optionally, you can open a welcome page or show a notification to the user
        chrome.storage.sync.set({ allergens: [], settings: {} }, () => {
            console.log('Default settings saved.');
        });
    } else if (details.reason === 'update') {
        console.log('Checktionary updated to a new version.');
        // You could run migration tasks here if needed
    }
});

chrome.runtime.onStartup.addListener(() => {
    console.log('Checktionary background script started.');
    // You can perform periodic tasks or checks here if needed
});

// Example of handling a message from a content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSettings') {
        chrome.storage.sync.get(['allergens', 'settings'], (result) => {
            sendResponse(result);
        });
        return true;  // Indicate you will send a response asynchronously
    }
});
