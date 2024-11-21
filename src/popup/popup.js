let running = true;

const btnTest = document.getElementById("btnTest");

const btnOnOff = document.getElementById("btnOnOff");

const timeSelect = document.getElementById("timeSelect");
const btnValidate = document.getElementById("btnValidate");

const resetTimerTime = document.getElementById("resetTimerTime");
const btnResetTimer = document.getElementById("btnResetTimer");



function updateButton() {
  if (running) {
    btnOnOff.innerText = "Running";
    btnOnOff.classList.remove("bg-red-500");
    btnOnOff.classList.add("bg-green-500");
  }
  else {
    btnOnOff.innerText = "Not Running";
    btnOnOff.classList.remove("bg-green-500");
    btnOnOff.classList.add("bg-red-500");
  }
}

chrome.storage.sync.get("running", (result) => {
  if (result.running !== undefined) running = result.running;
  updateButton();
});

btnTest.addEventListener("click", () => {
  console.log("Test!");
});

btnOnOff.addEventListener("click", () => {
  running = !running;
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ running: running }, () => {
      console.log("Running : ${running}");
      updateButton();
    });
  }
});

btnValidate.addEventListener("click", () => {
  const selectedTime = timeSelect.value;
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ selectedTime: selectedTime }, () => {
      console.log("Selected time : ${selectedTime} minutes");
    });
  }
});

btnResetTimer.addEventListener("click", () => {
  const resetTimerSelected = resetTimerTime.value;
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ resetTimerTime: resetTimerSelected }, () => {
      console.log("Reset timer time : ${resetTimerSelected} minutes");
    });
  }
});