const blurOverlay = document.createElement("div");
blurOverlay.style.position = "fixed";
blurOverlay.style.top = "0";
blurOverlay.style.left = "0";
blurOverlay.style.width = "100%";
blurOverlay.style.height = "100%";
blurOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
blurOverlay.color = "white";
blurOverlay.display = "flex";
blurOverlay.alignItems = "center";
blurOverlay.justifyContent = "center";
blurOverlay.zIndex = "9999";
blurOverlay.textContent = "Enough doomscrolling!";

document.body.appendChild(blurOverlay);

console.log("Content script loaded!");