const socket = io('wss://iot.afriticgroup.com', { tranports: ['websocket'] });
const snapShotGalery = document.getElementById('snapshotgalery');


socket.on('updateClient', data => {
    const lamp = document.getElementById("lamp");
    const led = document.getElementById("led");
    const iconLamp = document.getElementById("iconlamp");
    const iconLed = document.getElementById("iconled");

    (data.lamp === 0 ? (
        lamp.innerHTML = "Lamp Off",
        lamp.style.color = "#fff",
        iconLamp.style.color = "#000"
    ) :
        (
            lamp.innerHTML = "Lamp On",
            lamp.style.color = "#ffff00",
            iconLamp.style.color = "#ff8300"

        ));

    (data.led === 0 ? (
        led.innerHTML = "LED Off",
        led.style.color = "#fff",
        iconLed.style.color = "#000"
    ) :
        (
            led.innerHTML = "LED On",
            led.style.color = "#ffff00",
            iconLed.style.color = "#ff8300"
        ));
});

socket.on('updatePic', file => {

    document.getElementById("pic").src = file;
});

//CAMERA
function toggle(pin) {
    socket.emit('updateServer', pin);
}

//CAMERA
function takePic() {
    socket.emit('takePic');
    location.reload();
}

//Get all the snapshot
socket.on('folderRead', (mySnap) => {

    const ul = document.createElement('ul');
    const pathToSnap = "img/snapshot";
    const snapArrLength = mySnap.length;

    snapShotGalery.innerHTML = "";
    ul.setAttribute('id', 'snapshot');

    // for (let i = 0; i <= snapArrLength - 1; i++) {

    //     let li = document.createElement('li');
    //     let img = document.createElement('img');
    //     let icon = document.createElement('i');
    //     let label = document.createElement('label');
    //     let snap = mySnap[i];
    //     let unixTimestamp = snap.slice(0, -4);

    //     let getSnapTime = moment.unix(unixTimestamp / 1000).format("MM-DD-YYYY HH:mm A");

    //     img.setAttribute('src', `${pathToSnap}/${snap}`);
    //     icon.setAttribute("class", 'far fa-trash-alt iconsnap');
    //     icon.setAttribute("data-id", snap);
    //     label.innerText = getSnapTime;
    //     li.appendChild(icon);
    //     li.appendChild(img);
    //     li.appendChild(label);
    //     ul.appendChild(li);
    // }

    const divRow = document.createElement('div');

    mySnap.forEach((snap) => {

        const divCol = document.createElement('div');
        const img = document.createElement('img');
        const icon = document.createElement('i');
        const label = document.createElement('label');
        const unixTimestamp = snap.slice(0, -4);
        const getSnapTime = moment.unix(unixTimestamp / 1000).format("MM-DD-YYYY HH:mm A");

        divRow.setAttribute('class', 'row');
        divCol.setAttribute('class', 'col-lg-3 col-sm-12 mb-3');
        img.setAttribute('src', `${pathToSnap}/${snap}`);
        img.setAttribute('class', 'img-thumbnail img-fluid');
        img.setAttribute('alt', snap);
        icon.setAttribute("class", 'far fa-trash-alt iconsnap');
        icon.setAttribute("data-id", snap);
        label.innerText = getSnapTime;

        divCol.appendChild(icon);
        divCol.appendChild(label);
        divCol.appendChild(img);
        divRow.appendChild(divCol);

    });

    snapShotGalery.appendChild(divRow);
});

// Delete Snap
document.addEventListener('click', function (e) {
    console.log(e.target.className);
    if (e.target.className == "far fa-trash-alt iconsnap") {

        console.log(e.target.attributes[1].value);
        const snapFileName = e.target.attributes[1].value;

        socket.emit("deletesnap", snapFileName);

        location.reload();
        checkSnapNumber();
    }
});

//Get Temperature - Humidity
function getTemp() {
    const baseUrl = `https://iot.afriticgroup.com/temp`

    fetch(baseUrl)
        .then((response) => response.json())
        .then((data) => {

            const temperature = document.getElementById("temperature");
            const humidity = document.getElementById("humidity");
            const tempInFSpan = document.getElementById("temp_in_f");
            const tempInF = (data.Celsius * 9 / 5) + 32;

            temperature.innerText = `${data.Celsius}°C  `;
            tempInFSpan.innerText = `~ ${tempInF}°F`;
            humidity.innerText = `${data.Humidity}%`;
        })
}


//Check the number of snapshot
function checkSnapNumber() {

    socket.emit("snapshot");

    socket.on("folderRead", (getSnapNumber) => {
        const snapArrayLength = getSnapNumber.length;
        const btnSnap = document.getElementById("snap");
        const alertErrorMsg = document.getElementById("alert_error-msg");
        const notAllowedMsg = document.createElement("p");
        const snapNumber = document.getElementById("snapnumber");

        snapNumber.innerText = "";
        alertErrorMsg.innerHTML = "";
        alertErrorMsg.style.display = "none";
        snapNumber.innerText = snapArrayLength;

        if (snapArrayLength === 8) {

            btnSnap.disabled = true;
            btnSnap.classList.remove("btn-primary");
            btnSnap.classList.add("btn-secondary");
            alertErrorMsg.style.display = "block";
            alertErrorMsg.setAttribute("class", "alert alert-danger");
            alertErrorMsg.setAttribute("role", "alert");
            notAllowedMsg.innerText = `Maximum number of Snapshot has been reached! Please delete some be able to take more!!`;
            alertErrorMsg.appendChild(notAllowedMsg);
        }

        if (snapArrayLength === 0) {

            const firstShotDiv = document.createElement('div');
            const h1 = document.createElement('h1');
            const icon = document.createElement('i');

            h1.innerText = "Take your first shot!!";
            icon.setAttribute('class', 'fas fa-camera fa-5x');
            firstShotDiv.setAttribute('class', 'mt-5 text-center');

            firstShotDiv.appendChild(h1);
            firstShotDiv.appendChild(icon);
            snapShotGalery.appendChild(firstShotDiv);
        }
    })
}

checkSnapNumber();

//Run Once when Page is load
setTimeout(() => {
    getTemp();

    // Run Every 1h when the page is load
    setInterval(() => {
        getTemp();
    }, 3600000);

}, 1000);
