const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let activeTheme = 'default';

// Theme Config
const themes = {
    default: {
        color: 'rgba(255, 255, 255, 0.2)',
        speedMult: 0.5,
        type: 'circle',
        count: 100 // Increased
    },
    ss2: { // Matrix/Digital
        color: 'rgba(0, 255, 65, 0.6)',
        speedMult: 2,
        type: 'square',
        count: 150
    },
    tld: { // Blizzard
        color: 'rgba(220, 255, 255, 0.9)',
        speedMult: 1,
        type: 'circle',
        count: 300, // Reduced as requested
        gravity: 0.5,
        wind: 3
    },
    ts: { // Stealth/Void
        color: 'rgba(157, 0, 255, 0.5)',
        speedMult: 0.8,
        type: 'wisp',
        count: 120
    }
};

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        const theme = themes[activeTheme];
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * theme.speedMult;
        this.vy = (Math.random() - 0.5) * theme.speedMult;
        this.size = Math.random() * 3 + 1;
        this.life = Math.random() * 100;

        if (activeTheme === 'tld') {
            this.vy = Math.random() * 5 + 3;
            this.vx = Math.random() * 4 + 2;
            if (initial) {
                this.y = Math.random() * height;
                this.x = Math.random() * width;
            } else {
                // Spawn from top OR left side to fill the screen
                if (Math.random() > 0.5) {
                    this.y = -10; // Top
                    this.x = Math.random() * (width + 500) - 500; // Wide X
                } else {
                    this.x = -10; // Left
                    this.y = Math.random() * height; // Any Y
                }
            }
        } else if (activeTheme === 'ss2') {
            this.vy = Math.random() * 5 + 2;
            this.vx = 0;
            if (initial) {
                this.y = Math.random() * height;
            } else {
                this.y = Math.random() * -100;
            }
        }
    }

    update() {
        const theme = themes[activeTheme];

        // Dynamic Wind Calculation
        let currentVx = this.vx;
        if (activeTheme === 'tld') {
            const time = Date.now() / 1000;
            // Base gust
            let gust = Math.sin(time * 2) * 1.5 + Math.sin(time * 0.5) * 1 + Math.sin(time * 3.5) * 0.5;

            // "Storm Burst"
            if (Math.sin(time * 0.5) > 0.8) {
                gust += 15;
            }

            currentVx += gust;
        }

        this.x += currentVx;
        this.y += this.vy;
        this.life++;

        if (activeTheme === 'default' || activeTheme === 'ts') {
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        } else {
            // Reset if out of bounds
            // Logic: If gone too far right or down
            const isOutOfBounds = (this.y > height) || (this.x > width + 100);

            if (isOutOfBounds) {
                this.reset(false); // Re-use reset logic to spawn from top/left
            }
        }
    }

    draw() {
        const theme = themes[activeTheme];
        ctx.fillStyle = theme.color;

        if (theme.type === 'square') {
            ctx.fillRect(this.x, this.y, this.size, this.size * 5); // elongated for rain
        } else if (theme.type === 'wisp') {
            ctx.beginPath();
            const radius = Math.abs(this.size * Math.sin(this.life * 0.05) + 2);
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function initParticles() {
    particles = [];
    const count = themes[activeTheme].count;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Smooth transition logic could go here, but simple switch for now
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

initParticles();
animate();

// Interaction Handlers
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        const theme = card.getAttribute('data-theme');
        if (activeTheme !== theme) {
            activeTheme = theme;
            document.body.setAttribute('data-bg', theme); // Set background
            initParticles();
        }
    });

    card.addEventListener('mouseleave', () => {
        activeTheme = 'default';
        document.body.removeAttribute('data-bg'); // Reset background
        initParticles();
    });

    // Mobile touch support
    card.addEventListener('touchstart', () => {
        const theme = card.getAttribute('data-theme');
        if (activeTheme !== theme) {
            activeTheme = theme;
            document.body.setAttribute('data-bg', theme); // Set background
            initParticles();
        }
    });

    // 3D Tilt Effect
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate center relative position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        // Apply transform with perspective
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05) translateY(-10px)`;
        card.style.transition = 'box-shadow 0.4s ease';

        // Parallax Effects
        const img = card.querySelector('.card-image img');
        const contentInner = card.querySelector('.card-content-inner');

        // Move image slightly in opposite direction of tilt
        const moveX = (x - centerX) / centerX * -15; // Max 15px
        const moveY = (y - centerY) / centerY * -15;

        img.style.transform = `scale(1.2) translate(${moveX}px, ${moveY}px)`;
        img.style.transition = 'filter 0.5s ease'; // Remove transform transition for instant feedback

        // Move content slightly in the direction of tilt (pop out)
        const contentX = (x - centerX) / centerX * 15;
        const contentY = (y - centerY) / centerY * 15;
        contentInner.style.transform = `translate(${contentX}px, ${contentY}px)`;
    });

    card.addEventListener('mouseleave', () => {
        // Reset transform
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1) translateY(0)';
        card.style.transition = 'transform 0.5s ease, box-shadow 0.4s ease';

        // Reset Parallax
        const img = card.querySelector('.card-image img');
        const contentInner = card.querySelector('.card-content-inner');

        img.style.transform = 'scale(1.1) translate(0, 0)';
        img.style.transition = 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1), filter 0.5s ease';

        contentInner.style.transform = 'translate(0, 0)';
        contentInner.style.transition = 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)';

        activeTheme = 'default';
        document.body.removeAttribute('data-bg'); // Reset background
        initParticles();
    });
});
