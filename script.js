/*
 * Horrible code
 * Sorry...
 */

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

async function addExternalId(userId, externalId, externalSystemId) {
    data = {
        "userId": userId,
        "externalId": externalId,
        "externalSystemId": externalSystemId
    }
    let r = await fetch(`https://${document.location.host}/Mapping/CreateUserMapping`, {
        "credentials": "include",
        "body": JSON.stringify(data),
        "headers": {
            "__RequestVerificationToken": getCSRF(),
            "Content-Type": "application/json",
        },
        "method": "POST",
        "mode": "cors"
    });
    console.log(r);
}
async function fetchIntegrations() {
    let r = await fetch(`https://${document.location.host}/Mapping/GetIntegrationSystems`, {
        "credentials": "include",
        "method": "GET",
        "mode": "cors"
    });
    return r.json();
}
let integrations;

function getIntegrationByName(name) {
    for (let integration of integrations) {
        if (integration.systemName === name) return integration;
    }

}

async function fetchUsers() {
    let r = await fetch(`https://${document.location.host}/Entity/Get`, {
        "credentials": "include",
        "body": JSON.stringify({"dataSources": ["users"]}),
        "headers": {
            "__RequestVerificationToken": getCSRF(),
            "Content-Type": "application/json",
        },
        "method": "POST",
        "mode": "cors"
    });
    return r.json()
}
let users;

function getUserByEmail(email) {
    for (let user of users) {
        if (user.email == email) return user;
    }
}


function getCSRF() {
    let element = document.getElementsByName("__RequestVerificationToken")[0];
    return element.value;
}

function inject() {
    let header = getElementByXpath("/html/body/div[2]/div/div[1]/div/div/div/div/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]");
    if (header === null) {
        console.log("Header not found.");
        return;
    }
    upload = document.createElement("input");
    upload.type = "file";
    upload.innerText = "Upload csv";

    upload.onchange = onUpload;

    header.appendChild(upload);

    console.log("Injected!");
}

async function onUpload(event) {
    let file = event.target.files.item(0);
    let content = await file.text();


    users = (await fetchUsers()).users;
    integrations = await fetchIntegrations();

    console.log("h");

    for (let line of content.split(/\r?\n/)) {
        if (line === "") continue;
        let splitted = line.split(",");
        let email = splitted[0];
        let id = splitted[1];
        let type_name = splitted[2];
        
        console.log(email);
        let user_id = getUserByEmail(email).id;
        let type_id = getIntegrationByName(type_name).id;
        

        addExternalId(user_id, id, type_id);
        console.log({user_id, id, type_id});
    }
}

setTimeout(inject, 4000)
