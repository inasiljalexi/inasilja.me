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
        document.title = config.title || '☆ 𝓘𝓷𝓪𝓢𝓲𝓵𝓳𝓪 ☆';

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

                <h1>${config.name}</h1>

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

            // Zusätzlicher Willkommenstext
            if (config.bio.split('\n')[1]) {
                homeHTML += `<p>${config.bio.split('\n').slice(1).join('<br>')}</p>`;
            }

            homeSection.innerHTML = homeHTML;
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
        // 7. Alle Links in #links Section einfügen
        // ────────────────────────────────────────────────
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
        } else if (linksContainer) {
            linksContainer.innerHTML = '<p>Keine Links verfügbar... 🌙</p>';
        }

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

// Neue Funktion: Optimiert alle Cloudinary-Bilder zentral (verbesserte Erkennung)
function optimizeImages(config) {
    if (!config?.imageOptimizations) {
        console.warn('imageOptimizations fehlt in config!');
        return;
    }

    console.log('🚀 optimizeImages wurde aufgerufen!');
    const images = document.querySelectorAll('img');

    console.log(`Gefundene Bilder im DOM: ${images.length}`);

    images.forEach((img, index) => {
        const originalSrc = img.getAttribute('src');   // WICHTIG: Original aus HTML!

        if (!originalSrc) return;

        console.log(`Bild ${index + 1} → Original src:`, originalSrc);

        // Erkenne Cloudinary-Rest-URLs (beginnt mit v + viele Zahlen + /) oder volle Cloudinary-URLs
        if (originalSrc.match(/^v\d{8,12}\//) || originalSrc.includes('cloudinary.com')) {
            let versionAndFile = originalSrc;

            if (originalSrc.includes('/upload/')) {
                versionAndFile = originalSrc.split('/upload/')[1];
            }

            const newSrc = `${config.imageOptimizations.cloudinaryBase}${config.imageOptimizations.params}/${versionAndFile}`;

            img.src = newSrc;
            img.loading = config.imageOptimizations.loading || 'lazy';
            img.sizes = config.imageOptimizations.sizes || '(max-width: 600px) 100vw, 50vw';

            console.log(`✅ Bild erfolgreich optimiert → ${newSrc}`);
        } else {
            console.log(`⏭️  Bild wird übersprungen (kein Cloudinary-Rest-Pfad)`);
        }
    });
}