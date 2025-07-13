function insertCopyButton(owner: string, repo: string, prNumber: string) {
  if (document.getElementById("pr2prompt-btn")) return;

  const button = document.createElement("button");
  button.id = "pr2prompt-btn";
  button.textContent = "Copy AI Prompt";

  // 💥 fixed 스타일 적용
  Object.assign(button.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "9999",
    padding: "10px 16px",
    backgroundColor: "#2da44e", // GitHub green
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });

  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#2c974b"; // hover color
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

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "finalData") {
    const prompt = `Title:\n${msg.title}\n\nDescription:\n${msg.body}\n\nDiff:\n${msg.diff}`;
    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        alert("✅ Prompt copied to clipboard!");
      })
      .catch((err) => {
        alert("❌ Failed to copy prompt: " + err);
      });
  }
});

window.onload = function () {
  const match = window.location.pathname.match(
    /\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  );
  if (match) {
    const [, owner, repo, prNumber] = match;
    insertCopyButton(owner, repo, prNumber);
  }
};
