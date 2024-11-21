// Initial setup
let lastUrlByTab = {};
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
      lastUrlByTab[tab.id] = tab.url;
      console.log(`URL found in the tab!`);
      return true;
    }
  }
  console.log(`URL not found in the tab!`);
  return false;
}

function checkLastUrl(tab) {
  if (lastUrlByTab[tab.id]) {
    if (tab.url === lastUrlByTab[tab.id]) {
      console.log(`URL matched with last URL in the tab!`);
      return true;
    }
  }
  console.log(`URL not matched with last URL in the tab!`);
  return false;
}

// Timer Handler
let resetTimerId;
let intervalId;
let timeRemaining = settings.selectedTime * 60 * 1000;
let blocked = false;
let alreadyRunning = false;

function startTimer(tabId) {
  if (alreadyRunning) {
    console.log(`Already cooking!`);
    return ;
  }
  console.log(`Timer started with ${timeRemaining / 1000} seconds remaining!`);
  alreadyRunning = true;
  intervalId = setInterval(() => {
    timeRemaining -= 1000;
    if (timeRemaining <= 0 && !blocked) {
      clearInterval(intervalId);
      console.log(`Timer finished!`);
      blocked = true;
      startResetTimer();
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["./src/content/blurScreen.js"]
      });
    }
  }, 1000);
}

function pauseTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    alreadyRunning = false;
    console.log(`Timer paused/stopped with ${timeRemaining / 1000} seconds remaining!`);
  }
}

function startResetTimer() {
  if (resetTimerId) {
    clearTimeout(resetTimerId);
  }
  console.log(`Reset Timer started!`);
  resetTimerId = setTimeout(() => {
    timeRemaining = settings.selectedTime * 60 * 1000;
    pauseTimer();
    alreadyRunning = false;
    blocked = false;
  }, settings.resetTimerTime * 60 * 1000);
}

// Events handlers
function handleTabEvent(tabId, tab, eventType) {
  chrome.storage.sync.get(`running`, (result) => {
    if (!result.running || blocked) return;

    if (checkStartUrl(tab)) {
      if (!checkLastUrl(tab)) {
        console.log(`[${eventType}] Detected and matched: ${tab.url}`);
        startTimer(tabId);
        if (resetTimerId) {
          clearTimeout(resetTimerId);
          resetTimerId = null;
        }
      }
    } else {
      console.log(`[${eventType}] URL not in blocklist or already processed: ${tab.url}`);
      if (intervalId) {
        pauseTimer();
        startResetTimer();
      }
    }
  });
}

// Adapter les événements pour utiliser handleTabEvent
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    handleTabEvent(tabId, tab, 'onUpdated');
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    handleTabEvent(activeInfo.tabId, tab, 'onActivated');
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  chrome.tabs.get(details.tabId, (tab) => {
    handleTabEvent(details.tabId, tab, 'onHistoryStateUpdated');
  });
});
