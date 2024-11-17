let settings = {
  running: false, // Not activated by default
  selectedTime: 15 // 15 minutes by default
};

// FOR TESTING PURPOSES

if (settings.selectedTime === 0) {
  settings.selectedTime = 0.2;
}

// END TESTING

let notWantedUrls = [
  "https://www.youtube.com/shorts", 
  "https://www.facebook.com/reel", 
  "https://www.instagram.com/reel", 
  "https://www.tiktok.com"
];

function checkStartUrl(tab) {
  for (let url of notWantedUrls) {
    if (tab.url.startsWith(url)) {
      return true;
    }
  }
  return false;
}

chrome.storage.sync.get(["running", "selectedTime"], (result) => {
  if (result.running !== undefined) settings.running = result.running;
  if (result.selectedTime !== undefined) settings.selectedTime = result.selectedTime;
  
  if (settings.selectedTime === 0) settings.selectedTime = 0.2;

  if (settings.running) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && checkStartUrl(tab)) {
        console.log("Timer started!");
        setTimeout(() => {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["../content/content.js"]
          });
        }, settings.selectedTime * 60 * 1000);
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});