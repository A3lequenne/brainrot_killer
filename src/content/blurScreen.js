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
  blurOverlay.style.alignItems = `center`;
  blurOverlay.style.justifyContent = `center`;
  blurOverlay.style.zIndex = `9999`;

  let message = document.createElement(`span`);
  message.textContent = `Enough doomscrolling!`;
  message.style.fontSize = `2rem`;
  message.style.textAlign = `center`;

  blurOverlay.appendChild(message);
  document.body.appendChild(blurOverlay);
}