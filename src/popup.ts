const textarea = document.getElementById("template") as HTMLTextAreaElement;
const saveBtn = document.getElementById("save") as HTMLButtonElement;

textarea.placeholder =
  "Please review the following PR:\n\nTitle: {{title}}\n\nDescription:\n{{description}}\n\nChanges:\n{{diff}}";

chrome.storage.sync.get(["promptTemplate"], (data) => {
  textarea.value =
    data.promptTemplate ||
    "Please review the following PR:\n\nTitle: {{title}}\n\nDescription:\n{{description}}\n\nChanges:\n{{diff}}";
});

saveBtn.addEventListener("click", async () => {
  await chrome.storage.sync.set({ promptTemplate: textarea.value });
  saveBtn.textContent = "Saved!";
  saveBtn.style.backgroundColor = "#388e3c";
  setTimeout(() => window.close(), 800);
});
