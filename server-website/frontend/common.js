var parsedUrl = new URL(window.location.href);

function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        mode: "no-cors",
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}

function totp() {
    const totpCode = document.getElementById("totp-code").value;
    const localUsername = localStorage.getItem("username");

    payload = {
        totp: totpCode,
        username: localUsername
    }
    fetch("http://" + parsedUrl.host + ":8001/totp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response;
    })
    .then(data => {
        if (data.status == 200) {
            alert("TOTP successful");
            console.log(data);
            console.log(data.token);
            localStorage.set("token", data.token);
            window.location.href = ("http://" + parsedUrl.host + "/query.html");
        }
    })
    .catch((err) => {
        if (err.message == 500) {
            alert("Server error");
        }
        else if (err.message == 401) {
            alert("Incorrect TOTP");
        }
        else {
            alert("Unknown Error");
        }
    });
}

function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;

    payload = {
        username: u,
        password: p,
    };
    fetch("http://" + parsedUrl.host + ":8001/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response;
    })
    .then(data => {
        if (data.status == 200) {
            alert("Login successful!");
            localStorage.setItem("username", u);
            window.location.href = ("http://" + parsedUrl.host + "/totp.html");
        }
    })
    .catch((err) => {
        if (err.message == 500) {
            alert("Server Error");
        }
        else if (err.message == 401) {
            alert("Username or password incorrect");
        }
        else {
            alert("Unknown error");
        }
    });
}