const jsonText = document.body.textContent ?? "";
try {
  const data = JSON.parse(jsonText);
  chrome.runtime.sendMessage({
    action: "apiCollected",
    title: data.title ?? "",
    body: data.body ?? "",
    owner: window.location.pathname.split("/")[2],
    repo: window.location.pathname.split("/")[3],
    prNumber: window.location.pathname.split("/")[5],
  });
} catch (err) {
  chrome.runtime.sendMessage({ action: "apiCollected", title: "", body: "" });
}
