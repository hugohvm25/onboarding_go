$(document).ready(function () {
    getBuildInfo();
});

function getBuildInfo() {
    var field = document.getElementById('buildAndDateInfo');
    $.ajax({
        type: "POST",
        url: "Default.aspx/getBuildInfo",
        contentType: "application/json; charset=utf-8",
        async: false,
    })
        .done(function (data) {
            field.innerHTML = data.d;
        })
        .fail(function (error) {
            console.error('Erro to retrieve build info: ' + error.responseJSON.Message);
        });
}

function getCaptcha(captchaTokenInput) {
    if (!captchaTokenInput.value) {
        var reCaptchaKeyClient = '6LdaYbAZAAAAAHHsOG2SnjjuDusJnAr8SUH4mCwg';
        grecaptcha.execute(reCaptchaKeyClient, { action: 'login' }).then(function (token) {
            document.getElementById('HidToken').value = token;
        });
    }
}

function ValidateEmail() {
    var captchaTokenInput = document.getElementById("HidToken");
    getCaptcha(captchaTokenInput);

    var emailInput = document.getElementById("TbUserName");

    $.ajax({
        type: "POST",
        url: "Default.aspx/verifyEmail",
        contentType: "application/json; charset=utf-8",
        async: false,
        data: JSON.stringify({
            TbUserName: emailInput.value,
            CaptchaToken: captchaTokenInput.value,
        }),
    })
        .done(function (data) {
            userIsSSO(emailInput);
        })
        .fail(function (error) {
            var errorContainer = document.getElementById("emailInputErrorContainer");
            errorContainer.innerHTML = error.responseJSON.Message;
            emailInput.classList.add("is-invalid");
            return false;
        });
}
//SSO
function userIsSSO(emailInput) {
    $.ajax({
        type: "POST",
        url: "Default.aspx/userIsSSO",
        contentType: "application/json; charset=utf-8",
        async: false,
        data: JSON.stringify({
            TbUserName: emailInput.value,
        }),
    })
        .done(function (data) {
            var isSSO = data.d;
            emailInput.classList.remove("is-invalid");

            if (isSSO) {
                showSSOWindow();
            } else {
                onNextStep();
            }
        })
        .fail(function (error) {
            emailInput.classList.remove("is-invalid");
            onNextStep();
        });
}

function showSSOWindow() {
    var redirectURI = "";
    if (window.location.origin.includes("intranet") || window.location.origin.includes("h.debarry")) {
        redirectURI = window.location.origin + "/docxpress.ged/App/Dx/Documento/Pesquisar/"
    }
    else {
        redirectURI = window.location.origin + "/App/Dx/Documento/Pesquisar/"
    }

    const msalConfig = {
        auth: {
            clientId: "9c689188-8d38-4195-bf7d-e2a8569fb284",
            redirectUri: redirectURI, //defaults to application start page
        },
        cache: {
            cacheLocation: "sessionStorage", // This configures where your cache will be stored
            storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
        },
    };
    const myMSALObj = new msal.PublicClientApplication(msalConfig);
    const loginRequest = {
        origin: null,
        scopes: ["openid", "profile"],
        prompt: "select_account",
    };
    const modal = (document.getElementById("modalMSAL").style.display = "block");

    myMSALObj
        .loginPopup(loginRequest)
        .then((loginResponse) => sendSSOLoginData(loginResponse, redirectURI))
        .catch((e) => console.error("ERRO login SSO: " + e))
        .finally(
            () => (document.getElementById("modalMSAL").style.display = "none")
        );
}

function sendSSOLoginData(loginResponse, redirectURI) {
    var username = loginResponse.account.username;
    var captchaTokenInput = document.getElementById("HidToken");

    $.ajax({
        type: "POST",
        url: "Default.aspx/doSSOLogin",
        contentType: "application/json; charset=utf-8",
        async: false,
        data: JSON.stringify({
            TbUserName: username,
            CaptchaToken: captchaTokenInput.value,
        }),
    })
        .done(function (data) {
            window.location.href = redirectURI;
        })
        .fail(function (error) {
            var errorContainer = document.getElementById("emailInputErrorContainer");
            errorContainer.innerHTML = error.responseJSON.Message;
            document.getElementById("TbUserName").classList.add("is-invalid");
        });
}

function getMsalPopups() {
    // internal msal api: this may change in a future release
    if (!window.openedWindows) {
        window.openedWindows = [];
    }

    return window.openedWindows;
}

window.onclick = function (event) {
    const popUps = getMsalPopups();
    if (event.target == document.getElementById("modalMSAL") && popUps) {
        popUps.forEach((element) => {
            element.focus();
        });
    }
};

