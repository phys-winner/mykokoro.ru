const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let activeTheme = 'default';

// Theme Config
const themes = {
    default: {
        color: 'rgba(224, 224, 224, 0.1)',
        speedMult: 0.5,
        type: 'circle',
        count: 50
    },
    ss2: { // Matrix/Digital
        color: 'rgba(40, 200, 80, 0.25)',
        speedMult: 2,
        type: 'square',
        count: 80
    },
    tld: { // Blizzard
        color: 'rgba(160, 220, 240, 0.3)',
        speedMult: 0.5,
        type: 'circle',
        count: 150,
        gravity: 0.5,
        wind: 1.5
    },
    ts: { // Stealth/Void
        color: 'rgba(130, 60, 200, 0.25)',
        speedMult: 0.8,
        type: 'wisp',
        count: 60
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
            this.vy = Math.random() * 2.5 + 1.5;
            this.vx = Math.random() * 2 + 1;
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
            let gust = Math.sin(time * 2) * 0.75 + Math.sin(time * 0.5) * 0.5 + Math.sin(time * 3.5) * 0.25;

            // "Storm Burst"
            if (Math.sin(time * 0.5) > 0.8) {
                gust += 7.5;
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

let targetTheme = 'default';
let crystalOpacity = 1;

function transitTheme(newTheme) {
    targetTheme = newTheme;
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

    // Smooth Transition Logic
    if (activeTheme !== targetTheme) {
        crystalOpacity -= 0.08;
        if (crystalOpacity <= 0) {
            crystalOpacity = 0;
            activeTheme = targetTheme;
            if (activeTheme !== 'default') {
                document.body.setAttribute('data-bg', activeTheme);
            } else {
                document.body.removeAttribute('data-bg');
            }
            initParticles();
        }
    } else if (crystalOpacity < 1) {
        crystalOpacity += 0.08;
        if (crystalOpacity > 1) crystalOpacity = 1;
    }

    ctx.globalAlpha = crystalOpacity;

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

initParticles();
animate();

// Interaction Handlers
const cardWrappers = document.querySelectorAll('.card-wrapper');

cardWrappers.forEach(wrapper => {
    const card = wrapper.querySelector('.card');

    wrapper.addEventListener('mouseenter', () => {
        const theme = card.getAttribute('data-theme');
        transitTheme(theme);
    });

    wrapper.addEventListener('mouseleave', () => {
        transitTheme('default');

        // Reset transform
        card.style.transform = 'rotateX(0) rotateY(0) scale3d(1, 1, 1) translateY(0)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1), box-shadow 0.4s ease';

        // Reset Parallax
        const img = card.querySelector('.card-image img');
        const contentInner = card.querySelector('.card-content-inner');

        img.style.transform = 'translate(0, 0)';
        img.style.transition = 'transform 0.8s cubic-bezier(0.33, 1, 0.68, 1), filter 0.5s ease';

        contentInner.style.transform = 'translate(0, 0)';
        contentInner.style.transition = 'transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)';
    });

    wrapper.addEventListener('touchstart', () => {
        const theme = card.getAttribute('data-theme');
        transitTheme(theme);
    });

    // 3D Tilt Effect
    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate center relative position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        // Apply transform to the inner card
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05) translateY(-10px)`;
        card.style.transition = 'box-shadow 0.4s ease';

        // Parallax Effects
        const img = card.querySelector('.card-image img');
        const contentInner = card.querySelector('.card-content-inner');

        // Move image significantly (Far Parallax)
        const moveX = (x - centerX) / centerX * -15;
        const moveY = (y - centerY) / centerY * -15;

        img.style.transform = `scale(1) translate(${moveX}px, ${moveY}px)`;
        img.style.transition = 'filter 0.5s ease, transform 0s';

        // Move content in the direction of tilt (Pop Out)
        const contentX = (x - centerX) / centerX * 15;
        const contentY = (y - centerY) / centerY * 15;
        contentInner.style.transform = `translate(${contentX}px, ${contentY}px)`;
        contentInner.style.transition = 'transform 0s';
    });
});
