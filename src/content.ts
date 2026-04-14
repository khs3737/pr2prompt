function showToast(message: string, type: "success" | "error") {
  const existing = document.getElementById("pr2prompt-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "pr2prompt-toast";
  toast.textContent = message;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "70px",
    right: "20px",
    zIndex: "10000",
    padding: "10px 16px",
    backgroundColor: type === "success" ? "#2da44e" : "#d1242f",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "opacity 0.3s",
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function insertCopyButton(owner: string, repo: string, prNumber: string) {
  const prKey = `${owner}/${repo}/${prNumber}`;
  const existing = document.getElementById("pr2prompt-btn") as HTMLButtonElement | null;

  if (existing && existing.dataset.pr === prKey) return;
  if (existing) existing.remove();

  const button = document.createElement("button");
  button.id = "pr2prompt-btn";
  button.textContent = "Copy PR Prompt";
  button.dataset.pr = prKey;

  Object.assign(button.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "9999",
    padding: "10px 16px",
    backgroundColor: "#2da44e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });

  button.addEventListener("mouseenter", () => {
    if (!button.disabled) button.style.backgroundColor = "#2c974b";
  });

  button.addEventListener("mouseleave", () => {
    if (!button.disabled) button.style.backgroundColor = "#2da44e";
  });

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Loading...";
    button.style.backgroundColor = "#6e7781";
    button.style.cursor = "wait";

    await chrome.runtime.sendMessage({
      action: "startCollection",
      owner,
      repo,
      prNumber,
    });
  });

  document.body.appendChild(button);
}

function resetButton() {
  const button = document.getElementById("pr2prompt-btn") as HTMLButtonElement | null;
  if (!button) return;
  button.disabled = false;
  button.textContent = "Copy PR Prompt";
  button.style.backgroundColor = "#2da44e";
  button.style.cursor = "pointer";
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== "finalData") return;

  resetButton();

  if (msg.error) {
    showToast(msg.error, "error");
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(msg.html, "text/html");
  const title =
    doc.querySelector(".markdown-title")?.textContent?.trim() ?? "";
  const description =
    (doc.querySelector(".comment-body") as HTMLElement)?.textContent?.trim() ?? "";

  const applyTemplate = (
    template: string,
    t: string,
    d: string,
    diff: string
  ): string => {
    return template
      .replace(/{{\s*title\s*}}/gi, t)
      .replace(/{{\s*description\s*}}/gi, d)
      .replace(/{{\s*diff\s*}}/gi, diff);
  };

  const template = await chrome.storage.sync.get(["promptTemplate"]);
  const finalPrompt = applyTemplate(
    template.promptTemplate ||
      "Please review the following PR:\n\nTitle: {{title}}\n\nDescription:\n{{description}}\n\nChanges:\n{{diff}}",
    title,
    description,
    msg.diff
  );

  navigator.clipboard
    .writeText(finalPrompt)
    .then(() => showToast("Prompt copied to clipboard!", "success"))
    .catch((err) => showToast("Failed to copy: " + err, "error"));
});

function removeCopyButton() {
  const button = document.getElementById("pr2prompt-btn");
  if (button) button.remove();
}

function checkAndToggleButton() {
  const match = window.location.pathname.match(
    /\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  );

  if (match) {
    const [, owner, repo, prNumber] = match;
    insertCopyButton(owner, repo, prNumber);
  } else {
    removeCopyButton();
  }
}

checkAndToggleButton();

let lastHref = location.href;
setInterval(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    checkAndToggleButton();
  }
}, 500);
