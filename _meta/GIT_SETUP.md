# Git & GitHub setup — Aureum AI Portfolio

I cannot run authenticated `git push` for you (your credentials, your account). Follow these steps **once** and you are live.

## 1. Create the GitHub account / organization

1. Go to <https://github.com/signup> if you don't have an account yet. Suggested username: `alex-ureche` or `aureum-ai`.
2. Once logged in, create an **organization** named `Aureum` (free plan is fine): <https://github.com/organizations/plan>. This becomes your professional brand.

## 2. Create the portfolio repo

On <https://github.com/new>:
- Owner: `Aureum`
- Name: `aureum-ai-portfolio`
- Public ✅
- **Do NOT** initialize with README (we already have one)

## 3. Initialize locally and push

Open Terminal and paste this one block (copy ALL lines, paste once, hit enter):

```bash
cd ~/Documents/Aureum-AI-Portfolio

# 0. Clean any stale .git folders left over from setup
rm -rf .git
find . -mindepth 2 -name ".git" -type d -exec rm -rf {} + 2>/dev/null

# 1. One-time identity (skip if already set globally)
git config --global user.name  "Ureche Ionel Alexandru"
git config --global user.email "urecheionelalexandru@gmail.com"

# 2. Init, stage, commit
git init -b main
git add .
git commit -m "Initial commit — Aureum AI Portfolio (10 projects, CV, 3-month roadmap)"

# 3. Connect to GitHub and push
git remote add origin https://github.com/Aureum/aureum-ai-portfolio.git
git push -u origin main
```

GitHub will ask you to authenticate. Use a **Personal Access Token** (not your password):
- <https://github.com/settings/tokens> → Generate new token (classic) → check `repo` → copy → paste when git asks for password.

## 4. (Optional) Per-project repos

For maximum recruiter signal, also publish the 2-3 strongest projects as **standalone** repos so each shows up in your GitHub profile pinned list:

```bash
# example — agent-pipeline
cd ~/Documents/Aureum-AI-Portfolio/01_LLM_Agents/agent-pipeline
git init && git add . && git commit -m "Initial commit"
gh repo create Aureum/agent-pipeline --public --source=. --push
```

Recommended pinned repos (in this order):
1. `agent-pipeline` — multi-agent Claude system
2. `wine-quality-mlflow-e2e` — full MLOps pipeline
3. `aureum-crm` — full-stack AI product
4. `multimodal-agent-agrobot` — multimodality

## 5. Add the GitHub link to your CV

Once pushed, replace `_to be created_` in `_cv/CV.md` with `https://github.com/Aureum`. Re-export the `.docx`.

## 6. Sanity check before applying to Google

- [ ] Repo is public and the README renders correctly on github.com
- [ ] No secrets in the history (`.env`, API keys). If found: `git filter-repo` to strip them.
- [ ] At least 1 green build badge on the MLOps project (GH Actions)
- [ ] Pinned repos on your profile match the CV
