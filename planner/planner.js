/* =========================================================
   INVESTOPIA TRADEAI - INVESTMENT PLANNER
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

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profileName =
        document.getElementById("profileName");

    const plannerForm =
        document.getElementById("plannerForm");

    const goalType =
        document.getElementById("goalType");

    const targetValue =
        document.getElementById("targetValue");

    const timeline =
        document.getElementById("timeline");

    const initialAmount =
        document.getElementById("initialAmount");

    const monthlyAmount =
        document.getElementById("monthlyAmount");

    const aiPlanContent =
        document.getElementById("aiPlanContent");

    const activeGoal =
        document.getElementById("activeGoal");

    const targetAmount =
        document.getElementById("targetAmount");

    const targetTimeline =
        document.getElementById("targetTimeline");

    const progressPercent =
        document.getElementById("progressPercent");

    const progressFill =
        document.getElementById("progressFill");

    const progressCurrent =
        document.getElementById("progressCurrent");

    const progressTarget =
        document.getElementById("progressTarget");

    const progressSource =
        document.getElementById("progressSource");


    /* =====================================================
       USER NAME
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

    const plannerStorageKey =
        `investopia-planner-${user.id}`;

    const aiPlannerStorageKey =
        `investopia-ai-planner-context-${user.id}`;


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

    globalSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter"
            ) {
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

                globalSearch?.focus();

            }

        }
    );


    /* =====================================================
       NUMBER FORMATTER
    ===================================================== */

    function formatCurrency(value) {

        const number =
            Number(value) || 0;

        return "₹" +
            number.toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits: 0
                }
            );
    }


    function formatCurrencyDecimal(value) {

        const number =
            Number(value) || 0;

        return "₹" +
            number.toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );
    }


    /* =====================================================
       GOAL NAME
    ===================================================== */

    function getGoalName(value) {

        const goals = {

            wealth:
                "Wealth Creation",

            retirement:
                "Retirement",

            education:
                "Education",

            home:
                "Buying a Home",

            vehicle:
                "Buying a Vehicle",

            travel:
                "Travel",

            emergency:
                "Emergency Fund",

            other:
                "Other Goal"

        };


        return goals[value] ||
            "Investment Goal";
    }


    /* =====================================================
       TIMELINE
    ===================================================== */

    function getTimelineText(value) {

        if (!value) {
            return "Not set";
        }


        if (String(value) === "20") {
            return "20+ Years";
        }


        return `${value} Year${String(value) === "1" ? "" : "s"}`;
    }


    /* =====================================================
       RISK
    ===================================================== */

    function getRisk() {

        const selected =
            document.querySelector(
                'input[name="risk"]:checked'
            );


        return selected
            ? selected.value
            : null;
    }


    function getRiskText(risk) {

        const riskNames = {

            low:
                "Conservative",

            moderate:
                "Moderate",

            high:
                "Growth"

        };


        return riskNames[risk] ||
            "Not selected";
    }


    /* =====================================================
       VALIDATE NUMBER
    ===================================================== */

    function getPositiveNumber(input) {

        if (!input) {
            return 0;
        }

        const value =
            Number(input.value);

        if (
            !Number.isFinite(value) ||
            value < 0
        ) {
            return 0;
        }

        return value;
    }


    /* =====================================================
       BASIC EDUCATIONAL ESTIMATION
       
       IMPORTANT:
       These rates are assumptions used only for simulation.
       They are NOT Angel One prices and are NOT guaranteed
       market returns.
    ===================================================== */

    function calculatePlan() {

        const target =
            getPositiveNumber(targetValue);

        const initial =
            getPositiveNumber(initialAmount);

        const monthly =
            getPositiveNumber(monthlyAmount);

        const years =
            Number(timeline?.value) || 0;

        const risk =
            getRisk();


        if (
            !goalType?.value ||
            target <= 0 ||
            years <= 0 ||
            monthly <= 0 ||
            !risk
        ) {

            showValidation();

            return null;
        }


        const months =
            years * 12;


        const totalContribution =
            initial +
            monthly * months;


        /*
            Educational planning assumptions only.

            Conservative = 7%
            Moderate     = 10%
            Growth       = 12%

            These are not predictions and do not represent
            live market returns.
        */

        const assumedRates = {

            low:
                0.07,

            moderate:
                0.10,

            high:
                0.12

        };


        const annualRate =
            assumedRates[risk];


        const monthlyRate =
            annualRate / 12;


        let estimatedValue =
            initial;


        for (
            let month = 1;
            month <= months;
            month++
        ) {

            estimatedValue =
                estimatedValue *
                (1 + monthlyRate);

            estimatedValue +=
                monthly;

        }


        const goalProgress =
            Math.min(
                (estimatedValue / target) * 100,
                100
            );


        return {

            goal:
                getGoalName(
                    goalType.value
                ),

            goalType:
                goalType.value,

            target,

            initial,

            monthly,

            years,

            months,

            risk,

            riskText:
                getRiskText(risk),

            annualRate,

            totalContribution,

            estimatedValue,

            goalProgress,

            createdAt:
                new Date().toISOString()

        };

    }


    /* =====================================================
       VALIDATION MESSAGE
    ===================================================== */

    function showValidation() {

        if (!aiPlanContent) {
            return;
        }


        aiPlanContent.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i class="bi bi-exclamation-circle"></i>

                </div>

                <h4>
                    Complete your plan
                </h4>

                <p>
                    Please select a goal, enter your target
                    amount and timeline, add a monthly investment,
                    and choose your risk preference.
                </p>

            </div>

        `;

    }


    /* =====================================================
       DISPLAY PLAN
    ===================================================== */

    function displayPlan(plan) {

        if (!aiPlanContent) {
            return;
        }


        aiPlanContent.innerHTML = `

            <div class="generated-plan">

                <div class="plan-score">

                    <span class="plan-score-label">
                        PLANNING STATUS
                    </span>

                    <span class="plan-score-value">
                        Plan Created
                    </span>

                </div>


                <div class="plan-item">

                    <span>
                        Investment Goal
                    </span>

                    <strong>
                        ${plan.goal}
                    </strong>

                </div>


                <div class="plan-item">

                    <span>
                        Target Amount
                    </span>

                    <strong>
                        ${formatCurrency(
                            plan.target
                        )}
                    </strong>

                </div>


                <div class="plan-item">

                    <span>
                        Monthly Investment
                    </span>

                    <strong>
                        ${formatCurrency(
                            plan.monthly
                        )}
                    </strong>

                </div>


                <div class="plan-item">

                    <span>
                        Time Horizon
                    </span>

                    <strong>
                        ${getTimelineText(
                            String(plan.years)
                        )}
                    </strong>

                </div>


                <div class="plan-item">

                    <span>
                        Risk Preference
                    </span>

                    <strong>
                        ${plan.riskText}
                    </strong>

                </div>


                <div class="plan-item">

                    <span>
                        Planned Contributions
                    </span>

                    <strong>
                        ${formatCurrency(
                            plan.totalContribution
                        )}
                    </strong>

                </div>


                <div class="plan-item">

                    <span>
                        Simulated Future Value
                    </span>

                    <strong>
                        ${formatCurrency(
                            plan.estimatedValue
                        )}
                    </strong>

                </div>


                <div class="plan-item">

                    <span>
                        Assumed Annual Rate
                    </span>

                    <strong>
                        ${(plan.annualRate * 100).toFixed(1)}%
                    </strong>

                </div>

            </div>

        `;

    }


    /* =====================================================
       UPDATE QUICK STATS
    ===================================================== */

    function updateStats(plan) {

        if (activeGoal) {

            activeGoal.textContent =
                plan.goal;

        }


        if (targetAmount) {

            targetAmount.textContent =
                formatCurrency(
                    plan.target
                );

        }


        if (targetTimeline) {

            targetTimeline.textContent =
                getTimelineText(
                    String(plan.years)
                );

        }

    }


    /* =====================================================
       PAPER PORTFOLIO VALUE
       
       Reads Investopia's existing paper-trading storage.
       
       No stock price is invented here.
       Only stored portfolio values are used.
    ===================================================== */

    function getPaperPortfolioValue() {

        let cash = 0;
        let holdingsValue = 0;
        let foundPortfolioData = false;


        /* -----------------------------------------------
           CASH
        ------------------------------------------------ */

        const possibleCashKeys = [

            "investopiaVirtualCash",

            `investopiaVirtualCash-${user.id}`

        ];


        for (const key of possibleCashKeys) {

            const raw =
                localStorage.getItem(key);

            if (raw === null) {
                continue;
            }


            const parsed =
                Number(
                    String(raw)
                        .replace(/,/g, "")
                        .replace(/[₹$]/g, "")
                );


            if (
                Number.isFinite(parsed) &&
                parsed >= 0
            ) {

                cash = parsed;

                foundPortfolioData = true;

                break;

            }

        }


        /* -----------------------------------------------
           HOLDINGS
        ------------------------------------------------ */

        const possibleHoldingKeys = [

            "investopiaHoldings",

            `investopiaHoldings-${user.id}`

        ];


        let holdings = null;


        for (const key of possibleHoldingKeys) {

            const raw =
                localStorage.getItem(key);

            if (!raw) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(raw);


                if (parsed) {

                    holdings = parsed;

                    foundPortfolioData = true;

                    break;

                }

            } catch (error) {

                console.warn(
                    "Could not parse holdings:",
                    error
                );

            }

        }


        if (!holdings) {

            return {

                value: cash,

                hasData:
                    foundPortfolioData

            };

        }


        /*
            The planner does not invent prices.

            If the holdings already contain a current/market
            value, use that stored value.

            If only quantities are available, they are not
            converted into money here because doing so would
            require a live Angel One price for every holding.
        */

        if (Array.isArray(holdings)) {

            holdings.forEach(holding => {

                const marketValue =
                    Number(
                        holding.marketValue ??
                        holding.currentValue ??
                        holding.value ??
                        0
                    );


                if (
                    Number.isFinite(marketValue) &&
                    marketValue >= 0
                ) {

                    holdingsValue +=
                        marketValue;

                }

            });

        } else if (
            typeof holdings === "object"
        ) {

            Object.values(holdings)
                .forEach(holding => {

                    if (
                        !holding ||
                        typeof holding !== "object"
                    ) {
                        return;
                    }


                    const marketValue =
                        Number(
                            holding.marketValue ??
                            holding.currentValue ??
                            holding.value ??
                            0
                        );


                    if (
                        Number.isFinite(marketValue) &&
                        marketValue >= 0
                    ) {

                        holdingsValue +=
                            marketValue;

                    }

                });

        }


        return {

            value:
                cash + holdingsValue,

            hasData:
                foundPortfolioData

        };

    }


    /* =====================================================
       UPDATE PROGRESS
       
       Progress uses current paper portfolio value when
       available.

       It does NOT use the simulated future value.
    ===================================================== */

    function updateProgress(plan) {

        const portfolio =
            getPaperPortfolioValue();


        const currentValue =
            portfolio.value;


        const percentage =
            Math.min(
                Math.max(
                    (currentValue / plan.target) * 100,
                    0
                ),
                100
            );


        const roundedPercentage =
            Math.round(
                percentage
            );


        if (progressPercent) {

            progressPercent.textContent =
                `${roundedPercentage}%`;

        }


        if (progressFill) {

            progressFill.style.width =
                `${roundedPercentage}%`;

        }


        if (progressCurrent) {

            progressCurrent.textContent =
                `Current: ${formatCurrencyDecimal(
                    currentValue
                )}`;

        }


        if (progressTarget) {

            progressTarget.textContent =
                `Target: ${formatCurrency(
                    plan.target
                )}`;

        }


        if (progressSource) {

            if (portfolio.hasData) {

                progressSource.textContent =
                    "Current value is based on your Investopia paper-trading portfolio data.";

            } else {

                progressSource.textContent =
                    "No paper-trading portfolio value is available yet. Start paper trading to track actual progress.";

            }

        }

    }


    /* =====================================================
       SAVE PLAN
    ===================================================== */

    function savePlan(plan) {

        try {

            localStorage.setItem(
                plannerStorageKey,
                JSON.stringify(plan)
            );

        } catch (error) {

            console.error(
                "Could not save planner:",
                error
            );

        }

    }


    /* =====================================================
       LOAD SAVED PLAN
    ===================================================== */

    function loadSavedPlan() {

        let saved = null;


        try {

            saved =
                localStorage.getItem(
                    plannerStorageKey
                );

        } catch (error) {

            console.error(
                "Could not access saved planner:",
                error
            );

            return;

        }


        if (!saved) {
            return;
        }


        try {

            const plan =
                JSON.parse(saved);


            if (
                !plan ||
                !plan.target
            ) {
                return;
            }


            if (goalType) {

                goalType.value =
                    plan.goalType ||
                    getGoalValueFromName(
                        plan.goal
                    );

            }


            if (targetValue) {

                targetValue.value =
                    plan.target;

            }


            if (initialAmount) {

                initialAmount.value =
                    plan.initial || 0;

            }


            if (monthlyAmount) {

                monthlyAmount.value =
                    plan.monthly || 0;

            }


            if (timeline) {

                timeline.value =
                    String(
                        plan.years
                    );

            }


            const riskRadio =
                document.querySelector(
                    `input[name="risk"][value="${CSS.escape(
                        String(plan.risk || "")
                    )}"]`
                );


            if (riskRadio) {

                riskRadio.checked =
                    true;

            }


            displayPlan(plan);

            updateStats(plan);

            updateProgress(plan);

        } catch (error) {

            console.error(
                "Could not load saved plan:",
                error
            );

        }

    }


    /* =====================================================
       GOAL VALUE FROM OLD SAVED DATA
    ===================================================== */

    function getGoalValueFromName(name) {

        const goalMap = {

            "Wealth Creation":
                "wealth",

            "Retirement":
                "retirement",

            "Education":
                "education",

            "Buying a Home":
                "home",

            "Buying a Vehicle":
                "vehicle",

            "Travel":
                "travel",

            "Emergency Fund":
                "emergency",

            "Other Goal":
                "other"

        };


        return goalMap[name] || "";

    }


    /* =====================================================
       RESET WHEN GOAL CHANGES
    ===================================================== */

    goalType?.addEventListener(
        "change",
        () => {

            if (
                goalType.value &&
                targetValue.value
            ) {
                return;
            }


            if (activeGoal) {

                activeGoal.textContent =
                    goalType.value
                        ? getGoalName(
                            goalType.value
                        )
                        : "No goal set";

            }

        }
    );


    /* =====================================================
       NUMBER INPUT CLEANUP
    ===================================================== */

    [
        targetValue,
        initialAmount,
        monthlyAmount

    ].forEach(input => {

        input?.addEventListener(
            "input",
            () => {

                const value =
                    Number(input.value);


                if (
                    !Number.isFinite(value) ||
                    value < 0
                ) {

                    input.value = 0;

                }

            }
        );

    });


    /* =====================================================
       CREATE PLAN
    ===================================================== */

    plannerForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const plan =
                calculatePlan();


            if (!plan) {
                return;
            }


            displayPlan(plan);

            updateStats(plan);

            updateProgress(plan);

            savePlan(plan);

        }
    );


    /* =====================================================
       AI ADVISOR LINK
    ===================================================== */

    document
        .querySelector(".ai-chat-link")
        ?.addEventListener(
            "click",
            () => {

                /*
                    If the form is complete, create the latest
                    planner context.

                    If the user already has a saved plan,
                    use that instead.
                */

                const calculatedPlan =
                    calculatePlan();


                let plan =
                    calculatedPlan;


                if (!plan) {

                    try {

                        const saved =
                            localStorage.getItem(
                                plannerStorageKey
                            );


                        if (saved) {

                            plan =
                                JSON.parse(saved);

                        }

                    } catch (error) {

                        console.error(
                            "Could not read saved plan:",
                            error
                        );

                    }

                }


                if (!plan) {
                    return;
                }


                const plannerContext = {

                    userName,

                    goal:
                        plan.goal,

                    target:
                        plan.target,

                    initialInvestment:
                        plan.initial,

                    monthlyInvestment:
                        plan.monthly,

                    timeline:
                        plan.years,

                    risk:
                        plan.riskText,

                    estimatedValue:
                        plan.estimatedValue,

                    annualAssumption:
                        plan.annualRate,

                    createdAt:
                        new Date().toISOString()

                };


                try {

                    localStorage.setItem(
                        aiPlannerStorageKey,
                        JSON.stringify(
                            plannerContext
                        )
                    );

                } catch (error) {

                    console.error(
                        "Could not save AI planner context:",
                        error
                    );

                }

            }
        );


    /* =====================================================
       REFRESH PAPER PORTFOLIO PROGRESS
    ===================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                    "investopiaVirtualCash" ||
                event.key ===
                    "investopiaHoldings"
            ) {

                const saved =
                    localStorage.getItem(
                        plannerStorageKey
                    );


                if (!saved) {
                    return;
                }


                try {

                    const plan =
                        JSON.parse(saved);


                    updateProgress(plan);

                } catch (error) {

                    console.error(
                        "Could not refresh planner progress:",
                        error
                    );

                }

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
                window.innerWidth > 991
            ) {

                closeSidebar();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadSavedPlan();

    updateThemeIcon();


    console.log(
        "Investopia Investment Planner initialized successfully."
    );

});