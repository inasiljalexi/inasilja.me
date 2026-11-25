// js/config-loader.js
// Lädt config.json und baut die Seite dynamisch auf

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // ────────────────────────────────────────────────
        // 1. Config laden – zuerst relativ versuchen, dann Fallback
        // ────────────────────────────────────────────────
        let config;
        const response = await fetch('/config.json');
        if (!response.ok) throw new Error('Relative config.json nicht gefunden');
        config = await response.json();

        console.log('Config geladen:', config);

        // ────────────────────────────────────────────────
        // 2. Titel & Meta-Tags setzen
        // ────────────────────────────────────────────────
        document.title = config.title || '☆ Ina Silja ☆';

        // Hilfsfunktion: Meta-Tag erstellen oder updaten
        function setMeta(nameOrProperty, content, isProperty = false) {
            let selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
            let tag = document.querySelector(selector);
            if (!tag) {
                tag = document.createElement('meta');
                if (isProperty) tag.setAttribute('property', nameOrProperty);
                else tag.setAttribute('name', nameOrProperty);
                document.head.appendChild(tag);
            }
            tag.content = content;
        }

        // Standard-Meta
        if (config.meta) {
            setMeta('description', config.meta.description);
            setMeta('keywords', config.meta.keywords);
            setMeta('author', config.meta.author);
            setMeta('robots', config.meta.robots);
        }

        // Open Graph
        if (config.openGraph) {
            setMeta('og:title', config.openGraph.title, true);
            setMeta('og:description', config.openGraph.description, true);
            setMeta('og:image', config.openGraph.image, true);
            setMeta('og:url', config.openGraph.url, true);
            setMeta('og:type', config.openGraph.type, true);
        }

        // Twitter / X Cards
        if (config.twitter) {
            setMeta('twitter:card', config.twitter.card);
            setMeta('twitter:site', config.twitter.site);
            setMeta('twitter:title', config.twitter.title);
            setMeta('twitter:description', config.twitter.description);
            setMeta('twitter:image', config.twitter.image);
        }

        // ────────────────────────────────────────────────
        // 3. Favicon dynamisch setzen
        // ────────────────────────────────────────────────
        if (config.favicon) {
            const faviconLink = document.querySelector('link[rel="icon"]') || document.createElement('link');
            faviconLink.rel = 'icon';
            faviconLink.type = config.favicon.type || 'image/png';
            faviconLink.href = config.favicon.relative || config.favicon.fallback;
            if (!document.querySelector('link[rel="icon"]')) document.head.appendChild(faviconLink);
        }

        // ────────────────────────────────────────────────
        // 4. Font-CSS sicherstellen (falls nicht schon in HTML)
        // ────────────────────────────────────────────────
        if (config.font && config.font.cssPath) {
            if (!document.querySelector(`link[href="${config.font.cssPath}"]`)) {
                const fontLink = document.createElement('link');
                fontLink.rel = 'stylesheet';
                fontLink.href = config.font.cssPath;
                document.head.appendChild(fontLink);
            }
        }

        // ────────────────────────────────────────────────
        // 5. Home-Section aufbauen (Profilbild, Name, Bio, Primary Socials)
        // ────────────────────────────────────────────────
        const homeSection = document.getElementById('home');
        if (homeSection && config.profileImage && config.name && config.bio) {
            let homeHTML = `
                <img src="${config.profileImage.relative || config.profileImage.fallback}" 
                    alt="${config.profileImage.alt || 'Ina Silja'}" 
                    class="profile-img">

                <!-- Zierschrift bleibt sichtbar; Screenreader & Suchmaschinen lesen den Klartext (nameText) -->
                <h1><span class="name-fancy" aria-hidden="true">${config.name}</span><span class="visually-hidden">${config.nameText || 'Ina Silja'}</span></h1>

                <p class="bio-highlight">${config.bio.split('\n')[0]}</p>
            `;

            // Primary Socials mit async Image-Check (priorisiert local, fallback wenn 404)
            if (config.primarySocials && config.primarySocials.length > 0) {
                homeHTML += '<div class="primary-socials">';
                for (const social of config.primarySocials) {  // async for...of für Check
                    let iconSrc = social.icon.relative;
                    const isLocalAvailable = await checkImage(iconSrc);
                    if (!isLocalAvailable) {
                        iconSrc = social.icon.fallback;
                        console.warn(`Local Icon ${social.icon.relative} fehlt → Fallback: ${iconSrc}`);
                    }
                    homeHTML += `
                        <a href="${social.url}" target="_blank" rel="noopener noreferrer">
                            <img src="${iconSrc}" alt="${social.alt}" class="${social.class || ''}">
                            ${social.badge ? `<span class="new-badge">${social.badge}</span>` : ''}
                        </a>
                    `;
                }
                homeHTML += '</div>';
            }
            
            // Rechtliche Links auf der Startseite (Impressum & Datenschutz)
            homeHTML += `
                <p class="legal-links" style="position: relative; z-index: 10;">
                    <a href="/impressum">§ Impressum</a> • <a href="/datenschutz">Datenschutz</a>
                </p>
            `;

            // Zusätzlicher Willkommenstext
            if (config.bio.split('\n')[1]) {
                homeHTML += `<p>${config.bio.split('\n').slice(1).join('<br>')}</p>`;
            }

            homeSection.innerHTML = homeHTML;

            // Zierschrift-Name: nur wenn das Gerät die Zeichen nicht selbst darstellen kann,
            // die mitgelieferte Ersatzschrift aktivieren (sonst bleibt alles wie gewohnt, z. B. auf iPhone/Mac)
            const nameH1 = homeSection.querySelector('h1');
            if (nameH1 && !hasMathScriptGlyphs(getComputedStyle(nameH1).font)) {
                document.documentElement.classList.add('no-math-script');
                console.log('Zierschrift-Zeichen fehlen auf diesem Gerät → Ersatzschrift aktiv');
            }
        }

        // Hilfsfunktion: Checkt, ob Bild lädt (Promise)
        async function checkImage(url) {
            if (!url) return false;
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            });
        }

        // ────────────────────────────────────────────────
        // 6. Alle anderen Sections mit Partials füllen
        // ────────────────────────────────────────────────
        if (config.sections && Array.isArray(config.sections)) {
            for (const sec of config.sections) {
                const sectionEl = document.getElementById(sec.id);
                if (sectionEl && sec.partial) {
                    try {
                        const response = await fetch(`/partials/${sec.partial}`);
                        if (!response.ok) throw new Error(`Partial ${sec.partial} nicht gefunden`);
                        const html = await response.text();

                        if (sec.id === 'home') {
                            sectionEl.insertAdjacentHTML('beforeend', html);
                        } else {
                            sectionEl.innerHTML = html;
                        }

                        // Neu: Optionaler Section-Badge hinzufügen!
                        if (sec.badge) {
                            const badgeHTML = `<span class="new-badge section-badge">${sec.badge}</span>`;
                            sectionEl.insertAdjacentHTML('beforeend', badgeHTML);  // Anhängen als letztes Kind
                            console.log(`Badge "${sec.badge}" zu Section ${sec.id} hinzugefügt ✓`);
                        }
                    } catch (err) {
                        console.error(`Fehler beim Laden von ${sec.partial}:`, err);
                        sectionEl.innerHTML = '<p style="color: #ff3366;">Inhalt konnte nicht geladen werden 😔</p>';
                    }
                }
            }
        }

        // ────────────────────────────────────────────────
        // 7. Social Links in #all-links-container injizieren (funktioniert jetzt im Footer!)
        // ────────────────────────────────────────────────
        function injectSocialLinks() {
            const linksContainer = document.getElementById('all-links-container');
            if (linksContainer && config.linkButtons && config.linkButtons.length > 0) {
                let linksHTML = '';
                config.linkButtons.forEach(button => {
                    const iconSrc = button.icon.relative || button.icon.fallback;
                    linksHTML += `
                        <a href="${button.url}" class="social-link ${button.extraClass || ''}" target="_blank" rel="noopener noreferrer">
                            <img src="${iconSrc}" alt="${button.alt}" class="${button.class || 'social-icon'}">
                            <span>${button.label}</span>
                            ${button.badge ? `<span class="new-badge">${button.badge}</span>` : ''}
                        </a>
                    `;
                });
                linksContainer.innerHTML = linksHTML;
                console.log('✅ Social Links im Footer geladen');
            } else if (linksContainer) {
                linksContainer.innerHTML = '<p style="opacity: 0.6; font-style: italic;">Keine Links gefunden...</p>';
            }
        }

        // Sofort nach dem Laden aller Sections ausführen
        injectSocialLinks();

        // ────────────────────────────────────────────────
        // 8. Schema.org JSON-LD dynamisch erstellen
        // ────────────────────────────────────────────────
        if (config.schema) {
            const schema = { ...config.schema };

            // Dynamische Felder ergänzen
            schema.image = config.profileImage?.fallback || config.profileImage?.relative || '';
            schema.description = config.meta?.description || config.bio || '';

            // sameAs: alle Social-URLs sammeln (einzigartig)
            const allSocialUrls = [
                ...(config.primarySocials || []).map(s => s.url),
                ...(config.linkButtons || []).map(b => b.url)
            ];
            schema.sameAs = [...new Set(allSocialUrls.filter(url => url))];

            // Script-Tag erzeugen
            const schemaScript = document.createElement('script');
            schemaScript.type = 'application/ld+json';
            schemaScript.textContent = JSON.stringify(schema, null, 2);
            document.head.appendChild(schemaScript);
        }

        // Neu: Nach dem Laden aller Partials Bilder optimieren (zentral)
        optimizeImages(config);

        // Extra Sicherheit für den Footer (falls Partial noch lädt)
        setTimeout(injectSocialLinks, 500);

        console.log('Seite dynamisch aufgebaut ✓');

    } catch (error) {
        console.error('Schwerwiegender Fehler beim Laden der Config:', error);
        // Optional: Fallback-Nachricht auf Home anzeigen
        const home = document.getElementById('home');
        if (home) {
            home.innerHTML = '<h1>Ups... etwas ist schiefgelaufen 🌟</h1><p>Die Seite lädt gerade nicht richtig. Versuch es später nochmal oder schau direkt auf meinen Socials vorbei!</p>';
        }
    }
});

