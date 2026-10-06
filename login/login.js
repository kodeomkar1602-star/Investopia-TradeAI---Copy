// ============================================================
// INVESTOPIA TRADEAI - LOGIN PAGE
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // ELEMENTS
    // ============================================================

    const body =
        document.body;

    const themeToggle =
        document.getElementById("themeToggle");

    const themeIcon =
        document.getElementById("themeIcon");

    const password =
        document.getElementById("password");

    const passwordToggle =
        document.getElementById("passwordToggle");

    const passwordIcon =
        document.getElementById("passwordIcon");

    const loginForm =
        document.getElementById("loginForm");

    const demoLogin =
        document.getElementById("demoLogin");

    const loginButton =
        document.getElementById("loginButton");


    // ============================================================
    // CHECK SUPABASE
    // ============================================================

    if (typeof supabaseClient === "undefined") {

        console.error(
            "Supabase client is not available."
        );

        showMessage(
            "Supabase configuration could not be loaded.",
            "error"
        );

        return;
    }


    // ============================================================
    // THEME
    // ============================================================

    const savedTheme =
        localStorage.getItem("investopia-theme");

    if (savedTheme === "dark") {

        body.classList.add("dark-theme");

        updateThemeIcon(true);

    }


    themeToggle?.addEventListener(
        "click",
        () => {

            const isDark =
                body.classList.toggle(
                    "dark-theme"
                );

            localStorage.setItem(
                "investopia-theme",
                isDark
                    ? "dark"
                    : "light"
            );

            updateThemeIcon(isDark);

        }
    );


    function updateThemeIcon(isDark) {

        themeIcon.className =
            isDark
                ? "bi bi-sun-fill"
                : "bi bi-moon-stars";

    }


    // ============================================================
    // PASSWORD VISIBILITY
    // ============================================================

    passwordToggle?.addEventListener(
        "click",
        () => {

            const isPassword =
                password.type === "password";

            password.type =
                isPassword
                    ? "text"
                    : "password";

            passwordIcon.className =
                isPassword
                    ? "bi bi-eye-slash"
                    : "bi bi-eye";

            passwordToggle.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        }
    );


    // ============================================================
    // LOGIN FORM
    // ============================================================

    loginForm?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ----------------------------------------------------
            // GET VALUES
            // ----------------------------------------------------

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const passwordValue =
                password.value;


            // ----------------------------------------------------
            // VALIDATION
            // ----------------------------------------------------

            if (!email || !passwordValue) {

                showMessage(
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            // ====================================================
            // SUPABASE LOGIN
            // ====================================================

            try {

                // Disable login button

                loginButton.disabled = true;

                loginButton.innerHTML =
                    `
                    Logging in...
                    <span
                        class="spinner-border spinner-border-sm ms-2"
                        role="status"
                        aria-hidden="true">
                    </span>
                    `;


                // ------------------------------------------------
                // SIGN IN WITH SUPABASE
                // ------------------------------------------------

                const { data, error } =
                    await supabaseClient.auth.signInWithPassword({

                        email: email,

                        password: passwordValue

                    });


                // ------------------------------------------------
                // LOGIN ERROR
                // ------------------------------------------------

                if (error) {

                    console.error(
                        "Supabase Login Error:",
                        error
                    );

                    showMessage(
                        getLoginErrorMessage(error),
                        "error"
                    );

                    resetLoginButton();

                    return;
                }


                // ------------------------------------------------
                // CHECK SESSION
                // ------------------------------------------------

                if (
                    !data ||
                    !data.session
                ) {

                    showMessage(
                        "Login could not be completed. Please try again.",
                        "error"
                    );

                    resetLoginButton();

                    return;
                }


                // =================================================
                // LOGIN SUCCESS
                // =================================================

                console.log(
                    "Login successful.",
                    data.user
                );


                showMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                // ------------------------------------------------
                // REDIRECT TO DASHBOARD
                // ------------------------------------------------

                setTimeout(() => {

                    window.location.href =
                        "../dashboard/dashboard.html";

                }, 1200);

            }
            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                showMessage(
                    "Something went wrong while logging in. Please try again.",
                    "error"
                );

                resetLoginButton();

            }

        }
    );


    // ============================================================
    // DEMO LOGIN
    // ============================================================

    demoLogin?.addEventListener(
        "click",
        () => {

            document
                .getElementById("email")
                .value =
                "demo@gmail.com";

            password.value =
                "Demo123@";


            showMessage(
                "Demo credentials filled. Click Login to continue.",
                "success"
            );

        }
    );


    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    const forgotLink =
        document.querySelector(".forgot-link");


    forgotLink?.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            if (!email) {

                showMessage(
                    "Enter your email address first, then click Forgot password.",
                    "error"
                );

                return;
            }


            if (!isValidEmail(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            try {

                const { error } =
                    await supabaseClient.auth.resetPasswordForEmail(
                        email,
                        {
                            redirectTo:
                                window.location.origin +
                                "/login/reset-password.html"
                        }
                    );


                if (error) {

                    console.error(
                        "Password Reset Error:",
                        error
                    );

                    showMessage(
                        error.message ||
                        "Unable to send password reset email.",
                        "error"
                    );

                    return;
                }


                showMessage(
                    "Password reset email sent. Please check your inbox.",
                    "success"
                );

            }
            catch (error) {

                console.error(
                    "Password Reset Error:",
                    error
                );

                showMessage(
                    "Unable to send password reset email.",
                    "error"
                );

            }

        }
    );


    // ============================================================
    // EMAIL VALIDATION
    // ============================================================

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );

    }


    // ============================================================
    // LOGIN ERROR HANDLER
    // ============================================================

    function getLoginErrorMessage(error) {

        const message =
            error?.message || "";

        const lowerMessage =
            message.toLowerCase();


        if (
            lowerMessage.includes(
                "invalid login credentials"
            )
        ) {

            return "Incorrect email or password.";

        }


        if (
            lowerMessage.includes(
                "email not confirmed"
            )
        ) {

            return "Please confirm your email address before logging in.";

        }


        if (
            lowerMessage.includes(
                "too many requests"
            )
        ) {

            return "Too many login attempts. Please wait a moment and try again.";

        }


        return (
            message ||
            "Unable to login. Please try again."
        );

    }


    // ============================================================
    // RESET LOGIN BUTTON
    // ============================================================

    function resetLoginButton() {

        loginButton.disabled = false;

        loginButton.innerHTML =
            `
            Login to Investopia
            <i class="bi bi-arrow-right"></i>
            `;

    }


    // ============================================================
    // MESSAGE
    // ============================================================

    function showMessage(message, type) {

        let messageBox =
            document.getElementById(
                "loginMessage"
            );


        if (!messageBox) {

            messageBox =
                document.createElement("div");

            messageBox.id =
                "loginMessage";

            loginForm.insertBefore(
                messageBox,
                loginForm.firstElementChild
            );

        }


        messageBox.textContent =
            message;

        messageBox.className =
            `login-message ${type}`;


        setTimeout(() => {

            if (messageBox) {

                messageBox.remove();

            }

        }, 5000);

    }

});