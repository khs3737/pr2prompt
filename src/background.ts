chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action !== "startCollection") return;
  if (sender?.tab?.id === undefined) return;

  const { owner, repo, prNumber } = request;
  const originalTabId = sender.tab.id;

  try {
    const baseUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}`;

    const [pageRes, diffRes] = await Promise.all([
      fetch(baseUrl, { credentials: "include" }),
      fetch(`${baseUrl}.diff`, { credentials: "include" }),
    ]);

    if (!pageRes.ok) {
      await chrome.tabs.sendMessage(originalTabId, {
        action: "finalData",
        error: `Failed to fetch PR page (${pageRes.status}).`,
      });
      return;
    }

    if (!diffRes.ok) {
      await chrome.tabs.sendMessage(originalTabId, {
        action: "finalData",
        error: `Failed to fetch diff (${diffRes.status}).`,
      });
      return;
    }

    const [html, diff] = await Promise.all([
      pageRes.text(),
      diffRes.text(),
    ]);

    await chrome.tabs.sendMessage(originalTabId, {
      action: "finalData",
      html,
      diff,
    });
  } catch {
    await chrome.tabs.sendMessage(originalTabId, {
      action: "finalData",
      error: "Network error. Please check your connection.",
    });
  }
});
