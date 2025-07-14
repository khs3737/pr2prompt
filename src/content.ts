function insertCopyButton(owner: string, repo: string, prNumber: string) {
  if (document.getElementById("pr2prompt-btn")) return;

  const button = document.createElement("button");
  button.id = "pr2prompt-btn";
  button.textContent = "Copy PR Prompt";

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
    button.style.backgroundColor = "#2c974b";
  });

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#2da44e";
  });

  button.addEventListener("click", async () => {
    await chrome.runtime.sendMessage({
      action: "startCollection",
      owner,
      repo,
      prNumber,
    });
  });

  document.body.appendChild(button);
}

chrome.runtime.onMessage.addListener(async (msg) => {
  const applyTemplate = (
    template: string,
    title: string,
    description: string,
    diff: string
  ): string => {
    return template
      .replace(/{{\s*title\s*}}/gi, title)
      .replace(/{{\s*description\s*}}/gi, description)
      .replace(/{{\s*diff\s*}}/gi, diff);
  };

  if (msg.action === "finalData") {
    const template = await chrome.storage.sync.get(["promptTemplate"]);
    const finalPrompt = applyTemplate(
      template.promptTemplate ??
        "Please review the following PR:\n\nTitle: {{title}}\n\nDescription:\n{{description}}\n\nChanges:\n{{diff}}",
      msg.title,
      msg.description,
      msg.diff
    );
    navigator.clipboard
      .writeText(finalPrompt)
      .then(() => {
        alert("✅ Prompt copied to clipboard!");
      })
      .catch((err) => {
        alert("❌ Failed to copy prompt: " + err);
      });
  }
});

function removeCopyButton() {
  const button = document.getElementById("pr2prompt-btn");
  if (button) {
    button.remove();
  }
}

window.onload = function () {
  const match = window.location.pathname.match(
    /\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  );

  if (match) {
    const [, owner, repo, prNumber] = match;
    insertCopyButton(owner, repo, prNumber);
  }

  let lastPath = window.location.pathname;

  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;

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
  });

  observer.observe(document.body, { childList: true, subtree: true });
};
