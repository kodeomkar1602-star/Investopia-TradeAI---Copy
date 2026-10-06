/* =========================================================
   INVESTOPIA TRADEAI - STOCK DETAILS
   Angel One Live Market Data + Supabase User
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {


    /* =====================================================
       SESSION PROTECTION
    ===================================================== */

    const session =
        await requireAuth();


    if (!session) {
        return;
    }


    listenForAuthChanges();


    const user =
        session.user;


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


    const stockSearch =
        document.getElementById("stockSearch");


    const quantity =
        document.getElementById("quantity");


    const tradeValue =
        document.getElementById("tradeValue");


    const buyButton =
        document.getElementById("buyButton");


    const sellButton =
        document.getElementById("sellButton");


    const profileName =
        document.getElementById("profileName");


    const profileAvatar =
        document.getElementById("profileAvatar");


    const virtualCashElement =
        document.getElementById("virtualCash");


    const portfolioHolding =
        document.getElementById(
            "portfolioHolding"
        );


    const portfolioProgress =
        document.getElementById(
            "portfolioProgress"
        );


    const portfolioMessage =
        document.getElementById(
            "portfolioMessage"
        );


    const chartMessage =
        document.getElementById(
            "chartMessage"
        );



    /* =====================================================
       USER-SPECIFIC STORAGE
    ===================================================== */

    const userId =
        user.id;


    const CASH_KEY =
        `investopiaVirtualCash-${userId}`;


    const HOLDINGS_KEY =
        `investopiaHoldings-${userId}`;


    const TRANSACTIONS_KEY =
        `investopiaTransactions-${userId}`;



    /* =====================================================
       LOGGED-IN USER NAME
    ===================================================== */

    function getUserName() {

        const metadata =
            user.user_metadata || {};


        return (
            metadata.full_name ||
            metadata.name ||
            metadata.username ||
            user.email?.split("@")[0] ||
            "User"
        );

    }



    function getInitials(name) {

        if (!name) {
            return "U";
        }


        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();

    }



    function updateLoggedInUser() {

        const name =
            getUserName();


        if (profileName) {

            profileName.textContent =
                name;

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                getInitials(name);

        }

    }


    updateLoggedInUser();



    /* =====================================================
       URL PARAMETERS
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const rawSymbol =
        (
            params.get("symbol") ||
            "TCS-EQ"
        ).toUpperCase();


    let exchange =
        (
            params.get("exchange") ||
            "NSE"
        ).toUpperCase();


    let symbolToken =
        params.get("token") ||
        "";


    /*
     * Example:
     *
     * RELIANCE-EQ
     *      ↓
     * RELIANCE
     */

    const baseSymbol =
        rawSymbol
            .replace(
                /-EQ$/i,
                ""
            )
            .toUpperCase();


    let tradingSymbol =
        rawSymbol;



    /* =====================================================
       DYNAMIC ASSET INFORMATION
    ===================================================== */

    let asset = {

        name:
            baseSymbol,

        company:
            baseSymbol,

        type:
            "STOCK",

        logo:
            baseSymbol.charAt(0) ||
            "S",

        price:
            0,

        change:
            0

    };


    let liveDataAvailable =
        false;



    /* =====================================================
       CHART
    ===================================================== */

    const chartCache = {};


    let stockChart =
        null;


    let currentPeriod =
        "1D";


    let chartRequestId =
        0;



    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return "₹--";

        }


        return `₹${number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    }



    /* =====================================================
       FORMAT QUANTITY
    ===================================================== */

    function formatQuantity(value) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return "0";

        }


        return number.toLocaleString(
            "en-IN"
        );

    }



    /* =====================================================
       RESOLVE INSTRUMENT THROUGH ANGEL ONE
    ===================================================== */

    async function resolveStock() {

        /*
         * If URL already contains a token,
         * use it directly.
         */

        if (symbolToken) {

            return {

                exchange:
                    exchange,

                tradingSymbol:
                    tradingSymbol,

                symbolToken:
                    String(symbolToken)

            };

        }


        try {

            const searchTerm =
                baseSymbol;


            const url =
                `${API_BASE_URL}/api/stocks/search` +
                `?search=${encodeURIComponent(
                    searchTerm
                )}` +
                `&exchange=${encodeURIComponent(
                    exchange
                )}`;


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

                throw new Error(
                    "No Angel One search data returned."
                );

            }


            /*
             * Prefer normal NSE equity.
             */

            const equity =
                result.data.find(
                    stock => {

                        const symbol =
                            (
                                stock.tradingsymbol ||
                                ""
                            ).toUpperCase();


                        return (
                            symbol ===
                            `${baseSymbol}-EQ`
                        );

                    }
                );


            const selected =
                equity ||
                result.data[0];


            if (!selected) {

                throw new Error(
                    "Instrument not found."
                );

            }


            tradingSymbol =
                selected.tradingsymbol;


            symbolToken =
                String(
                    selected.symboltoken
                );


            exchange =
                (
                    selected.exchange ||
                    exchange
                ).toUpperCase();


            /*
             * Build dynamic metadata.
             */

            asset.name =
                selected.tradingsymbol ||
                baseSymbol;


            asset.company =
                selected.name ||
                selected.companyname ||
                selected.description ||
                selected.tradingsymbol ||
                baseSymbol;


            asset.type =
                detectAssetType(
                    selected.tradingsymbol
                );


            asset.logo =
                baseSymbol.charAt(0) ||
                "S";


            return {

                exchange:
                    exchange,

                tradingSymbol:
                    tradingSymbol,

                symbolToken:
                    symbolToken

            };

        }
        catch (error) {

            console.error(
                "Angel One stock resolution error:",
                error
            );


            return null;

        }

    }



    /* =====================================================
       DETECT ASSET TYPE
    ===================================================== */

    function detectAssetType(
        symbol
    ) {

        const value =
            String(symbol || "")
                .toUpperCase();


        if (
            value.includes("ETF") ||
            value.includes("BEES")
        ) {

            return "ETF";

        }


        return "STOCK";

    }



    /* =====================================================
       FETCH LIVE MARKET DATA
    ===================================================== */

    async function fetchLiveMarketData(
        stock
    ) {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/stocks/market-data`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                mode:
                                    "FULL",

                                exchangeTokens: {

                                    [stock.exchange]: [

                                        stock.symbolToken

                                    ]

                                }

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


            console.log(
                "Angel One market data:",
                result
            );


            const fetched =
                result
                    ?.data
                    ?.data
                    ?.fetched;


            if (
                !Array.isArray(
                    fetched
                ) ||
                !fetched.length
            ) {

                throw new Error(
                    "No live market data returned."
                );

            }


            return fetched[0];

        }
        catch (error) {

            console.error(
                "Live market data error:",
                error
            );


            return null;

        }

    }



    /* =====================================================
       UPDATE ASSET FROM LIVE DATA
    ===================================================== */

    function updateAssetFromMarketData(
        marketData
    ) {

        if (!marketData) {

            liveDataAvailable =
                false;

            return;

        }


        const livePrice =
            Number(
                marketData.ltp
            );


        if (
            !Number.isFinite(
                livePrice
            ) ||
            livePrice <= 0
        ) {

            liveDataAvailable =
                false;

            return;

        }


        asset.price =
            livePrice;


        let percentChange =
            Number(
                marketData.percentChange
            );


        if (
            !Number.isFinite(
                percentChange
            )
        ) {

            const previousClose =
                Number(
                    marketData.close
                );


            if (
                Number.isFinite(
                    previousClose
                ) &&
                previousClose > 0
            ) {

                percentChange =
                    (
                        (
                            livePrice -
                            previousClose
                        ) /
                        previousClose
                    ) *
                    100;

            }
            else {

                percentChange =
                    0;

            }

        }


        asset.change =
            percentChange;


        liveDataAvailable =
            true;


        console.log(
            "Live Angel One price:",
            livePrice
        );

    }



    /* =====================================================
       LOAD ASSET UI
    ===================================================== */

    function loadAsset() {

        const assetLogo =
            document.getElementById(
                "assetLogo"
            );


        const assetName =
            document.getElementById(
                "assetName"
            );


        const companyName =
            document.getElementById(
                "companyName"
            );


        const assetType =
            document.getElementById(
                "assetType"
            );


        const breadcrumbAsset =
            document.getElementById(
                "breadcrumbAsset"
            );


        const currentPrice =
            document.getElementById(
                "currentPrice"
            );


        const priceChange =
            document.getElementById(
                "priceChange"
            );


        const assetExchange =
            document.getElementById(
                "assetExchange"
            );


        if (assetLogo) {

            assetLogo.textContent =
                asset.logo;

        }


        if (assetName) {

            assetName.textContent =
                asset.name;

        }


        if (companyName) {

            companyName.textContent =
                asset.company;

        }


        if (assetType) {

            assetType.textContent =
                asset.type;

        }


        if (breadcrumbAsset) {

            breadcrumbAsset.textContent =
                baseSymbol;

        }


        if (assetExchange) {

            assetExchange.textContent =
                `${exchange} • ${tradingSymbol}`;

        }


        if (currentPrice) {

            if (
                liveDataAvailable &&
                Number.isFinite(
                    asset.price
                )
            ) {

                currentPrice.textContent =
                    formatMoney(
                        asset.price
                    );

            }
            else {

                currentPrice.textContent =
                    "₹--";

            }

        }


        if (priceChange) {

            const change =
                Number(
                    asset.change
                );


            if (
                liveDataAvailable &&
                Number.isFinite(change)
            ) {

                const negative =
                    change < 0;


                priceChange.innerHTML = `

                    <i class="bi ${
                        negative
                            ? "bi-arrow-down"
                            : "bi-arrow-up"
                    }"></i>

                    ${
                        change >= 0
                            ? "+"
                            : ""
                    }${change.toFixed(2)}% Today

                `;


                priceChange.className =
                    `price-change ${
                        negative
                            ? "negative"
                            : "positive"
                    }`;

            }
            else {

                priceChange.innerHTML = `

                    <i class="bi bi-dash"></i>

                    Live data unavailable

                `;


                priceChange.className =
                    "price-change";

            }

        }


        updateTradeValue();

        updateVirtualCashUI();

        updatePortfolioImpact();

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
        .querySelectorAll(
            ".sidebar-link"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        if (
                            window.innerWidth <=
                            991
                        ) {

                            closeSidebar();

                        }

                    }
                );

            }
        );



    /* =====================================================
       SIDEBAR LOGOUT
    ===================================================== */

    document
        .getElementById(
            "sidebarLogout"
        )
        ?.addEventListener(
            "click",
            async () => {

                const confirmed =
                    confirm(
                        "Are you sure you want to log out?"
                    );


                if (!confirmed) {
                    return;
                }


                await logoutUser();

            }
        );



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


    function applyTheme(
        theme
    ) {

        document.body.classList.toggle(
            "dark-theme",
            theme === "dark"
        );


        localStorage.setItem(
            "investopia-theme",
            theme
        );


        updateThemeIcon();


        if (stockChart) {

            renderCurrentChart();

        }

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
       DATE HELPERS
    ===================================================== */

    function pad(
        value
    ) {

        return String(value)
            .padStart(
                2,
                "0"
            );

    }



    function formatISTDateTime(
        date
    ) {

        const parts =
            new Intl.DateTimeFormat(
                "en-GB",
                {

                    timeZone:
                        "Asia/Kolkata",

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hourCycle:
                        "h23"

                }
            ).formatToParts(
                date
            );


        const values = {};


        parts.forEach(
            part => {

                if (
                    part.type !==
                    "literal"
                ) {

                    values[
                        part.type
                    ] =
                        part.value;

                }

            }
        );


        return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}`;

    }



    function getISTDate(
        daysAgo = 0
    ) {

        const date =
            new Date();


        date.setDate(
            date.getDate() -
            daysAgo
        );


        return date;

    }



    /* =====================================================
       HISTORICAL CHART REQUEST
    ===================================================== */

    function getChartRequest(
        period
    ) {

        const now =
            new Date();


        if (
            period === "1D"
        ) {

            const today =
                getISTDate(0);


            return {

                interval:
                    "FIVE_MINUTE",

                from:
                    `${today.getFullYear()}-${pad(
                        today.getMonth() + 1
                    )}-${pad(
                        today.getDate()
                    )} 09:15`,

                to:
                    formatISTDateTime(
                        now
                    )

            };

        }


        const days = {

            "1W":
                7,

            "1M":
                30,

            "1Y":
                365,

            "5Y":
                1825

        };


        const fromDate =
            getISTDate(
                days[period] || 30
            );


        return {

            interval:
                "ONE_DAY",

            from:
                `${fromDate.getFullYear()}-${pad(
                    fromDate.getMonth() + 1
                )}-${pad(
                    fromDate.getDate()
                )} 09:15`,

            to:
                formatISTDateTime(
                    now
                )

        };

    }



    /* =====================================================
       FETCH HISTORICAL CANDLES
    ===================================================== */

    async function fetchHistoricalCandles(
        period
    ) {

        if (!symbolToken) {

            return [];

        }


        if (
            chartCache[period]
        ) {

            return chartCache[period];

        }


        const request =
            getChartRequest(
                period
            );


        try {

            const url =
                `${API_BASE_URL}/api/stocks/candles` +
                `?exchange=${encodeURIComponent(
                    exchange
                )}` +
                `&token=${encodeURIComponent(
                    symbolToken
                )}` +
                `&interval=${encodeURIComponent(
                    request.interval
                )}` +
                `&from=${encodeURIComponent(
                    request.from
                )}` +
                `&to=${encodeURIComponent(
                    request.to
                )}`;


            console.log(
                "Historical candle request:",
                url
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


            const candles =
                result
                    ?.data
                    ?.data;


            if (
                !Array.isArray(
                    candles
                )
            ) {

                throw new Error(
                    "Invalid historical candle response."
                );

            }


            chartCache[period] =
                candles;


            return candles;

        }
        catch (error) {

            console.error(
                `Historical data error (${period}):`,
                error
            );


            return [];

        }

    }



    /* =====================================================
       FORMAT CHART LABEL
    ===================================================== */

    function formatChartLabel(
        timestamp,
        period
    ) {

        const date =
            new Date(timestamp);


        if (
            period === "1D"
        ) {

            return date.toLocaleTimeString(
                "en-IN",
                {

                    timeZone:
                        "Asia/Kolkata",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hour12:
                        false

                }
            );

        }


        return date.toLocaleDateString(
            "en-IN",
            {

                timeZone:
                    "Asia/Kolkata",

                day:
                    "2-digit",

                month:
                    "short"

            }
        );

    }



    /* =====================================================
       CREATE CHART
    ===================================================== */

    function createChart(
        period,
        candles
    ) {

        const canvas =
            document.getElementById(
                "stockChart"
            );


        if (
            !canvas ||
            typeof Chart ===
            "undefined"
        ) {

            return;

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


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


        if (stockChart) {

            stockChart.destroy();

        }


        if (
            !Array.isArray(
                candles
            ) ||
            !candles.length
        ) {

            stockChart =
                null;


            if (chartMessage) {

                chartMessage.textContent =
                    "No historical market data is available for this period.";

            }


            return;

        }


        if (chartMessage) {

            chartMessage.textContent =
                "";

        }


        const labels =
            candles.map(
                candle =>
                    formatChartLabel(
                        candle[0],
                        period
                    )
            );


        const values =
            candles.map(
                candle =>
                    Number(
                        candle[4]
                    )
            );


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                270
            );


        gradient.addColorStop(
            0,
            "rgba(22,163,74,.22)"
        );


        gradient.addColorStop(
            1,
            "rgba(22,163,74,0)"
        );


        stockChart =
            new Chart(
                ctx,
                {

                    type:
                        "line",

                    data: {

                        labels:
                            labels,

                        datasets: [

                            {

                                data:
                                    values,

                                borderColor:
                                    "#16a34a",

                                backgroundColor:
                                    gradient,

                                borderWidth:
                                    2.5,

                                fill:
                                    true,

                                tension:
                                    0.35,

                                pointRadius:
                                    0,

                                pointHoverRadius:
                                    5,

                                pointHoverBackgroundColor:
                                    "#16a34a",

                                pointHoverBorderColor:
                                    "#fff",

                                pointHoverBorderWidth:
                                    2

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

                                titleColor:
                                    "#fff",

                                bodyColor:
                                    "#fff",

                                displayColors:
                                    false,


                                callbacks: {

                                    label:
                                        context =>
                                            ` ₹${Number(
                                                context.parsed.y
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
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
                                        text,

                                    font: {

                                        size:
                                            9

                                    },

                                    maxTicksLimit:
                                        8

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

                                    font: {

                                        size:
                                            9

                                    },


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
       LOAD CHART
    ===================================================== */

    async function loadChartPeriod(
        period
    ) {

        if (!symbolToken) {

            return;

        }


        const requestId =
            ++chartRequestId;


        const candles =
            await fetchHistoricalCandles(
                period
            );


        if (
            requestId !==
            chartRequestId
        ) {

            return;

        }


        createChart(
            period,
            candles
        );

    }



    /* =====================================================
       RENDER CACHED CHART
    ===================================================== */

    function renderCurrentChart() {

        const candles =
            chartCache[
                currentPeriod
            ];


        if (
            candles &&
            candles.length
        ) {

            createChart(
                currentPeriod,
                candles
            );

        }

    }



    /* =====================================================
       CHART PERIOD BUTTONS
    ===================================================== */

    document
        .querySelectorAll(
            "#chartPeriods button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        document
                            .querySelectorAll(
                                "#chartPeriods button"
                            )
                            .forEach(
                                btn =>
                                    btn.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        currentPeriod =
                            button.dataset.period;


                        await loadChartPeriod(
                            currentPeriod
                        );

                    }
                );

            }
        );



    /* =====================================================
       VIRTUAL TRADING
       USER-SPECIFIC
    ===================================================== */

    let virtualCash =
        Number(
            localStorage.getItem(
                CASH_KEY
            )
        );


    if (
        !Number.isFinite(
            virtualCash
        )
    ) {

        virtualCash =
            100000;

    }


    let holdings = {};


    try {

        holdings =
            JSON.parse(
                localStorage.getItem(
                    HOLDINGS_KEY
                ) || "{}"
            );

    }
    catch {

        holdings = {};

    }



    /* =====================================================
       NORMALIZE HOLDING
    ===================================================== */

    function normalizeHolding(
        value
    ) {

        if (
            typeof value ===
            "number"
        ) {

            return {

                quantity:
                    Math.max(
                        0,
                        value
                    ),

                avgPrice:
                    0

            };

        }


        if (
            value &&
            typeof value ===
            "object"
        ) {

            return {

                quantity:
                    Number(
                        value.quantity
                    ) || 0,

                avgPrice:
                    Number(
                        value.avgPrice
                    ) || 0,

                exchange:
                    value.exchange ||
                    "NSE",

                token:
                    value.token ||
                    ""

            };

        }


        return {

            quantity:
                0,

            avgPrice:
                0

        };

    }



    /* =====================================================
       GET CURRENT HOLDING
    ===================================================== */

    function getCurrentHolding() {

        const holding =
            normalizeHolding(
                holdings[
                    baseSymbol
                ]
            );


        return holding;

    }



    /* =====================================================
       SAVE TRADING DATA
    ===================================================== */

    function saveTradingData() {

        localStorage.setItem(
            CASH_KEY,
            String(
                virtualCash
            )
        );


        localStorage.setItem(
            HOLDINGS_KEY,
            JSON.stringify(
                holdings
            )
        );

    }



    /* =====================================================
       TRANSACTION HISTORY
    ===================================================== */

    function saveTransaction(
        type,
        qty,
        price,
        total
    ) {

        let transactions = [];


        try {

            transactions =
                JSON.parse(
                    localStorage.getItem(
                        TRANSACTIONS_KEY
                    ) || "[]"
                );

        }
        catch {

            transactions = [];

        }


        transactions.unshift({

            id:
                crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,

            type:
                type,

            symbol:
                baseSymbol,

            tradingSymbol:
                tradingSymbol,

            exchange:
                exchange,

            quantity:
                qty,

            price:
                price,

            total:
                total,

            timestamp:
                new Date().toISOString()

        });


        /*
         * Keep latest 100 transactions.
         */

        transactions =
            transactions.slice(
                0,
                100
            );


        localStorage.setItem(
            TRANSACTIONS_KEY,
            JSON.stringify(
                transactions
            )
        );

    }



    /* =====================================================
       UPDATE VIRTUAL CASH UI
    ===================================================== */

    function updateVirtualCashUI() {

        if (
            virtualCashElement
        ) {

            virtualCashElement.textContent =
                formatMoney(
                    virtualCash
                );

        }

    }



    /* =====================================================
       UPDATE TRADE VALUE
    ===================================================== */

    function updateTradeValue() {

        const qty =
            Math.max(
                0,
                Number(
                    quantity?.value
                ) || 0
            );


        const price =
            Number(
                asset.price
            );


        if (
            tradeValue
        ) {

            if (
                liveDataAvailable &&
                Number.isFinite(
                    price
                ) &&
                price > 0
            ) {

                tradeValue.textContent =
                    formatMoney(
                        qty * price
                    );

            }
            else {

                tradeValue.textContent =
                    "₹--";

            }

        }

    }


    quantity?.addEventListener(
        "input",
        updateTradeValue
    );



    /* =====================================================
       UPDATE PORTFOLIO IMPACT
    ===================================================== */

    function updatePortfolioImpact() {

        const holding =
            getCurrentHolding();


        const qty =
            holding.quantity;


        if (
            portfolioHolding
        ) {

            portfolioHolding.textContent =
                formatQuantity(
                    qty
                );

        }


        if (
            portfolioProgress
        ) {

            /*
             * This progress bar is only a
             * visual holding indicator.
             *
             * It is not pretending to be
             * sector exposure.
             */

            const percentage =
                Math.min(
                    100,
                    qty > 0
                        ? 100
                        : 0
                );


            portfolioProgress.style.width =
                `${percentage}%`;

        }


        if (
            portfolioMessage
        ) {

            if (qty > 0) {

                portfolioMessage.textContent =
                    `You currently hold ${formatQuantity(
                        qty
                    )} unit(s) of ${baseSymbol} virtually.`;

            }
            else {

                portfolioMessage.textContent =
                    `You currently do not hold ${baseSymbol} virtually.`;

            }

        }

    }



    /* =====================================================
       TRADE MESSAGE
    ===================================================== */

    function showTradeMessage(
        message
    ) {

        alert(
            message
        );

    }



    /* =====================================================
       VIRTUAL BUY
    ===================================================== */

    buyButton?.addEventListener(
        "click",
        () => {

            if (
                !liveDataAvailable ||
                !asset.price
            ) {

                showTradeMessage(
                    "Live market data is unavailable. Please try again."
                );

                return;

            }


            const qty =
                Math.floor(
                    Number(
                        quantity?.value
                    )
                );


            if (
                !qty ||
                qty < 1
            ) {

                showTradeMessage(
                    "Please enter a valid quantity."
                );

                return;

            }


            const total =
                qty *
                asset.price;


            if (
                total >
                virtualCash
            ) {

                showTradeMessage(
                    `Insufficient virtual cash.

Available:
${formatMoney(
    virtualCash
)}

Required:
${formatMoney(
    total
)}`
                );

                return;

            }


            const existing =
                getCurrentHolding();


            const existingQuantity =
                existing.quantity;


            const existingAvgPrice =
                existing.avgPrice;


            const newQuantity =
                existingQuantity +
                qty;


            /*
             * Calculate weighted average
             * purchase price.
             */

            const newAveragePrice =
                existingQuantity > 0 &&
                existingAvgPrice > 0

                    ? (
                        (
                            existingQuantity *
                            existingAvgPrice
                        ) +
                        (
                            qty *
                            asset.price
                        )
                    ) /
                    newQuantity

                    : asset.price;


            virtualCash -=
                total;


            holdings[baseSymbol] = {

                quantity:
                    newQuantity,

                avgPrice:
                    newAveragePrice,

                exchange:
                    exchange,

                token:
                    symbolToken

            };


            saveTradingData();


            saveTransaction(
                "BUY",
                qty,
                asset.price,
                total
            );


            updateVirtualCashUI();

            updatePortfolioImpact();


            showTradeMessage(
                `Virtual BUY successful!

${qty} × ${tradingSymbol}

Price:
${formatMoney(
    asset.price
)}

Value:
${formatMoney(
    total
)}

Average purchase price:
${formatMoney(
    newAveragePrice
)}`
            );

        }
    );



    /* =====================================================
       VIRTUAL SELL
    ===================================================== */

    sellButton?.addEventListener(
        "click",
        () => {

            if (
                !liveDataAvailable ||
                !asset.price
            ) {

                showTradeMessage(
                    "Live market data is unavailable. Please try again."
                );

                return;

            }


            const qty =
                Math.floor(
                    Number(
                        quantity?.value
                    )
                );


            if (
                !qty ||
                qty < 1
            ) {

                showTradeMessage(
                    "Please enter a valid quantity."
                );

                return;

            }


            const existing =
                getCurrentHolding();


            const owned =
                existing.quantity;


            if (
                owned <
                qty
            ) {

                showTradeMessage(
                    `You do not own enough ${tradingSymbol} virtually.

Owned:
${formatQuantity(
    owned
)}`
                );

                return;

            }


            const total =
                qty *
                asset.price;


            virtualCash +=
                total;


            const remaining =
                owned -
                qty;


            if (
                remaining <= 0
            ) {

                delete holdings[
                    baseSymbol
                ];

            }
            else {

                holdings[
                    baseSymbol
                ] = {

                    ...existing,

                    quantity:
                        remaining

                };

            }


            saveTradingData();


            saveTransaction(
                "SELL",
                qty,
                asset.price,
                total
            );


            updateVirtualCashUI();

            updatePortfolioImpact();


            showTradeMessage(
                `Virtual SELL successful!

${qty} × ${tradingSymbol}

Price:
${formatMoney(
    asset.price
)}

Value:
${formatMoney(
    total
)}`
            );

        }
    );



    /* =====================================================
       SEARCH
    ===================================================== */

    stockSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            const query =
                stockSearch.value.trim();


            if (!query) {
                return;
            }


            /*
             * Send search to Market.
             * Market uses Angel One search.
             */

            window.location.href =
                `../market/market.html?search=${encodeURIComponent(
                    query
                )}`;

        }
    );



    /* =====================================================
       CTRL + K
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() ===
                "k"
            ) {

                event.preventDefault();

                stockSearch?.focus();

            }

        }
    );



    /* =====================================================
       SIMPLE TECHNICAL INFORMATION
       ONLY FROM ACTUAL CANDLES
    ===================================================== */

    function calculateSMA(
        candles,
        period
    ) {

        if (
            !Array.isArray(candles) ||
            candles.length < period
        ) {

            return null;

        }


        const recent =
            candles.slice(
                -period
            );


        const closes =
            recent
                .map(
                    candle =>
                        Number(
                            candle[4]
                        )
                )
                .filter(
                    Number.isFinite
                );


        if (
            closes.length <
            period
        ) {

            return null;

        }


        const total =
            closes.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            );


        return (
            total /
            closes.length
        );

    }



    function calculateRSI(
        candles,
        period = 14
    ) {

        if (
            !Array.isArray(candles) ||
            candles.length <= period
        ) {

            return null;

        }


        const closes =
            candles
                .map(
                    candle =>
                        Number(
                            candle[4]
                        )
                )
                .filter(
                    Number.isFinite
                );


        if (
            closes.length <= period
        ) {

            return null;

        }


        let gains = 0;

        let losses = 0;


        for (
            let i = 1;
            i <= period;
            i++
        ) {

            const difference =
                closes[i] -
                closes[i - 1];


            if (
                difference >= 0
            ) {

                gains +=
                    difference;

            }
            else {

                losses +=
                    Math.abs(
                        difference
                    );

            }

        }


        let averageGain =
            gains /
            period;


        let averageLoss =
            losses /
            period;


        for (
            let i = period + 1;
            i < closes.length;
            i++
        ) {

            const difference =
                closes[i] -
                closes[i - 1];


            const gain =
                difference > 0
                    ? difference
                    : 0;


            const loss =
                difference < 0
                    ? Math.abs(
                        difference
                    )
                    : 0;


            averageGain =
                (
                    (
                        averageGain *
                        (period - 1)
                    ) +
                    gain
                ) /
                period;


            averageLoss =
                (
                    (
                        averageLoss *
                        (period - 1)
                    ) +
                    loss
                ) /
                period;

        }


        if (
            averageLoss === 0
        ) {

            return 100;

        }


        const relativeStrength =
            averageGain /
            averageLoss;


        return (
            100 -
            (
                100 /
                (
                    1 +
                    relativeStrength
                )
            )
        );

    }



    function updateTechnicalAnalysis(
        candles
    ) {

        const trendElement =
            document.getElementById(
                "technicalTrend"
            );


        const ma50Element =
            document.getElementById(
                "ma50"
            );


        const ma200Element =
            document.getElementById(
                "ma200"
            );


        const rsiElement =
            document.getElementById(
                "rsiValue"
            );


        if (
            !Array.isArray(
                candles
            ) ||
            !candles.length
        ) {

            return;

        }


        const latestClose =
            Number(
                candles[
                    candles.length - 1
                ][4]
            );


        const ma50 =
            calculateSMA(
                candles,
                50
            );


        const ma200 =
            calculateSMA(
                candles,
                200
            );


        const rsi =
            calculateRSI(
                candles
            );


        if (
            ma50Element
        ) {

            ma50Element.textContent =
                ma50 !== null
                    ? formatMoney(
                        ma50
                    )
                    : "—";

        }


        if (
            ma200Element
        ) {

            ma200Element.textContent =
                ma200 !== null
                    ? formatMoney(
                        ma200
                    )
                    : "—";

        }


        if (
            rsiElement
        ) {

            rsiElement.textContent =
                rsi !== null
                    ? rsi.toFixed(2)
                    : "—";

        }


        if (
            trendElement
        ) {

            if (
                ma50 !== null &&
                ma200 !== null
            ) {

                if (
                    latestClose > ma50 &&
                    ma50 > ma200
                ) {

                    trendElement.textContent =
                        "Bullish";

                }
                else if (
                    latestClose < ma50 &&
                    ma50 < ma200
                ) {

                    trendElement.textContent =
                        "Bearish";

                }
                else {

                    trendElement.textContent =
                        "Mixed";

                }

            }
            else {

                trendElement.textContent =
                    "Insufficient data";

            }

        }

    }



    /* =====================================================
       LOAD TECHNICAL DATA
    ===================================================== */

    async function loadTechnicalData() {

        /*
         * Use 1Y daily candles for technical calculations.
         */

        const candles =
            await fetchHistoricalCandles(
                "1Y"
            );


        updateTechnicalAnalysis(
            candles
        );

    }



    /* =====================================================
       AI / SCORE PLACEHOLDER
       NO FABRICATED SCORES
    ===================================================== */

    function updateAnalysisState() {

        const score =
            document.getElementById(
                "investopiaScore"
            );


        const scoreLabel =
            document.getElementById(
                "scoreLabel"
            );


        const scoreDescription =
            document.getElementById(
                "scoreDescription"
            );


        const recommendation =
            document.getElementById(
                "aiRecommendation"
            );


        const confidence =
            document.getElementById(
                "aiConfidence"
            );


        if (score) {

            score.textContent =
                "—";

        }


        if (scoreLabel) {

            scoreLabel.textContent =
                "DATA REQUIRED";

        }


        if (scoreDescription) {

            scoreDescription.textContent =
                "A verified fundamentals data source is required for a complete score.";

        }


        if (recommendation) {

            recommendation.textContent =
                liveDataAvailable
                    ? "Market data available for further research"
                    : "Waiting for verified market data";

        }


        if (confidence) {

            confidence.innerHTML =
                "Confidence <strong>—</strong>";

        }

    }



    /* =====================================================
       INITIALIZE LIVE STOCK
    ===================================================== */

    async function initializeLiveStock() {

        /*
         * First show loading state.
         */

        loadAsset();


        /*
         * Resolve instrument through Angel One.
         */

        const stock =
            await resolveStock();


        if (!stock) {

            console.error(
                "Unable to resolve instrument through Angel One."
            );


            if (chartMessage) {

                chartMessage.textContent =
                    "Unable to resolve this instrument through Angel One.";

            }


            updateAnalysisState();


            return;

        }


        /*
         * Store actual resolved values.
         */

        tradingSymbol =
            stock.tradingSymbol;


        symbolToken =
            stock.symbolToken;


        exchange =
            stock.exchange;


        /*
         * Fetch live market data.
         */

        const marketData =
            await fetchLiveMarketData(
                stock
            );


        if (marketData) {

            updateAssetFromMarketData(
                marketData
            );

        }
        else {

            liveDataAvailable =
                false;

        }


        /*
         * Render live data.
         */

        loadAsset();


        updateAnalysisState();


        /*
         * Load default 1D chart.
         */

        await loadChartPeriod(
            currentPeriod
        );


        /*
         * Load technical information
         * from actual historical candles.
         */

        await loadTechnicalData();


        /*
         * Update portfolio information.
         */

        updatePortfolioImpact();


        console.log(
            "Investopia Stock Details initialized:",
            {

                userId:
                    user.id,

                exchange:
                    stock.exchange,

                tradingSymbol:
                    stock.tradingSymbol,

                symbolToken:
                    stock.symbolToken,

                livePrice:
                    asset.price

            }
        );

    }



    /* =====================================================
       RESPONSIVE SIDEBAR
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
       START
    ===================================================== */

    await initializeLiveStock();


});