/* -------------------------------------------------
   Helper: test if an image URL is reachable
   ------------------------------------------------- */
async function checkImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

/* -------------------------------------------------
   Load config & build page
   ------------------------------------------------- */
async function loadConfig() {
    let config;
    try {
        // 1. try local config.json
        let resp = await fetch('./config.json');
        if (!resp.ok) throw new Error();
        config = await resp.json();
    } catch (e) {
        // 2. fallback to GitHub raw
        const resp = await fetch('https://raw.githubusercontent.com/InaSilja/inasilja.me/main/config.json');
        if (!resp.ok) throw new Error('Both config fetches failed');
        config = await resp.json();
    }

    const primarySocials = document.querySelector('.primary-socials');
    const header         = document.querySelector('.header');
    const nameEl         = document.querySelector('.name');
    const bioEl          = document.querySelector('.bio');
    const creditEl       = document.querySelector('.site-credit');
    const profileDiv     = document.querySelector('.profile-img');
    const errEl          = document.querySelector('.config-error');

    // ---- remove error message ----
    errEl.remove();

    // ---- FONT (dynamic) ----
    const fontStyle = document.createElement('style');
    fontStyle.textContent = `
        @import url('${config.font.url}');
        :root { --main-font: '${config.font.name}', sans-serif; }
    `;
    document.head.appendChild(fontStyle);

    // ---- FAVICON ----
    const favUrl = await checkImage(config.favicon.relative) ? config.favicon.relative : config.favicon.fallback;
    const link = document.createElement('link');
    link.rel = 'icon'; link.type = config.favicon.type; link.href = favUrl;
    document.head.appendChild(link);

    // ---- PROFILE IMAGE ----
    const profUrl = await checkImage(config.profileImage.relative) ? config.profileImage.relative : config.profileImage.fallback;
    const img = document.createElement('img');
    img.src = profUrl; img.alt = config.profileImage.alt; img.className = 'profile-img';
    profileDiv.appendChild(img);

    // ---- TEXT ----
    nameEl.textContent   = config.name;
    bioEl.textContent    = config.bio;
    creditEl.textContent = config.siteCredit;

    // ---- PRIMARY SOCIALS ----
    primarySocials.innerHTML = '';
    for (const s of config.primarySocials) {
        const icon = await checkImage(s.icon.relative) ? s.icon.relative : s.icon.fallback;
        const a = document.createElement('a');
        a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        const im = document.createElement('img');
        im.src = icon; im.alt = s.alt; im.className = s.class;
        a.appendChild(im);
        if (s.isNew) {
            const badge = document.createElement('span');
            badge.className = 'new-badge';
            badge.textContent = 'New';
            a.appendChild(badge);
        }
        primarySocials.appendChild(a);
    }

    // ---- LINK BUTTONS ----
    header.querySelectorAll('.link-button').forEach(b => b.remove());
    for (const b of config.linkButtons) {
        const icon = await checkImage(b.icon.relative) ? b.icon.relative : b.icon.fallback;
        const a = document.createElement('a');
        a.href = b.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.className = `link-button ${b.extraClass || ''}`;
        const im = document.createElement('img');
        im.src = icon; im.alt = b.alt; im.className = b.class;
        const span = document.createElement('span');
        span.textContent = b.label;
        a.appendChild(im);
        a.appendChild(span);
        if (b.isNew) {
            const badge = document.createElement('span');
            badge.className = 'new-badge';
            badge.textContent = 'New';
            a.appendChild(badge);
        }
        header.insertBefore(a, creditEl);
    }

    // -------------------------------------------------
    // FUTURE: theme handling (just a comment for now)
    // -------------------------------------------------
    // if (config.theme) {
    //     const themeLink = document.createElement('link');
    //     themeLink.rel = 'stylesheet';
    //     themeLink.href = `styles/theme-${config.theme}.css`;
    //     document.head.appendChild(themeLink);
    // }
}

/* -------------------------------------------------
   Starfield animation (unchanged)
   ------------------------------------------------- */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colors = ['#FFFFFF', '#FFCCFF', '#CCFFFF', '#FF99CC'];
const stars = [];
const numStars = 150;
const shootingStars = [];

for (let i = 0; i < numStars; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * 0.5 + 0.5,
        arcOffset: Math.random() * canvas.height * 0.2,
        arcPhase: Math.random() * Math.PI * 2
    });
}

function createShootingStar() {
    const angle = Math.random() * Math.PI / 4 + Math.PI / 8;
    const speed = Math.random() * 10 + 10;
    shootingStars.push({
        x: canvas.width,
        y: Math.random() * canvas.height * 0.3,
        vx: -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 20 + 10,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 60
    });
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
            star.arcPhase = Math.random() * Math.PI * 2;
        }
        const arcY = star.y + Math.sin(star.x * 0.005 + star.arcPhase) * star.arcOffset;

        ctx.beginPath();
        ctx.arc(star.x, arcY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.sin(Date.now() * 0.001 * star.twinkle) * 0.5 + 0.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    });

    if (Math.random() < 0.02) createShootingStar();

    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        if (s.life <= 0 || s.x < 0 || s.y > canvas.height) {
            shootingStars.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * s.length / 10, s.y - s.vy * s.length / 10);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.radius;
        ctx.shadowBlur = 15;
        ctx.shadowColor = s.color;
        ctx.globalAlpha = s.life / 60;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animateStars);
}

/* -------------------------------------------------
   Start everything
   ------------------------------------------------- */
loadConfig();
animateStars();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});