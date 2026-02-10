// js/scripts.js
// Wird NACH config-loader.js ausgeführt
// Enthält: Starfield-Animation + Navigation Dots Logik

// ────────────────────────────────────────────────
// 1. Starfield Animation (Canvas)
// ────────────────────────────────────────────────
const canvas = document.getElementById('starfield');
if (canvas) {
    const ctx = canvas.getContext('2d');

    // Canvas Größe anpassen
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = ['#FFFFFF', '#FFCCFF', '#CCFFFF', '#FF99CC'];
    const stars = [];
    const numStars = 150;
    const shootingStars = [];

    // Normale Sterne initialisieren
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

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Normale Sterne
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

        // Shooting Stars spawnen
        if (Math.random() < 0.02) createShootingStar();

        // Shooting Stars zeichnen
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

        requestAnimationFrame(animate);
    }

    animate();
}

// ────────────────────────────────────────────────
// 2. Navigation Dots + Scroll-Handling
// ────────────────────────────────────────────────
const sections = document.querySelectorAll('section');
const navDots = document.querySelectorAll('.nav-dot');

function updateActiveDot() {
    const scrollPos = window.scrollY + (window.innerHeight / 3); // etwas Toleranz

    let current = 0;
    sections.forEach((section, index) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        if (scrollPos >= top && scrollPos < bottom) {
            current = index;
        }
    });

    navDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
    });
}

// Dots klickbar machen → smooth scroll
navDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        sections[index].scrollIntoView({ behavior: 'smooth' });
    });
});

// Scroll-Event
window.addEventListener('scroll', updateActiveDot);

// Initial aufrufen
updateActiveDot();

// Optional: Resize-Handling (falls Sections sich ändern)
window.addEventListener('resize', updateActiveDot);

console.log('scripts.js geladen: Starfield + Nav-Dots aktiv');