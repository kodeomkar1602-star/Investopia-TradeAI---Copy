/* =========================================================
   INVESTOPIA TRADEAI - LEARNING
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       SESSION PROTECTION
    ===================================================== */

    const session = await requireAuth();

    if (!session) {
        return;
    }

    listenForAuthChanges();

    const user = session.user;

    console.log("Investopia logged-in user:", user);
    console.log("User ID:", user.id);
    console.log("User Email:", user.email);


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const sidebar =
        document.getElementById("sidebar");

    const sidebarToggle =
        document.getElementById("sidebarToggle");

    const sidebarClose =
        document.getElementById("sidebarClose");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const themeToggle =
        document.getElementById("themeToggle");

    const themeIcon =
        document.getElementById("themeIcon");

    const globalSearch =
        document.getElementById("globalSearch");

    const learningSearch =
        document.getElementById("learningSearch");

    const categoryGrid =
        document.getElementById("categoryGrid");

    const lessonGrid =
        document.getElementById("lessonGrid");

    const resultCount =
        document.getElementById("resultCount");

    const lessons =
        [...document.querySelectorAll(".lesson-card")];


    /* =====================================================
       SIDEBAR
    ===================================================== */

    function openSidebar() {

        sidebar?.classList.add("sidebar-open");

        sidebarOverlay?.classList.add("active");

    }


    function closeSidebar() {

        sidebar?.classList.remove("sidebar-open");

        sidebarOverlay?.classList.remove("active");

    }


    sidebarToggle?.addEventListener(
        "click",
        () => {

            if (
                sidebar?.classList.contains(
                    "sidebar-open"
                )
            ) {

                closeSidebar();

            } else {

                openSidebar();

            }

        }
    );


    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(".sidebar-link")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    if (window.innerWidth <= 991) {
                        closeSidebar();
                    }

                }
            );

        });


    /* =====================================================
       THEME
    ===================================================== */

    function updateThemeIcon() {

        if (!themeIcon) {
            return;
        }

        themeIcon.className =
            document.body.classList.contains(
                "dark-theme"
            )
                ? "bi bi-sun"
                : "bi bi-moon-stars";

    }


    function applyTheme(theme) {

        document.body.classList.toggle(
            "dark-theme",
            theme === "dark"
        );

        localStorage.setItem(
            "investopia-theme",
            theme
        );

        updateThemeIcon();

    }


    if (
        localStorage.getItem(
            "investopia-theme"
        ) === "dark"
    ) {

        document.body.classList.add(
            "dark-theme"
        );

    }


    updateThemeIcon();


    themeToggle?.addEventListener(
        "click",
        () => {

            const dark =
                document.body.classList.contains(
                    "dark-theme"
                );

            applyTheme(
                dark
                    ? "light"
                    : "dark"
            );

        }
    );


    /* =====================================================
       GLOBAL SEARCH
    ===================================================== */

    globalSearch?.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Enter") {
                return;
            }

            const query =
                globalSearch.value.trim();

            if (!query) {
                return;
            }

            window.location.href =
                `../market/market.html?search=${encodeURIComponent(query)}`;

        }
    );


    /* =====================================================
       CTRL + K SEARCH
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                globalSearch?.focus();

            }

        }
    );


    /* =====================================================
       LESSON FILTERING
    ===================================================== */

    let activeCategory = "all";


    function filterLessons() {

        const query =
            learningSearch?.value
                .trim()
                .toLowerCase() || "";

        let visibleCount = 0;


        lessons.forEach((lesson) => {

            const category =
                lesson.dataset.category || "";


            const title = (
                lesson.dataset.title ||
                lesson.textContent
            ).toLowerCase();


            const categoryMatch =
                activeCategory === "all" ||
                category === activeCategory;


            const searchMatch =
                !query ||
                title.includes(query) ||
                category.includes(query);


            const show =
                categoryMatch &&
                searchMatch;


            lesson.classList.toggle(
                "hidden",
                !show
            );


            if (show) {
                visibleCount++;
            }

        });


        if (resultCount) {

            resultCount.textContent =
                `${visibleCount} ${
                    visibleCount === 1
                        ? "lesson"
                        : "lessons"
                }`;

        }

    }


    learningSearch?.addEventListener(
        "input",
        filterLessons
    );


    categoryGrid?.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".category-card"
                );

            if (!button) {
                return;
            }


            document
                .querySelectorAll(
                    ".category-card"
                )
                .forEach((card) => {

                    card.classList.remove(
                        "active"
                    );

                });


            button.classList.add(
                "active"
            );


            activeCategory =
                button.dataset.category ||
                "all";


            filterLessons();

        }
    );


    filterLessons();


    /* =====================================================
       LESSON PROGRESS
    ===================================================== */

    let completedLessons = [];


    try {

        completedLessons =
            JSON.parse(
                localStorage.getItem(
                    "investopia-completed-lessons"
                ) || "[]"
            );


        if (
            !Array.isArray(
                completedLessons
            )
        ) {

            completedLessons = [];

        }

    } catch (error) {

        console.error(
            "Unable to restore lesson progress:",
            error
        );

        completedLessons = [];

    }


    function saveCompletedLesson(title) {

        if (
            !completedLessons.includes(
                title
            )
        ) {

            completedLessons.push(
                title
            );


            localStorage.setItem(
                "investopia-completed-lessons",
                JSON.stringify(
                    completedLessons
                )
            );

        }

    }


    function markCompleted(
        button,
        title
    ) {

        saveCompletedLesson(
            title
        );


        button.innerHTML =
            `Completed <i class="bi bi-check-circle"></i>`;


        button.classList.add(
            "completed"
        );

    }


    function restoreProgress() {

        document
            .querySelectorAll(
                ".lesson-button"
            )
            .forEach((button) => {

                const title =
                    button.dataset.lesson;


                if (
                    title &&
                    completedLessons.includes(
                        title
                    )
                ) {

                    button.innerHTML =
                        `Completed <i class="bi bi-check-circle"></i>`;


                    button.classList.add(
                        "completed"
                    );

                }

            });

    }


    restoreProgress();


    /* =====================================================
       LESSON ACTION
    ===================================================== */

    document
        .querySelectorAll(
            ".lesson-button"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const title =
                        button.dataset.lesson ||
                        "Investment Lesson";


                    markCompleted(
                        button,
                        title
                    );


                    localStorage.setItem(
                        "investopia-current-lesson",
                        JSON.stringify({

                            title: title,

                            openedAt:
                                new Date()
                                    .toISOString()

                        })
                    );


                    alert(
                        `${title}\n\nLesson content can be opened here when the detailed lesson system is added.`
                    );

                }
            );

        });


    /* =====================================================
       AI ADVISOR CONTEXT
    ===================================================== */

    document
        .querySelector(".ai-button")
        ?.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "investopia-learning-context",
                    JSON.stringify({

                        page:
                            "Learning Center",

                        completedLessons:
                            completedLessons,

                        currentLesson:
                            localStorage.getItem(
                                "investopia-current-lesson"
                            ) || null,

                        createdAt:
                            new Date().toISOString()

                    })
                );

            }
        );


    /* =====================================================
       RESPONSIVE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 991
            ) {

                closeSidebar();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    console.log(
        "Investopia Learning initialized successfully."
    );

});