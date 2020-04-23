const io = require('socket.io')(3000)

function roomSetup(n) {
    let pRoom = io.sockets.adapter.rooms[n];
    pRoom.playerList = [];
    pRoom.idList = []
    pRoom.activePlayer = 0;
    pRoom.imageShuffle = []
    pRoom.img = 0;
    pRoom.vote = 0;
    pRoom.playerIndex = 0;
    pRoom.gameState = 0;
    pRoom.currentDrawing = [];
    pRoom.imageShuffled = [];
    pRoom.playedList = [];
    io.sockets.adapter.rooms[n].connectList = [];
    pRoom.playerPoints = [];
    pRoom.maxPoints = 20;
}

io.on('connection', socket => {

    socket.on('reconnect', data => {
        if (typeof socket.ro === 'undefined') {
            socket.join(roomName);
            socket.ro = io.sockets.adapter.rooms[roomName];
            roomSetup(roomName);
            socket.ro.admin = userID;
        } else {
            socket.join(roomName);
            io.to(socket.roN).emit('conn', socket.dbId);
            socket.ro.connectList[socket.index] = true;
        }
    });

    socket.on('newUser', data => {
        userID = data[0];
        roomName = toString(data[1]);
        let pattern = /^[a-zA-Z]+$/;
        if(userID == "") { return }
        if((pattern.test(roomName) == false) || (roomName.length < 5) || (roomName.length > 15)) { return }
        socket.join(roomName);
        console.log(roomName);
        socket.ro = io.sockets.adapter.rooms[roomName];
        if (socket.ro.length == 1) {
            roomSetup(roomName);
            socket.ro.admin = userID;
        } else {
        }
        socket.roN = roomName;
        socket.dbId = userID;
        let alreadyPresent = -1
        for (let player = 0; player < socket.ro.playerList.length; player++) {
            if (socket.ro.playerList[player].dbId == userID) {
                socket.i = socket.ro.playerList[player].i;
                socket.v = socket.ro.playerList[player].v;
                socket.ro.playerList[player] = socket;
                alreadyPresent = player;
                socket.index = player;
                io.to(socket.roN).emit('conn', socket.dbId);
                socket.ro.connectList[socket.index] = true;
            }
        }
        if (alreadyPresent < 0) {
            socket.i = "s";
            socket.v = -1;
            socket.index = socket.ro.playerIndex;
            // index = playerIndex;
            socket.ro.playerIndex++;
            socket.ro.idList.push(userID);
            socket.ro.playerList.push(socket);
            socket.ro.playerPoints.push(0);
            socket.ro.playedList.push(false);
            socket.ro.connectList.push(true);
            socket.broadcast.to(socket.roN).emit('newUser', userID)
        }
            socket.emit('update',[socket.ro.gameState,socket.ro.currentDrawing,socket.ro.imageShuffled,socket.ro.idList,
            socket.ro.playedList,socket.ro.playerList[socket.ro.activePlayer].dbId, socket.ro.connectList, socket.ro.playerPoints,socket.ro.maxPoints,socket.ro.admin])
    })

    socket.on('gamestart', () => {
        if (typeof socket.ro === 'undefined' || socket.dbId === 'undefined') {return}
        console.log('gameStart');
        let deletedUsers = [];
        if (socket.dbId == socket.ro.admin) {
            socket.ro.activePlayer = 0;
            for (let p = socket.ro.playerList.length-1; p >= 0; p--) {
                let player = socket.ro.playerList[p]
                socket.ro.playerPoints[p]=0;
                if(player.disconnected) {
                    deletedUsers.push(player.dbId);
                    socket.ro.playerList.splice(p, 1);
                    socket.ro.idList.splice(p, 1);
                    socket.ro.playerPoints.splice(p, 1);
                    socket.ro.playedList.splice(p, 1);
                    socket.ro.connectList.splice(p, 1);
                }
            }
            for (let p = 0; p < socket.ro.playerList.length; p++) {
                socket.ro.playerList[p].index = p;
            }
            // console.log('gameStart true');
            socket.ro.gameState = 1;
            io.to(socket.roN).emit('gamestarted', [deletedUsers, socket.ro.playerList[socket.ro.activePlayer].dbId]);
        }
    });
    socket.on('changeSettings', data => {
        if (typeof socket.ro === 'undefined' || socket.dbId === 'undefined') {return}
        if (socket.dbId == socket.ro.admin) {
            socket.ro.maxPoints = data;
            socket.broadcast.to(socket.roN).emit('changeMaxPoint', data);
        }
    });

    socket.on('disconnect', () => {
        if (typeof socket.ro === 'undefined') {
        } else {
            if (socket.ro.admin == socket.dbId) {
                let p = 0;
                while (socket.ro.playerList[p].disconnected && p < socket.ro.playerList.length-1) {
                    p++
                }
                socket.ro.admin = socket.ro.playerList[p].dbId;
            }
            socket.ro.connectList[socket.index] = false;
            socket.broadcast.to(socket.roN).emit('discon', [socket.dbId, socket.ro.admin]);
        }
        // console.log(io.sockets.adapter.rooms['test'].length);
        // for (let p = 0; p < io.sockets.adapter.rooms['test'].length; p++) {
        //     let temp = io.sockets.adapter.rooms['test'].sockets
        //     // console.log()[socket.roN]
        //     io.sockets.sockets[Object.keys(temp)[p]].leave('test')
        // }
        // console.log(io.sockets.adapter.rooms);

    });


    socket.on('draw', message => {
        if (typeof socket.ro === 'undefined' || socket.dbId === 'undefined') {return}
        if ((socket.index == socket.ro.activePlayer) && (socket.ro.gameState == 1)) {
            socket.ro.currentDrawing.push(message)
            socket.broadcast.to(socket.roN).emit('draw', message)
        }
    })

    socket.on('choose-image', message => {
        if (typeof socket.ro === 'undefined' || socket.dbId === 'undefined') {return}
        if (socket.ro.gameState == 1) {
            if (!socket.ro.playedList[socket.index]) {
                socket.ro.img++
                socket.ro.playedList[socket.index] = true;
                io.to(socket.roN).emit('played', socket.dbId)
            }
            socket.ro.playerList[socket.index].i = message;
            let numConnected = 0;
            for (let p of socket.ro.playerList) {
                if (!p.disconnected) {numConnected++}
            }
            if (socket.ro.img >= numConnected) {
                socket.ro.gameState = 2;
                let imageList = []
                for (let player of socket.ro.playerList) {
                    imageList.push(player.i);
                }
                let shuffled = shuffle(imageList)
                socket.ro.imageShuffled = shuffled[0];
                socket.ro.imageShuffle = shuffled[1];

                io.to(socket.roN).emit('endImage', socket.ro.imageShuffled);
                socket.ro.playerList[socket.ro.activePlayer].emit('qui', socket.ro.imageShuffle);
                socket.ro.playedList.fill(false);
            }
        }
    })

    socket.on('choose-vote', message => {
        if (typeof socket.ro === 'undefined' || socket.dbId === 'undefined') {return}
        if (socket.ro.gameState == 2) {
            if (socket.index != socket.ro.activePlayer) {
                if (!socket.ro.playedList[socket.index]) {
                    socket.ro.vote++
                    socket.ro.playedList[socket.index] = true;
                    io.to(socket.roN).emit('played', socket.dbId)
                }
                socket.ro.playerList[socket.index].v = message;

                let numConnected = 0;
                for (let p = 0; p< socket.ro.playerList.length; p++) {
                    if ((!socket.ro.playerList[p].disconnected) && (p != socket.ro.activePlayer)) {numConnected++}
                }
                if (socket.ro.vote >= numConnected) {
                    let voteResult = []
                    for (let player of socket.ro.playerList) {
                        voteResult.push(player.v);
                    }
                    let bonusScore = new Array(socket.ro.playerList.length).fill(0);
                    let foundScore = new Array(socket.ro.playerList.length).fill(0);
                    let validVotes = 0;
                    for (let i = 0; i < voteResult.length; i++) {
                        if (voteResult[i]>=0) {
                            if (socket.ro.imageShuffle[voteResult[i]] != socket.index){
                                bonusScore[socket.ro.imageShuffle[voteResult[i]]]++
                            }
                            if (socket.ro.imageShuffle[voteResult[i]] == socket.ro.activePlayer) {foundScore[i]+=3;}
                            validVotes++
                        }
                    }
                    if ((bonusScore[socket.ro.activePlayer] == 0) || (bonusScore[socket.ro.activePlayer] == validVotes)) {
                        bonusScore = new Array(socket.ro.playerList.length).fill(0);
                        foundScore = new Array(socket.ro.playerList.length).fill(2);
                        foundScore[socket.ro.activePlayer] = 0;
                    } else {
                        foundScore[socket.ro.activePlayer] = 3; bonusScore[socket.ro.activePlayer] = 0;
                    }
                    for (let i = 0; i < socket.ro.playerList.length; i++) {
                        socket.ro.playerPoints[i] += (Math.min(3,bonusScore[i])+foundScore[i])
                    }
                    let iwhile = 0;
                    do {
                        socket.ro.activePlayer++;
                        socket.ro.activePlayer= socket.ro.activePlayer%socket.ro.playerList.length
                        iwhile++;
                    }while ((socket.ro.playerList[socket.ro.activePlayer].disconnected) && (iwhile<socket.ro.playerList.length))

                    io.to(socket.roN).emit("whosTurn", [socket.ro.playerList[socket.ro.activePlayer].dbId, voteResult, socket.ro.imageShuffle, socket.ro.playerPoints]);
                    for (let player of socket.ro.playerList) {
                        player.i = ""; player.v = -1;
                    }
                    socket.ro.img = 0; socket.ro.vote = 0;
                    socket.ro.currentDrawing = [];
                    if (Math.max(...socket.ro.playerPoints) >= socket.ro.maxPoints) {
                        io.to(socket.roN).emit('endGame', "")
                        socket.ro.gameState = 0;
                    } else {
                        socket.ro.gameState = 1;
                    }
                    socket.ro.playedList.fill(false);
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
