// Initial setup
let settings = {
  running: false, // Not activated by default
  selectedTime: 0.25, // 15 minutes by default A changer
  resetTimerTime: 0.5 // 10 minutes by default A changer
};

chrome.storage.sync.get([`running`, `selectedTime`, `resetTimerTime`], (result) => {
  settings.running = result.running; 
  settings.selectedTime = result.selectedTime;
  settings.resetTimerTime = result.resetTimerTime;

  console.log(`settings.running: ${settings.running}`);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ running: false, selectedTime: 0.25, resetTimerTime: 0.5 }, () => { // Changer les valeurs d'initialisation
    console.log("Running state reset to false on installation.");
  });
});

// Utils
let notWantedUrls = [
  "https://www.youtube.com/shorts", 
  "https://www.facebook.com/reel", 
  "https://www.instagram.com/reel", 
  "https://www.tiktok.com"
];

function checkStartUrl(tab) {
  if (!tab.url) {
    console.log(`No URL found!`);
    return false;
  }
  for (let url of notWantedUrls) {
    if (tab.url.startsWith(url)) {
      return true;
    }
  }
  console.log(`URL not found in the tab!`);
  return false;
}

// Timer Handler
let resetTimerId;
let intervalId;
let timeRemaining = settings.selectedTime * 60 * 1000;
let blocked = false;

function startTimer(tabId) {
  console.log(`Timer started!`);
  intervalId = setInterval(() => {
    timeRemaining -= 1000;
    if (timeRemaining <= 0) {
      clearInterval(intervalId);
      console.log(`Timer finished!`);
      blocked = true;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["./src/content/content.js"]
      });
    }
  }, 1000);
}

function pauseTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log(`Timer paused/stopped with ${timeRemaining / 1000} seconds remaining!`);
  }
}

function startResetTimer() {
  if (resetTimerId) {
    clearTimeout(resetTimerId);
  }
  resetTimerId = setTimeout(() => {
    console.log(`Reset Timer started!`);
    pauseTimer();
    timeRemaining = settings.selectedTime * 60 * 1000;
    blocked = false;
  }, settings.resetTimerTime * 60 * 1000);
}

// Events handlers
function handleTabUpdate(tabId, changeInfo, tab) {
  chrome.storage.sync.get(`running`, (result) => {
    if (result.running) {
      if (changeInfo.status === `complete` && checkStartUrl(tab)) {
        startTimer(tabId);
        if (resetTimerId) {
          clearTimeout(resetTimerId);
          resetTimerId = null;
        }
      }
      else {
        pauseTimer();
        startResetTimer();
      }
    }
  });
}

function handleTabActivated(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    chrome.storage.sync.get(`running`, (result) => {
      if (result.running) {
        console.log(`Tab activated!: ${tab.url}`);
        if (checkStartUrl(tab)) {
          startTimer(tab.id);
          if (resetTimerId) {
            clearTimeout(resetTimerId);
            resetTimerId = null;
          }
        } 
        else {
          pauseTimer();
          startResetTimer();
        }
      }
    });
  });
}

// Events listerners
chrome.tabs.onUpdated.addListener(handleTabUpdate);
chrome.tabs.onActivated.addListener(handleTabActivated);