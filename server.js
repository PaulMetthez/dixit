const io = require('socket.io')(3000)
let choosing = true;
let playerList = [];
let idList = []
let activePlayer = 0;
let imageShuffle = []
let img = 0;
let vote = 0;
let playerIndex = 0;
let gameState = 0;
let currentDrawing = [];
let imageShuffled = [];
let playedList = [];
let connectList = [];
let playerPoints = [];
let maxPoints = 20;

io.on('connection', socket => {
    let index = -1;

    socket.on('newUser', userID => {
        socket.i = "s";
        socket.v = -1;
        socket.dbId = userID;
        let alreadyPresent = -1
        for (let player = 0; player < playerList.length; player++) {
            if (playerList[player].dbId == userID) {
                playerList[player] = socket;
                alreadyPresent = index = player;
                io.emit('conn', socket.dbId);
                connectList[index] = true;
            }
        }
        if (alreadyPresent < 0) {
            index = playerIndex;
            playerIndex++;
            idList.push(userID);
            console.log(idList)
            playerList.push(socket);
            playerPoints.push(0);
            playedList.push(false);
            connectList.push(true);
            socket.broadcast.emit('newUser', userID)
        }
        socket.emit('update',[gameState,currentDrawing,imageShuffled,idList,playedList,playerList[activePlayer].dbId, connectList, playerPoints])
    })

    socket.on('gamestart', () => {
        console.log('gameStart');
        if (socket.dbId == 1) {
            for (let p = playerList.length-1; p >= 0; p--) {
                let player = playerList[p]
                playerPoints[p]=0;
                if(player.disconnected) {
                    playerList.splice(p, 1);
                    idList.splice(p, 1);
                    playerPoints.splice(p, 1);
                    playedList.splice(p, 1);
                    connectList.splice(p, 1);
                }
            }
            // console.log('gameStart true');
            gameState = 1;
            console.log('gameState changed' + gameState);
            io.emit('gamestarted', 's');
            console.log('gameStaarted send' + gameState);

        }
    });
    socket.on('commands', data => {
        if (socket.dbId == 1) {
            if (data[0] == "points") {
                maxPoints = data[1]
            }
        }
    });

    socket.on('disconnect', () => {
        connectList[index] = false;
        io.emit('discon', socket.dbId);
    });


    socket.on('draw', message => {
        if ((index == activePlayer) && (gameState == 1)) {
            currentDrawing.push(message)
            socket.broadcast.emit('draw', message)
        }
    })

    socket.on('choose-image', message => {
        if (gameState == 1) {
            if (!playedList[index]) {
                img++
                playedList[index] = true;
                io.emit('played', socket.dbId)
            }
            playerList[index].i = message;
            let numConnected = 0;
            for (let p of playerList) {
                if (!p.disconnected) {numConnected++}
            }
            console.log('numConnected', numConnected, img)
            if (img >= numConnected) {
                gameState = 2;
                let imageList = []
                for (let player of playerList) {
                    imageList.push(player.i);
                }
                let shuffled = shuffle(imageList)
                imageShuffled = shuffled[0];
                imageShuffle = shuffled[1];

                io.emit('endImage', imageShuffled);
                playerList[activePlayer].emit('qui', imageShuffle);
                console.log("why", gameState)
                playedList.fill(false);
            }
        }
    })

    socket.on('choose-vote', message => {
        console.log("h1 " + socket.dbId+ index);
        if (gameState == 2) {
            console.log(socket.dbId+" - h2" + index);
            if (index != activePlayer) {
                console.log(socket.dbId+" - h3");
                if (!playedList[index]) {
                    vote++
                    playedList[index] = true;
                    io.emit('played', socket.dbId)
                }
                playerList[index].v = message;

                let numConnected = 0;
                for (let p = 0; p< playerList.length; p++) {
                    if ((!playerList[p].disconnected) && (p != activePlayer)) {numConnected++}
                }
                console.log('numConnected', numConnected, vote)
                console.log(numConnected, "goz2");
                if (vote >= numConnected) {
                    let voteResult = []
                    for (let player of playerList) {
                        voteResult.push(player.v);
                    }
                    let bonusScore = new Array(playerList.length).fill(0);
                    let foundScore = new Array(playerList.length).fill(0);
                    let validVotes = 0;
                    for (let i = 0; i < voteResult.length; i++) {
                        if (voteResult[i]>=0) {
                            if (imageShuffle[voteResult[i]] != index){
                                bonusScore[imageShuffle[voteResult[i]]]++
                            }
                            if (imageShuffle[voteResult[i]] == activePlayer) {foundScore[i]+=3;}
                            validVotes++
                        }
                    }
                    if ((bonusScore[activePlayer] == 0) || (bonusScore[activePlayer] == validVotes)) {
                        bonusScore = new Array(playerList.length).fill(0);
                        foundScore = new Array(playerList.length).fill(2);
                        foundScore[activePlayer] = 0;
                    } else {
                        foundScore[activePlayer] = 3; bonusScore[activePlayer] = 0;
                    }
                    for (let i = 0; i < playerList.length; i++) {
                        playerPoints[i] += (Math.min(3,bonusScore[i])+foundScore[i])
                    }
                    console.log("points", playerPoints)
                    let iwhile = 0;
                    do {
                        activePlayer++;
                        activePlayer= activePlayer%playerList.length
                        iwhile++;
                    }while ((playerList[activePlayer].disconnected) && (iwhile<playerList.length))

                    io.emit("whosTurn", [playerList[activePlayer].dbId, voteResult, imageShuffle, playerPoints]);
                    for (let player of playerList) {
                        player.i = ""; player.v = -1;
                    }
                    img = 0; vote = 0;
                    currentDrawing = [];
                    if (Math.max(...playerPoints) >= maxPoints) {
                        io.emit('endGame', "")
                        gameState = 0;
                    } else {
                        gameState = 1;
                    }
                    playedList.fill(false);
                }
            }
        }
    })
})

function shuffle(input) {
    let arr = [...input];
    let temp = [];
    let order = new Array(arr.length);
    let i = 0;
    while (arr.length>0) {
        let rand = Math.floor(Math.random() * arr.length)
        order[i] = input.indexOf(arr[rand]);
        temp.push(arr[rand])
        arr.splice(rand, 1);
        i++;
    }
    return [temp, order]
}
