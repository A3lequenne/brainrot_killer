let running = true;

const btnTest = document.getElementById("btnTest");
const btnOnOff = document.getElementById("btnOnOff");
const timeSelect = document.getElementById("timeSelect");
const btnValidate = document.getElementById("btnValidate");

btnTest.addEventListener("click", () => {
  console.log("Test!");
});

btnOnOff.addEventListener("click", () => {
  if (running) {
    btnOnOff.innerText = "Start";
    btnOnOff.classList.remove("bg-green-500");
    btnOnOff.classList.add("bg-red-500");
  }
  else {
    btnOnOff.innerText = "Stop";
    btnOnOff.classList.remove("bg-red-500");
    btnOnOff.classList.add("bg-green-500");
  }
  running = !running;
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ running: running }, () => {
      if (running)
        console.log("Extension Activated!");
      else
        console.log("Extension Deactivated!");
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