const CLD_PLACEHOLDER = '__CLD__';   // ← nur zur Erkennung, wird aus URL entfernt

// Neue Funktion: Optimiert alle Cloudinary-Bilder zentral (Placeholder-basiert)
function optimizeImages(config) {
  if (!config?.imageOptimizations) {
    console.warn('imageOptimizations fehlt in config!');
    return;
  }

  console.log('🚀 optimizeImages wurde aufgerufen!');

  const images = document.querySelectorAll('img');
  console.log(`Gefundene Bilder im DOM: ${images.length}`);

  images.forEach((img, index) => {
    const originalSrc = img.getAttribute('src'); // WICHTIG: Original aus HTML!
    if (!originalSrc) return;

    console.log(`Bild ${index + 1} → Original src:`, originalSrc);

    // Nur Bilder mit unserem Placeholder bearbeiten
    if (originalSrc.includes(CLD_PLACEHOLDER)) {
      
      // Placeholder entfernen + Pfad sauber machen
      let publicId = originalSrc
        .replace(CLD_PLACEHOLDER, '')
        .replace(/^\/+/, '');   // führende Slashes entfernen

      const newSrc = `${config.imageOptimizations.cloudinaryBase}${config.imageOptimizations.params}/${publicId}`;

      img.src = newSrc;
      img.loading = config.imageOptimizations.loading || 'lazy';
      img.sizes = config.imageOptimizations.sizes || '(max-width: 600px) 100vw, 50vw';

      console.log(`✅ Bild erfolgreich optimiert → ${newSrc}`);
    } else {
      console.log(`⏭️ Bild wird übersprungen (kein ${CLD_PLACEHOLDER} Placeholder)`);
    }
  });
}

// Prüft, ob das Gerät die Zierschrift-Buchstaben (Mathematical Bold Script, z. B. 𝓘𝓷𝓪) selbst darstellen kann.
// Trick: Echte Buchstaben haben unterschiedliche Breiten. Fehlende Zeichen werden alle als gleich breites
// "Kästchen" gezeichnet – genau wie unbelegte Codepunkte. Sind beide Texte gleich breit, fehlen die Zeichen.
function hasMathScriptGlyphs(fontCss) {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = fontCss || '700 40px sans-serif';
    const echt = ctx.measureText('\u{1D4D8}\u{1D4F7}\u{1D4EA}\u{1D4E2}\u{1D4F2}\u{1D4F5}\u{1D4F3}\u{1D4EA}').width;           // 𝓘𝓷𝓪𝓢𝓲𝓵𝓳𝓪
    const unbelegt = ctx.measureText('\u{1D49D}\u{1D4A0}\u{1D4A1}\u{1D4A3}\u{1D4A4}\u{1D4A7}\u{1D4A8}\u{1D4AD}').width;    // 8 reservierte Lücken im Unicode-Block
    return Math.abs(echt - unbelegt) > 0.5;
  } catch (e) {
    return true; // im Zweifel nichts ändern
  }
}
