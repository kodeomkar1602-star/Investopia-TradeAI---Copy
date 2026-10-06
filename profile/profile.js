/* =========================================================
   INVESTOPIA TRADEAI - PROFILE
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


    /* =====================================================
       PROFILE MODAL ELEMENTS
    ===================================================== */

    const profileModal =
        document.getElementById("profileModal");

    const modalOverlay =
        document.getElementById("modalOverlay");

    const modalClose =
        document.getElementById("modalClose");

    const editProfileButton =
        document.getElementById("editProfileButton");

    const profileForm =
        document.getElementById("profileForm");

    const editName =
        document.getElementById("editName");

    const editEmail =
        document.getElementById("editEmail");


    /* =====================================================
       PROFILE DISPLAY ELEMENTS
    ===================================================== */

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const displayName =
        document.getElementById("displayName");

    const displayEmail =
        document.getElementById("displayEmail");

    const memberSince =
        document.getElementById("memberSince");


    /* =====================================================
       PREFERENCE ELEMENTS
    ===================================================== */

    const investmentGoal =
        document.getElementById("investmentGoal");

    const riskPreference =
        document.getElementById("riskPreference");

    const investmentHorizon =
        document.getElementById("investmentHorizon");

    const savePreferences =
        document.getElementById("savePreferences");


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
       GLOBAL SEARCH
    ===================================================== */

    globalSearch?.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Enter") {
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
       PROFILE DATA
    ===================================================== */

    const userMetadata =
        user.user_metadata || {};


    const defaultProfile = {

        name:
            userMetadata.full_name ||
            "Investor",

        email:
            user.email ||
            "investor@example.com",

        memberSince:
            user.created_at
                ? new Date(
                    user.created_at
                ).toLocaleDateString(
                    "en-IN",
                    {
                        month: "long",
                        year: "numeric"
                    }
                )
                : "August 2026"

    };


    function getProfile() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        "investopia-profile"
                    ) || "{}"
                );


            return {

                ...defaultProfile,

                ...saved,

                email:
                    user.email ||
                    saved.email ||
                    defaultProfile.email

            };

        } catch (error) {

            console.error(
                "Profile read error:",
                error
            );

            return defaultProfile;

        }

    }


    function saveProfile(profile) {

        localStorage.setItem(
            "investopia-profile",
            JSON.stringify(profile)
        );

    }


    function updateProfileUI() {

        const profile =
            getProfile();


        if (profileName) {

            profileName.textContent =
                profile.name;

        }


        if (profileEmail) {

            profileEmail.textContent =
                profile.email;

        }


        if (displayName) {

            displayName.textContent =
                profile.name;

        }


        if (displayEmail) {

            displayEmail.textContent =
                profile.email;

        }


        if (memberSince) {

            memberSince.textContent =
                profile.memberSince;

        }

    }


    updateProfileUI();


    /* =====================================================
       EDIT PROFILE MODAL
    ===================================================== */

    function openProfileModal() {

        const profile =
            getProfile();


        if (editName) {

            editName.value =
                profile.name;

        }


        if (editEmail) {

            editEmail.value =
                profile.email;

            /*
             * Supabase currently controls the authenticated
             * email address. Therefore the email field is
             * displayed but should not be used to change
             * authentication email from this local profile form.
             */

            editEmail.readOnly = true;

        }


        profileModal?.classList.add(
            "show"
        );

        document.body.style.overflow =
            "hidden";


        setTimeout(
            () => editName?.focus(),
            100
        );

    }


    function closeProfileModal() {

        profileModal?.classList.remove(
            "show"
        );

        document.body.style.overflow =
            "";

    }


    editProfileButton?.addEventListener(
        "click",
        openProfileModal
    );


    modalClose?.addEventListener(
        "click",
        closeProfileModal
    );


    modalOverlay?.addEventListener(
        "click",
        closeProfileModal
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeProfileModal();

            }

        }
    );


    profileForm?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                editName?.value.trim();


            const email =
                editEmail?.value.trim();


            if (!name || !email) {

                alert(
                    "Please enter your name and email address."
                );

                return;

            }


            const current =
                getProfile();


            saveProfile({

                ...current,

                name,

                email:
                    user.email ||
                    current.email

            });


            /*
             * Also update the user's Supabase metadata
             * so the name is associated with the account.
             */

            const {
                error
            } =
                await supabaseClient.auth.updateUser({

                    data: {
                        full_name: name
                    }

                });


            if (error) {

                console.error(
                    "Profile update error:",
                    error
                );

                alert(
                    "Profile was saved locally, but the account name could not be updated."
                );

                updateProfileUI();

                closeProfileModal();

                return;

            }


            user.user_metadata =
                user.user_metadata || {};

            user.user_metadata.full_name =
                name;


            updateProfileUI();

            closeProfileModal();


            alert(
                "Profile updated successfully."
            );

        }
    );


    /* =====================================================
       INVESTOR PREFERENCES
    ===================================================== */

    const defaultPreferences = {

        goal:
            "wealth",

        risk:
            "moderate",

        horizon:
            "long"

    };


    function getPreferences() {

        try {

            return {

                ...defaultPreferences,

                ...JSON.parse(
                    localStorage.getItem(
                        "investopia-preferences"
                    ) || "{}"
                )

            };

        } catch (error) {

            console.error(
                "Preferences read error:",
                error
            );

            return defaultPreferences;

        }

    }


    function loadPreferences() {

        const preferences =
            getPreferences();


        if (investmentGoal) {

            investmentGoal.value =
                preferences.goal;

        }


        if (riskPreference) {

            riskPreference.value =
                preferences.risk;

        }


        if (investmentHorizon) {

            investmentHorizon.value =
                preferences.horizon;

        }

    }


    loadPreferences();


    savePreferences?.addEventListener(
        "click",
        () => {

            const preferences = {

                goal:
                    investmentGoal?.value ||
                    "wealth",

                risk:
                    riskPreference?.value ||
                    "moderate",

                horizon:
                    investmentHorizon?.value ||
                    "long"

            };


            localStorage.setItem(
                "investopia-preferences",
                JSON.stringify(
                    preferences
                )
            );


            alert(
                "Investor preferences saved successfully."
            );

        }
    );


    /* =====================================================
       SETTINGS
    ===================================================== */

    document
        .getElementById("notificationSetting")
        ?.addEventListener(
            "click",
            () => {

                alert(
                    "Notification settings will be available when the notification system is connected."
                );

            }
        );


    document
        .getElementById("securitySetting")
        ?.addEventListener(
            "click",
            () => {

                alert(
                    "Your account authentication is managed by Supabase. Additional security features can be added here later."
                );

            }
        );


    document
        .getElementById("dataSetting")
        ?.addEventListener(
            "click",
            () => {

                alert(
                    "Your current profile preferences are stored locally in your browser. Account authentication is managed by Supabase."
                );

            }
        );


    /* =====================================================
       LOGOUT
    ===================================================== */

    document
        .getElementById("logoutButton")
        ?.addEventListener(
            "click",
            async () => {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to log out?"
                    );


                if (!confirmLogout) {
                    return;
                }


                const logoutSuccess =
                    await logoutUser();


                if (!logoutSuccess) {

                    alert(
                        "Unable to log out. Please try again."
                    );

                }

            }
        );


    /* =====================================================
       AI ADVISOR CONTEXT
    ===================================================== */

    document
        .querySelector(".ai-button")
        ?.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "investopia-ai-profile-context",
                    JSON.stringify({

                        profile:
                            getProfile(),

                        preferences:
                            getPreferences(),

                        createdAt:
                            new Date().toISOString()

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

    console.log(
        "Investopia Profile initialized successfully."
    );

});