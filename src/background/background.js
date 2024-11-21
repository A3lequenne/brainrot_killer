let settings = {
  running: false, // Not activated by default
  selectedTime: 0, // 15 minutes by default
  resetTimerTime: 0 // 10 minutes by default
};

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

let timerId;
let resetTimerId;

function startTimer(tabId) {
  console.log("Timer started!");
  timerId = setTimeout(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["../content/content.js"]
    });
  }, selectedTime * 60 * 1000);
}

function stopTimer() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
    console.log("Timer stopped and reset!");
  }
}

function startResetTimer() {
  if (resetTimerId) {
    clearTimeout(resetTimerId);
  }
  resetTimerId = setTimeout(() => {
    console.log("Reset Timer started!");
    stopTimer();
  }, 10 * 60 * 1000);
}

chrome.storage.sync.get(["running", "selectedTime", "resetTimerTime"], (result) => {
  if (result.running !== undefined) settings.running = result.running;
  if (result.selectedTime !== undefined) settings.selectedTime = result.selectedTime;
  if (result.resetTimerTime !== undefined) settings.resetTimerTime = result.resetTimerTime;
  
  if (settings.selectedTime === 0) settings.selectedTime = 0.2;
  if (settings.resetTimerTime === 0) settings.resetTimerTime = 1;

  if (settings.running) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && checkStartUrl(tab)) {
        startTimer(tabId);
        startResetTimer();
      }
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (checkStartUrl(tab)) {
          startTimer(tab.id);
          if (resetTimerId) {
            clearTimeout(resetTimeoutId);
            resetTimerId = null;
          }
        }
        else {
          stopTimer();
          startResetTimer();
        }
      });
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});