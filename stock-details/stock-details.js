/* =========================================================
   INVESTOPIA TRADEAI - STOCK DETAILS JS
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


    /* ==================== ELEMENTS ==================== */

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


    /* =====================================================
       EXISTING ASSET INFORMATION
       
       Used for company names, logos, scores and risk labels.
       LIVE PRICE DATA comes from Angel One.
    ===================================================== */

    const assets = {

        TCS: {
            name: "TCS",
            company: "Tata Consultancy Services",
            type: "STOCK",
            logo: "T",
            price: 3421.50,
            change: "+1.24%",
            score: 78,
            risk: "Moderate Risk"
        },

        RELIANCE: {
            name: "RELIANCE",
            company: "Reliance Industries",
            type: "STOCK",
            logo: "R",
            price: 1425.20,
            change: "+0.84%",
            score: 75,
            risk: "Moderate Risk"
        },

        INFY: {
            name: "INFY",
            company: "Infosys",
            type: "STOCK",
            logo: "I",
            price: 1512.30,
            change: "-0.32%",
            score: 72,
            risk: "Moderate Risk"
        },

        HDFCBANK: {
            name: "HDFCBANK",
            company: "HDFC Bank",
            type: "STOCK",
            logo: "H",
            price: 1746.80,
            change: "+1.12%",
            score: 81,
            risk: "Low–Moderate Risk"
        },

        NIFTYBEES: {
            name: "NIFTYBEES",
            company: "Nippon India ETF Nifty BeES",
            type: "ETF",
            logo: "N",
            price: 265.40,
            change: "+0.63%",
            score: 80,
            risk: "Moderate Risk"
        },

        PPFAS: {
            name: "PPFAS",
            company: "Parag Parikh Flexi Cap Fund",
            type: "MUTUAL FUND",
            logo: "P",
            price: 82.36,
            change: "+0.42%",
            score: 83,
            risk: "Moderate Risk"
        }

    };


    /* =====================================================
       GET URL PARAMETERS
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const rawSymbol =
        (
            params.get("symbol") ||
            "TCS"
        ).toUpperCase();


    const exchange =
        (
            params.get("exchange") ||
            "NSE"
        ).toUpperCase();


    let symbolToken =
        params.get("token") ||
        "";


    /*
        Example:

        symbol = RELIANCE-EQ
        display symbol = RELIANCE
    */

    const baseSymbol =
        rawSymbol
            .replace(/-EQ$/i, "")
            .toUpperCase();


    /*
        Existing asset information if available.
    */

    let asset =
        assets[baseSymbol] || {

            name: baseSymbol,

            company: baseSymbol,

            type: "STOCK",

            logo:
                baseSymbol.charAt(0) ||
                "S",

            price: 0,

            change: "0.00%",

            score: "—",

            risk: "Market Data"

        };


    /*
        Store the actual Angel One trading symbol.

        Example:

        RELIANCE-EQ
    */

    let tradingSymbol =
        rawSymbol;


    let liveDataAvailable =
        false;


    /* =====================================================
       CHART DATA CACHE
    ===================================================== */

    const chartCache = {};


    let stockChart = null;

    let currentPeriod = "1D";

    let chartRequestId = 0;


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    function formatMoney(value) {

        return `₹${Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    }


    /* =====================================================
       SEARCH / RESOLVE STOCK
    ===================================================== */

    async function resolveStock() {

        /*
            If Market page already supplied
            a symbol token, use it directly.
        */

        if (symbolToken) {

            return {

                exchange: exchange,

                tradingSymbol:
                    tradingSymbol,

                symbolToken:
                    String(symbolToken)

            };

        }


        /*
            No token was supplied.

            Search Angel One.

            Example:

            RELIANCE
            ↓
            RELIANCE-EQ
            ↓
            2885
        */

        try {

            const searchTerm =
                baseSymbol;


            const url =
                `${API_BASE_URL}/api/stocks/search` +
                `?search=${encodeURIComponent(searchTerm)}` +
                `&exchange=${encodeURIComponent(exchange)}`;


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
                !Array.isArray(result.data)
            ) {

                throw new Error(
                    "No stock search data returned."
                );

            }


            /*
                Prefer normal EQ series.
            */

            const equity =
                result.data.find(stock => {

                    const currentSymbol =
                        (
                            stock.tradingsymbol ||
                            ""
                        ).toUpperCase();


                    return (
                        currentSymbol ===
                        `${baseSymbol}-EQ`
                    );

                });


            const selected =
                equity ||
                result.data[0];


            if (!selected) {

                throw new Error(
                    "Stock not found."
                );

            }


            tradingSymbol =
                selected.tradingsymbol;


            symbolToken =
                String(
                    selected.symboltoken
                );


            return {

                exchange:
                    selected.exchange ||
                    exchange,

                tradingSymbol:
                    tradingSymbol,

                symbolToken:
                    symbolToken

            };

        }
        catch (error) {

            console.error(
                "Stock resolution error:",
                error
            );


            return null;

        }

    }


    /* =====================================================
       FETCH LIVE MARKET DATA
       
       Uses FULL market-data mode so we get:
       LTP
       Open
       High
       Low
       Close
       Net change
       Percentage change
    ===================================================== */

    async function fetchLiveMarketData(
        stock
    ) {

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
                !Array.isArray(fetched) ||
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
       UPDATE ASSET USING LIVE DATA
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


        /*
            Use Angel One percentChange
            when available.

            If unavailable, calculate it
            using previous close.
        */

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

            } else {

                percentChange =
                    0;

            }

        }


        asset.change =
            `${
                percentChange >= 0
                    ? "+"
                    : ""
            }${percentChange.toFixed(2)}%`;


        liveDataAvailable =
            true;


        console.log(
            "Live stock price:",
            livePrice
        );

    }


    /* =====================================================
       LOAD ASSET UI
    ===================================================== */

    function loadAsset() {

        document.title =
            `${asset.name} | Investopia TradeAI`;


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


        const investopiaScore =
            document.getElementById(
                "investopiaScore"
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
                asset.name;

        }


        if (currentPrice) {

            if (
                Number.isFinite(
                    Number(asset.price)
                ) &&
                Number(asset.price) > 0
            ) {

                currentPrice.textContent =
                    formatMoney(
                        asset.price
                    );

            } else {

                currentPrice.textContent =
                    "₹--";

            }

        }


        const change =
            document.getElementById(
                "priceChange"
            );


        if (change) {

            const numericChange =
                parseFloat(
                    asset.change
                );


            const negative =
                Number.isFinite(
                    numericChange
                ) &&
                numericChange < 0;


            change.innerHTML = `

                <i class="bi ${
                    negative
                        ? "bi-arrow-down"
                        : "bi-arrow-up"
                }"></i>

                ${asset.change} Today

            `;


            change.className =
                `price-change ${
                    negative
                        ? "negative"
                        : "positive"
                }`;

        }


        if (investopiaScore) {

            investopiaScore.textContent =
                asset.score;

        }


        if (
            quantity &&
            !quantity.value
        ) {

            quantity.value =
                1;

        }


        updateTradeValue();

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
                        window.innerWidth <=
                        991
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

    function pad(value) {

        return String(value)
            .padStart(2, "0");

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
            ).formatToParts(date);


        const values = {};


        parts.forEach(part => {

            if (
                part.type !==
                "literal"
            ) {

                values[part.type] =
                    part.value;

            }

        });


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
       HISTORICAL CHART CONFIGURATION
    ===================================================== */

    function getChartRequest(
        period
    ) {

        const now =
            new Date();


        if (period === "1D") {

            const today =
                getISTDate(0);


            const from =
                `${today.getFullYear()}-${pad(
                    today.getMonth() + 1
                )}-${pad(
                    today.getDate()
                )} 09:15`;


            const to =
                formatISTDateTime(
                    now
                );


            return {

                interval:
                    "FIVE_MINUTE",

                from:
                    from,

                to:
                    to

            };

        }


        if (period === "1W") {

            const fromDate =
                getISTDate(7);


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


        if (period === "1M") {

            const fromDate =
                getISTDate(30);


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


        if (period === "1Y") {

            const fromDate =
                getISTDate(365);


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


        if (period === "5Y") {

            const fromDate =
                getISTDate(1825);


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


        return {

            interval:
                "ONE_DAY",

            from:
                formatISTDateTime(
                    getISTDate(30)
                ),

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


        /*
            Return cached data if already loaded.
        */

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


            console.log(
                "Historical candle response:",
                result
            );


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
       RENDER CHART
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


        if (stockChart) {

            stockChart.destroy();

        }


        /*
            No historical data available.
        */

        if (
            !Array.isArray(candles) ||
            !candles.length
        ) {

            stockChart = null;

            return;

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
                                    .35,

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
       LOAD CHART FOR PERIOD
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
       RENDER CURRENT CACHED CHART
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
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    document
                        .querySelectorAll(
                            "#chartPeriods button"
                        )
                        .forEach(btn =>
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

        });


    /* =====================================================
       VIRTUAL TRADING
    ===================================================== */

    let virtualCash =
        Number(
            localStorage.getItem(
                "investopiaVirtualCash"
            )
        ) || 100000;


    let holdings =
        JSON.parse(
            localStorage.getItem(
                "investopiaHoldings"
            ) || "{}"
        );


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


        if (tradeValue) {

            tradeValue.textContent =
                formatMoney(
                    qty *
                    Number(
                        asset.price
                    )
                );

        }

    }


    quantity?.addEventListener(
        "input",
        updateTradeValue
    );


    /* =====================================================
       SAVE TRADING DATA
    ===================================================== */

    function saveTradingData() {

        localStorage.setItem(
            "investopiaVirtualCash",
            virtualCash
        );


        localStorage.setItem(
            "investopiaHoldings",
            JSON.stringify(
                holdings
            )
        );

    }


    /* =====================================================
       TRADE MESSAGE
    ===================================================== */

    function showTradeMessage(
        message,
        success = true
    ) {

        alert(message);

    }


    /* =====================================================
       VIRTUAL BUY
    ===================================================== */

    buyButton?.addEventListener(
        "click",
        () => {

            /*
                Do not allow virtual trades
                if live market data failed.
            */

            if (
                !liveDataAvailable ||
                !asset.price
            ) {

                showTradeMessage(
                    "Live market data is unavailable. Please try again.",
                    false
                );

                return;

            }


            const qty =
                Math.floor(
                    Number(
                        quantity.value
                    )
                );


            if (
                !qty ||
                qty < 1
            ) {

                showTradeMessage(
                    "Please enter a valid quantity.",
                    false
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
Available: ${formatMoney(
                        virtualCash
                    )}`,
                    false
                );

                return;

            }


            virtualCash -=
                total;


            holdings[baseSymbol] =
                (
                    holdings[baseSymbol] ||
                    0
                ) +
                qty;


            saveTradingData();


            showTradeMessage(
                `Virtual BUY successful!

${qty} × ${asset.name}
Price: ${formatMoney(
                    asset.price
                )}
Value: ${formatMoney(
                    total
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
                    "Live market data is unavailable. Please try again.",
                    false
                );

                return;

            }


            const qty =
                Math.floor(
                    Number(
                        quantity.value
                    )
                );


            const owned =
                holdings[
                    baseSymbol
                ] || 0;


            if (
                !qty ||
                qty < 1
            ) {

                showTradeMessage(
                    "Please enter a valid quantity.",
                    false
                );

                return;

            }


            if (
                owned <
                qty
            ) {

                showTradeMessage(
                    `You do not own enough ${asset.name} virtually.
Owned: ${owned}`,
                    false
                );

                return;

            }


            const total =
                qty *
                asset.price;


            virtualCash +=
                total;


            holdings[
                baseSymbol
            ] -=
                qty;


            if (
                holdings[
                    baseSymbol
                ] <= 0
            ) {

                delete holdings[
                    baseSymbol
                ];

            }


            saveTradingData();


            showTradeMessage(
                `Virtual SELL successful!

${qty} × ${asset.name}
Price: ${formatMoney(
                    asset.price
                )}
Value: ${formatMoney(
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


            window.location.href =
                `../market/market.html?search=${encodeURIComponent(
                    query
                )}`;

        }
    );


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
       INITIALIZE LIVE STOCK
    ===================================================== */

    async function initializeLiveStock() {

        /*
            First display the existing UI.
        */

        loadAsset();


        /*
            Resolve the Angel One
            trading symbol + token.
        */

        const stock =
            await resolveStock();


        if (!stock) {

            console.error(
                "Unable to resolve stock through Angel One."
            );

            loadAsset();

            return;

        }


        /*
            Store the actual values.
        */

        tradingSymbol =
            stock.tradingSymbol;


        symbolToken =
            stock.symbolToken;


        /*
            Get real-time market data.
        */

        const marketData =
            await fetchLiveMarketData(
                stock
            );


        if (marketData) {

            updateAssetFromMarketData(
                marketData
            );


            /*
                Update company metadata
                if this is a stock not already
                in the local metadata list.
            */

            if (
                !assets[baseSymbol]
            ) {

                asset.name =
                    baseSymbol;

                asset.company =
                    baseSymbol;

                asset.type =
                    "STOCK";

                asset.logo =
                    baseSymbol.charAt(0) ||
                    "S";

            }

        }


        /*
            Render the real price.
        */

        loadAsset();


        /*
            Load the default 1D
            historical chart.
        */

        await loadChartPeriod(
            currentPeriod
        );


        console.log(
            "Investopia Stock Details loaded:",
            {
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
       START
    ===================================================== */

    await initializeLiveStock();

});