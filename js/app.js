angular.module('dodgem', []).controller('MainController', ($scope, $timeout, $interval) => {
    // variable
    $scope.gameStarted = false;
    $scope.lastMoved = null;
    $scope.congratulationMessage = null;
    $scope.baseLineGameProperties = {
        played: 0,
        playerWin: 0,
        thisMatch: {
            map: [
              [
                {
                    selected: false,
                    active: 'player'
                },
                {
                    selected: false,
                    active: ''
                },
                {
                    selected: false,
                    active: ''
                }
              ],
              [
                {
                    selected: false,
                    active: 'player'
                },
                {
                    selected: false,
                    active: ''
                },
                {
                    selected: false,
                    active: ''
                }
              ],
              [
                {
                    selected: false,
                    active: ''
                },
                {
                    selected: false,
                    active: 'com'
                },
                {
                    selected: false,
                    active: 'com'
                }
              ]
            ],
            playerMoved: 0,
            comMoved: 0,
            playerLeft: 2,
            comLeft: 2,
            overview: {
                player: [
                  [
                    {
                        score: 10
                    },
                    {
                        score: 25
                    },
                    {
                        score: 40
                    }
                  ],
                  [
                    {
                        score: 5
                    },
                    {
                        score: 20
                    },
                    {
                        score: 35
                    }
                  ],
                  [
                    {
                        score: 0
                    },
                    {
                        score: 15
                    },
                    {
                        score: 30
                    }
                  ]
                ],
                com: [
                  [
                    {
                        score: 30
                    },
                    {
                        score: 35
                    },
                    {
                        score: 40
                    }
                  ],
                  [
                    {
                        score: 15
                    },
                    {
                        score: 20
                    },
                    {
                        score: 25
                    }
                  ],
                  [
                    {
                        score: 0
                    },
                    {
                        score: 5
                    },
                    {
                        score: 10
                    }
                  ]
                ]
            },
            directionCanMove: {
                top: true,
                left: true,
                right: true,
                bottom: true
            },
            selectedChessPiece: null
        }
    };
    $scope.history = [];
    $scope.root = {
        data: undefined,
        childs: []
    };

    // init game
    $scope.initGame = (playerMoveFirst) => {
        $scope.history.unshift([]);
        $scope.history.selectedIndex = 0;

        $scope.gameProperties = angular.copy($scope.baseLineGameProperties);
        $scope.gameStarted = true;
        // setup chess piece position
        $scope.lastMoved = !playerMoveFirst;

        // draw tree
        $scope.root.data = angular.copy($scope.gameProperties.thisMatch.map);
        $scope.initTree($scope.root, playerMoveFirst ? 'player' : 'com', 3);

        if (playerMoveFirst) {
            $scope.setSelectedChessPiece($scope.gameProperties.thisMatch.map[0][0], 0, 0);
        }
        else {
            $scope.comMove();
        }
    }

    $scope.initTree = (root, active, level)=>{
        if(!level){
            return;
        }

        let points = [];
        let map = root.data;

        for(let i = 0; i < map.length; i++){
            for(let j = 0; j < map[i].length; j++){
                if(map[i][j].active === active){
                    let point = angular.copy(map[i][j]);
                    point.x = i;
                    point.y = j;
                    points.push(point);
                }
            }
        }

        if(points.length){
            for(let i = 0; i < points.length; i++){
                let point = points[i];
                let direction = $scope.checkingDirection(point, point.x, point.y, map);

                if(direction.top === true || direction.bottom === true
                || direction.left === true || direction.right === true){
                     let leaf = {
                        data: angular.copy(map),
                        childs: []
                    };
                    leaf.data[point.x][point.y].active = '';

                    let child = angular.copy(leaf);
                    if(direction.top === true){
                        child.query = `top ${point.x - 1} ${point.y}`;
                        if(point.x !== 0){
                            child.data[point.x - 1][point.y].active = point.active;
                        }
                        root.childs.push(child);
                    }

                    child = angular.copy(leaf);
                    if(direction.bottom === true){
                        child.query = `bottom ${point.x  + 1} ${point.y}`;
                        if(point.x !== 2){
                            child.data[point.x + 1][point.y].active = point.active;
                        }
                        root.childs.push(child);
                    }

                    child = angular.copy(leaf);
                    if(direction.left === true){
                        child.query = `left ${point.x} ${point.y - 1}`;
                        if(point.y !== 0){
                            child.data[point.x][point.y - 1].active = point.active;
                        }
                        root.childs.push(child);
                    }

                    child = angular.copy(leaf);
                    if(direction.right === true){
                        child.query = `right ${point.x} ${point.y + 1}`;
                        if(point.y !== 2){
                            child.data[point.x][point.y + 1].active = point.active;
                        }
                        root.childs.push(child);
                    }
                }
            }

            for(let i = 0; i < root.childs.length; i++){
                ////console.log(`Level ${level}: ${i}`);
                $scope.initTree(root.childs[i], active === 'com' ? 'player' : 'com', level - 1);
            }
        }
    }

    $scope.setSelectedChessPiece = (c, x, y) => {
        if (c.active != '' && c.active !== ($scope.lastMoved ? 'player' : 'com')) {
            $scope.gameProperties.thisMatch.selectedChessPiece = {
                c: c,
                x: x,
                y: y
            };
            for(let i = 0; i < $scope.gameProperties.thisMatch.map.length; i++){
                for(let j = 0; j < $scope.gameProperties.thisMatch.map[i].length; j++){
                    $scope.gameProperties.thisMatch.map[i][j].selected = false;
                }
            }
            c.selected = true;
            $scope.checkingDirection(c, x, y);
        }
    }

    $scope.checkingDirection = (c, x, y, m) => {
        direction = $scope.gameProperties.thisMatch.directionCanMove;
        getTop = (x, y) => {
            //case can exist
            if (c.active === 'com' && x === 0) {
                if(m){
                    return {active:''};
                }
                $scope.gameProperties.thisMatch.selectedChessPiece.canExist = true;
                return { active: '' }//exception
            }
            if (x = m ? m[x - 1] : $scope.gameProperties.thisMatch.map[x - 1]) {
                return x[y];
            }
            return undefined;
        }
        getBottom = (x, y) => {
            if ((x = m ? m[x + 1] : $scope.gameProperties.thisMatch.map[x + 1]) && (c.active === 'player')) {
                return x[y];
            }
            return undefined;
        }
        getLeft = (x, y) => {
            if (c.active === 'player') {
                return undefined;
            }
            return m ? m[x][y - 1] : $scope.gameProperties.thisMatch.map[x][y - 1];
        }
        getRight = (x, y) => {
            if (c.active === 'player' && y === 2) {
                if(m){
                    return {active:''};
                }
                $scope.gameProperties.thisMatch.selectedChessPiece.canExist = true;
                return { active: '' }//exception
            }
            return m ? m[x][y + 1] : $scope.gameProperties.thisMatch.map[x][y + 1];
        }

        //checking is beside border
        z = getTop(x, y);
        direction.top = z ? z.active === '' ? true : false : false;
        z = getBottom(x, y);
        direction.bottom = z ? z.active === '' ? true : false : false;
        z = getLeft(x, y);
        direction.left = z ? z.active === '' ? true : false : false;
        z = getRight(x, y);
        direction.right = z ? z.active === '' ? true : false : false;

        return direction;
    }

    $scope.findPosition = (type) => {
        pos = [];

        $scope.gameProperties.thisMatch.map.forEach((it, ind) => {
            it.forEach((it2, ind2) => {
                if (it2.active === type) {
                    pos.push({ x: ind, y: ind2, active: it2.active, score: $scope.gameProperties.thisMatch.overview[type][ind][ind2].score });
                }
            })
        })
        return pos;
    }

    $scope.reCalculatorScore = (type, x, y, w) => {
        let thisMatch = $scope.gameProperties.thisMatch;
        let s = angular.copy(thisMatch.overview[type][x][y].score);
        //let chessPieceLeft = type === 'player' ? thisMatch.playerLeft : thisMatch.comLeft;
        for (i = 0; i < 2; i++) {
            if (type === 'player') {
                if (z = thisMatch.map[x + i + 1]) {
                    if (z[y].active === 'com') {
                        if (w === true) {
                            s += 40 - 10 * i;
                        }
                        else {
                            thisMatch.overview[type][x][y].score += 40 - 10 * i;
                        }
                    }
                }
            }
            else {
                if (z = thisMatch.map[x][y - i - 1]) {
                    if (z.active === 'player') {
                        if (w === true) {
                            s += 40 - 10 * i;
                        }
                        else {
                            thisMatch.overview[type][x][y].score += 40 - 10 * i;
                        }
                    }
                }
            }
        }

        return s;
    }

    $scope.comFindingNextStop = () => {
        // First: Get all direction com can move
        let com = {};
        com.posCanBeNextStop = [];
        com.chessPieces = $scope.findPosition('com');
        com.chessPieces.forEach((it, ind) => {
            it.directionCanMove = angular.copy($scope.checkingDirection(it, it.x, it.y));

            // Second: Get total score each move
            if (it.directionCanMove.left === true) {
                com.posCanBeNextStop.push({
                    x: it.x,
                    y: it.y,
                    nextStop: 'left',
                    totalScore: $scope.reCalculatorScore('com', it.x, it.y - 1, true),
                });
            }
            if (it.directionCanMove.right === true) {
                com.posCanBeNextStop.push({
                    x: it.x,
                    y: it.y,
                    nextStop: 'right',
                    totalScore: $scope.reCalculatorScore('com', it.x, it.y + 1, true),
                });
            }
            if (it.directionCanMove.top === true) {
                com.posCanBeNextStop.push({
                    x: it.x,
                    y: it.y,
                    nextStop: 'top',
                    totalScore: it.x - 1 < 0 ? 0 : $scope.reCalculatorScore('com', it.x - 1, it.y, true),
                });
            }
            if (it.directionCanMove.bottom === true) {
                //console.log('Exception: Com can move down to bottom')
                com.posCanBeNextStop.push({
                    x: it.x,
                    y: it.y,
                    nextStop: 'bottom',
                    totalScore: $scope.reCalculatorScore('com', it.x + 1, it.y, true),
                });
            }
        });

        if (com.chessPieces.length > 1) {
            com.posCanBeNextStop.forEach((it) => {
                let t = com.chessPieces.find((it2) => {
                    return it2.x != it.x || it2.y != it.y;
                });

                if (it.nextStop === 'top' && it.x === 0) {
                    it.totalScore = t.score + 50;
                }
                else {
                    it.totalScore += t.score;
                }
            })
        }
        else if(com.chessPieces.length === 1){
            let t = com.chessPieces[0];
            let indexPosCanExist = com.posCanBeNextStop.findIndex((it)=>{
                return it.nextStop === 'top' && it.x === 0;
            })

            if (indexPosCanExist !== -1){
                com.posCanBeNextStop[indexPosCanExist].totalScore = 50;
            }
        }

        let calculationNextStop = ()=>{
            let tempArr = com.posCanBeNextStop.map((it) => {
                return it.totalScore;
            });
            let maxScore = Math.max(...tempArr);
            let tempPosCanBeNextStop = angular.copy(com.posCanBeNextStop).filter((it, ind) => {
                it.index = ind;
                return it.totalScore === maxScore;
            })
            //console.log(tempPosCanBeNextStop);
            let rand = Math.floor((Math.random() * tempPosCanBeNextStop.length - 1) + 1);
            ////console.log(com);
            let nextMove = {
                x: tempPosCanBeNextStop[rand].nextStop === 'top' ? tempPosCanBeNextStop[rand].x - 1 : tempPosCanBeNextStop[rand].nextStop === 'bottom' ? tempPosCanBeNextStop[rand].x + 1 : tempPosCanBeNextStop[rand].x,
                y: tempPosCanBeNextStop[rand].nextStop === 'left' ? tempPosCanBeNextStop[rand].y - 1 : tempPosCanBeNextStop[rand].nextStop === 'right' ? tempPosCanBeNextStop[rand].y + 1 : tempPosCanBeNextStop[rand].y
            };
            
            nextMove.tree = $scope.root.childs.find((child)=>{
                return child.query === `${tempPosCanBeNextStop[rand].nextStop} ${nextMove.x} ${nextMove.y}`
            })
            
            let playerCanWin = false;
            for (let i = 0; i < nextMove.tree.childs.length; i++){
                if(nextMove.tree.childs[i].childs.length === 0 && com.chessPieces.length > 1){
                    playerCanWin = true;
                }

                if (playerCanWin){
                    break;
                }
            }

            if (playerCanWin && com.posCanBeNextStop.length > 1){
                com.posCanBeNextStop.splice(tempPosCanBeNextStop[rand].index, 1);
            }

            return playerCanWin ? undefined : com.posCanBeNextStop[tempPosCanBeNextStop[rand].index];
        }

        result = calculationNextStop();
        while(!result && com.posCanBeNextStop.length > 1){
            result = calculationNextStop();
        }

        //console.log(result);

        return result;
    }

    $scope.comMove = () => {
        let comNextStop = $scope.comFindingNextStop();
        if (comNextStop) {
            $scope.setSelectedChessPiece($scope.gameProperties.thisMatch.map[comNextStop.x][comNextStop.y], comNextStop.x, comNextStop.y);
            $scope.move(comNextStop.nextStop);
            
            //
            let playerPos = $scope.findPosition('player');
            if(playerPos.length === 1){
                let playerCanMove = $scope.checkingDirection($scope.gameProperties.thisMatch.map[playerPos[0].x][playerPos[0].y], playerPos[0].x, playerPos[0].y);
                if(!playerCanMove.top && !playerCanMove.bottom && !playerCanMove.right){
                    $scope.gameProperties.thisMatch.comLeft = 0;
                    $scope.endGame();
                }
            }
        }
        else {
            $scope.gameProperties.thisMatch.playerLeft = 0;
            $scope.endGame();
        }
        ////console.log($scope.findPosition('player'));
    }

    $scope.move = (nextStop) => {
        let sel = $scope.gameProperties.thisMatch.selectedChessPiece;
        x = nextStop === 'top' ? sel.x - 1 : nextStop === 'bottom' ? sel.x + 1 : sel.x;
        y = nextStop === 'left' ? sel.y - 1 : nextStop === 'right' ? sel.y + 1 : sel.y;

        let nextMap = $scope.root.childs.find((child)=>{
            return child.query === `${nextStop} ${x} ${y}`;
        })

        sel.c.selected = false;

        $scope.gameProperties.thisMatch.map = angular.copy(nextMap.data);
        $scope.root = nextMap;
        $scope.root.childs = [];
        $scope.initTree($scope.root, sel.c.active === 'player' ? 'com' : 'player', 3);

        $scope.gameProperties.thisMatch.playerLeft = 0;
        $scope.gameProperties.thisMatch.comLeft = 0;
        $scope.gameProperties.thisMatch.map.forEach((it)=>{
            it.forEach((it2)=>{
                if(it2.active === 'player'){
                    $scope.gameProperties.thisMatch.playerLeft ++;
                }
                else if(it2.active === 'com'){
                    $scope.gameProperties.thisMatch.comLeft ++;
                }
            })
        })

        if(!$scope.gameProperties.thisMatch.playerLeft ||
        !$scope.gameProperties.thisMatch.comLeft){
            $scope.endGame();
        }

        isPlayerMove = sel.c.active === 'player';
        sel.c.active = '';

        $scope.gameProperties.thisMatch.overview = angular.copy($scope.baseLineGameProperties.thisMatch.overview);
        $scope.findPosition('player').concat($scope.findPosition('com')).forEach((it, ind) => {
            $scope.reCalculatorScore(it.active, it.x, it.y, false);
        })

        $scope.lastMoved ? $scope.gameProperties.thisMatch.comMoved++ : $scope.gameProperties.thisMatch.playerMoved++;
        $scope.lastMoved = !$scope.lastMoved;

        //Backup last move to history
        let h = angular.copy($scope.gameProperties.thisMatch.map);
        h = h.map((it, ind) => {
            return it.map((it2, ind2) => {
                it2.score = it2.active ? angular.copy($scope.gameProperties.thisMatch.overview[it2.active][ind][ind2].score) : '';
                return it2;
            })
        })
        h.ower = isPlayerMove === true ? 'PLAYER' : 'COM';
        h.time = new Date();
        h.time = `${h.time.getHours()}:${h.time.getMinutes()}:${h.time.getSeconds()}:${h.time.getMilliseconds()}`
        $scope.history[$scope.history.selectedIndex].unshift(h);

        if (isPlayerMove === true) {
            $scope.comMove();
        }
    }

    $scope.endGame = () => {
        $scope.baseLineGameProperties.played++;

        if (!$scope.gameProperties.thisMatch.playerLeft) {
            $scope.gameProperties.playerWin++;
            $scope.baseLineGameProperties.playerWin++;
            m = 'PLAYER';
        }
        else {
            $scope.gameProperties.comWin++;
            $scope.baseLineGameProperties.comWin++;
            m = 'COM';
        }

        $scope.congratulationMessage = `${m} WIN!!!`;
        m = 5;

        $timeout(() => {
            handle = $interval(() => {
                m--;
                $scope.congratulationMessage = `Restart game in ${m}s`;
                if (!m) {
                    $interval.cancel(handle)
                    $scope.gameStarted = false;
                }
            }, 1000);
        }, 1000);
    }
})
