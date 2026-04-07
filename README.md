# InaSilja.me – Deine funkelnde Sternchen-Website! ✨

Hey, ich bin Ina Silja Bietsch (@Cilexiella auf X) – Cross-Media-Designerin, Gamerin, Künstlerin, Autorin & Model aus Köln.  
Das hier ist das GitHub-Repo für meine persönliche Website [www.inasilja.me](https://www.inasilja.me). Eine Single-Page-App mit Scroll-Snapping, Starfield-Animation und Glitzer-Magie!  
Gebaut mit purem HTML/CSS/JS – modular, dynamisch und wartbar.

## Projekt-Überblick
Eine verspielte, magische Portfolio-Site mit Sections zu meinem Leben, Talenten, Body & mehr. Alles lädt dynamisch aus `config.json` und Partials – super einfach zu updaten!

- **Key Features**:
  - Dynamische Config: Ändere Titel, Meta, Links, Bio ohne Code zu touchen
  - Starfield-Background mit Sternschnuppen
  - Scroll-Snap-Navigation mit Dots
  - Responsiv für Mobile/Tablet/Desktop
  - SEO-optimiert (Meta, OG, Twitter-Cards, Schema.org)
  - Glitzer-Animationen (Glow, Pulse, Rainbow)

## Projektstruktur
Hier ist die vollständige Projektstruktur (basierend auf den aktuellen Dateien und Verzeichnissen). Ich habe alle bekannten Partial-Dateien, Assets und weitere Elemente aufgelistet, um Vollständigkeit zu gewährleisten. Die Struktur ist modular aufgebaut, mit Fokus auf einfache Wartung.

```
inasilja.me/
├── index.html                        // Haupt-Einstieg: Skelett mit Sections & Canvas
├── config.json                       // Zentrale Config: Meta, Links, Socials, Schema.org
├── impressum.html                    // Separate Impressum-Seite (direkt unter /impressum erreichbar)
├── README.md                         // Diese Doku! 😊
├── assets/                           // Animations, Fonts, Icons, Images
│   └── animations/                   // Neu! Für animierte HTML/CSS-Dinger
│       └── eye_animation.html        // Deine coole Auge-Animation
│   └── fonts/                        // Fonts
│       // comic-neue-v9-latin-*.woff2 (Fonts von https://gwfh.mranftl.com/fonts/comic-neue?subsets=latin)
│       ├── comic-neue-v9-latin-300.woff2
│       ├── comic-neue-v9-latin-300italic.woff2
│       ├── comic-neue-v9-latin-regular.woff2
│       ├── comic-neue-v9-latin-italic.woff2
│       ├── comic-neue-v9-latin-700.woff2
│       └── comic-neue-v9-latin-700italic.woff2
│   ├── icons/                        // onlyfans_logo.svg, x_logo.svg usw.
│   │   ├── onlyfans_logo.svg         // Beispiel-Icon für OnlyFans-Link
│   │   └── x_logo.svg                // Beispiel-Icon für X (Twitter)-Link
│   └── images/                       // profile_inasilja.webp, favicon_inasilja.png usw.
│       ├── profile_inasilja.webp     // Haupt-Profilbild (Fallback)
│       └── favicon_inasilja.png      // Favicon (Fallback)
├── css/                              // Stylesheets
│   ├── reset.css                     // Browser-Reset
│   ├── fonts.css                     // @font-face für Comic Neue
│   └── styles.css                    // Haupt-Styles: Variablen, Keyframes, Layouts
├── js/                               // JavaScripts
│   ├── config-loader.js              // Lädt config.json & baut dynamisch (Meta, Home, Links, Partials)
│   └── scripts.js                    // Starfield-Animation & Nav-Dots-Logik
└── partials/                         // HTML-Inhalte für Sections (dynamisch geladen)
    ├── home.html                     // Willkommen & Swipe-Hint-Animation
    ├── me.html                       // Mehr über mich (mit interaktiver Img & Text-Layer)
    ├── bio.html                      // Verzauberte Bio
    ├── steckbrief.html               // Steckbrief-Liste & Bilder
    ├── talente.html                  // Talente-Items & Bilder
    ├── namen.html                    // Namen, Bedeutungen & Herkunft
    ├── mein-body.html                // Mein Body – Sections mit Beschreibungen & Bildern
    ├── nacktheit-sexualitaet.html    // Aufklärung über Nacktheit & Sexualität
    ├── support.html                  // Support-Me-Section
    └── footer.html                   // Footer mit Social-Links + Copyright
```

**Hinweis zur Struktur:**  
- Alle Partial-Dateien in `/partials/` werden dynamisch via `config-loader.js` in die entsprechenden `<section>`-Elemente in `index.html` geladen.  
- Assets sind kategorisiert: Fonts stammen von [https://gwfh.mranftl.com/fonts/comic-neue?subsets=latin](https://gwfh.mranftl.com/fonts/comic-neue?subsets=latin) (Google Webfonts Helper, für optimierte .woff2-Dateien).  
- Bilder in `/assets/images/` sind als Fallbacks gedacht; viele Inhalte laden dynamisch von Cloudinary (konfiguriert in `config.json`).  
- Es gibt eine separate `ina_silja_page.html`-Datei (nicht im Haupt-Repo-Struktur, könnte ein Export oder Test-Seite sein – falls relevant, integriere sie in die Struktur).

## Setup & Start
1. **Repo klonen**: `git clone https://github.com/dein-repo/inasilja.me.git`
2. **Abhängigkeiten**: Keine! Alles vanilla – kein NPM/Yarn nötig.
3. **Lokal öffnen**: Öffne `index.html` einfach im Browser (kein Server nötig, aber für Fetch empfehle ich ein Tool wie Live Server in VS Code)
4. **Testen**: 
   - Starfield + Glows laden?
   - Sections per Scroll/Dots navigieren?
   - Links/Socials klicken & dynamisch erscheinen?
   - Responsiv auf Handy prüfen (F12 > Mobile-View)
5. **Debug**: Öffne DevTools (F12) > Console: Schau nach Logs wie "Config geladen" und "Seite dynamisch aufgebaut"

## Updates & Anpassungen
- **Inhalte ändern**: Bearbeite einfach die `.html`-Files in `partials/` – z. B. Texte, Emojis, Struktur
- **Links/Bio/Meta updaten**: Alles in `config.json` – speichern, neu laden, fertig!
  - Neuen Social hinzufügen? Ergänze in `primarySocials` oder `linkButtons`
  - SEO ändern? Passe `meta`, `openGraph`, `twitter`, `schema` an
- **Styles anpassen**: In `css/styles.css` – Farben in `:root`, neue Animationen/Keyframes hinzufügen
- **Neue Section?**
  1. Erstelle neue `.html`-File in `partials/`
  2. Füge in `config.json > sections`: `{ "id": "neu-id", "partial": "neu.html" }`
  3. Ergänze in `index.html`: `<section id="neu-id"></section>`
  4. Ergänze in Navigation: `<div class="nav-dot" data-section="neu-id"></div>`
- **Font ändern?**: Lade neue .woff2 in `assets/fonts/`, update `css/fonts.css`. Die aktuellen Fonts (Comic Neue) stammen von [https://gwfh.mranftl.com/fonts/comic-neue?subsets=latin](https://gwfh.mranftl.com/fonts/comic-neue?subsets=latin) – lade dort neue Subsets oder Alternativen herunter.

## Deployment
- **GitHub Pages** (kostenlos & einfach – empfohlen!):
  1. Push dein Repo zu GitHub
  2. In Repo-Settings > Pages: Source = main/root
  3. Warte 1-2 Min – URL: https://dein-github-name.github.io/inasilja.me
  4. Custom Domain: Füge in Settings > Pages > Custom domain: www.inasilja.me (und DNS bei deinem Hoster anpassen)
- **Netlify** (für HTTPS & schnelles Hosting):
  1. Connect dein GitHub-Repo zu Netlify
  2. Build-Command: leer lassen (kein Build nötig)
  3. Publish-Directory: /
  4. Custom Domain hinzufügen
- **Probleme?**: Check Console auf 404-Errors (z. B. falsche Pfade) – passe relative/fallback-URLs in config.json an

## To-Do / Erweiterungen
- Analytics hinzufügen (z. B. Google Analytics-Script in index.html)
- Minifizieren (CSS/JS) für schnellere Ladezeiten (Tool: cssnano oder online)
- Dark-Mode? Füge eine :root.dark umschaltbar via JS
- Feedback? Schreib mir auf X @inasilja!

Viel Spaß mit deinem neuen funkelnden Universum! Wenn du Fragen hast, ich bin da. HexHex! 🪄💕