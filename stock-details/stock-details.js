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


    /* ==================== ELEMENTS ==================== */

    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarClose = document.getElementById("sidebarClose");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const stockSearch = document.getElementById("stockSearch");

    const quantity = document.getElementById("quantity");
    const tradeValue = document.getElementById("tradeValue");
    const buyButton = document.getElementById("buyButton");
    const sellButton = document.getElementById("sellButton");


    /* ==================== ASSET DATA ==================== */

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


    /* ==================== GET ASSET ==================== */

    const params =
        new URLSearchParams(window.location.search);

    const symbol =
        (params.get("symbol") || "TCS").toUpperCase();

    const asset =
        assets[symbol] || assets.TCS;


    /* ==================== LOAD ASSET ==================== */

    function loadAsset() {

        document.title =
            `${asset.name} | Investopia TradeAI`;

        document.getElementById("assetLogo").textContent =
            asset.logo;

        document.getElementById("assetName").textContent =
            asset.name;

        document.getElementById("companyName").textContent =
            asset.company;

        document.getElementById("assetType").textContent =
            asset.type;

        document.getElementById("breadcrumbAsset").textContent =
            asset.name;

        document.getElementById("currentPrice").textContent =
            `₹${asset.price.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;


        const change =
            document.getElementById("priceChange");

        change.innerHTML = `
            <i class="bi ${
                asset.change.startsWith("-")
                    ? "bi-arrow-down"
                    : "bi-arrow-up"
            }"></i>
            ${asset.change} Today
        `;

        change.className =
            `price-change ${
                asset.change.startsWith("-")
                    ? "negative"
                    : "positive"
            }`;


        document.getElementById("investopiaScore").textContent =
            asset.score;

        quantity.value = 1;

        updateTradeValue();

    }


    loadAsset();


    /* ==================== SIDEBAR ==================== */

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
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    if (window.innerWidth <= 991) {

                        closeSidebar();

                    }

                }
            );

        });


    /* ==================== THEME ==================== */

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

            createChart(currentPeriod);

        }

    }


    if (
        localStorage.getItem("investopia-theme") === "dark"
    ) {

        document.body.classList.add("dark-theme");

    }


    updateThemeIcon();


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


    /* ==================== CHART DATA ==================== */

    const chartData = {

        "1D": [
            3380,
            3395,
            3388,
            3410,
            3402,
            3421
        ],

        "1W": [
            3310,
            3340,
            3375,
            3360,
            3395,
            3421
        ],

        "1M": [
            3150,
            3210,
            3255,
            3310,
            3370,
            3421
        ],

        "1Y": [
            2750,
            2880,
            3010,
            3150,
            3290,
            3421
        ],

        "5Y": [
            1450,
            1850,
            2300,
            2700,
            3150,
            3421
        ]

    };


    const chartLabels = {

        "1D": [
            "9:30",
            "11:00",
            "12:30",
            "2:00",
            "3:00",
            "Now"
        ],

        "1W": [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Today"
        ],

        "1M": [
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4",
            "Week 5",
            "Now"
        ],

        "1Y": [
            "Jul",
            "Sep",
            "Nov",
            "Jan",
            "Mar",
            "Jul"
        ],

        "5Y": [
            "2022",
            "2023",
            "2024",
            "2025",
            "2026",
            "Now"
        ]

    };


    let stockChart = null;

    let currentPeriod = "1D";


    /* ==================== CHART ==================== */

    function createChart(period = "1D") {

        const canvas =
            document.getElementById("stockChart");

        if (
            !canvas ||
            typeof Chart === "undefined"
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


        const values =
            chartData[period].map(
                (value) =>
                    asset.price *
                    (value / 3421.5)
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


        stockChart = new Chart(
            ctx,
            {
                type: "line",

                data: {

                    labels:
                        chartLabels[period],

                    datasets: [

                        {

                            data: values,

                            borderColor:
                                "#16a34a",

                            backgroundColor:
                                gradient,

                            borderWidth:
                                2.5,

                            fill:
                                true,

                            tension:
                                .4,

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
                            display: false
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
                                        ` ₹${context.parsed.y.toLocaleString(
                                            "en-IN",
                                            {
                                                maximumFractionDigits: 2
                                            }
                                        )}`

                            }

                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            border: {
                                display: false
                            },

                            ticks: {

                                color:
                                    text,

                                font: {
                                    size: 9
                                }

                            }

                        },

                        y: {

                            grid: {
                                color: grid
                            },

                            border: {
                                display: false
                            },

                            ticks: {

                                color:
                                    text,

                                font: {
                                    size: 9
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


    createChart();


    /* ==================== CHART PERIODS ==================== */

    document
        .querySelectorAll("#chartPeriods button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

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


                    createChart(
                        currentPeriod
                    );

                }
            );

        });


    /* ==================== VIRTUAL TRADING ==================== */

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


    function formatMoney(value) {

        return `₹${Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    }


    function updateTradeValue() {

        const qty =
            Math.max(
                0,
                Number(quantity?.value) || 0
            );


        if (tradeValue) {

            tradeValue.textContent =
                formatMoney(
                    qty * asset.price
                );

        }

    }


    quantity?.addEventListener(
        "input",
        updateTradeValue
    );


    function saveTradingData() {

        localStorage.setItem(
            "investopiaVirtualCash",
            virtualCash
        );


        localStorage.setItem(
            "investopiaHoldings",
            JSON.stringify(holdings)
        );

    }


    function showTradeMessage(
        message,
        success = true
    ) {

        alert(message);

    }


    /* ==================== VIRTUAL BUY ==================== */

    buyButton?.addEventListener(
        "click",
        () => {

            const qty =
                Math.floor(
                    Number(quantity.value)
                );


            if (!qty || qty < 1) {

                showTradeMessage(
                    "Please enter a valid quantity.",
                    false
                );

                return;

            }


            const total =
                qty * asset.price;


            if (total > virtualCash) {

                showTradeMessage(
                    `Insufficient virtual cash.
Available: ${formatMoney(virtualCash)}`,
                    false
                );

                return;

            }


            virtualCash -= total;


            holdings[symbol] =
                (holdings[symbol] || 0) + qty;


            saveTradingData();


            showTradeMessage(
                `Virtual BUY successful!

${qty} × ${asset.name}
Value: ${formatMoney(total)}`
            );

        }
    );


    /* ==================== VIRTUAL SELL ==================== */

    sellButton?.addEventListener(
        "click",
        () => {

            const qty =
                Math.floor(
                    Number(quantity.value)
                );


            const owned =
                holdings[symbol] || 0;


            if (!qty || qty < 1) {

                showTradeMessage(
                    "Please enter a valid quantity.",
                    false
                );

                return;

            }


            if (owned < qty) {

                showTradeMessage(
                    `You do not own enough ${asset.name} virtually.
Owned: ${owned}`,
                    false
                );

                return;

            }


            const total =
                qty * asset.price;


            virtualCash += total;

            holdings[symbol] -= qty;


            if (holdings[symbol] <= 0) {

                delete holdings[symbol];

            }


            saveTradingData();


            showTradeMessage(
                `Virtual SELL successful!

${qty} × ${asset.name}
Value: ${formatMoney(total)}`
            );

        }
    );


    /* ==================== SEARCH ==================== */

    stockSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Enter") {

                return;

            }


            const query =
                stockSearch.value.trim();


            if (!query) {

                return;

            }


            window.location.href =
                `../market/market.html?search=${encodeURIComponent(query)}`;

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                stockSearch?.focus();

            }

        }
    );


    /* ==================== RESIZE ==================== */

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