/* =========================================================
   INVESTOPIA TRADEAI - PROFILE
   Supabase Logged-in User Profile
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

    const profileAvatar =
        document.getElementById("profileAvatar");

    const topbarProfileAvatar =
        document.getElementById("topbarProfileAvatar");


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
       USER-SPECIFIC STORAGE KEYS
    ===================================================== */

    const userId = user.id;

    const PROFILE_STORAGE_KEY =
        `investopia-profile-${userId}`;

    const PREFERENCES_STORAGE_KEY =
        `investopia-preferences-${userId}`;

    const AI_CONTEXT_STORAGE_KEY =
        `investopia-ai-profile-context-${userId}`;


    /* =====================================================
       HELPER - GET USER NAME
    ===================================================== */

    function getUserName() {

        const metadata =
            user.user_metadata || {};

        return (
            metadata.full_name ||
            metadata.name ||
            metadata.username ||
            user.email?.split("@")[0] ||
            "Investor"
        );

    }


    /* =====================================================
       HELPER - GET INITIALS
    ===================================================== */

    function getInitials(name) {

        if (!name) {
            return "U";
        }

        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();

        }

        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();

    }


    /* =====================================================
       HELPER - SET AVATAR
    ===================================================== */

    function updateAvatar(name) {

        const initials =
            getInitials(name);

        if (profileAvatar) {

            profileAvatar.textContent =
                initials;

        }

        if (topbarProfileAvatar) {

            topbarProfileAvatar.textContent =
                initials;

        }

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
            userMetadata.name ||
            userMetadata.username ||
            user.email?.split("@")[0] ||
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
                : "—"

    };


    function getProfile() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        PROFILE_STORAGE_KEY
                    ) || "{}"
                );


            return {

                ...defaultProfile,

                ...saved,

                /*
                 * Supabase remains the source of truth
                 * for the authenticated email.
                 */

                email:
                    user.email ||
                    defaultProfile.email

            };

        } catch (error) {

            console.error(
                "Profile read error:",
                error
            );

            return {
                ...defaultProfile
            };

        }

    }


    function saveProfile(profile) {

        localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify(profile)
        );

    }


    /* =====================================================
       UPDATE PROFILE UI
    ===================================================== */

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


        updateAvatar(
            profile.name
        );

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
             * Supabase controls the authenticated email.
             * Therefore this field is read-only.
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


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    profileForm?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                editName?.value.trim();


            if (!name) {

                alert(
                    "Please enter your full name."
                );

                return;

            }


            const current =
                getProfile();


            /*
             * Save locally using this user's
             * unique Supabase user ID.
             */

            saveProfile({

                ...current,

                name,

                email:
                    user.email ||
                    current.email

            });


            /*
             * Update Supabase user metadata.
             */

            const {
                data,
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
                    "Profile was saved locally, but the account name could not be updated in Supabase."
                );

                updateProfileUI();

                closeProfileModal();

                return;

            }


            /*
             * Update local user object immediately.
             */

            user.user_metadata =
                data?.user?.user_metadata ||
                user.user_metadata ||
                {};

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

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        PREFERENCES_STORAGE_KEY
                    ) || "{}"
                );


            return {

                ...defaultPreferences,

                ...saved

            };

        } catch (error) {

            console.error(
                "Preferences read error:",
                error
            );

            return {
                ...defaultPreferences
            };

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


    /* =====================================================
       SAVE PREFERENCES
    ===================================================== */

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
                PREFERENCES_STORAGE_KEY,
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
       ACCOUNT SETTINGS
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
                    "Your profile preferences are stored separately for this account in this browser. Account authentication is managed by Supabase."
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
                    AI_CONTEXT_STORAGE_KEY,
                    JSON.stringify({

                        userId:
                            user.id,

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

    console.log(
        "Profile storage key:",
        PROFILE_STORAGE_KEY
    );

    console.log(
        "Preferences storage key:",
        PREFERENCES_STORAGE_KEY
    );

});