/* =========================================================
   FASHION HUB - SIGNUP.JS
   ========================================================= */

async function signupUser(event) {

    event.preventDefault();

    console.log("SIGNUP FORM SUBMITTED");

    const nameInput =
        document.getElementById("signupName");

    const emailInput =
        document.getElementById("signupEmail");

    const passwordInput =
        document.getElementById("signupPassword");

    const confirmPasswordInput =
        document.getElementById("signupConfirmPassword");

    const button =
        document.getElementById("signupButton");


    /* -----------------------------------------------------
       CHECK INPUT ELEMENTS
       ----------------------------------------------------- */

    if (
        !nameInput ||
        !emailInput ||
        !passwordInput ||
        !confirmPasswordInput
    ) {

        alert(
            "Signup form fields are missing. Check signup.html."
        );

        console.error(
            "Signup input elements not found."
        );

        return;
    }


    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (!name) {

        alert("Please enter your name.");

        return;
    }


    if (!email) {

        alert("Please enter your email.");

        return;
    }


    if (!password) {

        alert("Please enter a password.");

        return;
    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;
    }


    if (password !== confirmPassword) {

        alert(
            "Passwords do not match ❌"
        );

        return;
    }


    /* -----------------------------------------------------
       BUTTON
       ----------------------------------------------------- */

    if (button) {

        button.disabled = true;

        button.textContent =
            "CREATING ACCOUNT...";
    }


    try {

        console.log("Sending signup request...");
        console.log({
            name: name,
            email: email
        });


        /* -------------------------------------------------
           SEND DATA TO FLASK
           ------------------------------------------------- */

        const response =
            await fetch("/api/signup", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name: name,

                    email: email,

                    password: password

                })

            });


        console.log(
            "Signup response status:",
            response.status
        );


        /* -------------------------------------------------
           READ RESPONSE
           ------------------------------------------------- */

        const data =
            await response.json();


        console.log(
            "Signup response:",
            data
        );


        /* -------------------------------------------------
           ERROR FROM FLASK
           ------------------------------------------------- */

        if (!response.ok) {

            alert(
                data.message ||
                "Signup failed ❌"
            );

            return;
        }


        /* -------------------------------------------------
           SUCCESS
           ------------------------------------------------- */

        alert(
            "Account created successfully 🎉"
        );


        console.log(
            "USER CREATED:",
            data.user
        );


        /* Go back to home/login */

        window.location.href = "/";


    } catch (error) {

        console.error(
            "SIGNUP ERROR:",
            error
        );


        alert(
            "Cannot connect to Flask server ❌\n\n" +
            error.message
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "CREATE ACCOUNT";
        }

    }

}