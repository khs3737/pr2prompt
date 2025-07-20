# pr2prompt

💬 **pr2prompt** is a Chrome extension that lets you turn GitHub pull requests into customizable AI prompts for instant code review feedback.

⬇️ [Download on Chrome Web Store](https://chromewebstore.google.com/detail/pr2prompt/ngfjlogeneilajnklafnhklllalelkge) ⬇️

https://github.com/user-attachments/assets/8f4c54be-f503-43a9-9d3a-3d703571f94c

---

## 🚀 Features

✅ Extracts PR **title**, **description**, and **diff**  
✅ Lets you define your own prompt template using `{{title}}`, `{{description}}`, `{{diff}}` placeholders  
✅ Copies the generated prompt directly to your clipboard  
✅ Supports public and private repositories (uses your logged-in GitHub session)  
✅ Simple popup interface to customize and save your template

---

## 🔧 How It Works

1. Go to a GitHub pull request page.
2. Click the **floating button** (bottom right): `Copy PR Prompt`.
3. The extension:
   - Opens the GitHub API and diff in background tabs (no token needed).
   - Extracts the PR details.
   - Applies your custom template.
   - Copies the final prompt to your clipboard.

---

## ✨ Custom Template Example

In the extension popup, you can set templates like:

```
Please review the following PR:

Title: {{title}}

Description:
{{description}}

Changes:
{{diff}}
```
