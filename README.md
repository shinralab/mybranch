# ⌥ mybranch.fun

> One tree. Infinite branches. Every branch is a person.

A living git repository where branches are profiles and the git graph is the social graph.
No accounts. No database. No algorithms. Just git.

---

## You're looking at the root

This is **MF DOGE's** branch — `main`. It's protected. You can't commit here.
But you can fork the whole tree and add your own branch.

**Your branch = your profile.** Full HTML/CSS/JS freedom. Build anything.

---

## How to join

### 1. Fork this repo
Hit the Fork button on GitHub. This gives you your own copy.

### 2. Create your branch
```bash
git clone https://github.com/YOUR-USERNAME/mybranch
cd mybranch
git checkout -b your-username
```

### 3. Make index.html yours
Edit `index.html`. This is your entire profile — full HTML canvas.
Delete everything I wrote. Or keep it. The tree shows who forked from whom.

```bash
# Some ideas:
# - Dark background, glowing text, CSS animations
# - Three.js scene
# - A full band page with embedded audio
# - A portfolio with scroll animations
# - Literally anything HTML can do
```

### 4. Push and open a PR
```bash
git add index.html
git commit -m "my profile"
git push origin your-username
```

Then open a PR on GitHub. **Don't target `main`** — just submit the PR
with your branch as the head. We'll add your branch to the tree.

Once merged: you're live at `https://mybranch.fun/your-username`

---

## The rules (there's basically one)

**You cannot use MF DOGE's name.** Any variation — `MFDOGE`, `mf_doge`, `mf-doge` —
will be rejected. The tree shows who's root. There is no confusion.

Everything else is fair game. Your profile, your rules.

---

## Groups and clubs

Name your branch `group/your-group-name` or `club/your-club-name`:

```bash
git checkout -b group/cool-devs
# or
git checkout -b club/pixel-artists
```

Groups appear in a separate section on the leaderboard.
Anyone can branch off your group branch for sub-communities.
That's a real git branch-off-a-branch. It shows in the graph.

---

## Assets in your profile

**Easiest:** Use raw GitHub URLs for images, CSS, fonts:
```html
<img src="https://raw.githubusercontent.com/YOUR-USERNAME/mybranch/your-branch/assets/photo.jpg">
<link rel="stylesheet" href="https://raw.githubusercontent.com/YOUR-USERNAME/mybranch/your-branch/assets/style.css">
```

**Via proxy:** The site can serve your assets too:
```
/api/profile-asset?owner=REPO_OWNER&repo=mybranch&branch=your-username&path=assets/photo.jpg
```

**Note:** Your profile runs in a sandboxed iframe. `allow-same-origin` is OFF by design.
External CDNs (Google Fonts, Three.js CDN, etc.) work fine because those aren't same-origin restrictions.

---

## What git concepts mean here

| Git | mybranch.fun |
|-----|-------------|
| Branch | A person or group |
| Commit | A profile update |
| Fork | Joining the tree |
| PR | Applying to join |
| Merge | Acceptance into the tree |
| Branch off a branch | Sub-community |
| Graph | The social graph |
| Blame | Who influenced you |
| Tag | A moment in time |
| Rebase | Rewriting your history |
| Cherry-pick | Adopting one idea from someone |

---

## Local dev (for site contributors)

```bash
git clone https://github.com/MFDOGE/mybranch
cd mybranch
npm install
cp .env.local.example .env.local
# Fill in your GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN
npm run dev
# → http://localhost:3000
```

### Vercel deploy

1. Push to GitHub
2. Import to vercel.com
3. Set env vars:
   - `GITHUB_OWNER` — repo owner username
   - `GITHUB_REPO` — repo name (`mybranch`)
   - `ROOT_USERNAME` — your username (`MFDOGE`)
   - `GITHUB_TOKEN` — personal access token (recommended)
   - `NEXT_PUBLIC_SITE_URL` — `https://mybranch.fun`

---

## Domains

- `mybranch.fun` — the main site (leaderboard + profiles + graph)
- `gitdev.fun` — coming soon

---

*rooted at MF DOGE · no database · no auth · just git*
