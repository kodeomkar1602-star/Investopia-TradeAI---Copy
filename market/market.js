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
       API CONFIGURATION
    ===================================================== */

    const API_BASE_URL =
        "https://investopia-tradeai-copy.onrender.com";


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

    const marketSearch =
        document.getElementById("marketSearch");

    const assetSearch =
        document.getElementById("assetSearch");

    const searchButton =
        document.getElementById("searchButton");

    const searchResults =
        document.getElementById("searchResults");

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


    /* Close sidebar after navigation */

    document.querySelectorAll(
        ".sidebar-link"
    ).forEach(link => {

        link.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <= 991
                ) {

                    closeSidebar();

                }

            }
        );

    });


    /* =====================================================
       THEME
    ===================================================== */

    function updateThemeIcon() {

        if (!themeIcon) return;


        const dark =
            document.body.classList.contains(
                "dark-theme"
            );


        themeIcon.className =
            dark
                ? "bi bi-sun"
                : "bi bi-moon-stars";

    }


    function applyTheme(theme) {

        if (theme === "dark") {

            document.body.classList.add(
                "dark-theme"
            );

            localStorage.setItem(
                "investopia-theme",
                "dark"
            );

        } else {

            document.body.classList.remove(
                "dark-theme"
            );

            localStorage.setItem(
                "investopia-theme",
                "light"
            );

        }


        updateThemeIcon();

    }


    /* Load saved theme */

    const savedTheme =
        localStorage.getItem(
            "investopia-theme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-theme"
        );

    }


    updateThemeIcon();


    /* Toggle theme */

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
       EXISTING MARKET ASSET DATA
       
       These are still used for the existing
       filter/card section of the page.

       Search itself now uses Angel One.
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
       SEARCH STATE
    ===================================================== */

    let searchRequestId = 0;


    /* =====================================================
       SEARCH HELPERS
    ===================================================== */

    function getTypeLabel(type) {

        const labels = {

            stock: "Stock",

            etf: "ETF",

            "mutual-fund": "Mutual Fund"

        };


        return labels[type] ||
            "Investment";

    }


    /* =====================================================
       ANGEL ONE STOCK SEARCH
    ===================================================== */

    async function searchAngelOneStocks(query) {

        const cleanQuery =
            query.trim().toUpperCase();


        if (!cleanQuery) {

            return [];

        }


        try {

            const url =
                `${API_BASE_URL}/api/stocks/search` +
                `?search=${encodeURIComponent(cleanQuery)}` +
                `&exchange=NSE`;


            console.log(
                "Searching Angel One:",
                cleanQuery
            );


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const result =
                await response.json();


            console.log(
                "Angel One search response:",
                result
            );


            if (
                !result ||
                !result.success ||
                !Array.isArray(result.data)
            ) {

                return [];

            }


            return result.data;

        }
        catch (error) {

            console.error(
                "Angel One stock search error:",
                error
            );


            return [];

        }

    }


    /* =====================================================
       SHOW SEARCH LOADING
    ===================================================== */

    function showSearchLoading() {

        if (!searchResults) return;


        searchResults.innerHTML = `

            <div class="search-result">

                <span>
                    Searching stocks...
                </span>

                <i class="bi bi-arrow-repeat"></i>

            </div>

        `;

    }


    /* =====================================================
       SHOW SEARCH ERROR
    ===================================================== */

    function showSearchError() {

        if (!searchResults) return;


        searchResults.innerHTML = `

            <div class="search-result">

                <span>
                    Unable to search stocks. Please try again.
                </span>

                <i class="bi bi-exclamation-circle"></i>

            </div>

        `;

    }


    /* =====================================================
       SHOW SEARCH RESULTS
    ===================================================== */

    function showSearchResults(
        query,
        results
    ) {

        if (!searchResults) return;


        searchResults.innerHTML = "";


        if (!query.trim()) {

            return;

        }


        if (!results.length) {

            searchResults.innerHTML = `

                <div class="search-result">

                    <span>
                        No matching NSE stock found.
                    </span>

                    <i class="bi bi-search"></i>

                </div>

            `;

            return;

        }


        results
            .slice(0, 6)
            .forEach(stock => {

                const link =
                    document.createElement("a");


                link.className =
                    "search-result";


                const symbol =
                    stock.tradingsymbol ||
                    "";


                const token =
                    stock.symboltoken ||
                    "";


                const exchange =
                    stock.exchange ||
                    "NSE";


                link.href =
                    `../stock-details/stock-details.html` +
                    `?symbol=${encodeURIComponent(symbol)}` +
                    `&token=${encodeURIComponent(token)}` +
                    `&exchange=${encodeURIComponent(exchange)}`;


                link.innerHTML = `

                    <div>

                        <strong>
                            ${symbol}
                        </strong>

                        <small style="
                            display:block;
                            color:var(--muted);
                            margin-top:3px;
                        ">
                            ${exchange}
                            • Token ${token}
                        </small>

                    </div>

                    <span style="
                        color:var(--primary);
                        font-size:11px;
                        font-weight:700;
                    ">

                        Stock

                        <i class="bi bi-arrow-right ms-1"></i>

                    </span>

                `;


                searchResults.appendChild(
                    link
                );

            });

    }


    /* =====================================================
       PERFORM SEARCH
    ===================================================== */

    async function performSearch(input) {

        const query =
            input?.value.trim();


        if (!query) {

            input?.focus();

            return;

        }


        const currentRequest =
            ++searchRequestId;


        showSearchLoading();


        const results =
            await searchAngelOneStocks(
                query
            );


        /*
            Ignore an older request if the user
            searched again before it finished.
        */

        if (
            currentRequest !==
            searchRequestId
        ) {

            return;

        }


        if (!results.length) {

            showSearchError();

            return;

        }


        /*
            Prefer the normal NSE equity symbol.

            Example:

            RELIANCE
            ↓
            RELIANCE-EQ
        */

        const exactEquity =
            results.find(stock => {

                const symbol =
                    (
                        stock.tradingsymbol ||
                        ""
                    ).toUpperCase();


                return (
                    symbol ===
                    `${query.toUpperCase()}-EQ`
                );

            });


        /*
            If an exact -EQ match exists,
            open Stock Details directly.
        */

        if (exactEquity) {

            const symbol =
                exactEquity.tradingsymbol;

            const token =
                exactEquity.symboltoken;

            const exchange =
                exactEquity.exchange ||
                "NSE";


            window.location.href =
                `../stock-details/stock-details.html` +
                `?symbol=${encodeURIComponent(symbol)}` +
                `&token=${encodeURIComponent(token)}` +
                `&exchange=${encodeURIComponent(exchange)}`;


            return;

        }


        /*
            If there is only one result,
            open it directly.
        */

        if (results.length === 1) {

            const stock =
                results[0];


            const symbol =
                stock.tradingsymbol;

            const token =
                stock.symboltoken;

            const exchange =
                stock.exchange ||
                "NSE";


            window.location.href =
                `../stock-details/stock-details.html` +
                `?symbol=${encodeURIComponent(symbol)}` +
                `&token=${encodeURIComponent(token)}` +
                `&exchange=${encodeURIComponent(exchange)}`;


            return;

        }


        /*
            Otherwise show all matching
            Angel One results.
        */

        showSearchResults(
            query,
            results
        );

    }


    /* =====================================================
       LARGE SEARCH
    ===================================================== */

    assetSearch?.addEventListener(
        "input",
        async () => {

            const query =
                assetSearch.value.trim();


            if (!query) {

                searchResults.innerHTML =
                    "";

                return;

            }


            const currentRequest =
                ++searchRequestId;


            showSearchLoading();


            const results =
                await searchAngelOneStocks(
                    query
                );


            if (
                currentRequest !==
                searchRequestId
            ) {

                return;

            }


            showSearchResults(
                query,
                results
            );

        }
    );


    assetSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                performSearch(
                    assetSearch
                );

            }

        }
    );


    searchButton?.addEventListener(
        "click",
        () => {

            performSearch(
                assetSearch
            );

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


        /*
            Automatically search Angel One
            when the page is opened with
            ?search=...
        */

        const currentRequest =
            ++searchRequestId;


        showSearchLoading();


        const results =
            await searchAngelOneStocks(
                urlSearch
            );


        if (
            currentRequest ===
            searchRequestId
        ) {

            showSearchResults(
                urlSearch,
                results
            );

        }

    }


    /* =====================================================
       SEARCH SHORTCUT
       Ctrl + K / Cmd + K
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                    "k"
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

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const selected =
                        button.dataset.filter;


                    /* Active button */

                    filterButtons.forEach(
                        btn => {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    /* Filter assets */

                    assetItems.forEach(
                        item => {

                            const type =
                                item.dataset.type;


                            const show =
                                selected ===
                                    "all" ||
                                selected ===
                                    type;


                            if (show) {

                                item.classList.remove(
                                    "d-none"
                                );

                            } else {

                                item.classList.add(
                                    "d-none"
                                );

                            }

                        }
                    );

                }
            );

        }
    );


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

                    searchResults.innerHTML =
                        "";

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
                sidebar?.classList.contains(
                    "sidebar-open"
                )
            ) {

                closeSidebar();

            }

        }
    );

});