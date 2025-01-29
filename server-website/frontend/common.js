var parsedUrl = new URL(window.location.href);

function formatData(data, table){
    let jsonData = JSON.parse(data)    
    
    if (table == 'sightings'){
        const alienSighting= jsonData.map(item => `
             
            <div>
                <p><strong>Sighting Number: </strong> ${item.sightingNumber} </p>
                <p><strong>Sighting Time:</strong> ${item.sightingTime} </p>
                <p><strong>Ship Shape: ${item.shipShape} </strong></p>
                <p><strong>Ship Color:</strong> ${item.shipColor} </p> 
                <p><strong>Ship Description:</strong> ${item.shipDesc} </p> 
            </div>
        `);
        return alienSighting;
    } else if (table == 'alienMessages') {
        const alienMessage = jsonData.map(item => `
            
            <div style="align-content: center;">
                <img src="alen.gif" style="width: 100%; height: 100%; border-radius: 8px; align-self: center;"> 
                <p><strong>Message Number: </strong> ${item.messageNumber} </p>
                <p><strong>Time:</strong> ${item.messageTime} </p>
                <p style="background-color: red;"><strong>Message: ${item.messageText} </strong></p>
                <p><strong>Medium:</strong> ${item.messageMedium} </p> 
            </div>
        `);
        return alienMessage;
    } else {
        const fail = `
            <div>
                <p><strong>NO DATA FOUND</strong></p>
            </div>
        `
        return fail;
    }
}

function log(who, what, success) {
    const when = new Date();
    let payload = {
        who: who,
        what: what,
        when: when,
        success: success
    }

    fetch("http://" + parsedUrl.host + ":8001/log", {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    })
}

function query(accessString) {
    let token = document.cookie.match(new RegExp('(^| )token=([^;]+)'))[2];
    let username = localStorage.getItem("username");
    // console.log(token);
    // console.log("TEST" + accessString)
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        mode: "cors",
        headers: {
            "Authorization": `Bearer ${token}`,
            "entries": `${accessString}`
        }
    })
    .then((resp) => resp.text())
    .then((data) => {
        if (data == "Access Denied") {
            document.getElementById("test").innerHTML = "<div>Access Denied</div>";
            log(username, "Queried Data: " + accessString, "Role Denied Access");   
        }
        else {
            let formatted = formatData(data, accessString);
            document.getElementById("test").innerHTML = formatted; 
            log(username, "Queried Data: " + accessString, "Success");   
        }
    })
    .catch((err) => {
        console.log(err);
        log(username, "Queried Data: " + accessString, "Failed"); 
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
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        log(localUsername, "TOTP Authentication", "Success");
        alert("TOTP successful");
        console.log(data);
        document.cookie = `token=${data.token}`;
        window.location.href = ("http://" + parsedUrl.host + "/query.html");
    })
    .catch((err) => {
        console.log(err);
        log(localUsername, "TOTP Authentication", "Failed");
    });
}

function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    payload = {
        username: u,
        password: p,
    };
    fetch("http://" + parsedUrl.host + ":8001/login", {  // This is where the current issue is
        // The two outputs
        // Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://0.0.0.0:8001/login. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing). Status code: 200.
        // Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://0.0.0.0:8001/login. (Reason: CORS request did not succeed). Status code: (null).
        method: "POST",
        mode: "cors",
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
            log(u, "Log In", "Success");
            alert("Login successful!");
            localStorage.setItem("username", u);
            window.location.href = ("http://" + parsedUrl.host + "/totp.html");
        }
    })
    .catch((err) => {
        log(u, "Log In", "Failed");
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