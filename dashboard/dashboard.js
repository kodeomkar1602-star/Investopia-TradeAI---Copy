/* =========================================================
   INVESTOPIA TRADEAI - DASHBOARD JS
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       SESSION / AUTHENTICATION
    ===================================================== */

    const session = await requireAuth();

    /*
        If there is no active Supabase session,
        requireAuth() redirects the user to login.

        Stop executing the dashboard code.
    */

    if (!session) {
        return;
    }


    /*
        Listen for future authentication changes.

        If the user logs out from another page/tab,
        the session handler can redirect them to login.
    */

    listenForAuthChanges();


    /* =====================================================
       CURRENT USER
    ===================================================== */

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


    /* Close mobile sidebar after clicking a link */

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
       PORTFOLIO CHART DATA
    ===================================================== */

    const chartData = {

        "1W": {

            labels: [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri"
            ],

            values: [
                119500,
                120800,
                121900,
                123100,
                124580
            ]

        },


        "1M": {

            labels: [
                "Week 1",
                "Week 2",
                "Week 3",
                "Week 4"
            ],

            values: [
                116800,
                119400,
                121700,
                124580
            ]

        },


        "6M": {

            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun"
            ],

            values: [
                102000,
                106500,
                109800,
                114200,
                119700,
                124580
            ]

        },


        "1Y": {

            labels: [
                "Jul",
                "Sep",
                "Nov",
                "Jan",
                "Mar",
                "May",
                "Jul"
            ],

            values: [
                92000,
                96000,
                101500,
                108000,
                113500,
                119700,
                124580
            ]

        },


        "All": {

            labels: [
                "2022",
                "2023",
                "2024",
                "2025",
                "2026"
            ],

            values: [
                65000,
                78000,
                91000,
                107000,
                124580
            ]

        }

    };


    let portfolioChart = null;

    let allocationChart = null;


    /* =====================================================
       CHART COLORS
    ===================================================== */

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

            primary: "#16a34a"

        };

    }


    /* =====================================================
       PORTFOLIO CHART
    ===================================================== */

    function createPortfolioChart(
        period = "6M"
    ) {

        if (!portfolioCanvas) return;


        const ctx =
            portfolioCanvas.getContext(
                "2d"
            );


        const colors =
            getChartColors();


        const selected =
            chartData[period] ||
            chartData["6M"];


        if (portfolioChart) {

            portfolioChart.destroy();

        }


        /* Gradient */

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

                        labels:
                            selected.labels,

                        datasets: [

                            {

                                label:
                                    "Portfolio Value",

                                data:
                                    selected.values,

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
                                    0,

                                pointHoverRadius:
                                    5,

                                pointHoverBackgroundColor:
                                    colors.primary,

                                pointHoverBorderColor:
                                    "#ffffff",

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
                                    document.body.classList.contains(
                                        "dark-theme"
                                    )
                                        ? "#102419"
                                        : "#17231c",

                                titleColor:
                                    "#ffffff",

                                bodyColor:
                                    "#ffffff",

                                padding:
                                    11,

                                displayColors:
                                    false,


                                callbacks: {

                                    label:
                                        function(context) {

                                            return (
                                                " ₹" +
                                                context.parsed.y.toLocaleString(
                                                    "en-IN"
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

                                border: {

                                    display:
                                        false

                                },

                                ticks: {

                                    color:
                                        colors.text,

                                    font: {

                                        size:
                                            10

                                    }

                                }

                            },


                            y: {

                                border: {

                                    display:
                                        false

                                },

                                grid: {

                                    color:
                                        colors.grid

                                },

                                ticks: {

                                    color:
                                        colors.text,

                                    font: {

                                        size:
                                            10

                                    },


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
       ASSET ALLOCATION CHART
    ===================================================== */

    function createAllocationChart() {

        if (!allocationCanvas)
            return;


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

                                    58,

                                    27,

                                    15

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

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function(context) {

                                            return (
                                                " " +
                                                context.label +
                                                ": " +
                                                context.parsed +
                                                "%"
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
       UPDATE CHARTS
    ===================================================== */

    function updateCharts() {

        const period =
            chartPeriod?.value ||
            "6M";


        createPortfolioChart(
            period
        );


        createAllocationChart();

    }


    /* Initial charts */

    updateCharts();


    /* =====================================================
       CHART PERIOD
    ===================================================== */

    chartPeriod?.addEventListener(
        "change",
        function() {

            createPortfolioChart(
                this.value
            );

        }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    globalSearch?.addEventListener(
        "keydown",
        function(event) {

            if (event.key !== "Enter")
                return;


            const query =
                this.value.trim();


            if (!query)
                return;


            /*
                For now, send the user to
                Stock Details.

                Later this can become:

                /api/search?q=TCS

                and the Node.js backend can
                return the correct stock /
                ETF / mutual fund result.
            */


            window.location.href =
                "../stock-details/stock-details.html?search=" +
                encodeURIComponent(
                    query
                );

        }
    );


    /* =====================================================
       SEARCH SHORTCUT
       Ctrl + K / Cmd + K
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


            if (!isShortcut)
                return;


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

});