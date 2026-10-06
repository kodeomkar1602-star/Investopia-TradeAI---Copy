/* =========================================================
   INVESTOPIA TRADEAI - MARKET JS
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

    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarClose = document.getElementById("sidebarClose");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const marketSearch = document.getElementById("marketSearch");
    const assetSearch = document.getElementById("assetSearch");
    const searchButton = document.getElementById("searchButton");
    const searchResults = document.getElementById("searchResults");

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const assetItems =
        document.querySelectorAll(".asset-item");


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


    sidebarToggle?.addEventListener("click", () => {

        if (sidebar?.classList.contains("sidebar-open")) {

            closeSidebar();

        } else {

            openSidebar();

        }

    });


    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    /* Close sidebar after navigation */

    document.querySelectorAll(".sidebar-link").forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 991) {

                closeSidebar();

            }

        });

    });


    /* =====================================================
       THEME
    ===================================================== */

    function updateThemeIcon() {

        if (!themeIcon) return;

        const dark =
            document.body.classList.contains("dark-theme");

        themeIcon.className =
            dark
                ? "bi bi-sun"
                : "bi bi-moon-stars";

    }


    function applyTheme(theme) {

        if (theme === "dark") {

            document.body.classList.add("dark-theme");

            localStorage.setItem(
                "investopia-theme",
                "dark"
            );

        } else {

            document.body.classList.remove("dark-theme");

            localStorage.setItem(
                "investopia-theme",
                "light"
            );

        }

        updateThemeIcon();

    }


    /* Load saved theme */

    const savedTheme =
        localStorage.getItem("investopia-theme");


    if (savedTheme === "dark") {

        document.body.classList.add("dark-theme");

    }


    updateThemeIcon();


    /* Toggle theme */

    themeToggle?.addEventListener(
        "click",
        () => {

            const dark =
                document.body.classList.contains("dark-theme");

            applyTheme(
                dark ? "light" : "dark"
            );

        }
    );


    /* =====================================================
       DEMO ASSET DATA
       
       Later:
       Replace this with Node.js/Express API.

       Example:
       GET /api/search?q=TCS
    ===================================================== */

    const assets = [

        {
            symbol: "TCS",
            name: "Tata Consultancy Services",
            type: "stock"
        },

        {
            symbol: "RELIANCE",
            name: "Reliance Industries",
            type: "stock"
        },

        {
            symbol: "INFY",
            name: "Infosys",
            type: "stock"
        },

        {
            symbol: "HDFCBANK",
            name: "HDFC Bank",
            type: "stock"
        },

        {
            symbol: "ITC",
            name: "ITC Limited",
            type: "stock"
        },

        {
            symbol: "SBIN",
            name: "State Bank of India",
            type: "stock"
        },

        {
            symbol: "NIFTYBEES",
            name: "Nippon India ETF Nifty BeES",
            type: "etf"
        },

        {
            symbol: "PPFAS",
            name: "Parag Parikh Flexi Cap Fund",
            type: "mutual-fund"
        }

    ];


    /* =====================================================
       SEARCH HELPERS
    ===================================================== */

    function getTypeLabel(type) {

        const labels = {

            stock: "Stock",

            etf: "ETF",

            "mutual-fund": "Mutual Fund"

        };

        return labels[type] || "Investment";

    }


    function searchAssets(query) {

        const value =
            query.trim().toLowerCase();

        if (!value) return [];


        return assets.filter(asset =>

            asset.symbol
                .toLowerCase()
                .includes(value)

            ||

            asset.name
                .toLowerCase()
                .includes(value)

        );

    }


    /* =====================================================
       SHOW SEARCH RESULTS
    ===================================================== */

    function showSearchResults(query) {

        if (!searchResults) return;


        const results =
            searchAssets(query);


        searchResults.innerHTML = "";


        if (!query.trim()) {

            return;

        }


        if (!results.length) {

            searchResults.innerHTML = `

                <div class="search-result">

                    <span>
                        No matching investment found.
                    </span>

                    <i class="bi bi-search"></i>

                </div>

            `;

            return;

        }


        results.slice(0, 6).forEach(asset => {

            const link =
                document.createElement("a");


            link.className =
                "search-result";


            link.href =
                `../stock-details/stock-details.html?symbol=${encodeURIComponent(asset.symbol)}`;


            link.innerHTML = `

                <div>

                    <strong>
                        ${asset.symbol}
                    </strong>

                    <small style="
                        display:block;
                        color:var(--muted);
                        margin-top:3px;
                    ">
                        ${asset.name}
                    </small>

                </div>

                <span style="
                    color:var(--primary);
                    font-size:11px;
                    font-weight:700;
                ">
                    ${getTypeLabel(asset.type)}
                    <i class="bi bi-arrow-right ms-1"></i>
                </span>

            `;


            searchResults.appendChild(link);

        });

    }


    /* =====================================================
       PERFORM SEARCH
    ===================================================== */

    function performSearch(input) {

        const query =
            input?.value.trim();

        if (!query) {

            input?.focus();

            return;

        }


        const results =
            searchAssets(query);


        /*
            Demo behavior:

            If an exact match exists,
            open its Stock Details page.

            Later Node.js/Express will handle:
            /api/search?q=query
        */

        const exact =
            results.find(asset =>
                asset.symbol.toLowerCase() ===
                query.toLowerCase()
            );


        if (exact) {

            window.location.href =
                `../stock-details/stock-details.html?symbol=${encodeURIComponent(exact.symbol)}`;

            return;

        }


        /* Show results for partial search */

        showSearchResults(query);

    }


    /* =====================================================
       LARGE SEARCH
    ===================================================== */

    assetSearch?.addEventListener(
        "input",
        () => {

            showSearchResults(
                assetSearch.value
            );

        }
    );


    assetSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                performSearch(assetSearch);

            }

        }
    );


    searchButton?.addEventListener(
        "click",
        () => {

            performSearch(assetSearch);

        }
    );


    /* =====================================================
       HEADER SEARCH
    ===================================================== */

    marketSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Enter") return;

            event.preventDefault();

            const query =
                marketSearch.value.trim();

            if (!query) {

                marketSearch.focus();

                return;

            }


            window.location.href =
                `market.html?search=${encodeURIComponent(query)}`;

        }
    );


    /* =====================================================
       LOAD SEARCH FROM URL

       Example:
       market.html?search=TCS
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlSearch =
        params.get("search");


    if (urlSearch) {

        if (marketSearch) {

            marketSearch.value =
                urlSearch;

        }

        if (assetSearch) {

            assetSearch.value =
                urlSearch;

        }

        showSearchResults(urlSearch);

    }


    /* =====================================================
       SEARCH SHORTCUT
       Ctrl + K / Cmd + K
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                /*
                    Prefer large search on market page.
                */

                if (assetSearch) {

                    assetSearch.focus();

                } else {

                    marketSearch?.focus();

                }

            }

        }
    );


    /* =====================================================
       FILTERS
    ===================================================== */

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const selected =
                    button.dataset.filter;


                /* Active button */

                filterButtons.forEach(btn => {

                    btn.classList.remove("active");

                });

                button.classList.add("active");


                /* Filter assets */

                assetItems.forEach(item => {

                    const type =
                        item.dataset.type;


                    const show =
                        selected === "all" ||
                        selected === type;


                    if (show) {

                        item.classList.remove("d-none");

                    } else {

                        item.classList.add("d-none");

                    }

                });

            }
        );

    });


    /* =====================================================
       CLOSE SEARCH RESULTS
       When clicking elsewhere
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const insideSearch =
                event.target.closest(
                    ".market-search-card"
                );


            if (!insideSearch) {

                if (searchResults) {

                    searchResults.innerHTML = "";

                }

            }

        }
    );


    /* =====================================================
       RESPONSIVE SIDEBAR
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 991 &&
                sidebar?.classList.contains("sidebar-open")
            ) {

                closeSidebar();

            }

        }
    );

});