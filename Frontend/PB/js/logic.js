//You can use ws:// instead, if you don't have a secured websocket
//though I recommend using wss:// to be able to use the twitch-function.
const relayIp = "wss://domain:port";

let P1;
let P1Name;
let P2;
let P2Name;
let P1Image;
let P2Image;
var diffText;
var diffTag;

function fancyTimeFormat(duration) {
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

async function setOverlay(P1, P1Name, P2, P2Name) {
    fetch('https://new.scoresaber.com/api/player/' + P1 + '/basic')
        .then(response => response.json())
        .then(data => {
            if (data.playerInfo.playerId == P1) {
                P1Id = P1;
                if (data.playerInfo.avatar == "/images/oculus.png") {
                    P1Image = "https://new.scoresaber.com/api/static/avatars/oculus.png";
                } else {
                    P1Image = "https://new.scoresaber.com/api/static/avatars/" + P1 + ".jpg";
                }
            }
        });
    fetch('https://new.scoresaber.com/api/player/' + P2 + '/basic')
        .then(response => response.json())
        .then(data => {
            if (data.playerInfo.playerId == P2) {
                P2Id = P2;
                if (data.playerInfo.avatar == "/images/oculus.png") {
                    P2Image = "https://new.scoresaber.com/api/static/avatars/oculus.png";
                } else {
                    P2Image = "https://new.scoresaber.com/api/static/avatars/" + P2 + ".jpg";
                }
            }
        });
}

function setPool(hash, diff) {
    let SongBox = document.getElementById("SongBox").cloneNode(true);

    fetch('https://api.beatsaver.com/maps/hash/' + hash, {
        headers: {
            'Access-Control-Request-Headers': 'x-requested-with'
        }
    })
        .then(response => {
            return response.json()
        })
        .then(data => {

            SongBox.getElementsByClassName("SongCover")[0].style.background = "url('https://eu.cdn.beatsaver.com/" + hash.toLowerCase() + ".jpg') 0% 0% / cover";
            SongBox.getElementsByClassName("SongArtist")[0].innerText = data.metadata.levelAuthorName;
            SongBox.getElementsByClassName("SongTitle")[0].innerText = data.metadata.songName;
            SongBox.getElementsByClassName("SongMapper")[0].innerText = data.metadata.songAuthorName;
            SongBox.getElementsByClassName("SongKey")[0].innerText = data.id;
            SongBox.getElementsByClassName("SongLength")[0].innerText = fancyTimeFormat(data.metadata.duration);
        });

    SongBox.getElementsByClassName("SongCard")[0].classList.add("SongCard" + hash);
    SongBox.getElementsByClassName("SongCover")[0].classList.add("SongCover" + hash);
    SongBox.getElementsByClassName("SongInfo")[0].classList.add("SongInfo" + hash);
    SongBox.getElementsByClassName("SongPick")[0].classList.add("SongPick" + hash);

    switch (diff.toLowerCase()) {
        case "easy":
            var diffText = "Easy";
            var diffColor = "#008055";
            break;
        case "normal":
            var diffText = "Normal";
            var diffColor = "#1268A1";
            break;
        case "hard":
            var diffText = "Hard";
            var diffColor = "#BD5500";
            break;
        case "expert":
            var diffText = "Expert";
            var diffColor = "#B52A1C";
            break;
        case "expertplus":
            var diffText = "Expert+";
            var diffColor = "#900000";
            break;
        case "expert+":
            //Really would wish that BeatKhana API used the same naming convention as BeatSaver........
            var diffText = "Expert+";
            var diffColor = "#900000";
            break;
    }

    SongBox.getElementsByClassName("DiffTag")[0].style.background = diffColor;
    SongBox.getElementsByClassName("DiffText")[0].innerText = diffText;
    document.getElementById("Songs").appendChild(SongBox);
}

function setPoolLoop(hash, diff) {
    for (let i = 0; i < hash.length; i++) {
        setTimeout(function () {
            setPool(hash[i], diff[i]);
        }, 100 * i);
    }
    setTimeout(function () {
        document.getElementById("Songs").style.opacity = "1";
    }, 1000);
}

function setMapState(hash, state, player) {
    let SongCard = document.getElementsByClassName("SongCard" + hash)[0];

    if (P1Id == player) {
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.backgroundImage = "url('" + P1Image + "')";
    }
    if (P2Id == player) {
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.backgroundImage = "url('" + P2Image + "')";
    }
    if (player == "0") {
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.backgroundImage = "url('./Images/Tiebreaker.png')";
    }
    if (state == "Pick") {
        SongCard.getElementsByClassName("SongCover" + hash)[0].style.borderColor = "#2CCB3C";
        SongCard.getElementsByClassName("SongInfo" + hash)[0].style.borderColor = "#2CCB3C";
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.borderColor = "#2CCB3C";
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.opacity = "1";
    } else if (state == "Ban") {
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.borderColor = "#CB2C2C";
        SongCard.getElementsByClassName("SongCover" + hash)[0].style.borderColor = "#CB2C2C";
        SongCard.getElementsByClassName("SongInfo" + hash)[0].style.borderColor = "#CB2C2C";
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.opacity = "1";
        SongCard.style.opacity = "0.6";
    } else if (state == "Tiebreaker") {
        SongCard.getElementsByClassName("SongCover" + hash)[0].style.borderColor = "#2CCB3C";
        SongCard.getElementsByClassName("SongInfo" + hash)[0].style.borderColor = "#2CCB3C";
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.borderColor = "#2CCB3C";
        SongCard.getElementsByClassName("SongPick" + hash)[0].style.opacity = "1";
    }
}
try {
    const TAsock = new WebSocket(relayIp);
    TAsock.onopen = function (event) {
        console.log("Connected to Relay-server: " + relayIp);
    }
    TAsock.onmessage = async function (event) {
        jsonObj = JSON.parse(event.data);
        if (jsonObj.Type == 5) { //If 1V1 type
            if (jsonObj.command == "createUsers") {
                setOverlay(jsonObj.PlayerIds[0], jsonObj.PlayerNames[0], jsonObj.PlayerIds[1], jsonObj.PlayerNames[1]);
            } else if (jsonObj.command == "setPool") {
                setPoolLoop(jsonObj.songHash, jsonObj.songDiff);
            } else if (jsonObj.command == "PicksAndBans") {
                if (jsonObj.Action == "Pick") {
                    setMapState(jsonObj.map, "Pick", jsonObj.PlayerId);
                } else if (jsonObj.Action == "Ban") {
                    setMapState(jsonObj.map, "Ban", jsonObj.PlayerId);
                } else if (jsonObj.Action == "Tiebreaker") {
                    setMapState(jsonObj.map, jsonObj.Action, "0");
                }
            } else if (jsonObj.command == "resetOverlay") {
                document.getElementById("Songs").style.opacity = "0";
                document.getElementById("Player1Container").style.opacity = 0;
                document.getElementById("Player2Container").style.opacity = 0;
                setTimeout(function () {
                    $('#Songs').empty();
                }, 1000);
            }
        }
    };
} catch (error) {
    console.log(error);
}