const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

const TWO_PI = Math.PI * 2;

let width, height;
let particles = [];
let activeTheme = 'default';
let cachedIsMobile = false;

// Theme Config
const themes = {
    default: {
        color: 'rgba(224, 224, 224, 0.1)',
        speedMult: 0.5,
        type: 'circle',
        count: 50,
        wrap: true,
        hasWind: false
    },
    ss2: { // Matrix/Digital
        color: 'rgba(40, 200, 80, 0.25)',
        speedMult: 2,
        type: 'square',
        count: 80,
        wrap: false,
        hasWind: false
    },
    tld: { // Blizzard
        color: 'rgba(160, 220, 240, 0.3)',
        speedMult: 0.5,
        type: 'circle',
        count: 150,
        gravity: 0.5,
        wind: 1.5,
        wrap: false,
        hasWind: true
    },
    ts: { // Stealth/Void
        color: 'rgba(130, 60, 200, 0.25)',
        speedMult: 0.8,
        type: 'wisp',
        count: 60,
        wrap: true,
        hasWind: false
    }
};

const projectDetails = {
    ss2: {
        title: "Aura-Sight",
        description: "Aura-Sight is a sophisticated internal tool designed for System Shock 2. It provides real-time visualization of game world entities, enabling researchers and speedrunners to understand the game's complex AI and item systems through direct memory access and custom rendering.",
        features: ["Bounding Box ESP", "Item Value Display", "AI State Monitoring", "Hidden Cache Detection"],
        techStack: ["C++ / DirectX 9", "VMT Hooking", "MinHook Integration", "Custom ImGui Overlay"],
        repoUrl: "https://github.com/phys-winner/ss2-aura-sight"
    },
    tld: {
        title: "Fubuki-ESP",
        description: "Fubuki-ESP (Snowstorm) is a lightweight, performance-focused exploration tool for The Long Dark. It helps players navigate the harsh wilderness of Great Bear Island by identifying critical survival resources and wildlife locations without compromising the game's immersive atmosphere.",
        features: ["Wildlife Tracking", "Resource Highlighting", "Weather Prediction Data", "Container Inventory Peek"],
        techStack: ["C++ / Unity Engine", "Mono Injection", "Pattern Scanning", "Custom Shader Rendering"],
        repoUrl: "https://github.com/phys-winner/fubuki-esp"
    },
    ts: {
        title: "Byakugan",
        description: "Byakugan provides unparalleled mechanical insight for Thief Simulator. By visualizing security systems, guard patrol paths, and loot density, it serves as a comprehensive tool for analyzing the game's stealth mechanics and level design efficiency.",
        features: ["Guard Vision Cone Visualization", "Patrol Path Mapping", "Loot Density Heatmap", "Security System Diagnostics"],
        techStack: ["C++ / Unity Engine", "Bypass Techniques", "Reflection-based Analysis", "Persistent Config System"],
        repoUrl: "https://github.com/phys-winner/thief-simulator-byakugan"
    }
};

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cachedIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 900;
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

    update(gust, theme) {
        let currentVx = this.vx + (theme.hasWind ? gust : 0);

        this.x += currentVx;
        this.y += this.vy;
        this.life++;

        if (theme.wrap) {
            if (this.x < 0) this.x = width;
            else if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            else if (this.y > height) this.y = 0;
        } else {
            // Reset if out of bounds
            // Logic: If gone too far right or down
            const isOutOfBounds = (this.y > height) || (this.x > width + 100);

            if (isOutOfBounds) {
                this.reset(false); // Re-use reset logic to spawn from top/left
            }
        }
    }

    draw(theme) {
        if (theme.type === 'square') {
            ctx.fillRect(this.x, this.y, this.size, this.size * 5); // elongated for rain
        } else if (theme.type === 'wisp') {
            const radius = Math.abs(this.size * Math.sin(this.life * 0.05) + 2);
            ctx.moveTo(this.x + radius, this.y);
            ctx.arc(this.x, this.y, radius, 0, TWO_PI);
        } else {
            ctx.moveTo(this.x + this.size, this.y);
            ctx.arc(this.x, this.y, this.size, 0, TWO_PI);
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

function animate(timestamp) {
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

    // Performance Optimization: Cache current theme and calculate time once per frame
    const currentTheme = themes[activeTheme];
    const time = timestamp ? timestamp / 1000 : Date.now() / 1000;

    // Bolt ⚡: Hoist gust calculation to run once per frame instead of once per particle
    let gust = 0;
    if (currentTheme.hasWind) {
        gust = Math.sin(time * 2) * 0.75 + Math.sin(time * 0.5) * 0.5 + Math.sin(time * 3.5) * 0.25;
        const stormSine = Math.sin(time * 0.5);
        if (stormSine > 0.5) {
            gust += (stormSine - 0.5) * 8;
        }
    }

    ctx.fillStyle = currentTheme.color;
    const isSquare = currentTheme.type === 'square';

    // Bolt ⚡: Batch fill calls for non-square particles to reduce GPU draw calls (O(1) instead of O(N))
    if (!isSquare) {
        ctx.beginPath();
    }

    particles.forEach(p => {
        p.update(gust, currentTheme);
        p.draw(currentTheme);
    });

    if (!isSquare) {
        ctx.fill();
    }

    requestAnimationFrame(animate);
}

// GitHub API Integration
async function fetchRepoData() {
    const metricContainers = document.querySelectorAll('.project-metrics');

    // Bolt ⚡: Use Promise.all for concurrent fetching to improve load speed
    const fetchPromises = Array.from(metricContainers).map(async (container) => {
        const repo = container.getAttribute('data-repo');
        const starsEl = container.querySelector('.stars .value');
        const updatedEl = container.querySelector('.updated .value');

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`);
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();

            // Format date (e.g., "Oct 2025")
            const date = new Date(data.pushed_at);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            });

            starsEl.textContent = data.stargazers_count;
            updatedEl.textContent = formattedDate;
        } catch (error) {
            console.error(`Error fetching data for ${repo}:`, error);
            starsEl.textContent = 'N/A';
            updatedEl.textContent = 'Unknown';
        }
    });

    await Promise.all(fetchPromises);
}

initParticles();
fetchRepoData();
animate();

// Modal Logic
const modal = document.getElementById('project-modal');
const modalClose = modal.querySelector('.modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalFeatures = document.getElementById('modal-features');
const modalTechStack = document.getElementById('modal-tech-stack');
const modalGithubLink = document.getElementById('modal-github-link');

function openModal(projectId) {
    const data = projectDetails[projectId];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalGithubLink.href = data.repoUrl;

    modalFeatures.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
    modalTechStack.innerHTML = data.techStack.map(t => `<li>${t}</li>`).join('');

    modal.setAttribute('data-theme', projectId);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus trapping - initially focus close button
    setTimeout(() => modalClose.focus(), 100);
}

function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    transitTheme('default');
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Interaction Handlers
const cardWrappers = document.querySelectorAll('.card-wrapper');

cardWrappers.forEach(wrapper => {
    const card = wrapper.querySelector('.card');

    const handleEntry = () => {
        const theme = card.getAttribute('data-theme');
        transitTheme(theme);
    };

    const handleExit = () => {
        transitTheme('default');

        // Only reset transforms on desktop
        if (!cachedIsMobile) {
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
        }
    };

    wrapper.addEventListener('mouseenter', handleEntry);
    wrapper.addEventListener('mouseleave', handleExit);

    // Accessibility: Keyboard Navigation
    wrapper.addEventListener('focusin', handleEntry);
    wrapper.addEventListener('focusout', (e) => {
        // Only exit if focus moved outside the wrapper
        if (!wrapper.contains(e.relatedTarget)) {
            handleExit();
        }
    });

    wrapper.addEventListener('touchstart', () => {
        const theme = card.getAttribute('data-theme');
        transitTheme(theme);
    });

    const detailsBtn = wrapper.querySelector('.btn-details');
    detailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const projectId = detailsBtn.getAttribute('data-project');
        openModal(projectId);
    });

    // 3D Tilt Effect - Only on Desktop
    wrapper.addEventListener('mousemove', (e) => {
        // Skip all transform and parallax effects on mobile
        if (cachedIsMobile) return;

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
