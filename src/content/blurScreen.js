if (!document.getElementById(`blurOverlay`)) {
  let blurOverlay = document.createElement(`div`);
  blurOverlay.id = `blurOverlay`;
  blurOverlay.style.position = `fixed`;
  blurOverlay.style.top = `0`;
  blurOverlay.style.left = `0`;
  blurOverlay.style.width = `100%`;
  blurOverlay.style.height = `100%`;
  blurOverlay.style.backgroundColor = `rgba(0, 0, 0, 0.8)`;
  blurOverlay.style.color = `white`;
  blurOverlay.style.display = `flex`;
  blurOverlay.style.direction = `column`;
  blurOverlay.style.alignItems = `center`;
  blurOverlay.style.justifyContent = `center`;
  blurOverlay.style.zIndex = `9999`;

  let message = document.createElement(`span`);
  message.textContent = `Enough doomscrolling!`;
  message.style.fontSize = `4rem`;
  message.style.textAlign = `center`;
  message.style.margin = `2rem 0`;
  message.style.fontWeight = `bold`;

  let closeBtn = document.createElement(`button`);
  closeBtn.type = `button`;
  closeBtn.id = `closeBtn`;
  closeBtn.textContent = `Close`;
  closeBtn.style.padding = `0.5rem 1rem`;
  closeBtn.style.fontSize = '1rem';
  closeBtn.style.color = 'black';
  closeBtn.style.backgroundColor = 'white';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '0.25rem';
  closeBtn.style.cursor = 'pointer';
  closeBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'closeTab' });
  });

  let timerDiv = document.createElement(`div`);
  timerDiv.style.display = `flex`;
  timerDiv.alignItems = `center`;
  timerDiv.justifyContent = `space-envenly`;
  timerDiv.width = `100%`;

  let timerDisplay = document.createElement(`span`);
  timerDisplay.id = `timerDisplay`;
  timerDisplay.style.fontSize = `4rem`;

  let refreshBtn = document.createElement(`button`);
  refreshBtn.type = `button`;
  refreshBtn.id = `refreshBtn`;
  refreshBtn.textContent = `Refresh`;
  refreshBtn.style.padding = `0.5rem 1rem`;
  refreshBtn.style.fontSize = '1rem';
  refreshBtn.style.color = 'black';
  refreshBtn.style.backgroundColor = 'white';
  refreshBtn.style.border = 'none';
  refreshBtn.style.borderRadius = '0.25rem';
  refreshBtn.style.cursor = 'pointer';
  refreshBtn.addEventListener('click', () => {
    location.reload();
  });

  blurOverlay.appendChild(message);

  timerDiv.appendChild(timerDisplay);
  timerDiv.appendChild(refreshBtn);
  blurOverlay.appendChild(timerDiv);

  blurOverlay.appendChild(closeBtn);
  document.body.appendChild(blurOverlay);
}