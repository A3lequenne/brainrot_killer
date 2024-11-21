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
  if (lastUrlByTab[tab.id] === tab.url) {
    console.log(`URL already processed: ${tab.url}`);
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

// Timer Handler
let resetTimerId;
let intervalId;
let timeRemaining = settings.selectedTime * 60 * 1000;
let blocked = false;

function startTimer(tabId) {
  if (intervalId) {
    return ;
  }
  console.log(`Timer started!`);
  intervalId = setInterval(() => {
    timeRemaining -= 1000;
    if (timeRemaining <= 0 && !blocked) {
      clearInterval(intervalId);
      console.log(`Timer finished!`);
      blocked = true;
      startResetTimer();
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
  console.log(`Reset Timer started!`);
  resetTimerId = setTimeout(() => {
    pauseTimer();
    timeRemaining = settings.selectedTime * 60 * 1000;
    blocked = false;
  }, settings.resetTimerTime * 60 * 1000);
}

// Events handlers
function handleTabUpdate(tabId, changeInfo, tab) {
  chrome.storage.sync.get(`running`, (result) => {
    if (result.running && !blocked) {
      if (changeInfo.status === `complete` && checkStartUrl(tab)) {
        console.log(`Tab updated!: ${tab.url}`);
        startTimer(tabId);
        if (resetTimerId) {
          clearTimeout(resetTimerId);
          resetTimerId = null;
        }
      }
      else {
        if (intervalId) {
          pauseTimer()
          startResetTimer();
        }
      }
    }
  });
}

function handleTabActivated(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    chrome.storage.sync.get(`running`, (result) => {
      if (result.running && !blocked) {
        console.log(`Tab activated!: ${tab.url}`);
        if (checkStartUrl(tab)) {
          startTimer(tab.id);
          if (resetTimerId) {
            clearTimeout(resetTimerId);
            resetTimerId = null;
          }
        } 
        else {
          if (intervalId) {
            pauseTimer();
            startResetTimer();
          }
        } 
      }
    });
  });
}

function handleHistoryStateUpdate(details) {
  chrome.storage.sync.get('running', (result) => {
    if (result.running && !blocked) {
      chrome.tabs.get(details.tabId, (tab) => {
        if (checkStartUrl(tab)) {
          console.log(`SPA navigation detected and matched: ${tab.url}`);
          startTimer(tab.id);
          if (resetTimerId) {
            clearTimeout(resetTimerId);
            resetTimerId = null;
          }
        } 
        else {
          console.log(`SPA navigation detected but not in blocklist: ${tab.url}`);
          if (intervalId) {
            pauseTimer();
            startResetTimer();
          }
        }
      });
    }
  });
}

// Events listerners
chrome.tabs.onUpdated.addListener(handleTabUpdate);
chrome.tabs.onActivated.addListener(handleTabActivated);
chrome.webNavigation.onHistoryStateUpdated.addListener(handleHistoryStateUpdate);