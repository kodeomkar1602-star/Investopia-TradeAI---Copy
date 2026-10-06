// ============================================================
// INVESTOPIA TRADEAI - SESSION HANDLING
// ============================================================

// ------------------------------------------------------------
// GET CURRENT SESSION
// ------------------------------------------------------------

async function getCurrentSession() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session Error:",
                error
            );

            return null;
        }


        return data.session;

    }
    catch (error) {

        console.error(
            "Session Check Error:",
            error
        );

        return null;
    }
}


// ------------------------------------------------------------
// GET CURRENT USER
// ------------------------------------------------------------

async function getCurrentUser() {

    const session =
        await getCurrentSession();


    if (!session) {

        return null;

    }


    return session.user;

}


// ------------------------------------------------------------
// CHECK IF USER IS LOGGED IN
// ------------------------------------------------------------

async function requireAuth() {

    const session =
        await getCurrentSession();


    if (!session) {

        // Save the page the user tried to access

        sessionStorage.setItem(
            "investopiaRedirectAfterLogin",
            window.location.href
        );


        // Redirect to login

        window.location.href =
            "../login/login.html";


        return null;

    }


    return session;

}


// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------

async function logoutUser() {

    try {

        const {
            error
        } = await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout Error:",
                error
            );

            return false;
        }


        // Remove saved redirect

        sessionStorage.removeItem(
            "investopiaRedirectAfterLogin"
        );


        // Redirect to login

        window.location.href =
            "../login/login.html";


        return true;

    }
    catch (error) {

        console.error(
            "Logout Error:",
            error
        );

        return false;
    }

}


// ------------------------------------------------------------
// LISTEN FOR AUTH STATE CHANGES
// ------------------------------------------------------------

function listenForAuthChanges() {

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            console.log(
                "Auth State:",
                event
            );


            if (event === "SIGNED_OUT") {

                window.location.href =
                    "../login/login.html";

            }

        }
    );

}