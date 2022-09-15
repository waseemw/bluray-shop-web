async function login() {
    let user = document.getElementById("login-username");
    let pass = document.getElementById("login-password");
    let changes = document.getElementById("changes-notif");
    try {
        let res = await axios.post("http://localhost:3000/user/login", {username: user.value, password: pass.value});
        changes.innerText = "Successfully logged in!";
        animate(10000);
        localStorage.setItem("token", res.data.authToken);
        localStorage.setItem("role", res.data.role);
        let offlineUserCart = localStorage.getItem("userCart");
        if (offlineUserCart) offlineUserCart = JSON.parse(offlineUserCart);
        if (offlineUserCart && Object.keys(offlineUserCart).length > 0) {
            await getCart();
            for (let name in offlineUserCart) {
                if (!userCart[name])
                    userCart[name] = offlineUserCart[name];
                else
                    userCart[name] += offlineUserCart[name];
                await axios.post("http://localhost:3000/cart", {
                    blurayName: name,
                    count: userCart[name],
                }, {headers: {authorization: "Bearer " + res.data.authToken}});
            }
        }
        await new Promise(res => setTimeout(res, 3000));
        window.location.replace("/shop.html");
    } catch (e) {
        let msg = e.response?.data?.message;
        if (typeof msg == "string")
            alert(msg);
        else if (typeof msg == "object")
            alert(msg.join("\n"));
    }
}

async function signUp() {
    let changes = document.getElementById("changes-notif");
    let user = document.getElementById("signup-username");
    let pass = document.getElementById("signup-password");
    let pass2 = document.getElementById("signup-password-repeat");
    if (pass.value !== pass2.value)
        return alert("Passwords aren't the same");
    try {
        let res = await axios.post("http://localhost:3000/user", {username: user.value, password: pass.value});
        changes.innerText = "Successfully signed up!";
        animate(10000);
        localStorage.setItem("token", res.data.authToken);
        localStorage.setItem("role", res.data.role);
        await new Promise(res => setTimeout(res, 3000));
        window.location.replace("./shop.html");
    } catch (e) {
        let msg = e.response?.data?.message;
        if (typeof msg == "string")
            alert(msg);
        else if (typeof msg == "object")
            alert(msg.join("\n"));
    }
}

function setLoginButton() {
    let el = document.getElementById("login-link");
    let manageLink = document.getElementById("manage-link");
    if (localStorage.getItem("token")) {
        el.innerText = "Log out";
        el.style.backgroundColor = "inherit";
        el.style.boxShadow = "inherit";
    } else {
        el.innerText = "Login";
        el.style.backgroundColor = null;
        el.style.boxShadow = null;
    }
    el.style.display = null;

    if (localStorage.getItem("role") === "ADMIN")
        manageLink.style.display = "flex";
    else
        manageLink.style.display = "none";

    el.addEventListener("click", () => {
        if (localStorage.getItem("token")) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userCart");
        }
        window.location = "/login.html";
    });
}

function checkLoggedIn() {
    if (localStorage.getItem("token"))
        window.location.replace("/index.html");
}

function onlyAllowAdmin() {
    if (localStorage.getItem("role") !== "ADMIN")
        window.location.replace("/index.html");
}