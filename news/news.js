/* =========================================================
   INVESTOPIA TRADEAI - MARKET NEWS
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

    const newsSearch =
        document.getElementById("newsSearch");

    const newsFilters =
        document.getElementById("newsFilters");

    const newsStatus =
        document.getElementById("newsStatus");

    const marketTrend =
        document.getElementById("marketTrend");

    const indexStatus =
        document.getElementById("indexStatus");

    const newsSentiment =
        document.getElementById("newsSentiment");

    const lastUpdated =
        document.getElementById("lastUpdated");

    const resultCount =
        document.getElementById("resultCount");

    const newsCards =
        [...document.querySelectorAll(".news-card")];

    const latestNews =
        [...document.querySelectorAll(".latest-news")];


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

            sidebar?.classList.contains("sidebar-open")
                ? closeSidebar()
                : openSidebar();

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
            document.body.classList.contains("dark-theme")
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
        localStorage.getItem("investopia-theme") === "dark"
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
                dark ? "light" : "dark"
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
       NEWS FILTERING + SEARCH
    ===================================================== */

    let activeCategory = "all";


    function filterNews() {

        const query =
            newsSearch?.value.trim().toLowerCase() || "";

        let visible = 0;


        newsCards.forEach((card) => {

            const category =
                card.dataset.category || "";

            const title =
                (
                    card.dataset.title ||
                    card.textContent
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


            card.classList.toggle(
                "hidden",
                !show
            );


            if (
                show &&
                card.classList.contains("latest-news")
            ) {

                visible++;

            }

        });


        if (resultCount) {

            resultCount.textContent =
                `${visible} ${
                    visible === 1
                        ? "story"
                        : "stories"
                }`;

        }

    }


    newsSearch?.addEventListener(
        "input",
        filterNews
    );


    newsFilters?.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".filter-button"
                );

            if (!button) {
                return;
            }


            document
                .querySelectorAll(".filter-button")
                .forEach((item) => {

                    item.classList.remove(
                        "active"
                    );

                });


            button.classList.add("active");


            activeCategory =
                button.dataset.category ||
                "all";


            filterNews();

        }
    );


    filterNews();


    /* =====================================================
       DEMO MARKET PULSE
       
       Temporary frontend values.
       Replace with live market API later.
    ===================================================== */

    function loadDemoMarketPulse() {

        if (newsStatus) {
            newsStatus.textContent =
                "Demo data";
        }


        if (marketTrend) {
            marketTrend.textContent =
                "Neutral";
        }


        if (indexStatus) {
            indexStatus.textContent =
                "NIFTY / SENSEX";
        }


        if (newsSentiment) {
            newsSentiment.textContent =
                "Neutral";
        }


        if (lastUpdated) {

            lastUpdated.textContent =
                new Date().toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

        }

    }


    loadDemoMarketPulse();


    /* =====================================================
       NEWS CARD ACTIONS
    ===================================================== */

    document
        .querySelectorAll(".read-news")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const card =
                        button.closest(
                            ".latest-news"
                        );

                    if (!card) {
                        return;
                    }


                    const title =
                        card.querySelector("h4")
                            ?.textContent
                            .trim() ||
                        "Market News";


                    alert(
                        `${title}\n\nLive article links will be available after the news API is connected.`
                    );

                }
            );

        });


    /* =====================================================
       NEWS DATA API PLACEHOLDER
       
       Later, live news can be loaded here.

       Do not put API keys directly into the frontend
       when the project moves to production.
    ===================================================== */

    async function loadLiveNews() {

        /*
            Example future flow:

            const response =
                await fetch("/api/news");

            const data =
                await response.json();

            updateNewsUI(data);
        */

    }


    /* =====================================================
       AI NEWS CONTEXT
       
       Stores the selected news topic so the AI Advisor
       can use it later.
    ===================================================== */

    document
        .querySelector(".ai-button")
        ?.addEventListener(
            "click",
            () => {

                const visibleNews =
                    latestNews

                        .filter(
                            (card) =>
                                !card.classList.contains(
                                    "hidden"
                                )
                        )

                        .slice(0, 3)

                        .map(
                            (card) =>
                                card.querySelector("h4")
                                    ?.textContent
                                    .trim()
                        )

                        .filter(Boolean);


                localStorage.setItem(
                    "investopia-news-context",
                    JSON.stringify({

                        topics: visibleNews,

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

            if (window.innerWidth > 991) {
                closeSidebar();
            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadLiveNews();


    console.log(
        "Investopia News initialized successfully."
    );

});