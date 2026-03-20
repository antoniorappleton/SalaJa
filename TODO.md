# SalaJá PWA Fix & GitHub Push - TODO

## Approved PWA Plan (User: YES)

**Information Gathered:**
- Corruption: \"Asc\" strings in login.html/app.js/sw.js 
- SW: Syntax error, basic cache
- Manifest: Missing 512 icon/lang/scope
- Duplicates: * 1.html/* 2.* files
- Git: main/origin, partial cleanups staged
- logo.png: 14KB ✓ (will resize)

**Execution Plan:**
1. Clean duplicates
2. Fix corruption (remove Asc)
3. Improve manifest/icons
4. Fix SW + offline.html
5. Git commit/push
6. Lighthouse PWA test

## Progress Steps

✅ **Step 1: Updated TODO.md** - Plan tracking created

⏳ **Step 2: Clean duplicate files** (git clean/rm backups)

✅ **Step 3: Fixed login.html, sw.js, offline.html**

⏳ **Step 4: Fix app.js** (remove Asc in HTML strings)

⏳ **Step 5: Fix sw.js** (syntax + v2 cache/offline)

⏳ **Step 6: Update manifest.json** (icons/lang)

⏳ **Step 7: Create logo-512.png/offline.html**

⏳ **Step 8: Git add/commit/push** (\"Fix PWA installable\")

⏳ **Step 9: Verify** (Lighthouse 100%)

