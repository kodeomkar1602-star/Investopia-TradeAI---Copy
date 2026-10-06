/* ============================================================
   INVESTOPIA TRADEAI - INSIGHTS
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

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
       ELEMENTS
       ============================================================ */

    const sidebar = document.querySelector(".sidebar");
    const menuBtn = document.querySelector(".menu-btn");
    const closeSidebarBtn = document.querySelector(".close-sidebar");
    const themeToggle = document.querySelector(".theme-toggle");

    const globalSearch =
        document.querySelector("#globalSearch") ||
        document.querySelector(".global-search");

    const searchBtn =
        document.querySelector("#searchBtn") ||
        document.querySelector(".search-btn");


    /* ============================================================
       SIDEBAR
       ============================================================ */

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.add("open");
        });
    }

    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener("click", () => {
            sidebar.classList.remove("open");
        });
    }


    /* ============================================================
       CLOSE SIDEBAR WHEN CLICKING OUTSIDE
       ============================================================ */

    document.addEventListener("click", (event) => {

        if (!sidebar) {
            return;
        }

        if (
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !event.target.closest(".menu-btn")
        ) {
            sidebar.classList.remove("open");
        }

    });


    /* ============================================================
       THEME
       ============================================================ */

    const savedTheme =
        localStorage.getItem("investopia-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            document.body.classList.toggle("dark-mode");

            const isDark =
                document.body.classList.contains("dark-mode");

            localStorage.setItem(
                "investopia-theme",
                isDark ? "dark" : "light"
            );

        });

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


    if (searchBtn) {
        searchBtn.addEventListener(
            "click",
            performSearch
        );
    }


    if (globalSearch) {

        globalSearch.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {
                    performSearch();
                }

            }
        );

    }


    /* ============================================================
       CTRL + K SEARCH SHORTCUT
       ============================================================ */

    document.addEventListener("keydown", (event) => {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            if (globalSearch) {
                globalSearch.focus();
            }

        }

    });


    /* ============================================================
       PORTFOLIO DATA
       ============================================================ */

    let portfolioData = null;

    const portfolioKeys = [
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

            portfolioData =
                JSON.parse(storedData);

            if (portfolioData) {
                break;
            }

        } catch (error) {

            console.error(
                `Unable to read ${key}:`,
                error
            );

        }

    }


    /* ============================================================
       PORTFOLIO ANALYSIS
       ============================================================ */

    let totalPortfolioValue = 0;

    let equityValue = 0;
    let etfValue = 0;
    let mutualFundValue = 0;
    let otherValue = 0;


    if (portfolioData) {

        let holdings = [];

        if (Array.isArray(portfolioData)) {
            holdings = portfolioData;
        }

        else if (Array.isArray(portfolioData.holdings)) {
            holdings = portfolioData.holdings;
        }

        else if (Array.isArray(portfolioData.assets)) {
            holdings = portfolioData.assets;
        }

        else if (Array.isArray(portfolioData.positions)) {
            holdings = portfolioData.positions;
        }


        holdings.forEach((holding) => {

            const value =
                Number(
                    holding.value ??
                    holding.currentValue ??
                    holding.amount ??
                    0
                );

            if (!Number.isFinite(value)) {
                return;
            }

            totalPortfolioValue += value;


            const type = String(
                holding.type ??
                holding.category ??
                "other"
            ).toLowerCase();


            if (
                type.includes("equity") ||
                type.includes("stock") ||
                type.includes("share")
            ) {

                equityValue += value;

            }

            else if (type.includes("etf")) {

                etfValue += value;

            }

            else if (
                type.includes("mutual") ||
                type.includes("fund")
            ) {

                mutualFundValue += value;

            }

            else {

                otherValue += value;

            }

        });

    }


    /* ============================================================
       ALLOCATION
       ============================================================ */

    let equityPercent = 0;
    let etfPercent = 0;
    let mutualFundPercent = 0;
    let otherPercent = 0;


    if (totalPortfolioValue > 0) {

        equityPercent =
            (equityValue / totalPortfolioValue) * 100;

        etfPercent =
            (etfValue / totalPortfolioValue) * 100;

        mutualFundPercent =
            (mutualFundValue / totalPortfolioValue) * 100;

        otherPercent =
            (otherValue / totalPortfolioValue) * 100;

    }


    /* ============================================================
       UPDATE ALLOCATION BARS
       ============================================================ */

    function updateAllocationBar(
        selectors,
        percentage
    ) {

        selectors.forEach((selector) => {

            const element =
                document.querySelector(selector);

            if (element) {

                element.style.width =
                    `${Math.min(Math.max(percentage, 0), 100)}%`;

            }

        });

    }


    updateAllocationBar(
        [
            "#equityBar",
            ".equity-bar",
            "[data-allocation='equity']"
        ],
        equityPercent
    );


    updateAllocationBar(
        [
            "#etfBar",
            ".etf-bar",
            "[data-allocation='etf']"
        ],
        etfPercent
    );


    updateAllocationBar(
        [
            "#mutualFundBar",
            ".mutual-fund-bar",
            "[data-allocation='mutual-fund']"
        ],
        mutualFundPercent
    );


    updateAllocationBar(
        [
            "#otherBar",
            ".other-bar",
            "[data-allocation='other']"
        ],
        otherPercent
    );


    /* ============================================================
       UPDATE ALLOCATION TEXT
       ============================================================ */

    function updateAllocationText(
        selectors,
        percentage
    ) {

        selectors.forEach((selector) => {

            const element =
                document.querySelector(selector);

            if (element) {

                element.textContent =
                    `${percentage.toFixed(1)}%`;

            }

        });

    }


    updateAllocationText(
        [
            "#equityPercent",
            ".equity-percent"
        ],
        equityPercent
    );


    updateAllocationText(
        [
            "#etfPercent",
            ".etf-percent"
        ],
        etfPercent
    );


    updateAllocationText(
        [
            "#mutualFundPercent",
            ".mutual-fund-percent"
        ],
        mutualFundPercent
    );


    updateAllocationText(
        [
            "#otherPercent",
            ".other-percent"
        ],
        otherPercent
    );


    /* ============================================================
       RISK SCORE
       ============================================================ */

    let riskScore = 30;
    let riskLevel = "Low";


    const largestAllocation =
        Math.max(
            equityPercent,
            etfPercent,
            mutualFundPercent,
            otherPercent
        );


    if (largestAllocation > 60) {

        riskScore = 75;
        riskLevel = "High";

    }

    else if (largestAllocation > 40) {

        riskScore = 55;
        riskLevel = "Moderate";

    }

    else {

        riskScore = 30;
        riskLevel = "Low";

    }


    /* ============================================================
       UPDATE RISK UI
       ============================================================ */

    const riskScoreElements = [
        document.querySelector("#riskScore"),
        document.querySelector(".risk-score")
    ];


    riskScoreElements.forEach((element) => {

        if (element) {
            element.textContent = riskScore;
        }

    });


    const riskLevelElements = [
        document.querySelector("#riskLevel"),
        document.querySelector(".risk-level")
    ];


    riskLevelElements.forEach((element) => {

        if (element) {
            element.textContent = riskLevel;
        }

    });


    /* ============================================================
       AI INSIGHT
       ============================================================ */

    let aiInsight = "";


    if (riskLevel === "High") {

        aiInsight =
            "Your portfolio appears concentrated in one major asset category. Consider reviewing diversification and risk exposure.";

    }

    else if (riskLevel === "Moderate") {

        aiInsight =
            "Your portfolio has a moderate concentration level. Consider balancing different asset categories according to your risk tolerance.";

    }

    else {

        aiInsight =
            "Your portfolio appears reasonably diversified based on the available allocation data.";

    }


    const aiInsightElements = [
        document.querySelector("#aiInsight"),
        document.querySelector(".ai-insight"),
        document.querySelector(".insight-text")
    ];


    aiInsightElements.forEach((element) => {

        if (element) {
            element.textContent = aiInsight;
        }

    });


    /* ============================================================
       PORTFOLIO VALUE
       ============================================================ */

    const portfolioValueElements = [
        document.querySelector("#portfolioValue"),
        document.querySelector(".portfolio-value"),
        document.querySelector("[data-portfolio-value]")
    ];


    portfolioValueElements.forEach((element) => {

        if (element && totalPortfolioValue > 0) {

            element.textContent =
                `₹${totalPortfolioValue.toLocaleString(
                    "en-IN",
                    {
                        maximumFractionDigits: 2
                    }
                )}`;

        }

    });


    /* ============================================================
       MARKET DATA STATUS
       ============================================================ */

    const liveDataElements = [
        document.querySelector("#marketStatus"),
        document.querySelector(".market-status"),
        document.querySelector(".live-data")
    ];


    liveDataElements.forEach((element) => {

        if (element) {

            element.textContent =
                "Live Data";

        }

    });


    /* ============================================================
       EMPTY PORTFOLIO MESSAGE
       ============================================================ */

    if (!portfolioData || totalPortfolioValue === 0) {

        const emptyMessages = [
            document.querySelector("#emptyPortfolio"),
            document.querySelector(".empty-portfolio"),
            document.querySelector(".no-portfolio")
        ];


        emptyMessages.forEach((element) => {

            if (element) {

                element.style.display =
                    "block";

            }

        });

    }


    /* ============================================================
       RESPONSIVE SIDEBAR
       ============================================================ */

    function handleResize() {

        if (!sidebar) {
            return;
        }

        if (window.innerWidth > 992) {
            sidebar.classList.remove("open");
        }

    }


    window.addEventListener(
        "resize",
        handleResize
    );


    handleResize();


    /* ============================================================
       PAGE READY
       ============================================================ */

    console.log(
        "Investopia Insights loaded successfully."
    );

});