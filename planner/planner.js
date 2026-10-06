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

    const progressTarget =
        document.getElementById("progressTarget");


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


            if (!query) return;


            window.location.href =
                `../market/market.html?search=${encodeURIComponent(query)}`;
        }
    );


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


        if (value === "20") {
            return "20+ Years";
        }


        return `${value} Year${value === "1" ? "" : "s"}`;
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
       BASIC ESTIMATION

       This is only a simple educational simulation.
       It is NOT a guaranteed return calculation.
    ===================================================== */

    function calculatePlan() {

        const target =
            Number(targetValue.value) || 0;

        const initial =
            Number(initialAmount.value) || 0;

        const monthly =
            Number(monthlyAmount.value) || 0;

        const years =
            Number(timeline.value) || 0;

        const risk =
            getRisk();


        if (
            !goalType.value ||
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
           Simple simulated annual assumptions.

           These are NOT promises or predictions.
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

            goalProgress

        };
    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function showValidation() {

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
       CREATE PLAN
    ===================================================== */

    plannerForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const plan =
                calculatePlan();


            if (!plan) return;


            displayPlan(plan);

            updateStats(plan);

            updateProgress(plan);

            savePlan(plan);

        }
    );


    /* =====================================================
       DISPLAY AI PLAN
    ===================================================== */

    function displayPlan(plan) {

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
       UPDATE PROGRESS
    ===================================================== */

    function updateProgress(plan) {

        const percentage =
            Math.round(
                plan.goalProgress
            );


        if (progressPercent) {

            progressPercent.textContent =
                `${percentage}%`;
        }


        if (progressFill) {

            progressFill.style.width =
                `${percentage}%`;
        }


        if (progressTarget) {

            progressTarget.textContent =
                `Target: ${formatCurrency(
                    plan.target
                )}`;
        }
    }


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    function savePlan(plan) {

        localStorage.setItem(
            "investopia-planner",
            JSON.stringify(plan)
        );
    }


    /* =====================================================
       LOAD SAVED PLAN
    ===================================================== */

    function loadSavedPlan() {

        const saved =
            localStorage.getItem(
                "investopia-planner"
            );


        if (!saved) return;


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


                goalType.value =
                    goalMap[
                        plan.goal
                    ] || "";
            }


            if (targetValue) {

                targetValue.value =
                    plan.target;
            }


            if (initialAmount) {

                initialAmount.value =
                    plan.initial;
            }


            if (monthlyAmount) {

                monthlyAmount.value =
                    plan.monthly;
            }


            if (timeline) {

                timeline.value =
                    String(
                        plan.years
                    );
            }


            const riskRadio =
                document.querySelector(
                    `input[name="risk"][value="${plan.risk}"]`
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
                    getGoalName(
                        goalType.value
                    );
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

                if (
                    Number(input.value) < 0
                ) {

                    input.value = 0;
                }

            }
        );

    });


    /* =====================================================
       AI ADVISOR LINK
    ===================================================== */

    /*
       Send planner information to AI Advisor
       through localStorage.

       The AI Advisor can use this later.
    */

    document
        .querySelector(
            ".ai-chat-link"
        )
        ?.addEventListener(
            "click",
            () => {

                const plan =
                    calculatePlan();


                if (!plan) {
                    return;
                }


                const plannerContext = {

                    goal:
                        plan.goal,

                    target:
                        plan.target,

                    monthlyInvestment:
                        plan.monthly,

                    timeline:
                        plan.years,

                    risk:
                        plan.riskText

                };


                localStorage.setItem(
                    "investopia-ai-planner-context",
                    JSON.stringify(
                        plannerContext
                    )
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

    loadSavedPlan();

    updateThemeIcon();

});