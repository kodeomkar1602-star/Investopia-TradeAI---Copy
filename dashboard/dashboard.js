/* =========================================================
   INVESTOPIA TRADEAI - DASHBOARD JS
   LIVE ANGEL ONE + SUPABASE USER DATA
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const API_BASE_URL =
        "https://investopia-tradeai-copy.onrender.com";


    /* =====================================================
       SESSION / AUTHENTICATION
    ===================================================== */

    const session = await requireAuth();

    if (!session) {
        return;
    }

    listenForAuthChanges();


    /* =====================================================
       CURRENT USER
    ===================================================== */

    const user = session.user;

    console.log("Investopia logged-in user:", user);
    console.log("User ID:", user.id);
    console.log("User Email:", user.email);


    /* =====================================================
       USERNAME
    ===================================================== */

    function getUserName() {

        const metadata = user.user_metadata || {};

        return (
            metadata.full_name ||
            metadata.name ||
            metadata.username ||
            user.email?.split("@")[0] ||
            "User"
        );

    }


    const userName = getUserName();


    /* =====================================================
       USER DISPLAY
    ===================================================== */

    function updateUserDisplay() {

        const profileName =
            document.getElementById("profileName");

        const profileAvatar =
            document.getElementById("profileAvatar");

        const welcomeHeading =
            document.getElementById("welcomeHeading");


        if (profileName) {

            profileName.textContent =
                userName;

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                userName
                    .trim()
                    .charAt(0)
                    .toUpperCase();

        }


        if (welcomeHeading) {

            const hour =
                new Date().getHours();

            let greeting = "Good morning";

            if (hour >= 12 && hour < 17) {

                greeting = "Good afternoon";

            }
            else if (hour >= 17) {

                greeting = "Good evening";

            }

            welcomeHeading.textContent =
                `${greeting}, ${userName} 👋`;

        }

    }


    updateUserDisplay();


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

    const chartPeriod =
        document.getElementById("chartPeriod");


    const portfolioCanvas =
        document.getElementById("portfolioChart");

    const allocationCanvas =
        document.getElementById("allocationChart");


    const marketWatchlistBody =
        document.getElementById(
            "marketWatchlistBody"
        );


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

            }
            else {

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

        if (!themeIcon) return;

        const darkMode =
            document.body.classList.contains(
                "dark-theme"
            );

        themeIcon.className =
            darkMode
                ? "bi bi-sun"
                : "bi bi-moon-stars";

    }


    function setTheme(theme) {

        if (theme === "dark") {

            document.body.classList.add(
                "dark-theme"
            );

            localStorage.setItem(
                "investopia-theme",
                "dark"
            );

        }
        else {

            document.body.classList.remove(
                "dark-theme"
            );

            localStorage.setItem(
                "investopia-theme",
                "light"
            );

        }

        updateThemeIcon();

        updateCharts();

    }


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


    themeToggle?.addEventListener(
        "click",
        () => {

            const darkMode =
                document.body.classList.contains(
                    "dark-theme"
                );

            setTheme(
                darkMode
                    ? "light"
                    : "dark"
            );

        }
    );


    /* =====================================================
       FORMATTERS
    ===================================================== */

    function formatINR(value) {

        const number =
            Number(value) || 0;

        return (
            "₹" +
            number.toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
        );

    }


    function formatPercent(value) {

        const number =
            Number(value) || 0;

        return (
            `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`
        );

    }


    /* =====================================================
       PAPER TRADING DATA
    ===================================================== */

    function getPaperCash() {

        const storedCash =
            localStorage.getItem(
                "investopiaVirtualCash"
            );

        const cash =
            Number(storedCash);

        if (
            Number.isFinite(cash)
        ) {

            return cash;

        }

        return 100000;

    }


    function getHoldings() {

        try {

            const stored =
                localStorage.getItem(
                    "investopiaHoldings"
                );

            if (!stored) {

                return {};

            }

            const parsed =
                JSON.parse(stored);

            if (
                !parsed ||
                typeof parsed !== "object"
            ) {

                return {};

            }

            return parsed;

        }
        catch (error) {

            console.error(
                "Unable to read paper holdings:",
                error
            );

            return {};

        }

    }


    /* =====================================================
       ANGEL ONE SEARCH
    ===================================================== */

    async function searchAngelOneStock(
        query
    ) {

        const response =
            await fetch(
                `${API_BASE_URL}/api/stocks/search?search=${encodeURIComponent(query)}&exchange=NSE`
            );

        if (!response.ok) {

            throw new Error(
                `Stock search failed: ${response.status}`
            );

        }

        const result =
            await response.json();

        const list =
            result?.data?.data ||
            result?.data ||
            [];

        if (!Array.isArray(list)) {

            return [];

        }

        return list;

    }


    /* =====================================================
       ANGEL ONE LTP
    ===================================================== */

    async function getStockLTP(
        exchange,
        symbol,
        token
    ) {

        const url =
            `${API_BASE_URL}/api/stocks/ltp` +
            `?exchange=${encodeURIComponent(exchange)}` +
            `&symbol=${encodeURIComponent(symbol)}` +
            `&token=${encodeURIComponent(token)}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `LTP request failed: ${response.status}`
            );

        }


        const result =
            await response.json();


        const fetched =
            result?.data?.data?.fetched;


        if (
            !Array.isArray(fetched) ||
            !fetched.length
        ) {

            throw new Error(
                "No live market data returned."
            );

        }


        return fetched[0];

    }


    /* =====================================================
       GET STOCK INSTRUMENT
    ===================================================== */

    async function getEquityInstrument(
        query
    ) {

        const results =
            await searchAngelOneStock(
                query
            );


        if (!results.length) {

            return null;

        }


        const normalized =
            query
                .trim()
                .toUpperCase();


        const exactEQ =
            results.find(
                item =>
                    String(
                        item.tradingsymbol ||
                        item.tradingSymbol ||
                        ""
                    ).toUpperCase()
                    === `${normalized}-EQ`
            );


        if (exactEQ) {

            return exactEQ;

        }


        const exact =
            results.find(
                item =>
                    String(
                        item.tradingsymbol ||
                        item.tradingSymbol ||
                        ""
                    ).toUpperCase()
                    === normalized
            );


        if (exact) {

            return exact;

        }


        const equity =
            results.find(
                item =>
                    String(
                        item.tradingsymbol ||
                        item.tradingSymbol ||
                        ""
                    ).toUpperCase()
                    .endsWith("-EQ")
            );


        return equity || results[0];

    }


    /* =====================================================
       WATCHLIST STOCKS
    ===================================================== */

    const watchlistSymbols = [
        "TCS",
        "RELIANCE",
        "INFY",
        "HDFCBANK"
    ];


    let liveWatchlist = [];


    /* =====================================================
       LOAD LIVE WATCHLIST
    ===================================================== */

    async function loadLiveWatchlist() {

        if (!marketWatchlistBody) {
            return;
        }


        marketWatchlistBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    Loading live market data...
                </td>
            </tr>
        `;


        const results = [];


        for (
            const searchSymbol
            of watchlistSymbols
        ) {

            try {

                const instrument =
                    await getEquityInstrument(
                        searchSymbol
                    );


                if (!instrument) {

                    continue;

                }


                const symbol =
                    instrument.tradingsymbol ||
                    instrument.tradingSymbol;


                const token =
                    instrument.symboltoken ||
                    instrument.symbolToken;


                if (
                    !symbol ||
                    !token
                ) {

                    continue;

                }


                const live =
                    await getStockLTP(
                        "NSE",
                        symbol,
                        token
                    );


                results.push({

                    name:
                        searchSymbol,

                    symbol,

                    token,

                    exchange:
                        "NSE",

                    ltp:
                        Number(live.ltp) || 0,

                    percentChange:
                        Number(
                            live.percentChange
                        ) || 0

                });

            }
            catch (error) {

                console.error(
                    `Unable to load ${searchSymbol}:`,
                    error
                );

            }

        }


        liveWatchlist =
            results;


        renderWatchlist();

    }


    /* =====================================================
       RENDER WATCHLIST
    ===================================================== */

    function renderWatchlist() {

        if (!marketWatchlistBody) {
            return;
        }


        if (!liveWatchlist.length) {

            marketWatchlistBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        Live market data unavailable.
                    </td>
                </tr>
            `;

            return;

        }


        marketWatchlistBody.innerHTML =
            liveWatchlist
                .map(stock => {

                    const change =
                        stock.percentChange;

                    const changeClass =
                        change >= 0
                            ? "positive"
                            : "negative";

                    const arrow =
                        change >= 0
                            ? "arrow-up"
                            : "arrow-down";


                    const displayName =
                        stock.name;


                    const logo =
                        displayName
                            .charAt(0)
                            .toUpperCase();


                    return `
                        <tr>

                            <td>

                                <div class="asset-info">

                                    <span class="asset-logo">
                                        ${logo}
                                    </span>

                                    <div>

                                        <strong>
                                            ${displayName}
                                        </strong>

                                        <small>
                                            NSE
                                        </small>

                                    </div>

                                </div>

                            </td>


                            <td>
                                ${formatINR(stock.ltp)}
                            </td>


                            <td class="${changeClass}">

                                <i class="bi bi-${arrow}"></i>

                                ${formatPercent(change)}

                            </td>


                            <td class="text-end">

                                <a
                                    href="../stock-details/stock-details.html?symbol=${encodeURIComponent(stock.symbol)}&token=${encodeURIComponent(stock.token)}&exchange=NSE"
                                    class="view-btn">

                                    View

                                </a>

                            </td>

                        </tr>
                    `;

                })
                .join("");

    }


    /* =====================================================
       PAPER PORTFOLIO CALCULATION
    ===================================================== */

    async function calculatePortfolio() {

        const holdings =
            getHoldings();


        const cash =
            getPaperCash();


        let marketValue = 0;

        let investedValue = 0;

        let todayPnL = 0;

        let stockCount = 0;


        const holdingEntries =
            Object.entries(
                holdings
            );


        for (
            const [
                key,
                holding
            ]
            of holdingEntries
        ) {

            const quantity =
                Number(
                    holding?.quantity ||
                    holding?.qty ||
                    0
                );


            if (
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {

                continue;

            }


            const averagePrice =
                Number(
                    holding?.averagePrice ??
                    holding?.avgPrice ??
                    holding?.price ??
                    0
                );


            const symbolBase =
                String(key)
                    .trim()
                    .toUpperCase()
                    .replace(
                        /-EQ$/,
                        ""
                    );


            try {

                const instrument =
                    await getEquityInstrument(
                        symbolBase
                    );


                if (!instrument) {

                    continue;

                }


                const symbol =
                    instrument.tradingsymbol ||
                    instrument.tradingSymbol;


                const token =
                    instrument.symboltoken ||
                    instrument.symbolToken;


                const live =
                    await getStockLTP(
                        "NSE",
                        symbol,
                        token
                    );


                const ltp =
                    Number(live.ltp) || 0;


                const previousClose =
                    Number(
                        live.close ||
                        live.prevClose ||
                        0
                    );


                marketValue +=
                    quantity * ltp;


                investedValue +=
                    quantity *
                    averagePrice;


                if (previousClose > 0) {

                    todayPnL +=
                        quantity *
                        (ltp - previousClose);

                }


                stockCount++;

            }
            catch (error) {

                console.error(
                    `Unable to calculate ${symbolBase}:`,
                    error
                );

            }

        }


        const portfolioValue =
            cash + marketValue;


        const totalReturns =
            marketValue -
            investedValue;


        const returnsPercent =
            investedValue > 0
                ? (
                    totalReturns /
                    investedValue
                ) * 100
                : 0;


        const todayBase =
            marketValue -
            todayPnL;


        const todayPercent =
            todayBase > 0
                ? (
                    todayPnL /
                    todayBase
                ) * 100
                : 0;


        return {

            cash,

            marketValue,

            portfolioValue,

            investedValue,

            totalReturns,

            returnsPercent,

            todayPnL,

            todayPercent,

            stockCount

        };

    }


    /* =====================================================
       UPDATE PORTFOLIO STATISTICS
    ===================================================== */

    function updatePortfolioStats(
        portfolio
    ) {

        const portfolioValue =
            document.getElementById(
                "portfolioValue"
            );

        const totalInvested =
            document.getElementById(
                "totalInvested"
            );

        const totalReturns =
            document.getElementById(
                "totalReturns"
            );

        const todayPnL =
            document.getElementById(
                "todayPnL"
            );

        const totalReturnsPercent =
            document.getElementById(
                "totalReturnsPercent"
            );

        const todayPnLPercent =
            document.getElementById(
                "todayPnLPercent"
            );

        const assetCountText =
            document.getElementById(
                "assetCountText"
            );


        if (portfolioValue) {

            portfolioValue.textContent =
                formatINR(
                    portfolio.portfolioValue
                );

        }


        if (totalInvested) {

            totalInvested.textContent =
                formatINR(
                    portfolio.investedValue
                );

        }


        if (totalReturns) {

            totalReturns.textContent =
                formatINR(
                    portfolio.totalReturns
                );

            totalReturns.classList.toggle(
                "positive",
                portfolio.totalReturns >= 0
            );

            totalReturns.classList.toggle(
                "negative",
                portfolio.totalReturns < 0
            );

        }


        if (todayPnL) {

            todayPnL.textContent =
                formatINR(
                    portfolio.todayPnL
                );

            todayPnL.classList.toggle(
                "positive",
                portfolio.todayPnL >= 0
            );

            todayPnL.classList.toggle(
                "negative",
                portfolio.todayPnL < 0
            );

        }


        if (totalReturnsPercent) {

            totalReturnsPercent.innerHTML =
                `
                <i class="bi bi-${portfolio.returnsPercent >= 0
                    ? "arrow-up"
                    : "arrow-down"}"></i>
                ${formatPercent(
                    portfolio.returnsPercent
                )}
                `;

            totalReturnsPercent.classList.toggle(
                "positive",
                portfolio.returnsPercent >= 0
            );

            totalReturnsPercent.classList.toggle(
                "negative",
                portfolio.returnsPercent < 0
            );

        }


        if (todayPnLPercent) {

            todayPnLPercent.innerHTML =
                `
                <i class="bi bi-${portfolio.todayPercent >= 0
                    ? "arrow-up"
                    : "arrow-down"}"></i>
                ${formatPercent(
                    portfolio.todayPercent
                )}
                `;

            todayPnLPercent.classList.toggle(
                "positive",
                portfolio.todayPercent >= 0
            );

            todayPnLPercent.classList.toggle(
                "negative",
                portfolio.todayPercent < 0
            );

        }


        if (assetCountText) {

            assetCountText.textContent =
                `Across ${portfolio.stockCount} assets`;

        }


        const allocationAssetCount =
            document.getElementById(
                "allocationAssetCount"
            );


        if (allocationAssetCount) {

            allocationAssetCount.textContent =
                portfolio.stockCount;

        }

    }


    /* =====================================================
       ALLOCATION
    ===================================================== */

    function calculateAllocation(
        portfolio
    ) {

        const total =
            portfolio.portfolioValue;


        if (total <= 0) {

            return {

                stocks: 0,

                mutualFunds: 0,

                cash: 100

            };

        }


        const stocks =
            (
                portfolio.marketValue /
                total
            ) * 100;


        const cash =
            (
                portfolio.cash /
                total
            ) * 100;


        return {

            stocks,

            mutualFunds: 0,

            cash

        };

    }


    function updateAllocationText(
        allocation
    ) {

        const stocks =
            document.getElementById(
                "stocksAllocation"
            );

        const mutualFunds =
            document.getElementById(
                "mutualFundsAllocation"
            );

        const cash =
            document.getElementById(
                "cashAllocation"
            );


        if (stocks) {

            stocks.textContent =
                `${allocation.stocks.toFixed(1)}%`;

        }


        if (mutualFunds) {

            mutualFunds.textContent =
                `${allocation.mutualFunds.toFixed(1)}%`;

        }


        if (cash) {

            cash.textContent =
                `${allocation.cash.toFixed(1)}%`;

        }

    }


    /* =====================================================
       CHARTS
    ===================================================== */

    let portfolioChart = null;

    let allocationChart = null;


    function getChartColors() {

        const darkMode =
            document.body.classList.contains(
                "dark-theme"
            );


        return {

            text: darkMode
                ? "#a6b4aa"
                : "#647268",

            grid: darkMode
                ? "#1c3426"
                : "#e2e8e4",

            primary:
                "#16a34a"

        };

    }


    /* =====================================================
       PORTFOLIO CHART
    ===================================================== */

    function createPortfolioChart(
        portfolio
    ) {

        if (!portfolioCanvas) {
            return;
        }


        const ctx =
            portfolioCanvas.getContext(
                "2d"
            );


        const colors =
            getChartColors();


        if (portfolioChart) {

            portfolioChart.destroy();

        }


        /*
            We deliberately do NOT use fake
            historical portfolio values.

            Until transaction history is stored,
            the dashboard shows the current
            real portfolio snapshot.
        */


        const labels = [
            "Current"
        ];


        const values = [
            portfolio.portfolioValue
        ];


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                280
            );


        gradient.addColorStop(
            0,
            "rgba(22, 163, 74, 0.22)"
        );


        gradient.addColorStop(
            1,
            "rgba(22, 163, 74, 0)"
        );


        portfolioChart =
            new Chart(
                ctx,
                {

                    type: "line",

                    data: {

                        labels,

                        datasets: [

                            {

                                label:
                                    "Current Portfolio Value",

                                data: values,

                                borderColor:
                                    colors.primary,

                                backgroundColor:
                                    gradient,

                                borderWidth:
                                    2.5,

                                fill:
                                    true,

                                tension:
                                    0.4,

                                pointRadius:
                                    4,

                                pointHoverRadius:
                                    6,

                                pointBackgroundColor:
                                    colors.primary

                            }

                        ]

                    },


                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,


                        plugins: {

                            legend: {

                                display:
                                    false

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function(context) {

                                            return (
                                                " " +
                                                formatINR(
                                                    context.parsed.y
                                                )
                                            );

                                        }

                                }

                            }

                        },


                        scales: {

                            x: {

                                grid: {

                                    display:
                                        false

                                },

                                ticks: {

                                    color:
                                        colors.text

                                }

                            },


                            y: {

                                grid: {

                                    color:
                                        colors.grid

                                },

                                ticks: {

                                    color:
                                        colors.text,

                                    callback:
                                        function(value) {

                                            return (
                                                "₹" +
                                                Number(
                                                    value
                                                ).toLocaleString(
                                                    "en-IN"
                                                )
                                            );

                                        }

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

    function createAllocationChart(
        allocation
    ) {

        if (!allocationCanvas) {
            return;
        }


        const ctx =
            allocationCanvas.getContext(
                "2d"
            );


        if (allocationChart) {

            allocationChart.destroy();

        }


        allocationChart =
            new Chart(
                ctx,
                {

                    type:
                        "doughnut",


                    data: {

                        labels: [

                            "Stocks",

                            "Mutual Funds",

                            "Cash"

                        ],


                        datasets: [

                            {

                                data: [

                                    allocation.stocks,

                                    allocation.mutualFunds,

                                    allocation.cash

                                ],


                                backgroundColor: [

                                    "#16a34a",

                                    "#60a5fa",

                                    "#a3a3a3"

                                ],


                                borderWidth:
                                    0,

                                hoverOffset:
                                    5

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

                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       CURRENT PORTFOLIO
    ===================================================== */

    let currentPortfolio = {

        cash: 100000,

        marketValue: 0,

        portfolioValue: 100000,

        investedValue: 0,

        totalReturns: 0,

        returnsPercent: 0,

        todayPnL: 0,

        todayPercent: 0,

        stockCount: 0

    };


    async function refreshPortfolio() {

        try {

            currentPortfolio =
                await calculatePortfolio();


            updatePortfolioStats(
                currentPortfolio
            );


            const allocation =
                calculateAllocation(
                    currentPortfolio
                );


            updateAllocationText(
                allocation
            );


            createPortfolioChart(
                currentPortfolio
            );


            createAllocationChart(
                allocation
            );

        }
        catch (error) {

            console.error(
                "Portfolio refresh failed:",
                error
            );

        }

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    await loadLiveWatchlist();

    await refreshPortfolio();


    /* =====================================================
       CHART PERIOD
    ===================================================== */

    chartPeriod?.addEventListener(
        "change",
        function() {

            /*
                Historical portfolio data is not
                fabricated. Until transaction history
                is available, keep the real current
                portfolio snapshot.
            */

            createPortfolioChart(
                currentPortfolio
            );

        }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    globalSearch?.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            const query =
                this.value.trim();


            if (!query) {
                return;
            }


            /*
                Send the search to the Market page.
                The Market page already uses Angel One
                search and can display the matching
                instruments.
            */

            window.location.href =
                `../market/market.html?search=${encodeURIComponent(query)}`;

        }
    );


    /* =====================================================
       SEARCH SHORTCUT
    ===================================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            const isShortcut =
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() ===
                "k";


            if (!isShortcut) {
                return;
            }


            event.preventDefault();


            globalSearch?.focus();

        }
    );


    /* =====================================================
       WINDOW RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        function() {

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
       REFRESH LIVE DATA
    ===================================================== */

    setInterval(
        async () => {

            try {

                await loadLiveWatchlist();

                await refreshPortfolio();

            }
            catch (error) {

                console.error(
                    "Live dashboard refresh failed:",
                    error
                );

            }

        },
        60000
    );

});