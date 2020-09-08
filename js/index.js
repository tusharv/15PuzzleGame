function init(containerName) {
    puzzle.build(containerName);

    var start = document.getElementById('start');
    start.addEventListener('click', function() {
        this.style.display = 'none';
        if(puzzle.moves !== 0){
            puzzle.resetGame();
        }
        puzzle.shuffle();
    });
    this.addEventListener('shuffledone', function() {
        puzzle.start();
    });
}

var puzzle = {
    /* Configurable Setup Values 
    * Can be Passed through back-end
    */
    
    /* Confing for 4x4 Image 
    row: 4,
    col: 4,
    boxWidth: 100,
    boxHeight: 100,
    imageHeight: 400,
    imageWidth: 400,
    puuzeImage: './img/puzzle7.jpg',
    */
    
    /* Confing for 3x3 Image */
    row: 3,
    col: 3,
    boxWidth: 100,
    boxHeight: 100,
    imageHeight: 300,
    imageWidth: 300,
    puuzeImage: './img/puzzle' + Math.floor(Math.random() * 6 + 1) + '.jpg',
    /* */
    
    /*
    * Game Status 
    */
    moves: 0,
    gameStartTime: 0,
    gameTimerId: 0,
    ref: 0,
    blankRef: 0,
    refTimer: 0,
    refMoves: 0,
    refMessage: 0,
    /*
     * Build Puzzle Arena
     */
    build: function(containerName) {
        if(this.ref === 0){
            var c = document.getElementById(containerName);
            this.ref = c;
        }else {
            c = this.ref;
        }
        //To Clear Blank Node
        c.innerHTML = "";
        
        c.style.width = this.col * this.boxWidth + 'px';
        c.style.height = this.row * this.boxHeight + 'px';

        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                var box = document.createElement('div');
                var num = document.createElement('span');

                box.id = 'box_' + (i + 1) + "_" + (j + 1);
                //box.className = (i== (this.row-1) && j == (this.col-1))?"box boxBlank":"box";
                if (i == (this.row - 1) && j == (this.col - 1)) {
                    this.blankRef = box;
                }
                box.className = "box";
                box.style.top = this.boxHeight * i + "px";
                box.style.left = this.boxWidth * j + "px";
                box.style.backgroundImage = "url(" + this.puuzeImage + ")";
                box.style.backgroundPosition = " -" + (j * 100) + "px -" + (i * 100) + "px";

                num.className = "boxText";
                num.innerHTML = (i * this.row + j + 1);

                box.appendChild(num);
                c.appendChild(box);
            }
        }
    },
    /*
     * Shuffle Tiles
     * Minimam 5 Shuffles
     */
    shuffle: function() {
        var that = this;
        var count = 0,
            maxCount = Math.floor(Math.random() * 10 + 5);
        this.refMessage = document.getElementById('message');

        var id = setInterval(function() {
            var num = Math.floor(Math.random() * that.ref.children.length);
            var num2 = Math.floor(Math.random() * that.ref.children.length);
            that.swap(that.ref.childNodes[num], that.ref.childNodes[num2]);
            count++;
            that.refMessage.innerHTML = "Shufling, Please Wait ... " + (maxCount - count + 1);

            if (count > maxCount) {
                that.refMessage.innerHTML = "Ready, Start Moving";
                clearInterval(id);
                dispatchEvent(new Event("shuffledone"));
                setTimeout(function() {
                    that.refMessage.innerHTML = "";
                }, 2500);
            }
        }, 600);

    },
    /*
     * Swap Position of Tiles
     */
    swap: function(box1, box2) {
        var tempBox = {
            top: box1.style.top,
            left: box1.style.left
        };
        var that = this;

        box1.style.top = box2.style.top;
        box1.style.left = box2.style.left;
        box1.style.zIndex = 10;

        box2.style.top = tempBox.top;
        box2.style.left = tempBox.left;
        box1.style.zIndex = 10;
        
        var handler = function(){
            this.style.zIndex = "";
            this.removeEventListener("transitionend",handler);
            console.log(that.checkDone());
            if(that.checkDone()){
                that.gameDone();
            }
        }

        box1.addEventListener('transitionend', handler);
        box2.addEventListener('transitionend', handler);
    },
    /*
     * Start Game Play
     */
    start: function() {
        this.gameStartTime = new Date();
        this.blankRef.className += " boxBlank";

        this.ref.addEventListener('click', this.shiftBox);
        this.startGameTimer();

    },
    /*
     * Start Game Timer
     */
    startGameTimer: function() {
        this.refTimer = document.getElementById('timer');
        this.refMoves = document.getElementById('moves');
        var that = this;
        this.gameTimerId = setInterval(function() {
            var currentTime = new Date();
            var gameTime = currentTime - that.gameStartTime;
            that.refTimer.innerHTML = that.formatTime(gameTime);
        }, 500);
    },
    /*
     * End Game Timer
     */
    endGameTimer: function() {
        clearInterval(this.gameTimerId);
    },
    /*
     * Convert Miliseconds to Presentable Time format
     */
    formatTime: function(gameTime) {
        var time = gameTime / 1000;
        var min = Math.floor(time / 60);
        var sec = Math.floor(time % 60);

        min = (min <= 9) ? '0' + min : String(min)
        sec = (sec <= 9) ? '0' + sec : String(sec)
        return (min + ":" + sec);

    },
    /*
     * shiftBox is user clicks on right box
     */
    shiftBox: function(e) {

        if (e.target == puzzle.blankRef) {
            console.log("Invalid Move");
            return;
        }

        if (e.target.style.top === puzzle.blankRef.style.top && Math.abs(parseInt(e.target.style.left) - parseInt(puzzle.blankRef.style.left)) === puzzle.boxHeight) {
            puzzle.moves++;
            puzzle.swap(e.target, puzzle.blankRef);
            puzzle.updateMoves();
        } else if (e.target.style.left === puzzle.blankRef.style.left && Math.abs(parseInt(e.target.style.top) - parseInt(puzzle.blankRef.style.top)) === puzzle.boxHeight) {
            puzzle.moves++;
            puzzle.swap(e.target, puzzle.blankRef);
            puzzle.updateMoves();
        } else {
            console.log("Not a Valid Move");
        }
    },
    /*
     * Update Number of Moves
     */
    updateMoves: function() {
        this.refMoves.innerHTML = this.moves + " Moves";
    },
    /*
    * Check if All Blocks are at right position
    */
    checkDone: function() {
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                var box = document.getElementById('box_' + (i + 1) + "_" + (j + 1));
                if (box.style.top != this.boxHeight * i + "px" || box.style.left != this.boxWidth * j + "px") {
                    return false;
                }
            }
        }
        return true;
    },
    /*
    * Game is done, Display Message and Option to Replay
    */
    gameDone: function(){
        this.endGameTimer();
        this.ref.removeEventListener('click', this.shiftBox);
        this.blankRef.className = "box";
        
        this.refMessage.innerHTML = "Well Done! You have finished puzzle in " + this.moves + " moves";
        
        var start = document.getElementById('start');
        start.innerHTML = "Restart";
        start.style.display = null;
        
    },
    /*
    * Resetting Previous game Data and restarting
    */
    resetGame: function(){
        this.moves = 0;
        this.puuzeImage = './img/puzzle' + Math.floor(Math.random() * 6 + 1) + '.jpg';
        this.updateMoves();
        this.refTimer.innerHTML = "00:00";
        this.build();
        
    }

}