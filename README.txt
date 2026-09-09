FULL-STACK AI ENGINEER ROADMAP — FINAL

FILES
- index.html        application UI
- style.css         application styling
- script.js         editor, persistence, GitHub sync and version history
- roadmap.json      canonical roadmap data stored in GitHub
- roadmap-data.js   embedded original fallback (works even when opened locally)

SETUP FOR CROSS-DEVICE USE
1. Create a GitHub repository.
2. Upload all files in this folder to the repository root.
3. Enable GitHub Pages for the repository (Settings → Pages → deploy from the main branch/root).
4. Open the deployed GitHub Pages site.
5. Click GitHub and enter:
   Owner = your GitHub username/org
   Repository = the repository name
   Branch = main (or your branch)
   Token = a GitHub Personal Access Token with Contents: Read and write for this repository.
6. Click Connect + save.

HOW PERSISTENCE WORKS
- The roadmap is stored in roadmap.json in GitHub.
- Every edit/add/delete/reorder/status change/undo/redo/import/reset-equivalent change calls the GitHub Contents API and creates a Git commit.
- The deployed site reads roadmap.json on startup, so the roadmap itself is available from any device.
- The GitHub token is deliberately stored only in the browser that entered it. A token is not copied to other devices.
- On another device, open the same deployed site and enter the token there if you want to edit. Reading the public roadmap does not require a token.

IMPORTANT
- Do not commit your GitHub token into the repository.
- Do not put the token in this source code.
- The browser-only architecture cannot safely hide a write token from the person using the browser. For a private/professional deployment, use GitHub OAuth or a small authenticated backend instead.
- Opening index.html directly from disk uses the embedded fallback data. For cross-device persistence, use GitHub Pages (or another static host) and connect GitHub.
