/**
 * ALEX RIVERA PORTFOLIO — main.js
 * Handles: navigation, typing animation, scroll effects,
 *          skill bars, project filtering, GitHub API, contact form
 */

/* ──────────────────────────────────────────
   NAVIGATION
────────────────────────────────────────── */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('navLinks');
const navLinkEls  = document.querySelectorAll('.nav-link');

// Scroll — add class & update active link
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveNav();
  toggleScrollTop();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinkEls.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 90;
  sections.forEach(section => {
    const top = section.offsetTop;
    const h   = section.offsetHeight;
    const id  = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + h);
  });
}

/* ──────────────────────────────────────────
   TYPING ANIMATION
────────────────────────────────────────── */
const roles = [
  'Software Engineer',
  'Web Developer',
  'AI Enthusiast',
  'Open Source Contributor',
  'Problem Solver',
];
let roleIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.getElementById('typingText');

function type() {
  const current = roles[roleIdx];
  if (deleting) {
    typingEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx  = (roleIdx + 1) % roles.length;
      setTimeout(type, 400);
      return;
    }
    setTimeout(type, 40);
  } else {
    typingEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(type, 2000);
      return;
    }
    setTimeout(type, 80);
  }
}
setTimeout(type, 800);

/* ──────────────────────────────────────────
   DARK / LIGHT THEME TOGGLE
────────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

themeToggle.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next   = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeIcon.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
});

/* ──────────────────────────────────────────
   SCROLL-TO-TOP BUTTON
────────────────────────────────────────── */
const scrollTopBtn = document.getElementById('scrollTop');

function toggleScrollTop() {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ──────────────────────────────────────────
   SCROLL ANIMATIONS (lightweight AOS)
────────────────────────────────────────── */
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        // Animate skill bars when skills section is visible
        if (entry.target.closest('#skills')) animateSkillBars();
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────
   SKILL BAR ANIMATION
────────────────────────────────────────── */
let skillsAnimated = false;
function animateSkillBars() {
  if (skillsAnimated) return;
  skillsAnimated = true;
  document.querySelectorAll('.skill-fill').forEach((bar, i) => {
    setTimeout(() => bar.classList.add('animated'), i * 80);
  });
}

/* ──────────────────────────────────────────
   PROJECT FILTER
────────────────────────────────────────── */
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const cat = card.dataset.category;
      const show = filter === 'all' || cat === filter;
      card.classList.toggle('hidden', !show);
    });
  });
});

/* ──────────────────────────────────────────
   GITHUB API — Fetch Pinned / Latest Repos
────────────────────────────────────────── */
async function fetchGitHubRepos() {
  // Replace 'alexrivera' with your actual GitHub username
  const username   = 'octocat';       // demo username
  const reposEl    = document.getElementById('githubRepos');
  const apiUrl     = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;

  try {
    const res  = await fetch(apiUrl);
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    reposEl.innerHTML = '';
    repos
      .filter(r => !r.fork)
      .slice(0, 6)
      .forEach(repo => {
        const card = document.createElement('a');
        card.href   = repo.html_url;
        card.target = '_blank';
        card.rel    = 'noopener noreferrer';
        card.className = 'repo-card';
        card.innerHTML = `
          <div class="repo-name">${escapeHtml(repo.name)}</div>
          <div class="repo-desc">${escapeHtml(repo.description || 'No description provided.')}</div>
          <div class="repo-meta">
            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
            ${repo.language ? `<span><i class="fas fa-circle" style="font-size:0.5rem; color:var(--accent)"></i> ${escapeHtml(repo.language)}</span>` : ''}
          </div>
        `;
        reposEl.appendChild(card);
      });

    if (reposEl.children.length === 0) {
      reposEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.875rem">No public repositories found.</p>';
    }
  } catch (err) {
    reposEl.innerHTML = `
      <p style="color:var(--text-muted);font-size:0.875rem">
        <i class="fas fa-info-circle"></i>
        Live repos unavailable — <a href="https://github.com/${username}" target="_blank" style="color:var(--accent)">visit GitHub</a> directly.
      </p>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ──────────────────────────────────────────
   CONTACT FORM
────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formStatus  = document.getElementById('formStatus');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  // Basic validation
  if (!name || !email || !message) {
    setFormStatus('Please fill in all required fields.', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    setFormStatus('Please enter a valid email address.', 'error');
    return;
  }

  // Show loading state
  submitBtn.querySelector('.btn-text').style.display   = 'none';
  submitBtn.querySelector('.btn-loading').style.display = 'flex';
  submitBtn.disabled = true;

  // Simulate send (replace with actual fetch to your backend / FormSpree / EmailJS)
  await new Promise(r => setTimeout(r, 1800));

  submitBtn.querySelector('.btn-text').style.display   = '';
  submitBtn.querySelector('.btn-loading').style.display = 'none';
  submitBtn.disabled = false;
  contactForm.reset();
  setFormStatus('✓ Message sent! I\'ll get back to you within 24 hours.', 'success');
  setTimeout(() => setFormStatus('', ''), 5000);
});

function setFormStatus(msg, type) {
  formStatus.textContent  = msg;
  formStatus.className    = `form-status ${type}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ──────────────────────────────────────────
   SMOOTH HOVER TILT on project cards
────────────────────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect  = card.getBoundingClientRect();
    const x     = (e.clientX - rect.left) / rect.width  - 0.5;
    const y     = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  fetchGitHubRepos();
  updateActiveNav();
});
