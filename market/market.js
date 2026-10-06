/* =========================================================
   INVESTOPIA TRADEAI - MARKET JS
   Angel One Live Market Integration
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

    console.log(
        "Investopia logged-in user:",
        user
    );


    /* =====================================================
       API CONFIGURATION
    ===================================================== */

    const API_BASE_URL =
        "https://investopia-tradeai-copy.onrender.com";


    /* =====================================================
       USER NAME
    ===================================================== */

    const metadata =
        user.user_metadata || {};

    const userName =
        metadata.full_name ||
        metadata.name ||
        metadata.username ||
        (
            user.email
                ? user.email.split("@")[0]
                : "User"
        );


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

    const assetGrid =
        document.getElementById("assetGrid");

    const gainersBody =
        document.getElementById("gainersBody");

    const losersBody =
        document.getElementById("losersBody");

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const niftyPrice =
        document.getElementById("niftyPrice");

    const niftyChange =
        document.getElementById("niftyChange");

    const sensexPrice =
        document.getElementById("sensexPrice");

    const sensexChange =
        document.getElementById("sensexChange");

    const marketStatus =
        document.getElementById("marketStatus");

    const marketStatusDot =
        document.getElementById("marketStatusDot");

    const profileName =
        document.getElementById("profileName");

    const profileAvatar =
        document.getElementById("profileAvatar");


    /* =====================================================
       PROFILE
    ===================================================== */

    if (profileName) {

        profileName.textContent =
            userName;

    }


    if (profileAvatar) {

        const initials =
            userName
                .trim()
                .split(/\s+/)
                .map(
                    part =>
                        part.charAt(0)
                )
                .join("")
                .slice(0, 2)
                .toUpperCase();


        profileAvatar.textContent =
            initials || "U";

    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    function openSidebar() {

        sidebar?.classList.add(
            "sidebar-open"
        );

        sidebarOverlay?.classList.add(
            "active"
        );

    }


    function closeSidebar() {

        sidebar?.classList.remove(
            "sidebar-open"
        );

        sidebarOverlay?.classList.remove(
            "active"
        );

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
        .forEach(link => {

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

        if (!themeIcon) {
            return;
        }


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
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;

    }


    function formatPrice(value) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return "--";

        }


        return number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    function formatPercent(value) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return null;

        }


        const sign =
            number > 0
                ? "+"
                : "";


        return `${sign}${number.toFixed(2)}%`;

    }


    function getChangeClass(value) {

        const number =
            Number(value);


        if (number > 0) {

            return "positive";

        }


        if (number < 0) {

            return "negative";

        }


        return "";

    }


    function getChangeIcon(value) {

        const number =
            Number(value);


        if (number > 0) {

            return "bi bi-arrow-up";

        }


        if (number < 0) {

            return "bi bi-arrow-down";

        }


        return "bi bi-dash";

    }


    function getTypeLabel(type) {

        const labels = {

            stock: "Stock",

            etf: "ETF",

            "mutual-fund":
                "Mutual Fund",

            index:
                "Index",

            instrument:
                "Instrument"

        };


        return (
            labels[type] ||
            "Instrument"
        );

    }


    function inferInstrumentType(
        symbol,
        name
    ) {

        const text =
            `${symbol} ${name}`
                .toUpperCase();


        if (
            text.includes("ETF") ||
            text.includes("BEES") ||
            text.includes("NIFTYBEES")
        ) {

            return "etf";

        }


        if (
            text.includes("MF") ||
            text.includes("MUTUAL") ||
            text.includes("FUND")
        ) {

            return "mutual-fund";

        }


        return "stock";

    }


    /* =====================================================
       ANGEL ONE SEARCH
    ===================================================== */

    async function searchAngelOneStocks(
        query
    ) {

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


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const result =
                await response.json();


            if (
                !result ||
                !result.success ||
                !Array.isArray(
                    result.data
                )
            ) {

                return [];

            }


            return result.data;

        }

        catch (error) {

            console.error(
                "Angel One search error:",
                error
            );


            return [];

        }

    }


    /* =====================================================
       ANGEL ONE LTP
    ===================================================== */

    async function getStockLTP(
        exchange,
        symbol,
        token
    ) {

        try {

            const url =
                `${API_BASE_URL}/api/stocks/ltp` +
                `?exchange=${encodeURIComponent(exchange)}` +
                `&symbol=${encodeURIComponent(symbol)}` +
                `&token=${encodeURIComponent(token)}`;


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const result =
                await response.json();


            if (
                !result ||
                !result.success
            ) {

                return null;

            }


            return (
                result.data
                    ?.data
                    ?.fetched
                    ?. [0] ||
                null
            );

        }

        catch (error) {

            console.error(
                `LTP error for ${symbol}:`,
                error
            );


            return null;

        }

    }


    /* =====================================================
       ANGEL ONE FULL MARKET DATA
    ===================================================== */

    async function getFullMarketData(
        instruments
    ) {

        if (
            !Array.isArray(
                instruments
            ) ||
            !instruments.length
        ) {

            return [];

        }


        const exchangeTokens = {};


        instruments.forEach(
            instrument => {

                const exchange =
                    instrument.exchange ||
                    "NSE";

                const token =
                    String(
                        instrument.symboltoken
                    );


                if (
                    !exchangeTokens[exchange]
                ) {

                    exchangeTokens[exchange] =
                        [];

                }


                exchangeTokens[
                    exchange
                ].push(token);

            }
        );


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/stocks/market-data`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                mode: "FULL",
                                exchangeTokens
                            })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const result =
                await response.json();


            if (
                !result ||
                !result.success
            ) {

                return [];

            }


            return (
                result.data
                    ?.data
                    ?.fetched ||
                []
            );

        }

        catch (error) {

            console.error(
                "Angel One market data error:",
                error
            );


            return [];

        }

    }


    /* =====================================================
       SEARCH RESULT UI
    ===================================================== */

    function showSearchLoading() {

        if (!searchResults) {
            return;
        }


        searchResults.innerHTML = `

            <div class="search-result">

                <span>
                    Searching Angel One...
                </span>

                <i class="bi bi-arrow-repeat"></i>

            </div>

        `;

    }


    function showSearchError() {

        if (!searchResults) {
            return;
        }


        searchResults.innerHTML = `

            <div class="search-result">

                <span>
                    Unable to search market data.
                    Please try again.
                </span>

                <i class="bi bi-exclamation-circle"></i>

            </div>

        `;

    }


    function showSearchResults(
        query,
        results
    ) {

        if (!searchResults) {
            return;
        }


        searchResults.innerHTML =
            "";


        if (!query.trim()) {
            return;
        }


        if (!results.length) {

            searchResults.innerHTML = `

                <div class="search-result">

                    <span>
                        No matching NSE instrument found.
                    </span>

                    <i class="bi bi-search"></i>

                </div>

            `;

            return;

        }


        results
            .slice(0, 10)
            .forEach(
                stock => {

                    const link =
                        document.createElement(
                            "a"
                        );


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


                    const type =
                        inferInstrumentType(
                            symbol,
                            stock.name ||
                            stock.description ||
                            ""
                        );


                    link.href =
                        `../stock-details/stock-details.html` +
                        `?symbol=${encodeURIComponent(symbol)}` +
                        `&token=${encodeURIComponent(token)}` +
                        `&exchange=${encodeURIComponent(exchange)}`;


                    link.innerHTML = `

                        <div>

                            <strong>
                                ${escapeHTML(symbol)}
                            </strong>

                            <small
                                style="
                                    display:block;
                                    color:var(--muted);
                                    margin-top:3px;
                                ">

                                ${escapeHTML(exchange)}
                                • Token
                                ${escapeHTML(token)}

                            </small>

                        </div>

                        <span
                            style="
                                color:var(--primary);
                                font-size:11px;
                                font-weight:700;
                            ">

                            ${escapeHTML(
                                getTypeLabel(type)
                            )}

                            <i
                                class="bi bi-arrow-right ms-1">
                            </i>

                        </span>

                    `;


                    searchResults.appendChild(
                        link
                    );

                }
            );

    }


    /* =====================================================
       SEARCH STATE
    ===================================================== */

    let searchRequestId = 0;


    /* =====================================================
       PERFORM SEARCH
    ===================================================== */

    async function performSearch(
        input
    ) {

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


        const normalizedQuery =
            query
                .toUpperCase()
                .replace(
                    /-EQ$/,
                    ""
                );


        const exactEquity =
            results.find(
                stock => {

                    const symbol =
                        (
                            stock.tradingsymbol ||
                            ""
                        ).toUpperCase();


                    return (
                        symbol ===
                        `${normalizedQuery}-EQ`
                    );

                }
            );


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


        if (results.length === 1) {

            const stock =
                results[0];


            openStockDetails(
                stock
            );


            return;

        }


        showSearchResults(
            query,
            results
        );

    }


    function openStockDetails(
        stock
    ) {

        if (!stock) {
            return;
        }


        const symbol =
            stock.tradingsymbol ||
            "";


        const token =
            stock.symboltoken ||
            "";


        const exchange =
            stock.exchange ||
            "NSE";


        if (!symbol || !token) {

            return;

        }


        window.location.href =
            `../stock-details/stock-details.html` +
            `?symbol=${encodeURIComponent(symbol)}` +
            `&token=${encodeURIComponent(token)}` +
            `&exchange=${encodeURIComponent(exchange)}`;

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

            if (
                event.key === "Enter"
            ) {

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

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            event.preventDefault();


            const query =
                marketSearch.value.trim();


            if (!query) {

                marketSearch.focus();

                return;

            }


            window.location.href =
                `market.html?search=${encodeURIComponent(
                    query
                )}`;

        }
    );


    /* =====================================================
       URL SEARCH
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
       CTRL + K
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


                assetSearch?.focus();

            }

        }
    );


    /* =====================================================
       LIVE MARKET INSTRUMENTS
    ===================================================== */

    /*
       These are only seed searches.

       The user can search ANY Angel One
       instrument using the search box.

       We are NOT using hardcoded prices.
    */

    const seedSymbols = [
        "TCS",
        "RELIANCE",
        "INFY",
        "HDFCBANK",
        "ITC",
        "SBIN",
        "NIFTYBEES"
    ];


    let liveInstruments = [];


    async function loadSeedInstruments() {

        const results = [];


        for (
            const query of seedSymbols
        ) {

            try {

                const matches =
                    await searchAngelOneStocks(
                        query
                    );


                const cleanQuery =
                    query.toUpperCase();


                const exact =
                    matches.find(
                        stock =>
                            (
                                stock.tradingsymbol ||
                                ""
                            ).toUpperCase() ===
                            `${cleanQuery}-EQ`
                    );


                const selected =
                    exact ||
                    matches[0];


                if (selected) {

                    results.push(
                        selected
                    );

                }

            }

            catch (error) {

                console.error(
                    `Unable to load ${query}:`,
                    error
                );

            }

        }


        /*
           Remove duplicate tokens.
        */

        const unique =
            new Map();


        results.forEach(
            instrument => {

                const key =
                    `${instrument.exchange || "NSE"}:${instrument.symboltoken}`;

                unique.set(
                    key,
                    instrument
                );

            }
        );


        liveInstruments =
            [...unique.values()];

    }


    /* =====================================================
       RENDER LIVE ASSET CARDS
    ===================================================== */

    function renderAssetCards(
        marketData
    ) {

        if (!assetGrid) {
            return;
        }


        if (
            !liveInstruments.length
        ) {

            assetGrid.innerHTML = `

                <div class="col-12">

                    <div class="market-asset-card">

                        <h3>
                            No market instruments available
                        </h3>

                        <p>
                            Use the search box to search
                            Angel One market instruments.
                        </p>

                    </div>

                </div>

            `;

            return;

        }


        const marketMap =
            new Map();


        marketData.forEach(
            data => {

                const key =
                    `${data.exchange}:${data.symbolToken}`;

                marketMap.set(
                    key,
                    data
                );

            }
        );


        assetGrid.innerHTML =
            "";


        liveInstruments
            .forEach(
                instrument => {

                    const exchange =
                        instrument.exchange ||
                        "NSE";


                    const token =
                        String(
                            instrument.symboltoken
                        );


                    const symbol =
                        instrument.tradingsymbol ||
                        "";


                    const name =
                        instrument.name ||
                        instrument.description ||
                        symbol;


                    const type =
                        inferInstrumentType(
                            symbol,
                            name
                        );


                    const data =
                        marketMap.get(
                            `${exchange}:${token}`
                        );


                    const price =
                        data?.ltp;


                    const change =
                        data?.percentChange;


                    const changeText =
                        formatPercent(
                            change
                        );


                    const changeClass =
                        getChangeClass(
                            change
                        );


                    const logo =
                        symbol
                            .replace(
                                /[^A-Z0-9]/gi,
                                ""
                            )
                            .charAt(0)
                            .toUpperCase() ||
                        "I";


                    const column =
                        document.createElement(
                            "div"
                        );


                    column.className =
                        "col-12 col-md-6 col-xl-3 asset-item";


                    column.dataset.type =
                        type;


                    column.dataset.name =
                        `${symbol} ${name}`
                            .toLowerCase();


                    column.innerHTML = `

                        <a
                            href="../stock-details/stock-details.html?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}&exchange=${encodeURIComponent(exchange)}"
                            class="market-asset-card">

                            <div class="asset-card-top">

                                <span class="asset-logo">
                                    ${escapeHTML(logo)}
                                </span>

                                <span class="asset-type">
                                    ${escapeHTML(
                                        getTypeLabel(type)
                                    )}
                                </span>

                            </div>

                            <h3>
                                ${escapeHTML(symbol)}
                            </h3>

                            <p>
                                ${escapeHTML(name)}
                            </p>

                            <div class="asset-price">
                                ${
                                    Number.isFinite(
                                        Number(price)
                                    )
                                        ? `₹${formatPrice(price)}`
                                        : "--"
                                }
                            </div>

                            <span
                                class="${changeClass}">

                                ${
                                    changeText
                                        ? `
                                            <i class="${getChangeIcon(change)}"></i>
                                            ${changeText}
                                          `
                                        : "--"
                                }

                            </span>

                            <div class="asset-card-footer">

                                View Analysis

                                <i class="bi bi-arrow-right"></i>

                            </div>

                        </a>

                    `;


                    assetGrid.appendChild(
                        column
                    );

                }
            );


        applyActiveFilter();

    }


    /* =====================================================
       FILTERS
    ===================================================== */

    let activeFilter =
        "all";


    function applyActiveFilter() {

        document
            .querySelectorAll(
                ".asset-item"
            )
            .forEach(
                item => {

                    const type =
                        item.dataset.type;


                    const show =
                        activeFilter ===
                            "all" ||
                        activeFilter ===
                            type;


                    item.classList.toggle(
                        "d-none",
                        !show
                    );

                }
            );

    }


    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    activeFilter =
                        button.dataset.filter ||
                        "all";


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


                    applyActiveFilter();

                }
            );

        }
    );


    /* =====================================================
       TOP GAINERS / LOSERS
    ===================================================== */

    function renderMovers(
        marketData
    ) {

        const validData =
            marketData
                .filter(
                    item =>
                        Number.isFinite(
                            Number(
                                item.percentChange
                            )
                        )
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        Number(
                            b.percentChange
                        ) -
                        Number(
                            a.percentChange
                        )
                );


        const gainers =
            validData
                .filter(
                    item =>
                        Number(
                            item.percentChange
                        ) > 0
                )
                .slice(0, 5);


        const losers =
            validData
                .filter(
                    item =>
                        Number(
                            item.percentChange
                        ) < 0
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        Number(
                            a.percentChange
                        ) -
                        Number(
                            b.percentChange
                        )
                )
                .slice(0, 5);


        renderMoverTable(
            gainersBody,
            gainers,
            true
        );


        renderMoverTable(
            losersBody,
            losers,
            false
        );

    }


    function renderMoverTable(
        container,
        data,
        positive
    ) {

        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        if (!data.length) {

            container.innerHTML = `

                <tr>

                    <td colspan="3">
                        No live movement data available.
                    </td>

                </tr>

            `;

            return;

        }


        data.forEach(
            item => {

                const symbol =
                    item.tradingSymbol ||
                    "";


                const token =
                    item.symbolToken ||
                    "";


                const exchange =
                    item.exchange ||
                    "NSE";


                const price =
                    item.ltp;


                const change =
                    Number(
                        item.percentChange
                    );


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <a
                            href="../stock-details/stock-details.html?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}&exchange=${encodeURIComponent(exchange)}"
                            class="table-asset">

                            <strong>
                                ${escapeHTML(symbol)}
                            </strong>

                            <small>
                                ${escapeHTML(exchange)}
                            </small>

                        </a>

                    </td>

                    <td>
                        ${
                            Number.isFinite(
                                Number(price)
                            )
                                ? `₹${formatPrice(price)}`
                                : "--"
                        }
                    </td>

                    <td
                        class="${positive ? "positive" : "negative"}">

                        ${
                            formatPercent(
                                change
                            ) || "--"
                        }

                    </td>

                `;


                container.appendChild(
                    row
                );

            }
        );

    }


    /* =====================================================
       MARKET OVERVIEW
    ===================================================== */

    /*
       Angel One search can locate the index instruments.
       We search them dynamically instead of putting fake
       index prices in HTML.
    */

    async function loadIndexData() {

        try {

            const [
                niftyResults,
                sensexResults
            ] =
                await Promise.all([
                    searchAngelOneStocks(
                        "NIFTY"
                    ),
                    searchAngelOneStocks(
                        "SENSEX"
                    )
                ]);


            const nifty =
                niftyResults.find(
                    item =>
                        (
                            item.tradingsymbol ||
                            ""
                        )
                            .toUpperCase()
                            .includes(
                                "NIFTY"
                            )
                );


            const sensex =
                sensexResults.find(
                    item =>
                        (
                            item.tradingsymbol ||
                            ""
                        )
                            .toUpperCase()
                            .includes(
                                "SENSEX"
                            )
                );


            const indexInstruments =
                [
                    nifty,
                    sensex
                ].filter(Boolean);


            if (
                !indexInstruments.length
            ) {

                return;

            }


            const indexData =
                await getFullMarketData(
                    indexInstruments
                );


            const findIndex =
                (
                    symbolText
                ) =>
                    indexData.find(
                        item =>
                            (
                                item.tradingSymbol ||
                                ""
                            )
                                .toUpperCase()
                                .includes(
                                    symbolText
                                )
                    );


            const niftyData =
                findIndex("NIFTY");


            const sensexData =
                findIndex("SENSEX");


            if (niftyData) {

                if (niftyPrice) {

                    niftyPrice.textContent =
                        formatPrice(
                            niftyData.ltp
                        );

                }


                updateChangeElement(
                    niftyChange,
                    niftyData.percentChange
                );

            }


            if (sensexData) {

                if (sensexPrice) {

                    sensexPrice.textContent =
                        formatPrice(
                            sensexData.ltp
                        );

                }


                updateChangeElement(
                    sensexChange,
                    sensexData.percentChange
                );

            }

        }

        catch (error) {

            console.error(
                "Index data error:",
                error
            );

        }

    }


    function updateChangeElement(
        element,
        value
    ) {

        if (!element) {
            return;
        }


        const formatted =
            formatPercent(value);


        element.className =
            getChangeClass(value);


        if (
            formatted === null
        ) {

            element.textContent =
                "--";

            return;

        }


        element.innerHTML = `

            <i class="${getChangeIcon(value)}"></i>

            ${escapeHTML(formatted)}

        `;

    }


    /* =====================================================
       MARKET STATUS
    ===================================================== */

    function updateMarketStatus() {

        if (!marketStatus) {
            return;
        }


        const now =
            new Date();


        /*
           NSE/BSE regular equity trading is
           generally during Indian market hours.
        */

        const indiaTime =
            new Intl.DateTimeFormat(
                "en-IN",
                {
                    timeZone:
                        "Asia/Kolkata",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hour12:
                        false,

                    weekday:
                        "short"

                }
            ).formatToParts(
                now
            );


        const parts = {};


        indiaTime.forEach(
            part => {

                parts[
                    part.type
                ] =
                    part.value;

            }
        );


        const weekday =
            parts.weekday;


        const hour =
            Number(parts.hour);


        const minute =
            Number(parts.minute);


        const totalMinutes =
            hour * 60 +
            minute;


        const weekdayClosed =
            weekday === "Sun" ||
            weekday === "Sat";


        const open =
            !weekdayClosed &&
            totalMinutes >= 555 &&
            totalMinutes <= 930;


        marketStatus.textContent =
            open
                ? "Market Open"
                : "Market Closed";


        if (marketStatusDot) {

            marketStatusDot.style.opacity =
                open
                    ? "1"
                    : "0.45";

        }

    }


    /* =====================================================
       LOAD LIVE MARKET
    ===================================================== */

    async function loadLiveMarket() {

        try {

            await loadSeedInstruments();


            if (
                !liveInstruments.length
            ) {

                return;

            }


            const marketData =
                await getFullMarketData(
                    liveInstruments
                );


            renderAssetCards(
                marketData
            );


            renderMovers(
                marketData
            );


            await loadIndexData();


            updateMarketStatus();

        }

        catch (error) {

            console.error(
                "Unable to load live market:",
                error
            );

        }

    }


    /* =====================================================
       INITIAL MARKET LOAD
    ===================================================== */

    await loadLiveMarket();


    /* =====================================================
       LIVE REFRESH
    ===================================================== */

    /*
       Refresh displayed market data every 60 seconds.
    */

    setInterval(
        async () => {

            if (
                !liveInstruments.length
            ) {

                return;

            }


            const marketData =
                await getFullMarketData(
                    liveInstruments
                );


            renderAssetCards(
                marketData
            );


            renderMovers(
                marketData
            );


            await loadIndexData();


            updateMarketStatus();

        },
        60000
    );


    /* =====================================================
       CLOSE SEARCH RESULTS
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


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateMarketStatus();


    console.log(
        "Investopia Market initialized successfully.",
        {
            userName,
            angelOne: true
        }
    );

});