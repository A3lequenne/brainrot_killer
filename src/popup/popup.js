const btnTest = document.getElementById("btnTest");
const btnOnOff = document.getElementById("btnOnOff");
const timeSelect = document.getElementById("timeSelect");
const btnValidate = document.getElementById("btnValidate");
const resetTimerTime = document.getElementById("resetTimerTime");
const btnResetTimer = document.getElementById("btnResetTimer");
const toggleLabel = document.querySelector("label[for='btnOnOff'] .font-medium");

chrome.storage.sync.get("running", (result) => {
  running = result.running || false;
  btnOnOff.checked = running;
  updateToggleText();
});

btnOnOff.addEventListener("change", () => {
  running = btnOnOff.checked;
  chrome.storage.sync.set({ running }, () => {
    updateToggleText();
    console.log("Running : ${running}");
  });
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

function updateToggleText() {
  toggleLabel.textContent = running ? "On" : "Off";
}

// btnTest.addEventListener("click", () => {
//     console.log("Test!");
//   });