/* =========================================================
   INVESTOPIA TRADEAI - LEARNING
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

    const globalSearch =
        document.getElementById("globalSearch");

    const learningSearch =
        document.getElementById("learningSearch");

    const categoryGrid =
        document.getElementById("categoryGrid");

    const lessonGrid =
        document.getElementById("lessonGrid");

    const resultCount =
        document.getElementById("resultCount");

    const progressText =
        document.getElementById("progressText");

    const progressFill =
        document.getElementById(
            "learningProgressFill"
        );

    const profileName =
        document.getElementById("profileName");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const learningIntroText =
        document.getElementById(
            "learningIntroText"
        );

    const lessons =
        [
            ...document.querySelectorAll(
                ".lesson-card"
            )
        ];


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


    if (learningIntroText) {

        learningIntroText.textContent =
            `Build your investing knowledge step by step, ${userName}. Learn stocks, ETFs, mutual funds, trading, risk and personal finance through simple lessons.`;

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
        .querySelectorAll(
            ".sidebar-link"
        )
        .forEach((link) => {

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


        themeIcon.className =
            document.body.classList.contains(
                "dark-theme"
            )
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
       GLOBAL STOCK SEARCH
    ===================================================== */

    function performGlobalSearch() {

        const query =
            globalSearch?.value
                .trim();


        if (!query) {
            return;
        }


        window.location.href =
            `../market/market.html?search=${encodeURIComponent(
                query
            )}`;

    }


    globalSearch?.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Enter") {
                return;
            }


            event.preventDefault();


            performGlobalSearch();

        }
    );


    /* =====================================================
       CTRL + K SEARCH
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                globalSearch?.focus();

            }

        }
    );


    /* =====================================================
       LESSON DATA
    ===================================================== */

    const lessonContent = {

        "What is a Stock?": {

            category: "STOCKS",

            title: "What is a Stock?",

            content: `
                <p>
                    A stock represents ownership in a company.
                    When you buy a company's shares, you own a
                    small portion of that business.
                </p>

                <h4>Why do companies issue stocks?</h4>

                <p>
                    Companies can issue shares to raise capital
                    for activities such as expansion, operations
                    or other business needs.
                </p>

                <h4>How can investors benefit?</h4>

                <p>
                    Investors may potentially benefit when the
                    value of their shares increases. Some companies
                    may also distribute dividends to shareholders.
                </p>

                <h4>Important</h4>

                <p>
                    Stock prices can rise or fall. Owning shares
                    therefore involves investment risk.
                </p>
            `
        },


        "What are Mutual Funds?": {

            category: "MUTUAL FUNDS",

            title: "What are Mutual Funds?",

            content: `
                <p>
                    A mutual fund pools money from multiple
                    investors and invests that money according
                    to the fund's stated strategy.
                </p>

                <h4>How does it work?</h4>

                <p>
                    Investors purchase units of a mutual fund.
                    The fund then invests the pooled money in
                    assets such as stocks, bonds or other
                    securities depending on its objective.
                </p>

                <h4>Role of the fund manager</h4>

                <p>
                    A professional fund manager generally manages
                    the investments according to the fund's
                    investment strategy.
                </p>

                <h4>Risk</h4>

                <p>
                    Mutual funds are investments and can lose
                    value. The level of risk depends on the
                    assets and strategy of the fund.
                </p>
            `
        },


        "What is an ETF?": {

            category: "ETFS",

            title: "What is an ETF?",

            content: `
                <p>
                    An Exchange Traded Fund, commonly called an ETF,
                    is an investment fund whose units can be traded
                    on a stock exchange.
                </p>

                <h4>How is an ETF different?</h4>

                <p>
                    ETFs can be bought and sold during market hours
                    in a way similar to exchange-traded shares.
                </p>

                <h4>What can an ETF track?</h4>

                <p>
                    An ETF may track an index, sector, commodity
                    or another investment strategy.
                </p>

                <h4>Risk</h4>

                <p>
                    The risk of an ETF depends on the assets or
                    strategy it follows.
                </p>
            `
        },


        "Trading vs Investing": {

            category: "TRADING",

            title: "Trading vs Investing",

            content: `
                <p>
                    Trading and investing both involve financial
                    markets, but they generally differ in time
                    horizon and approach.
                </p>

                <h4>Trading</h4>

                <p>
                    Trading generally focuses on shorter-term
                    price movements. Traders may enter and exit
                    positions more frequently.
                </p>

                <h4>Investing</h4>

                <p>
                    Investing generally focuses on holding assets
                    for a longer period based on a broader view
                    of their potential value or growth.
                </p>

                <h4>Remember</h4>

                <p>
                    Neither approach guarantees profits. Both
                    involve market risk and require appropriate
                    research and risk management.
                </p>
            `
        },


        "Understanding Investment Risk": {

            category: "RISK",

            title: "Understanding Investment Risk",

            content: `
                <p>
                    Investment risk is the possibility that an
                    investment may lose value or perform differently
                    from what an investor expected.
                </p>

                <h4>Why does risk exist?</h4>

                <p>
                    Prices can change because of company performance,
                    economic conditions, interest rates, market
                    sentiment and many other factors.
                </p>

                <h4>Diversification</h4>

                <p>
                    Diversification means spreading investments
                    across different assets or categories rather
                    than relying entirely on one investment.
                </p>

                <h4>Time horizon</h4>

                <p>
                    The amount of time an investor plans to hold
                    an investment can influence how they approach
                    market fluctuations.
                </p>
            `
        },


        "Building an Emergency Fund": {

            category: "PERSONAL FINANCE",

            title: "Building an Emergency Fund",

            content: `
                <p>
                    An emergency fund is money kept aside for
                    unexpected expenses such as urgent repairs,
                    temporary income disruption or other financial
                    emergencies.
                </p>

                <h4>Why is it useful?</h4>

                <p>
                    Having accessible emergency savings can reduce
                    the need to sell investments or borrow money
                    when an unexpected expense occurs.
                </p>

                <h4>Before investing</h4>

                <p>
                    Personal financial priorities should be considered
                    before committing money to investments.
                </p>

                <h4>Key idea</h4>

                <p>
                    Emergency savings and investments serve
                    different purposes and should not automatically
                    be treated as the same pool of money.
                </p>
            `
        },


        "Fundamental Analysis": {

            category: "STOCKS",

            title: "Fundamental Analysis",

            content: `
                <p>
                    Fundamental analysis involves examining a
                    company's financial and business information
                    to understand its performance and financial
                    position.
                </p>

                <h4>Common metrics</h4>

                <ul>
                    <li>Revenue</li>
                    <li>Profit</li>
                    <li>Earnings per share (EPS)</li>
                    <li>Price-to-earnings ratio (P/E)</li>
                    <li>Debt</li>
                    <li>Return on equity (ROE)</li>
                </ul>

                <h4>Why use it?</h4>

                <p>
                    These metrics can help investors study a
                    company's financial characteristics and compare
                    businesses or periods of performance.
                </p>

                <h4>Important</h4>

                <p>
                    No single metric provides a complete picture
                    of a company.
                </p>
            `
        },


        "Portfolio Diversification": {

            category: "ADVANCED",

            title: "Portfolio Diversification",

            content: `
                <p>
                    Portfolio diversification means spreading
                    investments across different assets, companies,
                    sectors or other categories.
                </p>

                <h4>Why diversify?</h4>

                <p>
                    Diversification can reduce dependence on the
                    performance of one individual investment or
                    category.
                </p>

                <h4>Example</h4>

                <p>
                    A portfolio concentrated entirely in one stock
                    may be more exposed to that company's specific
                    risks than a portfolio spread across multiple
                    investments.
                </p>

                <h4>Important</h4>

                <p>
                    Diversification does not eliminate investment
                    risk and cannot guarantee a profit.
                </p>
            `
        }

    };


    /* =====================================================
       LESSON PROGRESS
    ===================================================== */

    const progressStorageKey =
        `investopia-completed-lessons-${user.id}`;


    let completedLessons = [];


    try {

        completedLessons =
            JSON.parse(
                localStorage.getItem(
                    progressStorageKey
                ) || "[]"
            );


        if (
            !Array.isArray(
                completedLessons
            )
        ) {

            completedLessons = [];

        }

    }

    catch (error) {

        console.error(
            "Unable to restore lesson progress:",
            error
        );

        completedLessons = [];

    }


    /* =====================================================
       UPDATE PROGRESS
    ===================================================== */

    function updateProgress() {

        const total =
            Object.keys(
                lessonContent
            ).length;


        const completed =
            completedLessons.length;


        const percentage =
            total > 0
                ? (completed / total) * 100
                : 0;


        if (progressText) {

            progressText.textContent =
                `${completed} of ${total} lessons completed`;

        }


        if (progressFill) {

            progressFill.style.width =
                `${percentage}%`;

        }

    }


    /* =====================================================
       SAVE PROGRESS
    ===================================================== */

    function saveCompletedLesson(
        title
    ) {

        if (
            !completedLessons.includes(
                title
            )
        ) {

            completedLessons.push(
                title
            );


            localStorage.setItem(
                progressStorageKey,
                JSON.stringify(
                    completedLessons
                )
            );

        }


        updateProgress();

    }


    /* =====================================================
       RESTORE BUTTON STATE
    ===================================================== */

    function restoreProgress() {

        document
            .querySelectorAll(
                ".lesson-button"
            )
            .forEach((button) => {

                const title =
                    button.dataset.lesson;


                if (
                    title &&
                    completedLessons.includes(
                        title
                    )
                ) {

                    button.innerHTML =
                        `Completed <i class="bi bi-check-circle"></i>`;

                    button.classList.add(
                        "completed"
                    );

                }

            });


        updateProgress();

    }


    restoreProgress();


    /* =====================================================
       LESSON FILTERING
    ===================================================== */

    let activeCategory =
        "all";


    function filterLessons() {

        const query =
            learningSearch?.value
                .trim()
                .toLowerCase() || "";


        let visibleCount =
            0;


        lessons.forEach(
            (lesson) => {

                const category =
                    (
                        lesson.dataset.category ||
                        ""
                    ).toLowerCase();


                const title =
                    (
                        lesson.dataset.title ||
                        lesson.textContent
                    ).toLowerCase();


                const categoryMatch =
                    activeCategory === "all" ||
                    category === activeCategory;


                const searchMatch =
                    !query ||
                    title.includes(query) ||
                    category.includes(query);


                const show =
                    categoryMatch &&
                    searchMatch;


                lesson.classList.toggle(
                    "hidden",
                    !show
                );


                if (show) {
                    visibleCount++;
                }

            }
        );


        if (resultCount) {

            resultCount.textContent =
                `${visibleCount} ${
                    visibleCount === 1
                        ? "lesson"
                        : "lessons"
                }`;

        }

    }


    learningSearch?.addEventListener(
        "input",
        filterLessons
    );


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    categoryGrid?.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".category-card"
                );


            if (!button) {
                return;
            }


            document
                .querySelectorAll(
                    ".category-card"
                )
                .forEach(
                    (card) => {

                        card.classList.remove(
                            "active"
                        );

                    }
                );


            button.classList.add(
                "active"
            );


            activeCategory =
                button.dataset.category ||
                "all";


            filterLessons();

        }
    );


    filterLessons();


    /* =====================================================
       LESSON VIEWER
    ===================================================== */

    const lessonViewer =
        document.getElementById(
            "lessonViewer"
        );

    const viewerCategory =
        document.getElementById(
            "viewerCategory"
        );

    const viewerTitle =
        document.getElementById(
            "viewerTitle"
        );

    const viewerContent =
        document.getElementById(
            "lessonViewerContent"
        );

    const closeLesson =
        document.getElementById(
            "closeLesson"
        );

    const completeLessonButton =
        document.getElementById(
            "completeLessonButton"
        );


    let currentLesson =
        null;


    function openLesson(
        title
    ) {

        const lesson =
            lessonContent[title];


        if (!lesson) {

            console.error(
                "Lesson content not found:",
                title
            );

            return;

        }


        currentLesson =
            title;


        if (viewerCategory) {

            viewerCategory.textContent =
                lesson.category;

        }


        if (viewerTitle) {

            viewerTitle.textContent =
                lesson.title;

        }


        if (viewerContent) {

            viewerContent.innerHTML =
                lesson.content;

        }


        if (completeLessonButton) {

            const alreadyCompleted =
                completedLessons.includes(
                    title
                );


            completeLessonButton.innerHTML =
                alreadyCompleted
                    ? `<i class="bi bi-check-circle-fill"></i> Completed`
                    : `<i class="bi bi-check-circle"></i> Mark as Completed`;


            completeLessonButton.classList.toggle(
                "completed",
                alreadyCompleted
            );

        }


        if (lessonViewer) {

            lessonViewer.hidden =
                false;

            lessonViewer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        localStorage.setItem(
            `investopia-current-lesson-${user.id}`,
            JSON.stringify({

                title,

                openedAt:
                    new Date()
                        .toISOString()

            })
        );

    }


    function closeLessonViewer() {

        if (lessonViewer) {

            lessonViewer.hidden =
                true;

        }


        currentLesson =
            null;

    }


    closeLesson?.addEventListener(
        "click",
        closeLessonViewer
    );


    /* =====================================================
       LESSON BUTTONS
    ===================================================== */

    document
        .querySelectorAll(
            ".lesson-button"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const title =
                            button.dataset.lesson;


                        if (!title) {
                            return;
                        }


                        openLesson(
                            title
                        );

                    }
                );

            }
        );


    /* =====================================================
       COMPLETE LESSON
    ===================================================== */

    completeLessonButton?.addEventListener(
        "click",
        () => {

            if (!currentLesson) {
                return;
            }


            saveCompletedLesson(
                currentLesson
            );


            document
                .querySelectorAll(
                    ".lesson-button"
                )
                .forEach(
                    (button) => {

                        if (
                            button.dataset.lesson ===
                            currentLesson
                        ) {

                            button.innerHTML =
                                `Completed <i class="bi bi-check-circle"></i>`;

                            button.classList.add(
                                "completed"
                            );

                        }

                    }
                );


            completeLessonButton.innerHTML =
                `<i class="bi bi-check-circle-fill"></i> Completed`;


            completeLessonButton.classList.add(
                "completed"
            );

        }
    );


    /* =====================================================
       ESCAPE TO CLOSE LESSON
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                lessonViewer &&
                !lessonViewer.hidden
            ) {

                closeLessonViewer();

            }

        }
    );


    /* =====================================================
       AI ADVISOR CONTEXT
    ===================================================== */

    document
        .getElementById(
            "aiLearningButton"
        )
        ?.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    `investopia-learning-context-${user.id}`,
                    JSON.stringify({

                        page:
                            "Learning Center",

                        userName,

                        completedLessons:
                            completedLessons,

                        currentLesson:
                            currentLesson,

                        createdAt:
                            new Date()
                                .toISOString()

                    })
                );

            }
        );


    /* =====================================================
       RESPONSIVE
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
       INITIALIZE
    ===================================================== */

    updateProgress();


    console.log(
        "Investopia Learning initialized successfully.",
        {
            userName,
            completedLessons
        }
    );

});