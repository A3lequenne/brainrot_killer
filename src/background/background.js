// Initial setup
let blocked = false;
let toBeUnblocked = new Map(); // A enlever, mettre un tableau à la place si pas besoin de clé unique
let lastUrlByTab = {};
let settings = { // A changer, différents pour les tests
  running: false, // Not activated by default
  selectedTime: 0.1, // 15 minutes by default A changer
  resetTimerTime: 0.25 // 10 minutes by default A changer
};

chrome.storage.sync.get([`running`, `selectedTime`, `resetTimerTime`], (result) => {
  settings.running = result.running; 
  settings.selectedTime = result.selectedTime;
  settings.resetTimerTime = result.resetTimerTime;

  console.log(`settings.running: ${settings.running}`);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ running: false, selectedTime: 0.1, resetTimerTime: 2 }, () => { // Changer les valeurs d'initialisation
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

function applyBlurScreen(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./src/content/blurScreen.js"]
  });
  toBeUnblocked.set(tabId, true);
}

function removeBlurScreen(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./src/content/unblurScreen.js"]
  });
  toBeUnblocked.delete(tabId);
}

// Timer Handler
let resetTimerId;
let intervalId;
let timeRemaining = settings.selectedTime * 60 * 1000;
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
      toBeUnblocked.clear();
      applyBlurScreen(tabId);
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
  chrome.storage.sync.get('running', (result) => {
    if (!result.running || blocked) 
      return;

    if (checkStartUrl(tab)) {
      if (!alreadyRunning) {
        console.log(`[${eventType}] Starting timer for: ${tab.url}`);
        startTimer(tabId);
        if (resetTimerId) {
          clearTimeout(resetTimerId);
          resetTimerId = null;
        }
      } 
      else {
        console.log(`[${eventType}] Timer already running for: ${tab.url}`);
      }
    } 
    else {
      console.log(`[${eventType}] URL not in blocklist: ${tab.url}`);
      if (intervalId) {
        console.log(`[${eventType}] Pausing timer for: ${tab.url}`);
        pauseTimer();
        startResetTimer();
      }
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (!blocked) {
      if (toBeUnblocked.has(tabId))
        removeBlurScreen(tabId);
      else
        handleTabEvent(tabId, tab, 'onUpdated');
    }
    else if (checkStartUrl(tab))
      applyBlurScreen(tabId);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!blocked) {
      if (toBeUnblocked.has(activeInfo.tabId))
        removeBlurScreen(activeInfo.tabId);
      else
        handleTabEvent(activeInfo.tabId, tab, 'onActivated');
    }
    else if (checkStartUrl(tab))
      applyBlurScreen(activeInfo.tabId);
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  chrome.tabs.get(details.tabId, (tab) => {
    handleTabEvent(details.tabId, tab, 'onHistoryStateUpdated');
  });
});

// Middleware Event Utils
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === `closeTab` && sender.tab) {
    chrome.tabs.remove(sender.tab.id);
  }
});
