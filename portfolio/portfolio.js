/* =========================================================
   INVESTOPIA TRADEAI - PORTFOLIO JS
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


    /* ==================== ASSET DATA ==================== */

    const assets = {

        TCS: {
            name: "TCS",
            company: "Tata Consultancy Services",
            price: 3421.50,
            logo: "T"
        },

        RELIANCE: {
            name: "RELIANCE",
            company: "Reliance Industries",
            price: 1425.20,
            logo: "R"
        },

        INFY: {
            name: "INFY",
            company: "Infosys",
            price: 1512.30,
            logo: "I"
        },

        HDFCBANK: {
            name: "HDFCBANK",
            company: "HDFC Bank",
            price: 1746.80,
            logo: "H"
        },

        NIFTYBEES: {
            name: "NIFTYBEES",
            company: "Nippon India ETF Nifty BeES",
            price: 265.40,
            logo: "N"
        },

        PPFAS: {
            name: "PPFAS",
            company: "Parag Parikh Flexi Cap Fund",
            price: 82.36,
            logo: "P"
        }

    };


    /* ==================== SIDEBAR ==================== */

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


    /* ==================== THEME ==================== */

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


    /* ==================== VIRTUAL PORTFOLIO ==================== */

    let virtualCash =
        Number(
            localStorage.getItem(
                "investopiaVirtualCash"
            )
        ) || 100000;


    const holdings =
        JSON.parse(
            localStorage.getItem(
                "investopiaHoldings"
            ) || "{}"
        );


    function formatMoney(value) {

        return `₹${Number(
            value
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    }


    function getPortfolioData() {

        let invested = 0;


        Object.entries(
            holdings
        ).forEach(
            ([symbol, qty]) => {

                const asset =
                    assets[symbol];


                if (
                    asset &&
                    qty > 0
                ) {

                    invested +=
                        qty *
                        asset.price;

                }

            }
        );


        return {

            invested,

            cash:
                virtualCash,

            total:
                invested +
                virtualCash

        };

    }


    /* ==================== UPDATE SUMMARY ==================== */

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


        updateAllocation();

    }


    /* ==================== HOLDINGS TABLE ==================== */

    function updateHoldingsTable() {

        const tbody =
            document.querySelector(
                ".holdings-table tbody"
            );


        if (!tbody) return;


        const activeHoldings =
            Object.entries(
                holdings
            ).filter(
                ([symbol, qty]) =>
                    assets[symbol] &&
                    qty > 0
            );


        /*
            If no real virtual trades have been made,
            keep the demo holdings already present in HTML.
        */

        if (!activeHoldings.length) return;


        tbody.innerHTML = "";


        activeHoldings.forEach(
            ([symbol, qty]) => {

                const asset =
                    assets[symbol];


                const value =
                    qty *
                    asset.price;


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <a
                            href="../stock-details/stock-details.html?symbol=${symbol}"
                            class="holding-name">

                            <span class="holding-logo">
                                ${asset.logo}
                            </span>

                            <span>

                                <strong>
                                    ${asset.name}
                                </strong>

                                <small>
                                    ${asset.company}
                                </small>

                            </span>

                        </a>

                    </td>


                    <td>
                        ${qty}
                    </td>


                    <td>
                        ${formatMoney(asset.price)}
                    </td>


                    <td>
                        ${formatMoney(asset.price)}
                    </td>


                    <td>
                        ${formatMoney(value)}
                    </td>


                    <td class="positive">
                        +₹0.00
                    </td>


                    <td>

                        <a
                            href="../stock-details/stock-details.html?symbol=${symbol}"
                            class="view-btn">

                            View

                        </a>

                    </td>

                `;


                tbody.appendChild(
                    row
                );

            }
        );

    }


    /* ==================== ALLOCATION ==================== */

    function updateAllocation() {

        const data =
            getPortfolioData();


        const invested =
            data.invested || 0;


        const cash =
            data.cash || 0;


        const total =
            data.total || 1;


        let stockValue = 0;

        let fundValue = 0;


        Object.entries(
            holdings
        ).forEach(
            ([symbol, qty]) => {

                const asset =
                    assets[symbol];


                if (
                    !asset ||
                    qty <= 0
                ) {

                    return;

                }


                const value =
                    qty *
                    asset.price;


                if (
                    symbol === "PPFAS"
                ) {

                    fundValue +=
                        value;

                } else {

                    stockValue +=
                        value;

                }

            }
        );


        const stockPercent =
            Math.round(
                (stockValue / total) *
                100
            );


        const fundPercent =
            Math.round(
                (fundValue / total) *
                100
            );


        const cashPercent =
            Math.max(
                0,
                100 -
                stockPercent -
                fundPercent
            );


        const legend =
            document.querySelector(
                ".allocation-legend"
            );


        if (legend) {

            legend.innerHTML = `

                <div>

                    <span>

                        <i class="legend-dot stocks"></i>

                        Stocks / ETFs

                    </span>

                    <strong>
                        ${stockPercent}%
                    </strong>

                </div>


                <div>

                    <span>

                        <i class="legend-dot funds"></i>

                        Mutual Funds

                    </span>

                    <strong>
                        ${fundPercent}%
                    </strong>

                </div>


                <div>

                    <span>

                        <i class="legend-dot cash"></i>

                        Cash

                    </span>

                    <strong>
                        ${cashPercent}%
                    </strong>

                </div>

            `;

        }


        const center =
            document.querySelector(
                ".allocation-center strong"
            );


        if (center) {

            center.textContent =
                formatMoney(
                    invested
                ).replace(
                    ".00",
                    ""
                );

        }


        createAllocationChart(
            stockPercent,
            fundPercent,
            cashPercent
        );

    }


    /* ==================== PERFORMANCE CHART ==================== */

    let performanceChart = null;


    const performanceData = {

        "1M": [
            100000,
            101500,
            102200,
            104000,
            106500,
            108000
        ],

        "6M": [
            100000,
            103000,
            104500,
            107000,
            110500,
            112480
        ],

        "1Y": [
            100000,
            104000,
            108500,
            111000,
            116000,
            124580
        ],

        "ALL": [
            100000,
            102000,
            106000,
            111000,
            118000,
            124580
        ]

    };


    const performanceLabels = {

        "1M": [
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4",
            "Week 5",
            "Now"
        ],

        "6M": [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Now"
        ],

        "1Y": [
            "Jul",
            "Sep",
            "Nov",
            "Jan",
            "Apr",
            "Now"
        ],

        "ALL": [
            "Start",
            "Month 2",
            "Month 4",
            "Month 6",
            "Month 9",
            "Now"
        ]

    };


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


        if (performanceChart) {

            performanceChart.destroy();

        }


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                290
            );


        gradient.addColorStop(
            0,
            "rgba(22,163,74,.22)"
        );


        gradient.addColorStop(
            1,
            "rgba(22,163,74,0)"
        );


        performanceChart =
            new Chart(
                ctx,
                {

                    type: "line",

                    data: {

                        labels:
                            performanceLabels[
                                period
                            ],

                        datasets: [

                            {

                                data:
                                    performanceData[
                                        period
                                    ],

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
                                        text,

                                    font: {

                                        size:
                                            9

                                    }

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


    /* ==================== ALLOCATION CHART ==================== */

    let allocationChart = null;


    function createAllocationChart(
        stocks = 58,
        funds = 27,
        cash = 15
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


    /* ==================== PERIOD SELECTOR ==================== */

    performancePeriod?.addEventListener(
        "change",
        () => {

            createPerformanceChart(
                performancePeriod.value
            );

        }
    );


    /* ==================== SEARCH ==================== */

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


    /* ==================== CTRL + K / CMD + K ==================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                portfolioSearch?.focus();

            }

        }
    );


    /* ==================== INITIALIZE ==================== */

    createPerformanceChart(
        "6M"
    );

    createAllocationChart();

    updateSummary();

    updateHoldingsTable();


    /* ==================== RESPONSIVE ==================== */

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