function onNextStep() {
    document.getElementById("loginContainer").style.animationName =
        "divLoginAnimation";
    document.getElementById("loginContainer").style.animationDuration = "0.6s";

    document.getElementById("TbUserName").readOnly = true;
    document.getElementById("formLogin").style.animationName = "opacityAnimation";
    document.getElementById("formLogin").style.animationDuration = "0.8s";

    document.getElementById("btnProximaEtapa").classList.add("d-none");
    document.getElementById("secondStepContainer").classList.remove("d-none");
    document.getElementById("btnVoltar").classList.remove("d-none");

    document.getElementById("banner").classList.remove("w-100");
    document.getElementById("banner").style.animationName =
        "widthReverseAnimation";
    document.getElementById("banner").style.animationDuration = "0.8s";
}

function OnPreviousStep() {
    document.getElementById('HidToken').value = "";
    hideErrorContainer();
    document.getElementById("loginContainer").style.animationName =
        "divLoginReverseAnimation";
    document.getElementById("loginContainer").style.animationDuration = "0.6s";

    document.getElementById("TbUserName").readOnly = false;
    document.getElementById("formLogin").style.animationName = "opacityReverseAnimation";
    document.getElementById("formLogin").style.animationDuration = "0.8s";

    document.getElementById("btnProximaEtapa").classList.remove("d-none");
    document.getElementById("secondStepContainer").classList.add("d-none");
    document.getElementById("btnVoltar").classList.add("d-none");

    document.getElementById("banner").style.animationName =
        "widthAnimation";
    document.getElementById("banner").style.animationDuration = "0.8s";

    setTimeout(function () {
        document.getElementById("banner").classList.add("w-100");
    }, 750);
}

function onViewPassword() {
    var canSeePassword =
        document.getElementById("TbPassword").type === "text" ? true : false;
    if (canSeePassword) {
        document.getElementById("TbPassword").type = "password";
        document
            .getElementById("viewPasswordIcon")
            .classList.replace("bi-eye", "bi-eye-slash");
    } else {
        document.getElementById("TbPassword").type = "text";
        document
            .getElementById("viewPasswordIcon")
            .classList.replace("bi-eye-slash", "bi-eye");
    }
}

function sendLoginForm() {
    var emailInput = document.getElementById("TbUserName");
    var passwordInput = document.getElementById("TbPassword");
    var captchaTokenInput = document.getElementById("HidToken");
    toggleLoginButton(true);
    $.ajax({
        type: "POST",
        url: "Default.aspx/doLogin",
        contentType: "application/json; charset=utf-8",
        async: false,
        data: JSON.stringify({
            TbUserName: emailInput.value,
            TbPassword: passwordInput.value,
            CaptchaToken: captchaTokenInput.value,
        }),
    })
        .done(function (data) {
            var redirectURI = "";
            if (window.location.origin.includes("intranet") || window.location.origin.includes("h.debarry")) {
                redirectURI = window.location.origin + "/docxpress.ged/App/Dx/Documento/Pesquisar/"
            }
            else {
                redirectURI = window.location.origin + "/App/Dx/Documento/Pesquisar/"
            }

            window.location.assign(redirectURI);
        })
        .fail(function (error) {
            if (error.responseJSON.Message === "Informe uma senha válida!") {
                passwordInput.classList.add("is-invalid");
                $(".collapse").hide();
            } else {
                passwordInput.classList.remove("is-invalid");
                showErrorContainer(error.responseJSON.Message);
            }
            toggleLoginButton(false);
        });
}

function toggleLoginButton(disableButton) {
    document.getElementById('btnLogin').disable = disableButton;
    if (disableButton) {
        document.getElementById('btnLoginText').classList.add('d-none');
        document.getElementById('loadingSpinner').classList.remove('d-none');
    }
    else {
        document.getElementById('btnLoginText').classList.remove('d-none');
        document.getElementById('loadingSpinner').classList.add('d-none');
    }
}

function resetPasswordDoYes() {
    var emailInput = document.getElementById("TbUserName");
    var passwordInput = document.getElementById("TbPassword");
    var captchaTokenInput = document.getElementById("HidToken");

    $.ajax({
        type: "POST",
        url: "Default.aspx/RedefinirSenha",
        contentType: "application/json; charset=utf-8",
        async: false,
        data: JSON.stringify({
            TbUserName: emailInput.value,
            CaptchaToken: captchaTokenInput.value,
        }),
    })
        .done(function (data) {
            document.getElementById("btnResetPasswordDoYes").classList.add("d-none");
            document.getElementById("btnResetPasswordDoNo").innerHTML = "Fechar";
            document
                .getElementById("btnResetPasswordDoNo")
                .setAttribute("onClick", "location.reload()");
            document.getElementById("modalText").innerHTML = data.d;
        })
        .fail(function (error) {
            passwordInput.classList.remove("is-invalid");
            showErrorContainer(error.responseJSON.Message);
        });
}

function showErrorContainer(message) {
    $(".collapse").show();
    document.getElementById("erroField").innerHTML = message;
}

function hideErrorContainer() {
    $(".collapse").hide();
    document.getElementById("erroField").innerHTML = "";
}
