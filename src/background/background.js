chrome.runtime.onInstalled.addListerner(displayInstallNotification());

function displayInstallNotification() {
  console.log("Extension installed!");
}