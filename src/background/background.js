function displayInstallNotification() {
  console.log("Extension installed!");
}

chrome.runtime.onInstalled.addListener(displayInstallNotification);