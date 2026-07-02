/* ============================================
   Angel - Main JavaScript
   ============================================ */

(function () {
    'use strict';

    // --- Navbar scroll effect ---
    var navbar = document.getElementById('navbar');
    if (navbar && !navbar.classList.contains('scrolled')) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Mobile nav toggle ---
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }

    // --- Terminal typewriter effect ---
    var typewriterEl = document.getElementById('typewriter');
    var terminalOutput = document.getElementById('terminalOutput');

    if (typewriterEl && terminalOutput) {
        var commands = [
            {
                cmd: 'angel pull deepseek-r1:7b',
                output: 'Downloading deepseek-r1:7b... 100%\nModel ready. 6.2 GB loaded.'
            },
            {
                cmd: 'angel serve deepseek-r1:7b --port 8000',
                output: 'Starting Angel server...\nModel loaded on GPU 0 (NVIDIA A100 80GB)\nServer running at http://localhost:8000/v1'
            },
            {
                cmd: 'curl localhost:8000/v1/models',
                output: '{"models": [{"id": "deepseek-r1:7b", "status": "ready"}]}'
            }
        ];

        var cmdIndex = 0;
        var charIndex = 0;
        var isTyping = true;
        var pauseAfterCmd = 1200;
        var pauseAfterOutput = 2500;
        var typeSpeed = 45;

        function typeCommand() {
            if (cmdIndex >= commands.length) {
                cmdIndex = 0;
            }

            var current = commands[cmdIndex];

            if (isTyping) {
                if (charIndex < current.cmd.length) {
                    typewriterEl.textContent += current.cmd[charIndex];
                    charIndex++;
                    setTimeout(typeCommand, typeSpeed);
                } else {
                    isTyping = false;
                    setTimeout(typeCommand, pauseAfterCmd);
                }
            } else {
                terminalOutput.textContent = current.output;
                setTimeout(function () {
                    typewriterEl.textContent = '';
                    terminalOutput.textContent = '';
                    charIndex = 0;
                    isTyping = true;
                    cmdIndex++;
                    typeCommand();
                }, pauseAfterOutput);
            }
        }

        setTimeout(typeCommand, 800);
    }

    // --- Copy buttons ---
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var text = btn.getAttribute('data-copy');
            if (!text) {
                var codeBlock = btn.closest('.code-block');
                if (codeBlock) {
                    var code = codeBlock.querySelector('code');
                    if (code) {
                        text = code.textContent;
                    }
                }
            }
            if (text) {
                navigator.clipboard.writeText(text).then(function () {
                    btn.textContent = 'Copied!';
                    btn.classList.add('copied');
                    setTimeout(function () {
                        btn.textContent = 'Copy';
                        btn.classList.remove('copied');
                    }, 2000);
                });
            }
        });
    });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offset = 90;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });

                if (navLinks) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // --- Docs sidebar active link tracking ---
    var sidebarLinks = document.querySelectorAll('.sidebar-links a');
    if (sidebarLinks.length > 0) {
        var docSections = [];
        sidebarLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                var section = document.querySelector(href);
                if (section) {
                    docSections.push({ el: section, link: link });
                }
            }
        });

        function updateActiveSidebarLink() {
            var scrollPos = window.scrollY + 120;
            var activeLink = null;

            for (var i = docSections.length - 1; i >= 0; i--) {
                if (docSections[i].el.offsetTop <= scrollPos) {
                    activeLink = docSections[i].link;
                    break;
                }
            }

            sidebarLinks.forEach(function (l) { l.classList.remove('active'); });
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }

        window.addEventListener('scroll', updateActiveSidebarLink);
        updateActiveSidebarLink();
    }

    // --- Docs mobile sidebar toggle ---
    var docsMobileToggle = document.getElementById('docsMobileToggle');
    var docsSidebar = document.getElementById('docsSidebar');

    if (docsMobileToggle && docsSidebar) {
        docsMobileToggle.addEventListener('click', function () {
            docsSidebar.classList.toggle('open');
        });

        document.addEventListener('click', function (e) {
            if (!docsMobileToggle.contains(e.target) && !docsSidebar.contains(e.target)) {
                docsSidebar.classList.remove('open');
            }
        });
    }

    // --- Intersection Observer for fade-in animations ---
    var animatedCards = document.querySelectorAll(
        '.feature-card, .model-card, .infra-card, .step-card, .stat-item'
    );

    if (animatedCards.length > 0 && 'IntersectionObserver' in window) {
        animatedCards.forEach(function (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        animatedCards.forEach(function (card) {
            observer.observe(card);
        });
    }
})();
