const titleDiv = document.querySelector('.titleDiv')
const gameContainer = document.getElementById('gameContainer')
const gameboard = document.getElementById('gameboard');
const userInterface = document.getElementById('userInterface')
const interface = document.querySelector('#interface')
const startBtn = document.getElementById('startBtn');
const selectColor = document.getElementById('selectColor')
const boardDecor = document.getElementById("boardDecor")
const optionsContainer = document.getElementById('optionsContainer')
const restartText = document.querySelector('#rematchHeader')
const resultTxt = document.getElementById('resultTxt')
const winnerDiv = document.querySelector('.resultNotif')

const alphabet = ['A', 'B', 'C', 'D','E','F','G','H']
let allPiecesList = []
let whitePiecesList = [];
let blackPiecesList = [];
let boardTiles = [];
let possibleMovesList = []
let playerMovesList = [];
let enemyMovesList = [];
let currentTurn = "black";
let playerColor = "black"
let dragTarget = "";
let dropSpot = "";
let clicked = false;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const userInterfaceDiv = document.getElementById('userInterface')
const createAccountUI = document.querySelector('#createAccountUI')
const userCreate = document.querySelector('#userCreate')
const userName = document.querySelector('#nameValue')

const searchUI = document.getElementById('searchUI');
const searchFriendForm = document.getElementById('searchFriendForm');
const searchFriendDiv = document.getElementById('searchFriendDiv');
const friendName = document.getElementById('friend')
const playersOnline = document.getElementById('playersOnline')

let matchRoom
let clickSelection
let socket
let user
let possibleFriend
let friend
let singleplayer = true
let moveData


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener('selectstart', (e) => {
    e.preventDefault();  
})


startBtn.addEventListener('click', (e) => {
    clearBoard()
    if (socket != null) {
        socket.emit("disconnect friend", [friend, user]);
    }
    friend = ""
    singleplayer = true;
    startGame(selectColor.value)
})


boardDecor.addEventListener("change", (e) => {
    updateTileColor()
})


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function startGame(msg) {
    gameboard.style.display = "flex";
    fadeIn(gameboard, .02, 10);
    if (msg != "black") {
        createBoard("white")
    }
    else {
        createBoard(msg);
    }
    addChessPieces();
    nextTurn()
    selectColor.value = '';
}

function nextTurn() {
    playerMovesList = [];
    enemyMovesList = [];
    clearPossibleMoves()
    dragTarget = "";
    dropSpot = "";

    document.querySelectorAll(".gridTile").forEach((tile) => {
        tile.classList.remove("highlight")
    })
    currentTurn == "white" ? currentTurn = "black" : currentTurn = "white";

    if (singleplayer == true) {playerColor = currentTurn}

    clicked = false;

}


function clearBoard() {
    while (gameboard.firstChild) {
        gameboard.firstChild.remove()
    } 
    winnerDiv.classList.remove('show')
}



