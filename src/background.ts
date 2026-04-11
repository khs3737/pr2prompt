chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action !== "startCollection") return;
  if (sender?.tab?.id === undefined) return;

  const { owner, repo, prNumber } = request;
  const originalTabId = sender.tab.id;

  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}`;
    const apiRes = await fetch(apiUrl, { credentials: "include" });
    const apiData = await apiRes.json();

    const diffUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}.diff`;
    const diffRes = await fetch(diffUrl, { credentials: "include" });
    const diff = await diffRes.text();

    await chrome.tabs.sendMessage(originalTabId, {
      action: "finalData",
      title: apiData.title ?? "",
      description: apiData.body ?? "",
      diff,
    });
  } catch (err) {
    await chrome.tabs.sendMessage(originalTabId, {
      action: "finalData",
      title: "",
      description: "",
      diff: "",
    });
  }
});
