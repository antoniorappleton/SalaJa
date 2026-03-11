# SalaJa - Tasks to Complete

## Issues Found:
1. `index 6.html` should be renamed to `index.html`
2. Missing files: `reserva.html`, `minhas-reservas.html`, `perfil.html`, `login.html`
3. File corruption: `dashboard.htmlX` and `style.cssX` have extra extension
4. `logo.svg` is empty (0 bytes) - all HTML files reference `logo.png`
5. Service worker (`sw.js`) references `./index.html` 
6. Manifest has `start_url: "./index.html"`

## Tasks:

### Phase 1: Fix File Naming Issues
- [x] 1.1 Rename `index 6.html` to `index.html`
- [x] 1.2 Remove `X` extension from `dashboard.htmlX` → `dashboard.html`
- [x] 1.3 Remove `X` extension from `style.cssX` → `style.css`

### Phase 2: Create Missing HTML Pages
- [x] 2.1 Create `reserva.html` (Create Reservation page)
- [x] 2.2 Create `minhas-reservas.html` (My Reservations page)
- [x] 2.3 Create `perfil.html` (Profile page)
- [x] 2.4 Create `login.html` (Login page)

### Phase 3: Fix Logo Issues
- [x] 3.1 Create proper `logo.svg` file (building icon)
- [x] 3.2 Update HTML files to use correct logo path (logo.svg)

### Phase 4: PWA Improvements
- [x] 4.1 Update manifest.json with proper icons
- [x] 4.2 Update sw.js to include all pages (reserva.html, minhas-reservas.html, perfil.html, login.html)
- [ ] 4.3 Test PWA functionality

### Phase 5: GitHub Push
- [ ] 5.1 Initialize git repository
- [ ] 5.2 Create initial commit
- [ ] 5.3 Add remote and push to https://github.com/antoniorappleton/SalaJa.git

## Status: COMPLETED

