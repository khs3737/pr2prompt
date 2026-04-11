chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action !== "startCollection") return;
  if (sender?.tab?.id === undefined) return;

  const { owner, repo, prNumber } = request;
  const originalTabId = sender.tab.id;

  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}`;
    const apiRes = await fetch(apiUrl, { credentials: "include" });

    if (!apiRes.ok) {
      const error =
        apiRes.status === 403
          ? "GitHub API rate limit exceeded."
          : apiRes.status === 404
            ? "PR not found."
            : `GitHub API error (${apiRes.status}).`;
      await chrome.tabs.sendMessage(originalTabId, {
        action: "finalData",
        error,
      });
      return;
    }

    const apiData = await apiRes.json();

    const diffUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}.diff`;
    const diffRes = await fetch(diffUrl, { credentials: "include" });

    if (!diffRes.ok) {
      await chrome.tabs.sendMessage(originalTabId, {
        action: "finalData",
        error: `Failed to fetch diff (${diffRes.status}).`,
      });
      return;
    }

    const diff = await diffRes.text();

    await chrome.tabs.sendMessage(originalTabId, {
      action: "finalData",
      title: apiData.title ?? "",
      description: apiData.body ?? "",
      diff,
    });
  } catch {
    await chrome.tabs.sendMessage(originalTabId, {
      action: "finalData",
      error: "Network error. Please check your connection.",
    });
  }
});
