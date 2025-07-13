const diffText = document.body.textContent || "";

chrome.runtime.sendMessage({
  action: "diffCollected",
  diff: diffText,
});
