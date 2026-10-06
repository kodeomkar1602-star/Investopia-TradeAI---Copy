/* ============================================================
   INVESTOPIA TRADEAI - INSIGHTS
   Live Angel One Market Data + Portfolio Insights
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* ============================================================
       CONFIGURATION
       ============================================================ */

    const API_BASE_URL =
        "https://investopia-tradeai-copy.onrender.com";


    /* ============================================================
       SESSION PROTECTION
       ============================================================ */

    const session = await requireAuth();

    if (!session) {
        return;
    }

    listenForAuthChanges();

    const user = session.user;

    console.log("Investopia logged-in user:", user);
    console.log("User ID:", user.id);
    console.log("User Email:", user.email);


    /* ============================================================
       USER NAME
       ============================================================ */

    const metadata = user.user_metadata || {};

    const userName =
        metadata.full_name ||
        metadata.name ||
        metadata.username ||
        (user.email
            ? user.email.split("@")[0]
            : "User");


    /* ============================================================
       ELEMENTS
       ============================================================ */

    const sidebar =
        document.querySelector("#sidebar");

    const sidebarToggle =
        document.querySelector("#sidebarToggle");

    const sidebarClose =
        document.querySelector("#sidebarClose");

    const sidebarOverlay =
        document.querySelector("#sidebarOverlay");

    const themeToggle =
        document.querySelector("#themeToggle");

    const themeIcon =
        document.querySelector("#themeIcon");

    const globalSearch =
        document.querySelector("#globalSearch");


    /* ============================================================
       USER PROFILE
       ============================================================ */

    const profileName =
        document.querySelector("#profileName");

    const profileAvatar =
        document.querySelector("#profileAvatar");


    if (profileName) {
        profileName.textContent = userName;
    }


    if (profileAvatar) {

        const initials =
            userName
                .trim()
                .split(/\s+/)
                .map(part => part.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase();

        profileAvatar.textContent =
            initials || "U";
    }


    /* ============================================================
       INTRO PERSONALIZATION
       ============================================================ */

    const insightsIntroText =
        document.querySelector("#insightsIntroText");


    if (insightsIntroText) {

        insightsIntroText.textContent =
            `Live market and portfolio insights prepared for ${userName}.`;

    }


    /* ============================================================
       SIDEBAR
       ============================================================ */

    function openSidebar() {

        if (sidebar) {
            sidebar.classList.add("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("show");
        }

    }


    function closeSidebar() {

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

    }


    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            openSidebar
        );

    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /* ============================================================
       THEME
       ============================================================ */

    const savedTheme =
        localStorage.getItem("investopia-theme");


    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        if (themeIcon) {

            themeIcon.className =
                "bi bi-sun";

        }

    }


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "dark-mode"
                );

                const isDark =
                    document.body.classList.contains(
                        "dark-mode"
                    );

                localStorage.setItem(
                    "investopia-theme",
                    isDark ? "dark" : "light"
                );


                if (themeIcon) {

                    themeIcon.className =
                        isDark
                            ? "bi bi-sun"
                            : "bi bi-moon-stars";

                }

            }
        );

    }


    /* ============================================================
       GLOBAL SEARCH
       ============================================================ */

    function performSearch() {

        if (!globalSearch) {
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


    if (globalSearch) {

        globalSearch.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    performSearch();

                }

            }
        );

    }


    /* ============================================================
       CTRL + K SEARCH SHORTCUT
       ============================================================ */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                if (globalSearch) {
                    globalSearch.focus();
                }

            }

        }
    );


    /* ============================================================
       NUMBER HELPERS
       ============================================================ */

    function toNumber(value) {

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : 0;

    }


    function formatINR(value) {

        if (!Number.isFinite(value)) {
            return "₹0";
        }

        return `₹${value.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        )}`;

    }


    function formatNumber(value) {

        if (!Number.isFinite(value)) {
            return "--";
        }

        return value.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

    }


    function formatPercent(value) {

        if (!Number.isFinite(value)) {
            return "--";
        }

        const sign =
            value > 0
                ? "+"
                : "";

        return `${sign}${value.toFixed(2)}%`;

    }


    /* ============================================================
       ANGEL ONE API
       ============================================================ */

    async function searchAngelOneStock(
        searchText,
        exchange = "NSE"
    ) {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/stocks/search?search=${encodeURIComponent(
                        searchText
                    )}&exchange=${encodeURIComponent(
                        exchange
                    )}`
                );


            if (!response.ok) {
                throw new Error(
                    `Search request failed: ${response.status}`
                );
            }


            const result =
                await response.json();


            if (
                !result ||
                !result.success ||
                !result.data
            ) {

                return [];

            }


            return Array.isArray(result.data)
                ? result.data
                : [];

        }

        catch (error) {

            console.error(
                `Angel One search failed for ${searchText}:`,
                error
            );

            return [];

        }

    }


    async function getStockLTP(
        exchange,
        tradingSymbol,
        symbolToken
    ) {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/stocks/ltp?exchange=${encodeURIComponent(
                        exchange
                    )}&symbol=${encodeURIComponent(
                        tradingSymbol
                    )}&token=${encodeURIComponent(
                        symbolToken
                    )}`
                );


            if (!response.ok) {
                throw new Error(
                    `LTP request failed: ${response.status}`
                );
            }


            const result =
                await response.json();


            if (!result.success) {
                return null;
            }


            const fetched =
                result?.data?.data?.fetched;


            if (
                !Array.isArray(fetched) ||
                !fetched.length
            ) {

                return null;

            }


            return fetched[0];

        }

        catch (error) {

            console.error(
                `LTP request failed for ${tradingSymbol}:`,
                error
            );

            return null;

        }

    }


    async function getMarketQuote(
        exchange,
        tradingSymbol,
        symbolToken
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
                        body: JSON.stringify({
                            mode: "FULL",
                            exchangeTokens: {
                                [exchange]: [
                                    String(symbolToken)
                                ]
                            }
                        })
                    }
                );


            if (!response.ok) {
                throw new Error(
                    `Market data request failed: ${response.status}`
                );
            }


            const result =
                await response.json();


            if (!result.success) {
                return null;
            }


            const fetched =
                result?.data?.data?.fetched;


            if (
                !Array.isArray(fetched) ||
                !fetched.length
            ) {

                return null;

            }


            const quote =
                fetched.find(
                    item =>
                        String(
                            item.symbolToken
                        ) ===
                        String(symbolToken)
                ) ||
                fetched[0];


            return quote || null;

        }

        catch (error) {

            console.error(
                `Market quote failed for ${tradingSymbol}:`,
                error
            );

            return null;

        }

    }


    /* ============================================================
       RESOLVE ANGEL ONE INSTRUMENT
       ============================================================ */

    async function resolveInstrument(
        searchText,
        exchange = "NSE"
    ) {

        const results =
            await searchAngelOneStock(
                searchText,
                exchange
            );


        if (!results.length) {
            return null;
        }


        const normalized =
            searchText
                .trim()
                .toUpperCase();


        const exactEQ =
            results.find(
                item =>
                    String(
                        item.tradingsymbol ||
                        item.tradingSymbol ||
                        ""
                    ).toUpperCase() ===
                    `${normalized}-EQ`
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
                    ).toUpperCase() ===
                    normalized
            );


        if (exact) {
            return exact;
        }


        return results[0];

    }


    /* ============================================================
       INDEX DATA
       ============================================================ */

    let niftyData = null;
    let sensexData = null;


    async function loadIndexData() {

        const niftyValue =
            document.querySelector("#niftyValue");

        const niftyChange =
            document.querySelector("#niftyChange");

        const sensexValue =
            document.querySelector("#sensexValue");

        const sensexChange =
            document.querySelector("#sensexChange");


        if (niftyChange) {
            niftyChange.textContent =
                "Loading live market data...";
        }


        if (sensexChange) {
            sensexChange.textContent =
                "Loading live market data...";
        }


        /*
         * Angel One search is used instead of hardcoding
         * instrument tokens.
         */

        const [
            niftyInstrument,
            sensexInstrument
        ] = await Promise.all([
            resolveInstrument("NIFTY 50", "NSE"),
            resolveInstrument("SENSEX", "BSE")
        ]);


        /* ========================================================
           NIFTY
        ======================================================== */

        if (niftyInstrument) {

            const symbol =
                niftyInstrument.tradingsymbol ||
                niftyInstrument.tradingSymbol;

            const token =
                niftyInstrument.symboltoken ||
                niftyInstrument.symbolToken;

            if (symbol && token) {

                niftyData =
                    await getMarketQuote(
                        "NSE",
                        symbol,
                        token
                    );


                if (!niftyData) {

                    niftyData =
                        await getStockLTP(
                            "NSE",
                            symbol,
                            token
                        );

                }

            }

        }


        /* ========================================================
           SENSEX
        ======================================================== */

        if (sensexInstrument) {

            const symbol =
                sensexInstrument.tradingsymbol ||
                sensexInstrument.tradingSymbol;

            const token =
                sensexInstrument.symboltoken ||
                sensexInstrument.symbolToken;

            if (symbol && token) {

                sensexData =
                    await getMarketQuote(
                        "BSE",
                        symbol,
                        token
                    );


                if (!sensexData) {

                    sensexData =
                        await getStockLTP(
                            "BSE",
                            symbol,
                            token
                        );

                }

            }

        }


        /* ========================================================
           UPDATE NIFTY UI
        ======================================================== */

        if (niftyData) {

            const ltp =
                toNumber(niftyData.ltp);

            const percentChange =
                toNumber(
                    niftyData.percentChange
                );


            if (niftyValue) {

                niftyValue.textContent =
                    formatNumber(ltp);

            }


            if (niftyChange) {

                niftyChange.textContent =
                    Number.isFinite(
                        niftyData.percentChange
                    )
                        ? formatPercent(
                            percentChange
                        )
                        : "Live price available";

                niftyChange.classList.remove(
                    "positive",
                    "negative"
                );


                if (percentChange > 0) {

                    niftyChange.classList.add(
                        "positive"
                    );

                }

                else if (percentChange < 0) {

                    niftyChange.classList.add(
                        "negative"
                    );

                }

            }

        }

        else {

            if (niftyValue) {
                niftyValue.textContent = "--";
            }

            if (niftyChange) {
                niftyChange.textContent =
                    "NIFTY data unavailable";
            }

        }


        /* ========================================================
           UPDATE SENSEX UI
        ======================================================== */

        if (sensexData) {

            const ltp =
                toNumber(sensexData.ltp);

            const percentChange =
                toNumber(
                    sensexData.percentChange
                );


            if (sensexValue) {

                sensexValue.textContent =
                    formatNumber(ltp);

            }


            if (sensexChange) {

                sensexChange.textContent =
                    Number.isFinite(
                        sensexData.percentChange
                    )
                        ? formatPercent(
                            percentChange
                        )
                        : "Live price available";

                sensexChange.classList.remove(
                    "positive",
                    "negative"
                );


                if (percentChange > 0) {

                    sensexChange.classList.add(
                        "positive"
                    );

                }

                else if (percentChange < 0) {

                    sensexChange.classList.add(
                        "negative"
                    );

                }

            }

        }

        else {

            if (sensexValue) {
                sensexValue.textContent = "--";
            }

            if (sensexChange) {
                sensexChange.textContent =
                    "SENSEX data unavailable";
            }

        }


        updateMarketMood();

    }


    /* ============================================================
       MARKET MOOD
       ============================================================ */

    function updateMarketMood() {

        const marketMood =
            document.querySelector("#marketMood");

        const moodDescription =
            document.querySelector("#moodDescription");


        const niftyChange =
            niftyData
                ? Number(
                    niftyData.percentChange
                )
                : null;


        const sensexChange =
            sensexData
                ? Number(
                    sensexData.percentChange
                )
                : null;


        const validChanges =
            [
                niftyChange,
                sensexChange
            ].filter(
                value =>
                    Number.isFinite(value)
            );


        if (!validChanges.length) {

            if (marketMood) {
                marketMood.textContent =
                    "Unavailable";
            }

            if (moodDescription) {
                moodDescription.textContent =
                    "Live index change data unavailable";
            }

            return;

        }


        const average =
            validChanges.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) /
            validChanges.length;


        let mood =
            "Neutral";

        let description =
            "Market indices are relatively balanced.";


        if (average >= 1) {

            mood =
                "Bullish";

            description =
                "Major tracked indices are showing positive momentum.";

        }

        else if (average >= 0.25) {

            mood =
                "Positive";

            description =
                "Major tracked indices are slightly positive.";

        }

        else if (average <= -1) {

            mood =
                "Bearish";

            description =
                "Major tracked indices are showing negative momentum.";

        }

        else if (average <= -0.25) {

            mood =
                "Cautious";

            description =
                "Major tracked indices are slightly negative.";

        }


        if (marketMood) {
            marketMood.textContent =
                mood;
        }


        if (moodDescription) {
            moodDescription.textContent =
                description;
        }

    }


    /* ============================================================
       PORTFOLIO STORAGE
       ============================================================ */

    function loadPortfolioData() {

        const portfolioKeys = [

            "investopiaHoldings",

            "investopia-portfolio",

            "investopiaPortfolio",

            "portfolioData"

        ];


        for (const key of portfolioKeys) {

            const storedData =
                localStorage.getItem(key);


            if (!storedData) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(storedData);


                if (parsed) {

                    console.log(
                        "Portfolio data loaded from:",
                        key
                    );

                    return parsed;

                }

            }

            catch (error) {

                console.error(
                    `Unable to read ${key}:`,
                    error
                );

            }

        }


        return null;

    }


    /* ============================================================
       EXTRACT HOLDINGS
       ============================================================ */

    function extractHoldings(
        portfolioData
    ) {

        if (!portfolioData) {
            return [];
        }


        if (Array.isArray(portfolioData)) {
            return portfolioData;
        }


        if (
            Array.isArray(
                portfolioData.holdings
            )
        ) {

            return portfolioData.holdings;

        }


        if (
            Array.isArray(
                portfolioData.assets
            )
        ) {

            return portfolioData.assets;

        }


        if (
            Array.isArray(
                portfolioData.positions
            )
        ) {

            return portfolioData.positions;

        }


        return [];

    }


    /* ============================================================
       HOLDING HELPERS
       ============================================================ */

    function getHoldingQuantity(
        holding
    ) {

        return toNumber(
            holding.quantity ??
            holding.qty ??
            holding.units ??
            holding.shares ??
            0
        );

    }


    function getHoldingAveragePrice(
        holding
    ) {

        return toNumber(
            holding.averagePrice ??
            holding.avgPrice ??
            holding.average_price ??
            holding.buyPrice ??
            holding.price ??
            0
        );

    }


    function getHoldingSymbol(
        holding
    ) {

        return String(
            holding.tradingSymbol ??
            holding.tradingsymbol ??
            holding.symbol ??
            holding.ticker ??
            holding.stockSymbol ??
            ""
        ).trim();

    }


    function getHoldingToken(
        holding
    ) {

        return String(
            holding.symbolToken ??
            holding.symboltoken ??
            holding.token ??
            ""
        ).trim();

    }


    function getHoldingExchange(
        holding
    ) {

        return String(
            holding.exchange ??
            "NSE"
        ).trim().toUpperCase();

    }


    function getHoldingType(
        holding
    ) {

        return String(
            holding.type ??
            holding.category ??
            "equity"
        ).toLowerCase();

    }


    /* ============================================================
       LOAD LIVE HOLDING VALUE
       ============================================================ */

    async function getHoldingLiveData(
        holding
    ) {

        let symbol =
            getHoldingSymbol(holding);

        let token =
            getHoldingToken(holding);

        let exchange =
            getHoldingExchange(holding);


        /*
         * If token is already stored, use it directly.
         */

        if (symbol && token) {

            const quote =
                await getMarketQuote(
                    exchange,
                    symbol,
                    token
                );


            if (quote) {

                return {
                    symbol,
                    token,
                    exchange,
                    quote
                };

            }


            const ltp =
                await getStockLTP(
                    exchange,
                    symbol,
                    token
                );


            if (ltp) {

                return {
                    symbol,
                    token,
                    exchange,
                    quote: ltp
                };

            }

        }


        /*
         * Otherwise resolve the instrument
         * using Angel One search.
         */

        if (!symbol) {
            return null;
        }


        const cleanSearch =
            symbol
                .replace(/-EQ$/i, "")
                .trim();


        const instrument =
            await resolveInstrument(
                cleanSearch,
                exchange
            );


        if (!instrument) {
            return null;
        }


        symbol =
            instrument.tradingsymbol ||
            instrument.tradingSymbol ||
            symbol;


        token =
            instrument.symboltoken ||
            instrument.symbolToken ||
            token;


        if (!token) {
            return null;
        }


        const quote =
            await getMarketQuote(
                exchange,
                symbol,
                token
            );


        if (quote) {

            return {
                symbol,
                token,
                exchange,
                quote
            };

        }


        const ltp =
            await getStockLTP(
                exchange,
                symbol,
                token
            );


        if (!ltp) {
            return null;
        }


        return {
            symbol,
            token,
            exchange,
            quote: ltp
        };

    }


    /* ============================================================
       PORTFOLIO ANALYSIS
       ============================================================ */

    async function analyzePortfolio() {

        const portfolioData =
            loadPortfolioData();


        const holdings =
            extractHoldings(
                portfolioData
            );


        if (!holdings.length) {

            return {
                hasPortfolio: false,
                holdings: [],
                totalValue: 0,
                investedValue: 0,
                equityValue: 0,
                etfValue: 0,
                mutualFundValue: 0,
                otherValue: 0
            };

        }


        let totalValue = 0;
        let investedValue = 0;

        let equityValue = 0;
        let etfValue = 0;
        let mutualFundValue = 0;
        let otherValue = 0;


        const analyzedHoldings = [];


        /*
         * Process holdings sequentially.
         * This avoids sending too many Angel One
         * requests at once.
         */

        for (const holding of holdings) {

            const quantity =
                getHoldingQuantity(
                    holding
                );


            const averagePrice =
                getHoldingAveragePrice(
                    holding
                );


            const invested =
                quantity *
                averagePrice;


            investedValue +=
                invested;


            let livePrice = 0;
            let liveData = null;


            try {

                liveData =
                    await getHoldingLiveData(
                        holding
                    );

            }

            catch (error) {

                console.error(
                    "Unable to load live holding data:",
                    error
                );

            }


            if (liveData?.quote) {

                livePrice =
                    toNumber(
                        liveData.quote.ltp
                    );

            }


            /*
             * Use live price when available.
             * Do not invent a price when Angel One
             * has not returned one.
             */

            const currentValue =
                livePrice > 0
                    ? quantity * livePrice
                    : toNumber(
                        holding.currentValue ??
                        holding.value ??
                        0
                    );


            if (currentValue <= 0) {
                continue;
            }


            totalValue +=
                currentValue;


            const type =
                getHoldingType(
                    holding
                );


            if (
                type.includes("etf")
            ) {

                etfValue +=
                    currentValue;

            }

            else if (
                type.includes("mutual") ||
                type.includes("fund")
            ) {

                mutualFundValue +=
                    currentValue;

            }

            else if (
                type.includes("equity") ||
                type.includes("stock") ||
                type.includes("share")
            ) {

                equityValue +=
                    currentValue;

            }

            else {

                /*
                 * Stock holdings from the current
                 * paper-trading engine are treated
                 * as equity by default.
                 */

                if (
                    liveData ||
                    getHoldingSymbol(holding)
                ) {

                    equityValue +=
                        currentValue;

                }

                else {

                    otherValue +=
                        currentValue;

                }

            }


            analyzedHoldings.push({
                holding,
                quantity,
                averagePrice,
                livePrice,
                currentValue,
                liveData
            });

        }


        return {

            hasPortfolio:
                totalValue > 0,

            holdings:
                analyzedHoldings,

            totalValue,

            investedValue,

            equityValue,

            etfValue,

            mutualFundValue,

            otherValue

        };

    }


    /* ============================================================
       ALLOCATION
       ============================================================ */

    function calculateAllocation(
        portfolio
    ) {

        const total =
            portfolio.totalValue;


        if (total <= 0) {

            return {
                equity: 0,
                etf: 0,
                mutualFund: 0,
                other: 0
            };

        }


        return {

            equity:
                (portfolio.equityValue /
                    total) *
                100,

            etf:
                (portfolio.etfValue /
                    total) *
                100,

            mutualFund:
                (portfolio.mutualFundValue /
                    total) *
                100,

            other:
                (portfolio.otherValue /
                    total) *
                100

        };

    }


    /* ============================================================
       UPDATE ALLOCATION UI
       ============================================================ */

    function updateAllocationBar(
        id,
        percentage
    ) {

        const element =
            document.querySelector(id);


        if (!element) {
            return;
        }


        const safePercentage =
            Math.min(
                Math.max(
                    percentage,
                    0
                ),
                100
            );


        element.style.width =
            `${safePercentage}%`;

    }


    function updateAllocationText(
        id,
        percentage
    ) {

        const element =
            document.querySelector(id);


        if (!element) {
            return;
        }


        element.textContent =
            `${percentage.toFixed(1)}%`;

    }


    function renderAllocation(
        allocation,
        hasPortfolio
    ) {

        updateAllocationBar(
            "#equityBar",
            allocation.equity
        );


        updateAllocationBar(
            "#etfBar",
            allocation.etf
        );


        updateAllocationBar(
            "#mutualFundBar",
            allocation.mutualFund
        );


        updateAllocationBar(
            "#otherBar",
            allocation.other
        );


        updateAllocationText(
            "#equityPercent",
            allocation.equity
        );


        updateAllocationText(
            "#etfPercent",
            allocation.etf
        );


        updateAllocationText(
            "#mutualFundPercent",
            allocation.mutualFund
        );


        updateAllocationText(
            "#otherPercent",
            allocation.other
        );


        const note =
            document.querySelector(
                "#allocationNote"
            );


        if (!note) {
            return;
        }


        if (!hasPortfolio) {

            note.textContent =
                "Add virtual holdings to see your real portfolio allocation.";

        }

        else {

            note.textContent =
                "Allocation is calculated from the current value of your virtual holdings.";

        }

    }


    /* ============================================================
       RISK SCORE
       ============================================================ */

    function calculateRisk(
        allocation,
        hasPortfolio
    ) {

        if (!hasPortfolio) {

            return {
                score: null,
                level: "Not enough data",
                text:
                    "Add virtual holdings to calculate a portfolio concentration risk view."
            };

        }


        const largestAllocation =
            Math.max(
                allocation.equity,
                allocation.etf,
                allocation.mutualFund,
                allocation.other
            );


        /*
         * This is a simple concentration-based
         * educational risk indicator.
         *
         * It is NOT a financial risk score.
         */

        if (largestAllocation > 75) {

            return {
                score: 85,
                level: "High",
                text:
                    "A large portion of your portfolio is concentrated in one asset category."
            };

        }


        if (largestAllocation > 60) {

            return {
                score: 70,
                level: "Moderately High",
                text:
                    "Your portfolio has noticeable concentration in one asset category."
            };

        }


        if (largestAllocation > 40) {

            return {
                score: 55,
                level: "Moderate",
                text:
                    "Your portfolio has moderate concentration across asset categories."
            };

        }


        return {

            score: 30,

            level: "Lower Concentration",

            text:
                "Your portfolio is spread across multiple asset categories based on the available data."

        };

    }


    /* ============================================================
       RENDER RISK
       ============================================================ */

    function renderRisk(
        risk
    ) {

        const score =
            document.querySelector(
                "#riskScore"
            );


        const level =
            document.querySelector(
                "#riskLevel"
            );


        const text =
            document.querySelector(
                "#riskText"
            );


        if (score) {

            score.textContent =
                risk.score === null
                    ? "--"
                    : risk.score;

        }


        if (level) {
            level.textContent =
                risk.level;
        }


        if (text) {
            text.textContent =
                risk.text;
        }

    }


    /* ============================================================
       PORTFOLIO INSIGHT
       ============================================================ */

    function renderPortfolioInsight(
        portfolio,
        allocation
    ) {

        const container =
            document.querySelector(
                "#portfolioInsight"
            );


        if (!container) {
            return;
        }


        if (!portfolio.hasPortfolio) {

            container.innerHTML = `
                <div class="empty-insight">

                    <i class="bi bi-pie-chart"></i>

                    <div>

                        <strong>
                            No virtual holdings yet
                        </strong>

                        <p>
                            Add virtual holdings to your paper
                            portfolio to receive personalized
                            allocation, performance and risk insights.
                        </p>

                    </div>

                </div>
            `;

            return;

        }


        const totalValue =
            portfolio.totalValue;


        const investedValue =
            portfolio.investedValue;


        const pnl =
            investedValue > 0
                ? totalValue - investedValue
                : 0;


        const pnlPercent =
            investedValue > 0
                ? (pnl / investedValue) * 100
                : 0;


        const pnlClass =
            pnl > 0
                ? "positive"
                : pnl < 0
                    ? "negative"
                    : "";


        container.innerHTML = `

            <div class="portfolio-summary">

                <div>

                    <span>
                        Current Value
                    </span>

                    <strong>
                        ${formatINR(totalValue)}
                    </strong>

                </div>


                <div>

                    <span>
                        Invested
                    </span>

                    <strong>
                        ${formatINR(investedValue)}
                    </strong>

                </div>


                <div>

                    <span>
                        Allocation
                    </span>

                    <strong>
                        ${allocation.equity.toFixed(1)}% Equity
                    </strong>

                </div>

            </div>


            <div class="portfolio-insight-text">

                <strong class="${pnlClass}">
                    ${pnl >= 0 ? "Virtual gain" : "Virtual loss"}:
                    ${formatINR(Math.abs(pnl))}
                    ${
                        investedValue > 0
                            ? `(${formatPercent(pnlPercent)})`
                            : ""
                    }
                </strong>

                <p>
                    Your current virtual portfolio contains
                    ${portfolio.holdings.length}
                    tracked holding${portfolio.holdings.length === 1 ? "" : "s"}.
                    Values are calculated using available
                    Angel One market prices where possible.
                </p>

            </div>
        `;

    }


    /* ============================================================
       AI-STYLE INSIGHT
       ============================================================ */

    function renderAIInsight(
        portfolio,
        allocation,
        risk
    ) {

        const container =
            document.querySelector(
                "#aiInsightContent"
            );


        if (!container) {
            return;
        }


        let title =
            "Live portfolio insight";


        let message =
            "Your portfolio data is ready for analysis.";


        if (!portfolio.hasPortfolio) {

            title =
                `Welcome, ${userName}`;


            message =
                "Your Insights page is connected to live market data. Add virtual holdings to receive portfolio-specific insights.";

        }

        else if (
            allocation.equity > 75
        ) {

            title =
                "High equity concentration";


            message =
                `Your portfolio is approximately ${allocation.equity.toFixed(
                    1
                )}% equity by current value. Consider reviewing how this concentration fits your intended risk level.`;

        }

        else if (
            allocation.equity > 60
        ) {

            title =
                "Equity-heavy portfolio";


            message =
                `Equity currently represents approximately ${allocation.equity.toFixed(
                    1
                )}% of your tracked portfolio. Keep your diversification and risk preference in mind.`;

        }

        else if (
            allocation.equity > 0
        ) {

            title =
                "Portfolio allocation";


            message =
                `Your portfolio currently has approximately ${allocation.equity.toFixed(
                    1
                )}% in equity, ${allocation.etf.toFixed(
                    1
                )}% in ETFs and ${allocation.mutualFund.toFixed(
                    1
                )}% in mutual funds.`;

        }


        container.innerHTML = `

            <div class="ai-message">

                <div class="ai-avatar">
                    <i class="bi bi-stars"></i>
                </div>

                <div>

                    <strong>
                        ${title}
                    </strong>

                    <p>
                        ${message}
                    </p>

                </div>

            </div>

        `;

    }


    /* ============================================================
       INITIALIZE PAGE
       ============================================================ */

    async function initializeInsights() {

        console.log(
            "Loading live Investopia Insights..."
        );


        /*
         * Load market indices and portfolio
         * independently so one failure does not
         * stop the entire page.
         */

        let portfolio =
            null;


        try {

            await loadIndexData();

        }

        catch (error) {

            console.error(
                "Index loading failed:",
                error
            );

        }


        try {

            portfolio =
                await analyzePortfolio();

        }

        catch (error) {

            console.error(
                "Portfolio analysis failed:",
                error
            );


            portfolio = {

                hasPortfolio: false,

                holdings: [],

                totalValue: 0,

                investedValue: 0,

                equityValue: 0,

                etfValue: 0,

                mutualFundValue: 0,

                otherValue: 0

            };

        }


        const allocation =
            calculateAllocation(
                portfolio
            );


        renderAllocation(
            allocation,
            portfolio.hasPortfolio
        );


        const risk =
            calculateRisk(
                allocation,
                portfolio.hasPortfolio
            );


        renderRisk(risk);


        renderPortfolioInsight(
            portfolio,
            allocation
        );


        renderAIInsight(
            portfolio,
            allocation,
            risk
        );


        console.log(
            "Investopia Insights loaded successfully.",
            {
                user: userName,
                portfolio,
                allocation,
                risk,
                niftyData,
                sensexData
            }
        );

    }


    /* ============================================================
       RESPONSIVE SIDEBAR
       ============================================================ */

    function handleResize() {

        if (!sidebar) {
            return;
        }


        if (window.innerWidth > 992) {

            closeSidebar();

        }

    }


    window.addEventListener(
        "resize",
        handleResize
    );


    handleResize();


    /* ============================================================
       START
       ============================================================ */

    await initializeInsights();

});