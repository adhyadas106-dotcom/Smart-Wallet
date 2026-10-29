
const usersStorageKey = "smart-wallet-users";

function loadRegisteredUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(usersStorageKey) || "[]");
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

function login(){
    const account = document.querySelector("#login-view input[name='account']").value.trim();
    const normalizedAccount = account.toLowerCase();
    const registeredUser = loadRegisteredUsers().find((user) =>
        user && typeof user.username === "string" && typeof user.email === "string" &&
        (user.username.toLowerCase() === normalizedAccount || user.email.toLowerCase() === normalizedAccount)
    );
    const username = registeredUser?.username || (account.includes("@") ? account.split("@")[0] : account);
    localStorage.setItem("uname", username);
    window.alert("Successfully logged in");
    window.location.href = "home.html";
}

function initializeAuthPanels() {
    const loginView = document.getElementById("login-view");
    const registerView = document.getElementById("register-view");
    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    if (!loginView || !registerView || !showRegister || !showLogin || !registerForm || !loginForm) return;

    loginForm.reset();
    window.addEventListener("pageshow", () => loginForm.reset());

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        login();
    });

    showRegister.addEventListener("click", (event) => {
        event.preventDefault();
        loginView.hidden = true;
        registerView.hidden = false;
        showRegister.setAttribute("aria-expanded", "true");
        showLogin.setAttribute("aria-expanded", "true");
        registerView.querySelector("input[name='username']").focus();
    });

    showLogin.addEventListener("click", (event) => {
        event.preventDefault();
        registerView.hidden = true;
        loginView.hidden = false;
        showRegister.setAttribute("aria-expanded", "false");
        showLogin.setAttribute("aria-expanded", "false");
        loginView.querySelector("input[name='account']").focus();
    });

    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = registerForm.querySelector("input[name='username']").value.trim();
        const email = registerForm.querySelector("input[name='email']").value.trim();
        const users = loadRegisteredUsers();
        const existingUserIndex = users.findIndex((user) =>
            user && typeof user.email === "string" && user.email.toLowerCase() === email.toLowerCase()
        );
        const registeredUser = { username, email };
        if (existingUserIndex === -1) {
            users.push(registeredUser);
        } else {
            users[existingUserIndex] = registeredUser;
        }
        localStorage.setItem(usersStorageKey, JSON.stringify(users));
        window.alert("User Registered Successfully");
        registerForm.reset();
        registerView.hidden = true;
        loginView.hidden = false;
        showRegister.setAttribute("aria-expanded", "false");
        showLogin.setAttribute("aria-expanded", "false");
        loginView.querySelector("input[name='account']").focus();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAuthPanels);
} else {
    initializeAuthPanels();
}