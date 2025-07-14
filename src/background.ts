let originalTabId: number | null = null;
let collected = { title: "", description: "", diff: "" };

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (sender?.tab?.id === undefined) {
    return;
  }

  if (request.action === "startCollection") {
    originalTabId = sender.tab.id;

    const apiUrl = `https://api.github.com/repos/${request.owner}/${request.repo}/issues/${request.prNumber}`;
    const apiTab = await chrome.tabs.create({ url: apiUrl, active: false });

    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
      if (tabId === apiTab.id && info.status === "complete") {
        await chrome.scripting.executeScript({
          target: { tabId: apiTab.id },
          files: ["apiTabContent.js"],
        });
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  }

  if (request.action === "apiCollected") {
    collected.title = request.title;
    collected.description = request.description;
    await chrome.tabs.remove(sender.tab.id);

    const diffUrl = `https://github.com/${request.owner}/${request.repo}/pull/${request.prNumber}.diff`;
    const diffTab = await chrome.tabs.create({ url: diffUrl, active: false });

    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
      if (tabId === diffTab.id && info.status === "complete") {
        await chrome.scripting.executeScript({
          target: { tabId: diffTab.id },
          files: ["diffTabContent.js"],
        });
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  }

  if (request.action === "diffCollected") {
    collected.diff = request.diff;

    if (originalTabId !== null) {
      await chrome.tabs.sendMessage(originalTabId, {
        action: "finalData",
        title: collected.title,
        description: collected.description,
        diff: collected.diff,
      });
      originalTabId = null;
    }
    await chrome.tabs.remove(sender.tab.id);
  }
});