function reset() {
    clearBoard()
    boardTiles = []
    allPiecesList = []
    whitePiecesList = [];
    blackPiecesList = [];
    possibleMovesList = [];
    playerMovesList = [];
    enemyMovesList = [];
    whiteWins = false
    blackWins = false
    dragTarget = "";
    dropSpot = "";
    currentTurn = "black";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function createBoard(pColor) {
    reset()
    rowNum = 0;
    colNum = 0;
    for (let r = 1; r <= 8; r++) {
        for (let c = 7; c >=0; c--) {
            let currentTile = createGridTile(r, c)
            if (pColor == "white") {
                if (r == 1 || c == 0) {
                    createTileLabel(currentTile, r, c, pColor)
                }
                boardTiles.unshift(currentTile)
                gameboard.prepend(currentTile)
            }
            else {
                if (r == 8 || c == 7) {
                    createTileLabel(currentTile, r, c, pColor)
                }
                boardTiles.push(currentTile)
                gameboard.append(currentTile)
            }
        }
    }

    updateTileColor()

}




function createGridTile(rowNum, colNum) {
    const currentTile = document.createElement('div');
    currentTile.classList.add("gridTile");
    currentTile.dataset.row = rowNum;
    currentTile.dataset.colNum = colNum;
    currentTile.dataset.col = alphabet[colNum];
    currentTile.dataset.occupied = "false";
    currentTile.setAttribute('draggable', 'false')
    currentTile.setAttribute('id', `${alphabet[colNum]}${rowNum}`);
    createTileColor(currentTile, rowNum, colNum)
    //gameboard.appendChild(currentTile)
    return currentTile;
}


function createTileLabel(parentTile, rowNum, colNum, pColor) {
    if (pColor == "white"){   
        if (colNum == 0) {
            let labelTop = document.createElement('h4');
            labelTop.classList.add("gridTileLabel");
            //labelTop.classList.add("labelTopLeft");
            labelTop.textContent = rowNum;
            labelTop.setAttribute('draggable', 'false')
            parentTile.appendChild(labelTop)
        }
        if (rowNum == 1) {
            let labelBottom = document.createElement('h4');
            labelBottom.classList.add("gridTileLabel");
            labelBottom.classList.add("labelBottomRight");
            labelBottom.textContent = alphabet[colNum];
            labelBottom.setAttribute('draggable', 'false')
            parentTile.appendChild(labelBottom)
        }
    }
    else {
        if (colNum == 7) {
            let labelTop = document.createElement('h4');
            labelTop.classList.add("gridTileLabel");
            //labelTop.classList.add("labelTopLeft");
            labelTop.textContent = rowNum;
            labelTop.setAttribute('draggable', 'false')
            parentTile.appendChild(labelTop)
        }

        if (rowNum == 8) {
            let labelBottom = document.createElement('h4');
            labelBottom.classList.add("gridTileLabel");
            labelBottom.classList.add("labelBottomRight");
            labelBottom.textContent = alphabet[colNum];
            labelBottom.setAttribute('draggable', 'false')
            parentTile.appendChild(labelBottom)
        }
    }
}


function createTileColor(gridTile, r, c) {
    c--; //turn column to zero-based
    switch (r) {
        case 2:
        case 4:
        case 6:
        case 8:
            if (c%2 == 0) {
                gridTile.classList.add('darkTile')
            }
            else {
                gridTile.classList.add('lightTile') 
            }
            break;
        default:
            if ((c+1)%2 == 0) {
                gridTile.classList.add('darkTile')
            }
            else {
                gridTile.classList.add('lightTile') 
            }
            break;
    }

}

function updateTileColor() {
    switch (boardDecor.value) {
        case "wood":
            document.querySelectorAll(".gridTile").forEach((elem) => {
                if (elem.classList.contains("lightTile")) {
                    elem.classList.add("lightWood");
                }
                if (elem.classList.contains("darkTile")) {
                    elem.classList.add("darkWood");
                }
            });
            break;
        case "rainbow":
            document.querySelectorAll(".gridTile").forEach((elem) => {
                if (elem.classList.contains("lightTile")) {
                    elem.classList.remove("lightWood");
                }
                if (elem.classList.contains("darkTile")) {
                    elem.classList.remove("darkWood");
                    let r = Math.floor(Math.random() * 150) + 25
                    let g = Math.floor(Math.random() * 150) + 25
                    let b = Math.floor(Math.random() * 150) + 25
                    elem.style.backgroundColor = `rgb(${r},${g}, ${b})`

                }
            });
            break;
        default:
            document.querySelectorAll(".gridTile").forEach((elem) => {
                if (elem.classList.contains("lightTile")) {
                    elem.classList.remove("lightWood");
                }
                if (elem.classList.contains("darkTile")) {
                    elem.style.backgroundColor = boardDecor.value
                    elem.classList.remove("darkWood");
                }
            });
            break;

    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function createChessPiece(pType, color, startingPosition) {
    let currentChessPiece = document.createElement("div");
    let currentPosition = document.querySelector(`#${startingPosition}`);
    currentChessPiece.classList.add("chessPiece");
    currentChessPiece.classList.add(color.substring(0, 1) + pType);
    currentChessPiece.dataset.color = color;
    currentChessPiece.dataset.type = pType;
    if (pType == "King") {
        currentChessPiece.dataset.check = "false";
    }
    currentChessPiece.dataset.row = currentPosition.dataset.row;
    currentChessPiece.dataset.colNum = currentPosition.dataset.colNum;
    currentChessPiece.dataset.col = currentPosition.dataset.col;
    currentChessPiece.dataset.position = startingPosition;
    currentChessPiece.dataset.moved = "false";
    currentChessPiece.id = color.substring(0, 1) + pType + "column" + currentChessPiece.dataset.colNum;
    currentPosition.appendChild(currentChessPiece);
    currentPosition.dataset.occupied = "true";
    allPiecesList.push(currentChessPiece);
    if (color == "white" ) {whitePiecesList.push(currentChessPiece)}
    else {blackPiecesList.push(currentChessPiece)}
    createDraggable(currentChessPiece)
}


function addChessPieces() {
    for (let i = 0; i < alphabet.length; i++) {
        createChessPiece("Pawn", "white", `${alphabet[i]}2`);
        createChessPiece("Pawn", "black", `${alphabet[i]}7`);

        switch (i) {
            case 0:
                createChessPiece("Rook", "white", `${alphabet[i]}1`);
                createChessPiece("Rook", "black", `${alphabet[i]}8`);
                break;
            case 1:
                createChessPiece("Knight", "white", `${alphabet[i]}1`);
                createChessPiece("Knight", "black", `${alphabet[i]}8`);
                break;
            case 2:
                createChessPiece("Bishop", "white", `${alphabet[i]}1`);
                createChessPiece("Bishop", "black", `${alphabet[i]}8`);
                break;
            case 3:
                createChessPiece("Queen", "white", `${alphabet[i]}1`);
                createChessPiece("Queen", "black", `${alphabet[i]}8`);
                break;
            case 4:
                createChessPiece("King", "white", `${alphabet[i]}1`);
                createChessPiece("King", "black", `${alphabet[i]}8`);
                break;
            case 5:
                createChessPiece("Bishop", "white", `${alphabet[i]}1`);
                createChessPiece("Bishop", "black", `${alphabet[i]}8`);
                break;
            case 6:
                createChessPiece("Knight", "white", `${alphabet[i]}1`);
                createChessPiece("Knight", "black", `${alphabet[i]}8`);
                break;
            case 7:
                createChessPiece("Rook", "white", `${alphabet[i]}1`);
                createChessPiece("Rook", "black", `${alphabet[i]}8`);
                break;
        }
    }
}


function removePiece(piece) {
    let array;
    piece.dataset.color == "white" ? array = whitePiecesList : array = blackPiecesList;
    for (let i = 0; i < array.length; i++) {
        if (piece == array[i]) {
            array.splice(i, 1)
            break;
        }
    }
    piece.remove();
}

function undoRemovePiece(piece) {
    let array;
    piece.dataset.color == "white" ? array = whitePiecesList : array = blackPiecesList;
    array.push(piece)
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function checkVerticalTile(row, col, pColor, rowDistance, kill, array) {
    let nullBool;
    rowDistance > 0 ? nullBool = (row + rowDistance <= 8) :  nullBool = (row + rowDistance >= 1)

    if (nullBool) { //check null
        let targetTileRow = row + rowDistance;
        let verticalTile = document.querySelector(`#${alphabet[col]}${targetTileRow}`)
        if (kill == true) {
            if (verticalTile.dataset.occupied == "true") {
                if (verticalTile.querySelector(".chessPiece").dataset.color != pColor) {
                    array.push([alphabet[col], targetTileRow])
                    //createPossibleMove(targetTileRow, alphabet[col], array)
                }
                return false;
            }
            else {
                array.push([alphabet[col], targetTileRow])
                //createPossibleMove(targetTileRow, alphabet[col], array)
                return true 
            }
        }
        else {
            if (verticalTile.dataset.occupied == "false") { //check tile infront
                array.push([alphabet[col], targetTileRow])
                //createPossibleMove(targetTileRow, alphabet[col], array)
                return true;
            }
            else {
                return false
            }
        }
    }
}




function checkHorizontalTile(row, col, pColor, colDistance, kill, array) {
    let nullBool;
    colDistance > 0 ? nullBool = (col + colDistance <= 7) : nullBool = (col + colDistance >= 0)

    if (nullBool) { //check null

        let targetTileColumn = alphabet[col + colDistance];
        let horizontalTile = document.querySelector(`#${targetTileColumn}${row}`)
        if (kill == true) {
            if (horizontalTile.dataset.occupied == "true") {
                if (horizontalTile.querySelector(".chessPiece").dataset.color != pColor) {
                    array.push([targetTileColumn, row])
                    //createPossibleMove(row, targetTileColumn, array)    
                }
                return false;
            }
            else {
                array.push([targetTileColumn, row])
                //createPossibleMove(row, targetTileColumn, array)    
                return true 
            }
        }
        else {
            if (horizontalTile.dataset.occupied == "false") { //check tile infront
                array.push([targetTileColumn, row])
                //createPossibleMove(row, targetTileColumn, array)
                return true;
            }
            else {
                return false
            }
        }
    }
}

function checkDiagonalTile(row, col, pColor, rowDistance, colDistance, kill, passive, array) {
    let rowNullBool
    let colNullBool

    rowDistance > 0 ? rowNullBool = (row + rowDistance <= 8) :  rowNullBool = (row + rowDistance >= 1)
    colDistance > 0 ? colNullBool = (col + colDistance <= 7) : colNullBool = (col + colDistance >= 0)

    if (rowNullBool && colNullBool) { //check null
        let targetTileColumn = alphabet[col + colDistance];
        let targetTileRow = row + rowDistance;


        let diagonalMove = document.querySelector(`#${targetTileColumn}${targetTileRow}`)
        if (kill == true) {
            if (diagonalMove.dataset.occupied == "true") {
                if (diagonalMove.querySelector(".chessPiece").dataset.color != pColor) { 
                    array.push([targetTileColumn, targetTileRow])
                    //createPossibleMove(targetTileRow, targetTileColumn, array)
                }
                return false;
            }
            else {
                if (passive == false) {
                    array.push([targetTileColumn, targetTileRow])
                    //createPossibleMove(targetTileRow, targetTileColumn, array)
                    return true;
                }
                return false;
            }
        }
        else {
            if (diagonalMove.dataset.occupied == "false" && passive == false) {
                array.push([targetTileColumn, targetTileRow]) 
                //createPossibleMove(targetTileRow, targetTileColumn, array)
                return true;
            }
            else {
                return false;
            }
        }      
    }
}



function checkLTile(row, col, pColor, rowDistance, colDistance, array) {

    let rowNullBool
    let colNullBool

    rowDistance > 0 ? rowNullBool = (row + rowDistance <= 8) :  rowNullBool = (row + rowDistance >= 1)
    colDistance > 0 ? colNullBool = (col + colDistance <= 7) : colNullBool = (col + colDistance >= 0)

    if (rowNullBool && colNullBool) { //check null
        let targetTileColumn = alphabet[col + colDistance];
        let targetTileRow = row + rowDistance;
        let currentTargetTile = document.querySelector(`#${targetTileColumn}${targetTileRow}`)
        if (currentTargetTile.dataset.occupied == "false") {
            array.push([targetTileColumn, targetTileRow])
            //createPossibleMove(targetTileRow, targetTileColumn, array)
        }
        else if (currentTargetTile.querySelector(".chessPiece").dataset.color != pColor)  {
            array.push([targetTileColumn, targetTileRow])
            //createPossibleMove(targetTileRow, targetTileColumn, array);
        }    
    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function createPawnPossibleMoves(piece, array) {

    let currentColNum = Number(piece.dataset.colNum);
    let currentRow = Number(piece.dataset.row);

    if (piece.dataset.color == "white") {
        if (checkVerticalTile(currentRow, currentColNum, "white", 1, false, array)) { // check first tile
            if (piece.dataset.moved == "false") {checkVerticalTile(currentRow, currentColNum, "white", 2, false, array)} // check second tile
        }

        checkDiagonalTile(currentRow, currentColNum, "white", 1, 1, true, true, array)
        checkDiagonalTile(currentRow, currentColNum, "white", 1, -1, true, true, array) 
    }
    else {
        if (checkVerticalTile(currentRow, currentColNum, "black", -1, false, array)) { // check first tile
            if (piece.dataset.moved == "false") {checkVerticalTile(currentRow, currentColNum, "black", -2, false, array)} // check second tile
        }

        checkDiagonalTile(currentRow, currentColNum, "black", -1, 1, true, true, array)
        checkDiagonalTile(currentRow, currentColNum, "black", -1, -1, true, true, array)  
    }
}


function createRookPossibleMoves(piece, array) {
    let currentColNum = Number(piece.dataset.colNum);
    let currentRow = Number(piece.dataset.row);

    let colDistance = 1;
    while (checkHorizontalTile(currentRow, currentColNum, piece.dataset.color, colDistance, true, array)) {
        colDistance++
    }

    colDistance = -1;
    while (checkHorizontalTile(currentRow, currentColNum, piece.dataset.color, colDistance, true, array)) {
        colDistance--
    }

    let rowDistance = 1;
    while (checkVerticalTile(currentRow, currentColNum, piece.dataset.color, rowDistance, true, array)) {
        rowDistance++
    }

    rowDistance = -1;
    while (checkVerticalTile(currentRow, currentColNum, piece.dataset.color, rowDistance, true, array)) {
        rowDistance--
    }
}

function createBishopPossibleMoves(piece, array) {
    let currentColNum = Number(piece.dataset.colNum);
    let currentRow = Number(piece.dataset.row);

    let enemyColor;
    piece.dataset.color == "white" ? enemyColor = "black" : enemyColor = "white";

    let rowDistance = 1;
    let colDistance = 1;
    while (checkDiagonalTile(currentRow, currentColNum, piece.dataset.color, rowDistance, colDistance, true, false, array)) {
        rowDistance++
        colDistance++
    }

    rowDistance = 1;
    colDistance = -1;
    while (checkDiagonalTile(currentRow, currentColNum, piece.dataset.color, rowDistance, colDistance, true, false, array)) {
        rowDistance++
        colDistance--
    }

    rowDistance = -1;
    colDistance = -1;
    while (checkDiagonalTile(currentRow, currentColNum, piece.dataset.color, rowDistance, colDistance, true, false, array)) {
        rowDistance--
        colDistance--
    }

    rowDistance = -1;
    colDistance = 1;
    while (checkDiagonalTile(currentRow, currentColNum, piece.dataset.color, rowDistance, colDistance, true, false, array)) {
        rowDistance--
        colDistance++
    }
}



function createKnightPossibleMoves(piece, array) {
    let currentColNum = Number(piece.dataset.colNum);
    let currentRow = Number(piece.dataset.row);

    checkLTile(currentRow, currentColNum, piece.dataset.color, 2, 1, array)
    checkLTile(currentRow, currentColNum, piece.dataset.color, 2, -1, array)
    checkLTile(currentRow, currentColNum, piece.dataset.color, -2, 1, array)
    checkLTile(currentRow, currentColNum, piece.dataset.color, -2, -1, array)
    checkLTile(currentRow, currentColNum, piece.dataset.color, 1, 2, array)
    checkLTile(currentRow, currentColNum, piece.dataset.color, 1, -2, array)
    checkLTile(currentRow, currentColNum, piece.dataset.color, -1, 2, array)
    checkLTile(currentRow, currentColNum, piece.dataset.color, -1, -2, array)

}


function createQueenPossibleMoves(piece, array) {
    createRookPossibleMoves(piece, array)
    createBishopPossibleMoves(piece, array)
}

function createKingPossibleMoves(piece, array) {
    let currentColNum = Number(piece.dataset.colNum);
    let currentRow = Number(piece.dataset.row);

    checkVerticalTile(currentRow, currentColNum, piece.dataset.color, 1, true, array)
    checkVerticalTile(currentRow, currentColNum, piece.dataset.color, -1, true, array)
    checkHorizontalTile(currentRow, currentColNum, piece.dataset.color, 1, true, array)
    checkHorizontalTile(currentRow, currentColNum, piece.dataset.color, -1, true, array)
    checkDiagonalTile(currentRow, currentColNum, piece.dataset.color, 1, 1, true, false, array)
    checkDiagonalTile(currentRow, currentColNum, piece.dataset.color, 1, -1, true, false, array)
    checkDiagonalTile(currentRow, currentColNum, piece.dataset.color, -1, -1, true, false, array)
    checkDiagonalTile(currentRow, currentColNum, piece.dataset.color, -1, 1, true, false, array)
    checkCastlingTiles(piece, array)

}

function checkCastlingTiles(piece, array) {
    if (piece.dataset.moved == "false") {
        let currentRow = Number(piece.dataset.row);
        let rookTile1 = document.querySelector(`#A${currentRow}`)
        let rookTile2 = document.querySelector(`#H${currentRow}`)
        if (rookTile1.dataset.occupied == "true") {
            let rook1 = rookTile1.querySelector(".chessPiece");
            if (rook1.dataset.type == "Rook" && rook1.dataset.color == piece.dataset.color) {
                if (rook1.dataset.moved == "false") {
                    if (document.querySelector(`#F${currentRow}`).dataset.occupied == "false" && document.querySelector(`#G${currentRow}`).dataset.occupied == "false") {
                        //createPossibleMove(currentRow, "G", array)
                        array.push(["G", currentRow])
                    }
                }
            }
        }

        if (rookTile2.dataset.occupied == "true") {
            let rook2 = rookTile2.querySelector(".chessPiece");
            if (rook2.dataset.type == "Rook" && rook2.dataset.color == piece.dataset.color) {
                if (rook2.dataset.moved == "false") {
                    if (document.querySelector(`#B${currentRow}`).dataset.occupied == "false" && document.querySelector(`#C${currentRow}`).dataset.occupied == "false" 
                    && document.querySelector(`#D${currentRow}`).dataset.occupied == "false") {
                        array.push(["C", currentRow])
                        //createPossibleMove(currentRow, "C", array)
                    }
                }
            }
        }
    }
}


function castleRook(piece, target) {
    if (piece.dataset.type ==  "King" && piece.dataset.moved == "false") {
        if (target.dataset.row == piece.dataset.row) {
            if (target.dataset.col == "G") {
                let edgeTile = document.querySelector(`#H${piece.dataset.row}`)
                edgeTile.dataset.occupied = "false";
                let currentRook = edgeTile.querySelector(".chessPiece")
                let targetTile = document.querySelector(`#F${piece.dataset.row}`)
                targetTile.appendChild(currentRook);
                targetTile.dataset.occupied = "true";
                currentRook.dataset.position = targetTile.id;
                currentRook.dataset.moved = "true";
                currentRook.dataset.colNum = targetTile.dataset.colNum;
                currentRook.dataset.col = targetTile.dataset.col;
                currentRook.dataset.row = targetTile.dataset.row;
            }
            else if (target.dataset.col == "C") {
                let edgeTile = document.querySelector(`#A${piece.dataset.row}`)
                edgeTile.dataset.occupied = "false";
                let currentRook = edgeTile.querySelector(".chessPiece")
                let targetTile = document.querySelector(`#D${piece.dataset.row}`)
                targetTile.appendChild(currentRook);
                targetTile.dataset.occupied = "true";
                currentRook.dataset.position = targetTile.id;
                currentRook.dataset.moved = "true";
                currentRook.dataset.colNum = targetTile.dataset.colNum;
                currentRook.dataset.col = targetTile.dataset.col;
                currentRook.dataset.row = targetTile.dataset.row;
            }

        }
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function createPossibleMove(col, row) {
    let currentPossibleMove = document.createElement('div')
    currentPossibleMove.classList.add('possibleMove')
    //console.log(`${col}${row}`)
    let tile = document.querySelector(`#${col}${row}`)

    //if (tile.dataset.occupied == "true") {
        //currentPossibleMove.style.backgroundColor = "red"
    //}
    tile.appendChild(currentPossibleMove)
}

function clearPossibleMoves() {
    document.querySelectorAll('.possibleMove').forEach(item => {
        item.remove();
    });
    possibleMovesList = [];
    playerMovesList = [];
    enemyMovesList = [];
}

function checkPossibleMoves(piece, array) {

    switch(piece.dataset.type) {
        case "Pawn":
            createPawnPossibleMoves(piece, array)
            break;
        case "Rook":
            createRookPossibleMoves(piece, array) 
            break; 
        case "Bishop":
            createBishopPossibleMoves(piece, array)
            break; 
        case "Knight":
            createKnightPossibleMoves(piece, array)
            break; 
        case "Queen":
            createQueenPossibleMoves(piece, array)
            break; 
        case "King":
            createKingPossibleMoves(piece, array)
            break; 
    }

}


function getAllEnemyMoves(piece) {
    enemyMovesList = [];
    let currentColor = piece.dataset.color;
    let enemyPieceList;
    currentColor == "white" ? enemyPieceList = blackPiecesList : enemyPieceList = whitePiecesList;

    enemyPieceList.forEach((item) => {
        checkPossibleMoves(item, enemyMovesList)
    })   
}

function kingNotSafe(pColor) {
    let king = document.querySelector(`.${pColor.substring(0, 1)}King`);
    let kingTile = king.parentNode;

    for (let i = 0; i < enemyMovesList.length; i++) {
        if (kingTile.dataset.col == enemyMovesList[i][0] && kingTile.dataset.row == enemyMovesList[i][1]) {
            console.log("Invalid. King would be in check!")
            return true
        }
    }
    return false;
}

function createAllPossibleMoves(piece) {
    playerMovesList.forEach((move) => {
        if (piece.dataset.type != "King") {
            createPossibleMove(move[0], move[1])
        }
        else {
            getAllEnemyMoves(piece)
            let exists = false;
            for (let i = 0; i < enemyMovesList.length; i++) {
                if (move[0] == enemyMovesList[i][0] && move[1] == enemyMovesList[i][1]) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                createPossibleMove(move[0], move[1])
            }
        }
    })
}


function createAllPossibleMoves2(piece) {
    playerMovesList.forEach((move) => {
        if (piece.dataset.type != "King") {
            createPossibleMove(move[0], move[1])
        }
        else {
            getAllEnemyMoves(piece)
            let exists = false;
            for (let i = 0; i < enemyMovesList.length; i++) {
                if (move[0] == enemyMovesList[i][0] && move[1] == enemyMovesList[i][1]) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                createPossibleMove(move[0], move[1])
            }
        }
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function createClickablePossibleMoves(piece, oldParent) {
    document.querySelectorAll(".possibleMove").forEach((possibleMove) => {
        possibleMove.addEventListener('click', (e) => {
            piece.classList.remove("bigger")

            castleRook(piece, possibleMove.parentNode)
            if (dropPiece(piece, possibleMove.parentNode, oldParent)) {
                if (singleplayer == false) {
                    moveData = {
                        dragItem: piece.id,
                        originalSpot: oldParent.id,
                        drop: possibleMove.parentNode.id,
                        enemy: friend
                        //match: matchRoom
                    }
            
                    socket.emit('new move', moveData) 
                }
                nextTurn();
            }       
        })
    })
     
}


function checkDrop(coordinate, container) {
  if (coordinate.x <= container.getBoundingClientRect().x + container.getBoundingClientRect().width && coordinate.x >= container.getBoundingClientRect().x) {
    if ((coordinate.y >= container.getBoundingClientRect().y) && (coordinate.y <= container.getBoundingClientRect().y + container.getBoundingClientRect().height)) {
      dropSpot = container;
      return true
    }
  }
  else {
    dropSpot = "";
    return false
  }
}

function startMovingPiece(piece, eventTarget) {
    piece.style.cursor = "grabbing"
    piece.style.zIndex = 9999
    piece.style.position = "absolute";
    piece.style.left = (eventTarget.clientX) - (piece.offsetWidth/2) + window.scrollX + 'px'
    piece.style.top = (eventTarget.clientY) - (piece.offsetHeight/1.2) + window.scrollY + 'px'
    document.body.appendChild(piece)
    offSet = [piece.offsetLeft - eventTarget.clientX, piece.offsetTop - eventTarget.clientY]
}

function dropPiece(piece, targetSpot, parent) {
    piece.style.removeProperty('left');
    piece.style.removeProperty('top');
    piece.style.zIndex = 1234;
    piece.style.position = "relative";
    let pieceMoved = piece.dataset.moved;

    let targetCurrentPiece = "";
    let targetOccupied = "false";
    if (targetSpot.dataset.occupied == "true")
    {
        targetCurrentPiece = targetSpot.querySelector(".chessPiece")
        targetOccupied = "true"
        removePiece(targetCurrentPiece)
    }

    parent.dataset.occupied = "false"
    targetSpot.appendChild(piece);
    targetSpot.dataset.occupied = "true";

    piece.dataset.position = targetSpot.id;
    piece.dataset.moved = "true";
    piece.dataset.colNum = targetSpot.dataset.colNum;
    piece.dataset.col = targetSpot.dataset.col;
    piece.dataset.row = targetSpot.dataset.row;

    getAllEnemyMoves(piece);
    if (kingNotSafe(piece.dataset.color)) {
        resetPiecePosition(piece, parent)
        piece.dataset.moved = pieceMoved;
        targetSpot.dataset.occupied = targetOccupied;
        if (targetCurrentPiece != "") {
            targetSpot.appendChild(targetCurrentPiece)
            undoRemovePiece(targetCurrentPiece)
            console.log("Invalid. King would be in check!")
        }
        return false;
    }

    return true


}

function undoDrop(elem, parent) {
    resetPiecePosition(elem, parent)
    parent.dataset.occupied = "true";

    elem.dataset.position = parent.id;
    elem.dataset.colNum = parent.dataset.colNum;
    elem.dataset.col = parent.dataset.col;
    elem.dataset.row = parent.dataset.row;
 
}


function resetPiecePosition(elem, parent) {
    elem.style.position = "relative";
    elem.style.removeProperty('left');
    elem.style.removeProperty('top');
    elem.style.zIndex = 1234;
    parent.appendChild(elem);
    parent.dataset.occupied = "true";


    elem.dataset.position = parent.id;
    elem.dataset.colNum = parent.dataset.colNum;
    elem.dataset.col = parent.dataset.col;
    elem.dataset.row = parent.dataset.row;
}




function clearDragInfo() {
    dropSpot = "";
}


function customMouseDragEvents(element, elementParent) {
    element.addEventListener('mousedown', (e) => {
      //e.preventDefault()

        if (e.target.dataset.color == currentTurn && playerColor == currentTurn) {
            if (!clicked) {
                dragTarget = e.target;
                elementParent = dragTarget.parentNode;
                clearPossibleMoves()
                document.querySelectorAll(".gridTile").forEach((tile) => {
                    tile.classList.remove("highlight")
                })
                dragTarget.classList.add("bigger")
                elementParent.classList.add("highlight")
                checkPossibleMoves(dragTarget, playerMovesList)
                createAllPossibleMoves(dragTarget)
                possibleMovesList = document.querySelectorAll(".possibleMove")
                createClickablePossibleMoves(dragTarget, elementParent) 
                startMovingPiece(dragTarget, e)
                clicked = true;
            }
        }
    })
  
    element.addEventListener('mouseup', (e) => { 
        if (dragTarget != "") {
            dragTarget.style.cursor = "grab"
            dragTarget.classList.remove("bigger")
        }
        let currentMouse = {
            x : e.clientX,
            y : e.clientY
        };

        if (clicked == true) {
            for (let i = 0; i < possibleMovesList.length; i++) {
                if (checkDrop(currentMouse, possibleMovesList[i].parentNode)) {
                    break;
                }
            }
            if (dropSpot != "") {
                castleRook(dragTarget, dropSpot) 
                if (dropPiece(dragTarget, dropSpot, elementParent)) {
                    if (singleplayer == false) {
                        moveData = {
                            dragItem: dragTarget.id,
                            originalSpot: elementParent.id,
                            drop: dropSpot.id,
                            enemy: friend
                            //match: matchRoom
                        }
                
                        socket.emit('new move', moveData) 
                    }
                    nextTurn();
                }
            }
            else {
                dragTarget.classList.remove("bigger")
                resetPiecePosition(dragTarget, elementParent);
            }
        }

        clicked = false;
        clearDragInfo() 
    })

}


function customTouchDragEvents(element, elementParent) {
    element.addEventListener('touchstart', (e) => {
        e.preventDefault()
        if (e.touches.length > 1) {  
          e.preventDefault();
        }


        if (e.target.dataset.color == currentTurn && playerColor == currentTurn) {
            if (!clicked) {
                dragTarget = e.target;
                elementParent = dragTarget.parentNode;
                clearPossibleMoves()
                document.querySelectorAll(".gridTile").forEach((tile) => {
                    tile.classList.remove("highlight")
                })
                dragTarget.classList.add("bigger")
                elementParent.classList.add("highlight")
                checkPossibleMoves(dragTarget, playerMovesList)
                createAllPossibleMoves(dragTarget)
                possibleMovesList = document.querySelectorAll(".possibleMove")
                createClickablePossibleMoves(dragTarget, elementParent) 
                startMovingPiece(dragTarget, e.touches[0])
                clicked = true 
            }
        }
          
    }, { passive: false})
    
     
    
    element.addEventListener('touchend', (e) => { 
        let currentTouch = {
            x : e.changedTouches[0].clientX,
            y : e.changedTouches[0].clientY
        };
        if (clicked == true) {
            for (let i = 0; i < possibleMovesList.length; i++) {
                if (checkDrop(currentTouch, possibleMovesList[i].parentNode)) {
                    break;
                }
            }
            if (dropSpot != "") {
                dragTarget.classList.remove("bigger")
                castleRook(dragTarget, dropSpot) 
                if (dropPiece(dragTarget, dropSpot, elementParent)) {
                    if (singleplayer == false) {
                        moveData = {
                            dragItem: dragTarget.id,
                            originalSpot: elementParent.id,
                            drop: dropSpot.id,
                            enemy: friend
                            //match: matchRoom
                        }
                
                        socket.emit('new move', moveData) 
                    }
                    nextTurn();
                }
            }
            else {
                dragTarget.classList.remove("bigger")
                resetPiecePosition(dragTarget, elementParent);
            }
        }
        
        clicked = false;

        clearDragInfo()
    }) 

}


function createDraggable(elem) {
    let dragParent;
    customMouseDragEvents(elem, dragParent)
    customTouchDragEvents(elem, dragParent)
}

document.addEventListener('mousemove', (e) => {
    if (clicked == true) {
      dragTarget.style.left = (e.clientX + offSet[0]) + 'px'
      dragTarget.style.top = (e.clientY+ offSet[1]) + 'px' 
    } 
})

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {  
       e.preventDefault();
    }
    if (clicked == true) {
      dragTarget.style.left = (e.touches[0].clientX + offSet[0]) + 'px'
      dragTarget.style.top = (e.touches[0].clientY+ offSet[1]) + 'px' 
    } 
}, { passive: false})



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createOnlinePlayersDropdown() {
    const dropDown =  document.getElementById('myDropdown');
    dropDown.classList.toggle("show");
    const dropDownBtn = document.querySelector('.dropdownBtn');
    dropDownBtn.classList.toggle("clicked");

    window.onclick = function stopShow(event) {
        if (!event.target.matches('.dropdownBtn')) {
            const dropdowns = document.querySelector('.dropdownContent');
            if (dropdowns.classList.contains('show')) {
                dropdowns.classList.remove('show')
            }
        }
    }
}


function showOnlineUsers(msg) {
    while (playersOnline.firstChild) {
        playersOnline.firstChild.remove()
    }

    let showPlayers = document.createElement('button');
    showPlayers.setAttribute('id', 'showPlayers')
    showPlayers.setAttribute('class', 'dropdownBtn')
    let playerCount = msg.length - 1
    if (playerCount <= 0) {playerCount = 0}
    showPlayers.innerHTML = `${playerCount} Players Online: &#9776`
    playersOnline.appendChild(showPlayers)


    const myDropdown = document.createElement('div')
    myDropdown.setAttribute('id', 'myDropdown')
    myDropdown.setAttribute('class', 'dropdownContent')
    

    for (const player of msg) {
        if (player != user) {
            let newPlayer = document.createElement('a')
            newPlayer.setAttribute('class', 'online')
            newPlayer.textContent = player;
            myDropdown.appendChild(newPlayer)
            newPlayer.addEventListener('mousedown', (msg) => {
                clickSelection = player
                createRequestNotification(msg, `Send match request to ${clickSelection}?`, userInterfaceDiv, 'Send &#10004', 'Cancel &#10006', 'send', 'cancel')
            }) 
        }
    }

    playersOnline.appendChild(myDropdown)

    showPlayers.addEventListener('click', (e) => {
        createOnlinePlayersDropdown()
    })
}

function createNewUser(userN) {
    friend = ""
    if (userN != "" && userN.length <= 14) {
        socket = io()
        user = userN.toLowerCase()
        turnOnSocket()
        socket.emit("create user", user)
    }
    else {alert('Invalid')}
    userN = ""
}

userCreate.addEventListener('submit', (e) => {
    e.preventDefault();
    createNewUser(userName.value)   
})


function searchNewFriend(friendN) {
    if (friendN != "") {
        possibleFriend = friendN.toLowerCase()
        socket.emit("search friend", [user, possibleFriend, 'black'])     
    }
}

searchFriendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchNewFriend(friendName.value)
    friendName.value = ""
})


function acceptMatch(msg) {
    socket.emit("disconnect friend", [friend, user]);
    friend = msg[0];
    playerColor = 'white'
    socket.emit('accept match', [friend, user, 'black'])
    matchRoom = `${friend}+${user}`
    singleplayer = false
    startGame(playerColor)
}

function rejectMatch(msg) {
    socket.emit('reject match', [msg[0], user, `${user} has rejected your match` ])
}

function sendInvite() {
    searchNewFriend(clickSelection)
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function turnOnSocket() {
    if (socket != null) {
        socket.on('valid user', (msg) => {
            createAccountUI.classList.add('hide');
            searchFriendDiv.classList.remove('hide')
        })
        
        socket.on('not valid', (msg) => {
            createErrorNotification(msg, userInterfaceDiv)
            socket.emit("disconnect function", (msg))
            socket = null
        })

        socket.on('players online', (msg) => {showOnlineUsers(msg)})

        socket.on('not online', (msg) => {
            createErrorNotification(msg, userInterfaceDiv)
        })

        socket.on('friend found', (msg) => {
            console.log(msg)
        })

        socket.on('request match', (msg) => {
            createRequestNotification(msg, msg[2], userInterfaceDiv, 'Accept &#10004', 'Reject &#10006', 'accept', 'reject')
        })


        socket.on('reject match', (msg) => {
            createErrorNotification(msg, userInterfaceDiv)
        })

        socket.on('disconnect friend', (msg) => {
            friend = ""
            clearBoard()
            createErrorNotification(msg, gameContainer)
            socket.emit('disconnect accepted', (msg))
        })


        socket.on('player color', (msg) => {
            socket.emit("disconnect friend", [friend, user]);
            friend = msg[1];
            socket.emit("game start", ([friend, user]))
            playerColor = msg[0];
            matchRoom = msg[1]
            singleplayer = false
            startGame(playerColor)
        })

        socket.on('accept rematch', (msg) => {
            winnerDiv.classList.add('hide');
            socket.emit("game start", ([friend, user]))
            playerColor = msg[0];
            matchRoom = msg[1]
            singleplayer = false
            startGame(playerColor)
        })

        socket.on('new move', changeMove) 

    }
}


function changeMove(message) {
    let piece = document.getElementById(message.dragItem);
    let parent = document.getElementById(message.originalSpot);
    let drop = document.getElementById(message.drop);
    castleRook(piece, drop) 
    dropPiece(piece, drop, parent)
    nextTurn()
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createErrorNotification(msg, parent) {
    const messageDiv = document.createElement('div')
    messageDiv.classList.add('errorMessage')
    const messageText = document.createElement('p')
    messageText.textContent = msg
    messageText.classList.add('errorMessageText')
    messageDiv.appendChild(messageText)
    const closeBtn = document.createElement('button')
    closeBtn.classList.add('matchButton')
    closeBtn.innerHTML = 'Close &#10006'
    messageDiv.appendChild(closeBtn)
    parent.appendChild(messageDiv)

    closeBtn.addEventListener('click', (e) => { 
        messageDiv.remove()
    })
}


function createRequestNotification(msg, msgText, parent, acceptText, rejectText, acceptAction, rejectAction) {
    const messageDiv = document.createElement('div')
    messageDiv.classList.add('requestMessage')
    const messageText = document.createElement('p')
    messageText.textContent = msgText
    messageText.classList.add('requestMessageText')
    messageDiv.appendChild(messageText)

    const btnDiv = document.createElement('div')
    btnDiv.setAttribute('class', 'btnDiv')
    //btnDiv.style.display = 'flex';
    //btnDiv.style.gridTemplateColumns = '1fr 1fr'
    const acceptBtn = document.createElement('button')
    acceptBtn.classList.add('matchButton')
    acceptBtn.innerHTML = acceptText
    const closeBtn = document.createElement('button')
    closeBtn.classList.add('matchButton')
    closeBtn.innerHTML = rejectText

    btnDiv.appendChild(acceptBtn)
    btnDiv.appendChild(closeBtn)
    
    messageDiv.appendChild(btnDiv)

    parent.appendChild(messageDiv)

    acceptBtn.addEventListener('click', (e) => {
        if (acceptAction == 'send') {
            sendInvite()
        }
        else if (acceptAction == "accept") {
            acceptMatch(msg)
        }
        messageDiv.remove()
    })

    closeBtn.addEventListener('click', (e) => {
        if (rejectAction == 'reject') {
            rejectMatch(msg)
        }
        messageDiv.remove()
    })
}

function fadeIn(elem, increment, interval) {
    let opacity = 0
    let fadeI = setInterval(() => {
      opacity += increment//.05
      elem.style.opacity = opacity
      if (elem.style.opacity >= 1) {
        clearInterval(fadeI)
      } 
    }, interval) //20
}


