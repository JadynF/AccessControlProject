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

function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;

    payload = {
        username: u,
        password: p,
    };
    fetch("http://" + parsedUrl.host + "/login", {
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
            window.location.href = ("http://" + parsedUrl.host + "/query.html");
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