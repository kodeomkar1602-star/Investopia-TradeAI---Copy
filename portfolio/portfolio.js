/* =========================================================
   INVESTOPIA TRADEAI - PORTFOLIO
   Live Angel One market prices + virtual portfolio
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

    console.log(
        "User ID:",
        user.id
    );

    console.log(
        "User Email:",
        user.email
    );


    /* =====================================================
       API
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

    const portfolioSearch =
        document.getElementById("portfolioSearch");

    const performancePeriod =
        document.getElementById("performancePeriod");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profileName =
        document.getElementById("profileName");

    const holdingsBody =
        document.getElementById("holdingsBody");

    const emptyPortfolio =
        document.getElementById("emptyPortfolio");

    const performanceMessage =
        document.getElementById("performanceMessage");

    const transactionList =
        document.getElementById("transactionList");


    /* =====================================================
       USER
    ===================================================== */

    function getUserName() {

        const metadata =
            user?.user_metadata || {};

        return (
            metadata.full_name ||
            metadata.name ||
            metadata.username ||
            user?.email?.split("@")[0] ||
            "User"
        );

    }


    function getInitials(name) {

        const words =
            String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!words.length) {
            return "U";
        }


        if (words.length === 1) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();

    }


    const userName =
        getUserName();


    if (profileName) {

        profileName.textContent =
            userName;

    }


    if (profileAvatar) {

        profileAvatar.textContent =
            getInitials(userName);

    }


    /* =====================================================
       USER-SPECIFIC STORAGE
    ===================================================== */

    const userCashKey =
        `investopiaVirtualCash-${user.id}`;

    const userHoldingsKey =
        `investopiaHoldings-${user.id}`;

    const transactionKeys = [

        `investopiaTransactions-${user.id}`,

        `investopiaTransactions`,

        `investopiaVirtualTransactions`

    ];


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

            sidebar?.classList.contains(
                "sidebar-open"
            )
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


        createPerformanceChart(
            performancePeriod?.value || "6M"
        );


        createAllocationChart();

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

    portfolioSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            const query =
                portfolioSearch.value.trim();


            if (!query) {
                return;
            }


            window.location.href =
                `../market/market.html?search=${encodeURIComponent(query)}`;

        }
    );


    /* =====================================================
       CTRL + K
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                portfolioSearch?.focus();

            }

        }
    );


    /* =====================================================
       FORMATTERS
    ===================================================== */

    function formatMoney(value) {

        const number =
            Number(value) || 0;


        return `₹${number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    }


    function formatInteger(value) {

        const number =
            Number(value) || 0;


        return number.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 4
            }
        );

    }


    function formatPercent(value) {

        const number =
            Number(value) || 0;


        return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function getPnLClass(value) {

        return Number(value) >= 0
            ? "positive"
            : "negative";

    }


    /* =====================================================
       VIRTUAL CASH
       
       We support the original project key as a fallback
       so existing paper-trading data isn't lost.
    ===================================================== */

    function getVirtualCash() {

        const keys = [

            userCashKey,

            "investopiaVirtualCash"

        ];


        for (const key of keys) {

            const raw =
                localStorage.getItem(key);


            if (raw === null) {
                continue;
            }


            const value =
                Number(
                    String(raw)
                        .replace(/,/g, "")
                        .replace(/[₹$]/g, "")
                );


            if (
                Number.isFinite(value) &&
                value >= 0
            ) {

                return value;

            }

        }


        /*
            New paper-trading users receive the same
            starting virtual balance used by the existing
            project.
        */

        return 100000;

    }


    /* =====================================================
       HOLDINGS STORAGE
    ===================================================== */

    function loadRawHoldings() {

        const keys = [

            userHoldingsKey,

            "investopiaHoldings"

        ];


        for (const key of keys) {

            const raw =
                localStorage.getItem(key);


            if (!raw) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(raw);


                if (parsed) {

                    return parsed;

                }

            } catch (error) {

                console.error(
                    "Could not parse holdings:",
                    error
                );

            }

        }


        return {};

    }


    /* =====================================================
       NORMALIZE HOLDINGS
       
       Supports several formats so the portfolio remains
       compatible with the existing paper-trading pages.

       Example:

       {
           "TCS": 5
       }

       or:

       {
           "TCS": {
               quantity: 5,
               avgPrice: 3250,
               exchange: "NSE",
               token: "11536"
           }
       }
    ===================================================== */

    function normalizeHoldings(rawHoldings) {

        const normalized = [];


        if (
            !rawHoldings ||
            typeof rawHoldings !== "object"
        ) {

            return normalized;

        }


        const entries =
            Array.isArray(rawHoldings)

                ? rawHoldings.map(
                    item => [
                        item.symbol ||
                        item.tradingSymbol ||
                        item.name,
                        item
                    ]
                )

                : Object.entries(
                    rawHoldings
                );


        entries.forEach(
            ([rawSymbol, rawHolding]) => {

                if (!rawSymbol) {
                    return;
                }


                let symbol =
                    String(rawSymbol)
                        .trim()
                        .toUpperCase();


                let quantity = 0;

                let avgPrice = 0;

                let exchange =
                    "NSE";

                let token = "";


                if (
                    typeof rawHolding === "number" ||
                    typeof rawHolding === "string"
                ) {

                    quantity =
                        Number(rawHolding);

                } else if (
                    rawHolding &&
                    typeof rawHolding === "object"
                ) {

                    quantity =
                        Number(
                            rawHolding.quantity ??
                            rawHolding.qty ??
                            rawHolding.units ??
                            rawHolding.holdingQuantity ??
                            0
                        );


                    avgPrice =
                        Number(
                            rawHolding.avgPrice ??
                            rawHolding.averagePrice ??
                            rawHolding.buyPrice ??
                            rawHolding.purchasePrice ??
                            0
                        );


                    exchange =
                        String(
                            rawHolding.exchange ??
                            "NSE"
                        ).toUpperCase();


                    token =
                        String(
                            rawHolding.token ??
                            rawHolding.symbolToken ??
                            rawHolding.symboltoken ??
                            ""
                        );

                }


                if (
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {

                    return;

                }


                if (
                    !Number.isFinite(avgPrice) ||
                    avgPrice < 0
                ) {

                    avgPrice = 0;

                }


                normalized.push({

                    symbol,

                    quantity,

                    avgPrice,

                    exchange,

                    token

                });

            }
        );


        return normalized;

    }


    let holdings =
        normalizeHoldings(
            loadRawHoldings()
        );


    /* =====================================================
       ANGEL ONE SEARCH
    ===================================================== */

    async function searchAngelOne(
        query,
        exchange = "NSE"
    ) {

        try {

            const url =
                `${API_BASE_URL}/api/stocks/search?search=${encodeURIComponent(
                    query
                )}&exchange=${encodeURIComponent(
                    exchange
                )}`;


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Search failed: ${response.status}`
                );

            }


            const result =
                await response.json();


            if (
                !result.success ||
                !Array.isArray(result.data)
            ) {

                return [];

            }


            return result.data;

        } catch (error) {

            console.error(
                `Angel One search failed for ${query}:`,
                error
            );


            return [];

        }

    }


    /* =====================================================
       RESOLVE INSTRUMENT
    ===================================================== */

    async function resolveInstrument(
        holding
    ) {

        if (
            holding.token &&
            holding.exchange
        ) {

            return {

                ...holding,

                token:
                    String(
                        holding.token
                    )

            };

        }


        const results =
            await searchAngelOne(
                holding.symbol,
                holding.exchange || "NSE"
            );


        if (!results.length) {

            return holding;

        }


        const exactEQ =
            results.find(
                item =>
                    String(
                        item.tradingsymbol ||
                        item.symbol ||
                        ""
                    ).toUpperCase() ===
                    `${holding.symbol}-EQ`
            );


        const exactSymbol =
            results.find(
                item =>
                    String(
                        item.tradingsymbol ||
                        item.symbol ||
                        ""
                    ).toUpperCase() ===
                    holding.symbol
            );


        const selected =
            exactEQ ||
            exactSymbol ||
            results[0];


        return {

            ...holding,

            symbol:
                String(
                    selected.tradingsymbol ||
                    selected.symbol ||
                    holding.symbol
                ).toUpperCase(),

            exchange:
                String(
                    selected.exchange ||
                    holding.exchange ||
                    "NSE"
                ).toUpperCase(),

            token:
                String(
                    selected.symboltoken ||
                    selected.token ||
                    holding.token ||
                    ""
                ),

            company:
                selected.name ||
                selected.companyName ||
                holding.company ||
                ""

        };

    }


    /* =====================================================
       ANGEL ONE LTP
    ===================================================== */

    async function getLTP(
        holding
    ) {

        if (
            !holding.token ||
            !holding.exchange
        ) {

            return null;

        }


        try {

            const params =
                new URLSearchParams({

                    exchange:
                        holding.exchange,

                    symbol:
                        holding.symbol,

                    token:
                        holding.token

                });


            const response =
                await fetch(
                    `${API_BASE_URL}/api/stocks/ltp?${params.toString()}`
                );


            if (!response.ok) {

                throw new Error(
                    `LTP request failed: ${response.status}`
                );

            }


            const result =
                await response.json();


            if (
                !result.success
            ) {

                return null;

            }


            const data =
                result.data;


            const ltp =
                Number(
                    data?.ltp ??
                    data?.data?.ltp ??
                    data?.data?.data?.ltp ??
                    data?.data?.fetched?.[0]?.ltp ??
                    0
                );


            if (
                !Number.isFinite(ltp) ||
                ltp <= 0
            ) {

                return null;

            }


            const close =
                Number(
                    data?.close ??
                    data?.data?.close ??
                    data?.data?.data?.close ??
                    0
                );


            return {

                ltp,

                close:
                    Number.isFinite(close) &&
                    close > 0
                        ? close
                        : null

            };

        } catch (error) {

            console.error(
                `Could not get LTP for ${holding.symbol}:`,
                error
            );


            return null;

        }

    }


    /* =====================================================
       LOAD LIVE HOLDINGS
    ===================================================== */

    async function loadLiveHoldings() {

        holdings =
            normalizeHoldings(
                loadRawHoldings()
            );


        if (!holdings.length) {

            return [];

        }


        const resolved =
            await Promise.all(
                holdings.map(
                    holding =>
                        resolveInstrument(
                            holding
                        )
                )
            );


        const live =
            await Promise.all(
                resolved.map(
                    async holding => {

                        const market =
                            await getLTP(
                                holding
                            );


                        const currentPrice =
                            market?.ltp ||
                            0;


                        const quantity =
                            holding.quantity;


                        const avgPrice =
                            holding.avgPrice;


                        const invested =
                            avgPrice > 0
                                ? avgPrice * quantity
                                : 0;


                        const currentValue =
                            currentPrice > 0
                                ? currentPrice * quantity
                                : 0;


                        const pnl =
                            invested > 0
                                ? currentValue - invested
                                : 0;


                        const pnlPercent =
                            invested > 0
                                ? (
                                    pnl /
                                    invested
                                ) * 100
                                : 0;


                        return {

                            ...holding,

                            currentPrice,

                            invested,

                            currentValue,

                            pnl,

                            pnlPercent,

                            previousClose:
                                market?.close ||
                                null

                        };

                    }
                )
            );


        return live;

    }


    /* =====================================================
       PORTFOLIO DATA
    ===================================================== */

    let liveHoldings = [];


    function getPortfolioData() {

        const cash =
            getVirtualCash();


        let invested = 0;

        let currentHoldingsValue = 0;

        let totalPnL = 0;


        liveHoldings.forEach(
            holding => {

                invested +=
                    holding.invested || 0;


                currentHoldingsValue +=
                    holding.currentValue || 0;


                totalPnL +=
                    holding.pnl || 0;

            }
        );


        /*
            If an old holding does not have avgPrice,
            its cost basis is unknown.

            We don't invent one.

            Current market value can still be displayed.
        */

        const total =
            cash +
            currentHoldingsValue;


        const pnlPercent =
            invested > 0
                ? (
                    totalPnL /
                    invested
                ) * 100
                : 0;


        return {

            cash,

            invested,

            currentHoldingsValue,

            total,

            totalPnL,

            pnlPercent,

            assetCount:
                liveHoldings.length

        };

    }


    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    function updateSummary() {

        const data =
            getPortfolioData();


        const portfolioValue =
            document.getElementById(
                "portfolioValue"
            );


        const availableCash =
            document.getElementById(
                "availableCash"
            );


        const investedAmount =
            document.getElementById(
                "investedAmount"
            );


        const totalProfit =
            document.getElementById(
                "totalProfit"
            );


        const portfolioReturn =
            document.getElementById(
                "portfolioReturn"
            );


        const assetCount =
            document.getElementById(
                "assetCount"
            );


        if (portfolioValue) {

            portfolioValue.textContent =
                formatMoney(
                    data.total
                );

        }


        if (availableCash) {

            availableCash.textContent =
                formatMoney(
                    data.cash
                );

        }


        if (investedAmount) {

            investedAmount.textContent =
                formatMoney(
                    data.invested
                );

        }


        if (totalProfit) {

            totalProfit.textContent =
                `${data.totalPnL >= 0 ? "+" : ""}${formatMoney(
                    data.totalPnL
                )}`;

            totalProfit.classList.toggle(
                "positive",
                data.totalPnL >= 0
            );

            totalProfit.classList.toggle(
                "negative",
                data.totalPnL < 0
            );

        }


        if (portfolioReturn) {

            const icon =
                data.totalPnL >= 0
                    ? "bi-arrow-up"
                    : "bi-arrow-down";


            portfolioReturn.innerHTML = `

                <i class="bi ${icon}"></i>

                ${data.totalPnL >= 0 ? "+" : ""}
                ${formatMoney(data.totalPnL)}
                (${formatPercent(data.pnlPercent)})

            `;


            portfolioReturn.classList.toggle(
                "positive",
                data.totalPnL >= 0
            );


            portfolioReturn.classList.toggle(
                "negative",
                data.totalPnL < 0
            );

        }


        if (assetCount) {

            assetCount.textContent =
                `Across ${data.assetCount} ${
                    data.assetCount === 1
                        ? "asset"
                        : "assets"
                }`;

        }


        updateAllocation();

    }


    /* =====================================================
       HOLDINGS TABLE
    ===================================================== */

    function updateHoldingsTable() {

        if (!holdingsBody) {
            return;
        }


        holdingsBody.innerHTML = "";


        if (!liveHoldings.length) {

            if (emptyPortfolio) {

                emptyPortfolio.style.display =
                    "block";

            }

            return;

        }


        if (emptyPortfolio) {

            emptyPortfolio.style.display =
                "none";

        }


        liveHoldings.forEach(
            holding => {

                const symbol =
                    String(
                        holding.symbol
                    )
                    .replace(
                        /-EQ$/i,
                        ""
                    );


                const displayName =
                    holding.company ||
                    symbol;


                const logo =
                    symbol
                        .charAt(0)
                        .toUpperCase();


                const currentPrice =
                    holding.currentPrice;


                const invested =
                    holding.invested;


                const currentValue =
                    holding.currentValue;


                const pnl =
                    holding.pnl;


                const hasCostBasis =
                    holding.avgPrice > 0;


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <a
                            href="../stock-details/stock-details.html?symbol=${encodeURIComponent(
                                holding.symbol
                            )}&token=${encodeURIComponent(
                                holding.token
                            )}&exchange=${encodeURIComponent(
                                holding.exchange
                            )}"
                            class="holding-name">

                            <span class="holding-logo">
                                ${escapeHTML(logo)}
                            </span>

                            <span>

                                <strong>
                                    ${escapeHTML(symbol)}
                                </strong>

                                <small>
                                    ${escapeHTML(displayName)}
                                </small>

                            </span>

                        </a>

                    </td>


                    <td>
                        ${formatInteger(
                            holding.quantity
                        )}
                    </td>


                    <td>
                        ${
                            hasCostBasis
                                ? formatMoney(
                                    holding.avgPrice
                                )
                                : "Not available"
                        }
                    </td>


                    <td>

                        ${
                            currentPrice > 0
                                ? formatMoney(
                                    currentPrice
                                )
                                : "Unavailable"
                        }

                    </td>


                    <td>

                        ${
                            hasCostBasis
                                ? formatMoney(
                                    invested
                                )
                                : "Not available"
                        }

                    </td>


                    <td class="${
                        hasCostBasis
                            ? getPnLClass(pnl)
                            : ""
                    }">

                        ${
                            hasCostBasis
                                ? `${
                                    pnl >= 0
                                        ? "+"
                                        : ""
                                }${formatMoney(pnl)}`
                                : "Not available"
                        }

                    </td>


                    <td>

                        <a
                            href="../stock-details/stock-details.html?symbol=${encodeURIComponent(
                                holding.symbol
                            )}&token=${encodeURIComponent(
                                holding.token
                            )}&exchange=${encodeURIComponent(
                                holding.exchange
                            )}"
                            class="view-btn">

                            View

                        </a>

                    </td>

                `;


                holdingsBody.appendChild(
                    row
                );

            }
        );

    }


    /* =====================================================
       ALLOCATION
    ===================================================== */

    function getAllocationData() {

        const data =
            getPortfolioData();


        let stocks =
            0;

        let funds =
            0;


        liveHoldings.forEach(
            holding => {

                const symbol =
                    String(
                        holding.symbol
                    )
                    .toUpperCase();


                const value =
                    holding.currentValue ||
                    0;


                /*
                    PPFAS was previously treated as a mutual
                    fund in this project.

                    NIFTYBEES is an ETF and is counted with
                    stocks/ETFs.
                */

                if (
                    symbol.includes("PPFAS")
                ) {

                    funds += value;

                } else {

                    stocks += value;

                }

            }
        );


        const total =
            data.total || 0;


        const stocksPercent =
            total > 0
                ? Math.round(
                    (stocks / total) * 100
                )
                : 0;


        const fundsPercent =
            total > 0
                ? Math.round(
                    (funds / total) * 100
                )
                : 0;


        const cashPercent =
            Math.max(
                0,
                100 -
                stocksPercent -
                fundsPercent
            );


        return {

            stocks,

            funds,

            cash:
                data.cash,

            stocksPercent,

            fundsPercent,

            cashPercent

        };

    }


    function updateAllocation() {

        const allocation =
            getAllocationData();


        const legend =
            document.getElementById(
                "allocationLegend"
            );


        if (legend) {

            legend.innerHTML = `

                <div>

                    <span>

                        <i class="legend-dot stocks"></i>

                        Stocks / ETFs

                    </span>

                    <strong>
                        ${allocation.stocksPercent}%
                    </strong>

                </div>


                <div>

                    <span>

                        <i class="legend-dot funds"></i>

                        Mutual Funds

                    </span>

                    <strong>
                        ${allocation.fundsPercent}%
                    </strong>

                </div>


                <div>

                    <span>

                        <i class="legend-dot cash"></i>

                        Cash

                    </span>

                    <strong>
                        ${allocation.cashPercent}%
                    </strong>

                </div>

            `;

        }


        const center =
            document.getElementById(
                "allocationCenter"
            );


        if (center) {

            center.textContent =
                formatMoney(
                    getPortfolioData()
                        .currentHoldingsValue
                );

        }


        createAllocationChart(
            allocation.stocksPercent,
            allocation.fundsPercent,
            allocation.cashPercent
        );

    }


    /* =====================================================
       PERFORMANCE CHART
       
       IMPORTANT:
       We do NOT generate fake historical values.

       Historical chart data can only be displayed after
       actual portfolio snapshots/transactions are stored.
    ===================================================== */

    let performanceChart = null;


    function createPerformanceChart(
        period = "6M"
    ) {

        const canvas =
            document.getElementById(
                "portfolioChart"
            );


        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {

            return;

        }


        if (performanceChart) {

            performanceChart.destroy();

            performanceChart =
                null;

        }


        const context =
            canvas.getContext("2d");


        const dark =
            document.body.classList.contains(
                "dark-theme"
            );


        const text =
            dark
                ? "#9aa99f"
                : "#6b786f";


        const grid =
            dark
                ? "#1b3324"
                : "#e2e9e4";


        /*
            Search for real portfolio history.

            This supports future historical snapshots
            without inventing data today.
        */

        let history = [];


        const historyKeys = [

            `investopiaPortfolioHistory-${user.id}`,

            "investopiaPortfolioHistory"

        ];


        for (
            const key of historyKeys
        ) {

            const raw =
                localStorage.getItem(key);


            if (!raw) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(raw);


                if (
                    Array.isArray(parsed) &&
                    parsed.length > 1
                ) {

                    history =
                        parsed;

                    break;

                }

            } catch (error) {

                console.warn(
                    "Invalid portfolio history:",
                    error
                );

            }

        }


        if (history.length < 2) {

            if (performanceMessage) {

                performanceMessage.textContent =
                    "Historical portfolio data is not available yet. The chart will populate after actual portfolio snapshots are recorded.";

            }


            return;

        }


        if (performanceMessage) {

            performanceMessage.textContent =
                "Showing recorded portfolio history.";

        }


        const labels =
            history.map(
                item =>
                    new Date(
                        item.timestamp ||
                        item.date
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short"
                        }
                    )
            );


        const values =
            history.map(
                item =>
                    Number(
                        item.value ??
                        item.portfolioValue ??
                        item.total ??
                        0
                    )
            );


        const valid =
            values.every(
                value =>
                    Number.isFinite(value)
            );


        if (!valid) {

            if (performanceMessage) {

                performanceMessage.textContent =
                    "Portfolio history contains invalid values.";

            }

            return;

        }


        performanceChart =
            new Chart(
                context,
                {

                    type: "line",

                    data: {

                        labels,

                        datasets: [

                            {

                                data: values,

                                borderColor:
                                    "#16a34a",

                                backgroundColor:
                                    "rgba(22,163,74,.12)",

                                borderWidth:
                                    2.5,

                                fill:
                                    true,

                                tension:
                                    0.35,

                                pointRadius:
                                    0,

                                pointHoverRadius:
                                    5

                            }

                        ]

                    },


                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,


                        interaction: {

                            intersect:
                                false,

                            mode:
                                "index"

                        },


                        plugins: {

                            legend: {

                                display:
                                    false

                            },


                            tooltip: {

                                backgroundColor:
                                    dark
                                        ? "#102419"
                                        : "#17231c",

                                displayColors:
                                    false,

                                callbacks: {

                                    label:
                                        context =>
                                            ` ₹${Number(
                                                context.parsed.y
                                            ).toLocaleString(
                                                "en-IN"
                                            )}`

                                }

                            }

                        },


                        scales: {

                            x: {

                                grid: {

                                    display:
                                        false

                                },

                                border: {

                                    display:
                                        false

                                },

                                ticks: {

                                    color:
                                        text

                                }

                            },


                            y: {

                                grid: {

                                    color:
                                        grid

                                },

                                border: {

                                    display:
                                        false

                                },

                                ticks: {

                                    color:
                                        text,

                                    callback:
                                        value =>
                                            `₹${Number(
                                                value
                                            ).toLocaleString(
                                                "en-IN"
                                            )}`

                                }

                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       ALLOCATION CHART
    ===================================================== */

    let allocationChart = null;


    function createAllocationChart(
        stocks = 0,
        funds = 0,
        cash = 0
    ) {

        const canvas =
            document.getElementById(
                "allocationChart"
            );


        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {

            return;

        }


        if (allocationChart) {

            allocationChart.destroy();

        }


        const dark =
            document.body.classList.contains(
                "dark-theme"
            );


        allocationChart =
            new Chart(
                canvas.getContext("2d"),
                {

                    type: "doughnut",


                    data: {

                        labels: [

                            "Stocks / ETFs",

                            "Mutual Funds",

                            "Cash"

                        ],


                        datasets: [

                            {

                                data: [

                                    stocks,

                                    funds,

                                    cash

                                ],


                                backgroundColor: [

                                    "#16a34a",

                                    "#60a5fa",

                                    "#a3a3a3"

                                ],


                                borderWidth:
                                    0

                            }

                        ]

                    },


                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        cutout:
                            "72%",


                        plugins: {

                            legend: {

                                display:
                                    false

                            },


                            tooltip: {

                                backgroundColor:
                                    dark
                                        ? "#102419"
                                        : "#17231c",


                                callbacks: {

                                    label:
                                        context =>
                                            ` ${context.label}: ${context.raw}%`

                                }

                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       RISK ANALYSIS
    ===================================================== */

    function updateRiskAnalysis() {

        const data =
            getPortfolioData();


        const riskLevel =
            document.getElementById(
                "riskLevel"
            );


        const sectorRisk =
            document.getElementById(
                "sectorRisk"
            );


        const diversificationRisk =
            document.getElementById(
                "diversificationRisk"
            );


        const cashRisk =
            document.getElementById(
                "cashRisk"
            );


        const volatilityRisk =
            document.getElementById(
                "volatilityRisk"
            );


        if (!liveHoldings.length) {

            if (riskLevel) {
                riskLevel.textContent =
                    "Not available";
            }

            if (sectorRisk) {
                sectorRisk.textContent =
                    "Not available";
            }

            if (diversificationRisk) {
                diversificationRisk.textContent =
                    "Not available";
            }

            if (cashRisk) {
                cashRisk.textContent =
                    "Not available";
            }

            if (volatilityRisk) {
                volatilityRisk.textContent =
                    "Not available";
            }

            return;

        }


        const allocation =
            getAllocationData();


        const assetCount =
            liveHoldings.length;


        let diversification =
            "Good";


        if (assetCount === 1) {

            diversification =
                "Low";

        } else if (assetCount === 2) {

            diversification =
                "Moderate";

        }


        let cashPosition =
            "Healthy";


        if (
            allocation.cashPercent < 10
        ) {

            cashPosition =
                "Low";

        } else if (
            allocation.cashPercent > 50
        ) {

            cashPosition =
                "High";

        }


        let concentration =
            "Low";


        const largestHolding =
            liveHoldings.reduce(
                (largest, holding) =>
                    Math.max(
                        largest,
                        holding.currentValue || 0
                    ),
                0
            );


        const totalInvested =
            data.currentHoldingsValue;


        const concentrationPercent =
            totalInvested > 0
                ? (
                    largestHolding /
                    totalInvested
                ) * 100
                : 0;


        if (
            concentrationPercent >= 70
        ) {

            concentration =
                "High";

        } else if (
            concentrationPercent >= 40
        ) {

            concentration =
                "Moderate";

        }


        let overallRisk =
            "Moderate";


        if (
            assetCount === 1 ||
            concentrationPercent >= 70
        ) {

            overallRisk =
                "High";

        } else if (
            assetCount >= 5 &&
            concentrationPercent < 40
        ) {

            overallRisk =
                "Moderate";

        }


        if (riskLevel) {

            riskLevel.textContent =
                `${overallRisk} Risk`;

        }


        if (sectorRisk) {

            sectorRisk.textContent =
                concentration;

        }


        if (diversificationRisk) {

            diversificationRisk.textContent =
                diversification;

        }


        if (cashRisk) {

            cashRisk.textContent =
                cashPosition;

        }


        if (volatilityRisk) {

            volatilityRisk.textContent =
                overallRisk;

        }

    }


    /* =====================================================
       AI PORTFOLIO REVIEW
    ===================================================== */

    function updateAIReview() {

        const data =
            getPortfolioData();


        const aiScore =
            document.getElementById(
                "aiScore"
            );


        const title =
            document.getElementById(
                "aiReviewTitle"
            );


        const text =
            document.getElementById(
                "aiReviewText"
            );


        const observations =
            document.getElementById(
                "aiObservations"
            );


        if (!liveHoldings.length) {

            if (aiScore) {
                aiScore.textContent =
                    "--";
            }

            if (title) {

                title.textContent =
                    "Your portfolio is ready for analysis.";

            }

            if (text) {

                text.textContent =
                    "Create virtual holdings to receive portfolio observations based on your current allocation and P&L.";

            }

            if (observations) {

                observations.innerHTML = "";

            }

            return;

        }


        const allocation =
            getAllocationData();


        let score =
            60;


        if (
            liveHoldings.length >= 3
        ) {

            score += 10;

        }


        if (
            liveHoldings.length >= 5
        ) {

            score += 5;

        }


        if (
            allocation.cashPercent >= 10
        ) {

            score += 5;

        }


        if (
            allocation.cashPercent > 60
        ) {

            score -= 5;

        }


        if (
            allocation.stocksPercent >= 80
        ) {

            score -= 10;

        }


        score =
            Math.max(
                0,
                Math.min(
                    100,
                    score
                )
            );


        if (aiScore) {

            aiScore.textContent =
                `${score}/100`;

        }


        if (title) {

            if (
                score >= 80
            ) {

                title.textContent =
                    "Your virtual portfolio is reasonably diversified.";

            } else if (
                score >= 65
            ) {

                title.textContent =
                    "Your virtual portfolio has a moderate diversification profile.";

            } else {

                title.textContent =
                    "Your virtual portfolio may benefit from greater diversification.";

            }

        }


        if (text) {

            text.textContent =
                `Your portfolio currently contains ${liveHoldings.length} ${
                    liveHoldings.length === 1
                        ? "holding"
                        : "holdings"
                }, with ${allocation.stocksPercent}% in stocks/ETFs, ${
                    allocation.fundsPercent
                }% in mutual funds and ${
                    allocation.cashPercent
                }% in cash. These observations are educational and are not financial advice.`;

        }


        if (observations) {

            const items = [];


            if (
                liveHoldings.length >= 3
            ) {

                items.push({

                    type:
                        "positive-observation",

                    icon:
                        "bi-check-circle-fill",

                    text:
                        "Multiple holdings provide broader asset exposure."

                });

            } else {

                items.push({

                    type:
                        "warning-observation",

                    icon:
                        "bi-exclamation-triangle-fill",

                    text:
                        "The portfolio currently has a limited number of holdings."

                });

            }


            if (
                allocation.cashPercent >= 10
            ) {

                items.push({

                    type:
                        "positive-observation",

                    icon:
                        "bi-check-circle-fill",

                    text:
                        "The portfolio maintains a cash position."

                });

            } else {

                items.push({

                    type:
                        "warning-observation",

                    icon:
                        "bi-exclamation-triangle-fill",

                    text:
                        "The cash position is relatively small."

                });

            }


            if (
                allocation.stocksPercent > 80
            ) {

                items.push({

                    type:
                        "warning-observation",

                    icon:
                        "bi-exclamation-triangle-fill",

                    text:
                        "Stocks/ETFs represent a large share of the portfolio."

                });

            } else {

                items.push({

                    type:
                        "positive-observation",

                    icon:
                        "bi-check-circle-fill",

                    text:
                        "The portfolio is not overwhelmingly concentrated in stocks/ETFs."

                });

            }


            observations.innerHTML =
                items.map(
                    item => `

                        <div class="observation ${item.type}">

                            <i class="bi ${item.icon}"></i>

                            <span>
                                ${escapeHTML(item.text)}
                            </span>

                        </div>

                    `
                ).join("");

        }

    }


    /* =====================================================
       TRANSACTIONS
       
       Supports future transaction storage.

       No fake transaction history is created.
    ===================================================== */

    function loadTransactions() {

        if (!transactionList) {
            return;
        }


        let transactions = [];


        for (
            const key of transactionKeys
        ) {

            const raw =
                localStorage.getItem(key);


            if (!raw) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(raw);


                if (
                    Array.isArray(parsed)
                ) {

                    transactions =
                        parsed;

                    break;

                }

            } catch (error) {

                console.warn(
                    "Invalid transaction data:",
                    error
                );

            }

        }


        if (!transactions.length) {

            transactionList.innerHTML = `

                <div class="transaction-item">

                    <span class="transaction-icon">

                        <i class="bi bi-clock-history"></i>

                    </span>

                    <div>

                        <strong>
                            No transactions recorded
                        </strong>

                        <small>
                            Your virtual trades will appear here.
                        </small>

                    </div>

                </div>

            `;

            return;

        }


        transactions =
            transactions
                .slice()
                .reverse()
                .slice(0, 10);


        transactionList.innerHTML =
            transactions.map(
                transaction => {

                    const type =
                        String(
                            transaction.type ||
                            transaction.side ||
                            "BUY"
                        ).toUpperCase();


                    const symbol =
                        transaction.symbol ||
                        transaction.tradingsymbol ||
                        "Unknown";


                    const quantity =
                        Number(
                            transaction.quantity ??
                            transaction.qty ??
                            0
                        );


                    const price =
                        Number(
                            transaction.price ??
                            transaction.averagePrice ??
                            0
                        );


                    const total =
                        Number(
                            transaction.total ??
                            transaction.value ??
                            quantity * price
                        );


                    const isSell =
                        type === "SELL";


                    const date =
                        transaction.timestamp ||
                        transaction.date;


                    const dateText =
                        date
                            ? new Date(
                                date
                            ).toLocaleString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            )
                            : "Recorded";


                    return `

                        <div class="transaction-item">

                            <span class="transaction-icon ${
                                isSell
                                    ? "sell"
                                    : "buy"
                            }">

                                <i class="bi ${
                                    isSell
                                        ? "bi-arrow-up-right"
                                        : "bi-arrow-down-left"
                                }"></i>

                            </span>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        isSell
                                            ? `Sold ${symbol}`
                                            : `Bought ${symbol}`
                                    )}
                                </strong>


                                <small>
                                    ${formatInteger(quantity)}
                                    units •
                                    ${escapeHTML(dateText)}
                                </small>

                            </div>


                            <strong class="transaction-value ${
                                isSell
                                    ? "positive"
                                    : ""
                            }">

                                ${
                                    isSell
                                        ? "+"
                                        : "-"
                                }${formatMoney(total)}

                            </strong>

                        </div>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       PERIOD SELECTOR
    ===================================================== */

    performancePeriod?.addEventListener(
        "change",
        () => {

            createPerformanceChart(
                performancePeriod.value
            );

        }
    );


    /* =====================================================
       REFRESH PORTFOLIO
    ===================================================== */

    async function refreshPortfolio() {

        if (holdingsBody) {

            holdingsBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="text-center p-4">

                        <span>
                            Loading live market prices...
                        </span>

                    </td>

                </tr>

            `;

        }


        liveHoldings =
            await loadLiveHoldings();


        updateSummary();

        updateHoldingsTable();

        updateRiskAnalysis();

        updateAIReview();

        loadTransactions();

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    await refreshPortfolio();


    createPerformanceChart(
        performancePeriod?.value || "6M"
    );


    createAllocationChart();


    updateThemeIcon();


    /* =====================================================
       AUTO REFRESH
       
       Refresh live prices every 60 seconds.
    ===================================================== */

    const refreshInterval =
        setInterval(
            async () => {

                await refreshPortfolio();

            },
            60000
        );


    /* =====================================================
       STORAGE EVENTS
       
       Refresh if another Investopia page changes the
       paper-trading portfolio.
    ===================================================== */

    window.addEventListener(
        "storage",
        async event => {

            if (
                event.key ===
                    "investopiaVirtualCash" ||
                event.key ===
                    "investopiaHoldings" ||
                event.key ===
                    userCashKey ||
                event.key ===
                    userHoldingsKey
            ) {

                await refreshPortfolio();

            }

        }
    );


    /* =====================================================
       RESPONSIVE
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
       CLEANUP
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            clearInterval(
                refreshInterval
            );

        }
    );


    console.log(
        "Investopia Portfolio initialized successfully."
    );

});