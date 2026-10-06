// =========================================================
// INVESTOPIA TRADEAI - HOME PAGE
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const navbar = document.getElementById("mainNavbar");

    /* ================= THEME ================= */

    const savedTheme = localStorage.getItem("investopia-theme");

    if (savedTheme === "dark") {
        body.classList.add("dark-theme");
        updateThemeIcon(true);
    }

    themeToggle?.addEventListener("click", () => {
        const darkMode = body.classList.toggle("dark-theme");

        localStorage.setItem(
            "investopia-theme",
            darkMode ? "dark" : "light"
        );

        updateThemeIcon(darkMode);
    });

    function updateThemeIcon(isDark) {
        themeIcon.className = isDark
            ? "bi bi-sun-fill"
            : "bi bi-moon-stars";
    }


    /* ================= NAVBAR SCROLL ================= */

    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            navbar.classList.add("navbar-scrolled");
        } else {
            navbar.classList.remove("navbar-scrolled");
        }
    });


    /* ================= MOBILE NAVBAR ================= */

    const navLinks = document.querySelectorAll(
        "#navbarNav .nav-link"
    );

    const navbarCollapse = document.getElementById("navbarNav");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {

            if (
                window.innerWidth < 992 &&
                navbarCollapse.classList.contains("show")
            ) {
                bootstrap.Collapse
                    .getOrCreateInstance(navbarCollapse)
                    .hide();
            }

        });
    });


    /* ================= SCROLL REVEAL ================= */

    const revealElements = document.querySelectorAll(
        ".feature-card, .quick-card, .ai-card"
    );

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealElements.forEach(element => {
        element.classList.add("reveal");
        observer.observe(element);
    });

});