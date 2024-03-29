/* 
  Word game where a random word is selected, based on  
  the difficulty you pick (4 - 11), a grid is created  
  to capture your guesses, which are checked for validity  
  against a dictionary, providing hints, ig you get  
  correct letters, and their position.
*/

let tile = document.querySelector(".tile")
let square = document.querySelector(".guess-grid")
var slider = document.getElementById("myRange");
var output = document.getElementById("value");
const alertContainer = document.querySelector("[data-alert-container]")
const keyboard = document.querySelector("[data-keyboard]")
const guessGrid = document.querySelector("[data-guess-grid]")

// declarations for pop.js
const openModalButton = document.querySelectorAll('[data-modal-target]')
const closeModalButton = document.querySelectorAll('[data-close-button]')
const openInfoButton = document.querySelectorAll('[data-info-target]')
const closeInfoButton = document.querySelectorAll('[info-close-button]')
const overlay = document.getElementById('overlay')
const gear = document.querySelector(".options")  

// console.log(openInfoButton)

//check if touchevent is available  
let touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click'
// define grid width based on word size from difficulty slider   
let gridWidth
let scale = 4
let turns = 0
let Player = {
    totGame: 0,                 // Total number of games played  
    pWins: 0,                   // Total number of Wins  
    numGuess: 0,                // Number of guesses this game  
    avgNumGuess: 0.0,           // avgNumGuess  
    avgDiff: 0.0,               // avgDiff   
    lastGrid: 0                 // size of grid / difficulty in previous game  
}
const SAVE_KEY_SCORE = "wordle-dsmith73-player"   // save key for local storage of player data 
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500
// score handling (resetting / retrieving)
let scoreReset = false
let scoreStr

scoreReset === true ? 
    localStorage.setItem(SAVE_KEY_SCORE, JSON.stringify(Player)) : 
    scoreStr = localStorage.getItem(SAVE_KEY_SCORE)


// handle different screen sizes  
let screenHeight = window.innerHeight
let screenWidth = window.innerWidth

if (screenHeight < 850 || screenWidth < 475) scale = 3


function destroyGrid() {
    // return grid to 1 child    
    square.innerHTML = '<div class="tile"></div>'
}

function startInteraction() {
    let activeTiles = guessGrid.querySelectorAll("[data-state]")
    if (activeTiles.length === 0 ) {
        gridWidth = parseInt(slider.value) 
        // determine the dimensions of the .guess-grid boxes  
        gridWidth > 7 ? gridWidth > 9 ? scale = scale - 1.5 : scale = scale - 1 : scale
        // update .guess-grid to the length of the word & set box dimensions   
        square.setAttribute('style', `grid-template-columns: repeat(${gridWidth}, ${scale}em);
                                        grid-template-rows: repeat(6, ${scale}em);`);
        // setup the grid based on the length of the random word  
        for (let i=0; i < (gridWidth * 6) -1; i++) {
            const newBox = tile.cloneNode()
            square.appendChild(newBox)
        }
    }

    document.addEventListener("keydown", handleKeyPress)
    keyboard.addEventListener(touchEvent, handleMouseClick)
}

function getPlayerInfo(scoreStr) {
    scoreReset === true ? scoreStr = localStorage.getItem(SAVE_KEY_SCORE) : scoreStr

    // Get locally saved object and load into Player{}  
    // if new player, use values in Player, otherwise, load pObject values  
    if (scoreStr === null ) {
        Player
    } else {
        var pObject = JSON.parse(scoreStr)
        Player.totGame      = pObject.totGame
        Player.pWins        = pObject.pWins 
        Player.avgNumGuess  = pObject.avgNumGuess 
        Player.lastGrid     = pObject.lastGrid
        Player.avgDiff      = pObject.avgDiff
    }

    console.log(Player)
}

function stopInteraction() {
    document.removeEventListener("keydown", handleKeyPress)
    keyboard.removeEventListener(touchEvent, handleMouseClick)
}

function handleMouseClick(e) {
    // console.log(e)
    if (e.target.matches("[data-key]")) {
        // console.log(e)
        pressKey(e.target.dataset.key)
        return
    }
    if (e.target.matches("[data-enter]")) {
        submitGuess()
        return
    }
    if (e.target.matches("[data-delete]")) {
        deleteKey()
        return
    }
    if (e.target.matches("slider")) {
        
        return
    }
}

function handleKeyPress(e) {
    // console.log(e)
    if (e.key === "Enter") {
        submitGuess()
        return
    }
    if (e.key === "Delete" || e.key === "Backspace") {
        deleteKey()
        e.preventDefault()
        return
    }
    if (e.key.match(/^[a-z]$/)) {
        pressKey(e.key)
        return
    }
}

function pressKey(key) {
    const activeTiles = getActiveTiles()
    // prevent user from typing past the end of the row  
    if (activeTiles.length >= gridWidth) return
    // select first tile that doesn't already have a letter on it  
    const nextTile = guessGrid.querySelector(":not([data-letter])")
    nextTile.dataset.letter = key.toLowerCase()
    nextTile.textContent = key
    nextTile.dataset.state = "active"

}

function getActiveTiles() {
    return guessGrid.querySelectorAll('[data-state="active"]')
}

async function submitGuess() {
    const activeTiles = [...getActiveTiles()]
    if (activeTiles.length !== gridWidth) {
        showAlert("Word isn't long enough")
        shakeTiles(activeTiles)
        return
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter
    }, "")

    let answer = await checkWord(guess)


    if (answer === undefined) {
        showAlert("Not a real word")
        shakeTiles(activeTiles)
        return
    } else {
        stopInteraction()
        activeTiles.forEach((...params) => flipTile(...params, guess))
    }
}

function flipTile(tile, index, array, guess) {
    const letter = tile.dataset.letter
    const key = keyboard.querySelector(`[data-key="${letter}"i]`)
    setTimeout(() => {
        tile.classList.add("flip")
    }, (index * FLIP_ANIMATION_DURATION) /2)

    tile.addEventListener("transitionend", () => {
        tile.classList.remove("flip")
        if (wordOfTheDay[index] === letter) {
            tile.dataset.state = "correct"
            key.classList.add("correct")
        } else if (wordOfTheDay.includes(letter)) {
            tile.dataset.state = "wrong-location"
            key.classList.add("wrong-location")            
        } else {
            tile.dataset.state = "wrong"
            key.classList.add("wrong")  
        }

        if (index === array.length -1) {
            tile.addEventListener("transitionend", () => {
                startInteraction()
                checkWinLose(guess, array)
            }, {once: true})
        }
    }, {once: true})
    
    turns++
}

function deleteKey() {
    const activeTiles = getActiveTiles()
    const lastTile = activeTiles[activeTiles.length -1]
    if (lastTile == null) return
    lastTile.textContent = ""
    delete lastTile.dataset.state
    delete lastTile.dataset.letter
}

function showAlert(message, duration = 1000) {
   const alert = document.createElement("div") 
   alert.textContent = message
   alert.classList.add("alert")
   alertContainer.prepend(alert)
   if (duration == null) return

   setTimeout(() => {
    alert.classList.add("hide")
    alert.addEventListener("transitionend", () => {
        alert.remove()
    })
   }, duration)
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake")
        tile.addEventListener("animationend", () => {
            tile.classList.remove("shake")
        }, {once: true})
    })
}



function checkWinLose(guess, tiles) {
    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")

    if (guess === wordOfTheDay) {
        showAlert("You WIN!!", 5000)
        danceTiles(tiles)
        Player.pWins++
        Player.numGuess     = 6 - (remainingTiles.length / gridWidth)
        // running AVG = ((previous avg Guesses * previous total games) + new guesses) / new total games
        Player.avgNumGuess  = ((Player.avgNumGuess * Player.totGame) + Player.numGuess) / (Player.totGame + 1)
        Player.avgDiff      = ((Player.avgDiff * Player.totGame) + gridWidth) / (Player.totGame + 1)
        Player.lastGrid     = gridWidth
        Player.totGame++
        localStorage.setItem(SAVE_KEY_SCORE, JSON.stringify(Player))     // save Player info in local storage 
        console.log("Winner, Winner, Chicken Dinner!")
        stopInteraction()
        return
    }

    if (remainingTiles.length === 0) {
        showAlert(wordOfTheDay.toUpperCase(), null)
        Player.pWins        = Player.pWins
        Player.numGuess     = 6
        Player.avgNumGuess  = ((Player.avgNumGuess * Player.totGame) + Player.numGuess) / (Player.totGame + 1)
        Player.avgDiff      = ((Player.avgDiff * Player.totGame) + gridWidth) / (Player.totGame + 1)
        Player.lastGrid     = gridWidth
        Player.totGame++
        localStorage.setItem(SAVE_KEY_SCORE, JSON.stringify(Player))     // save Player info in local storage 
        console.log("Loser, loser, Punkey Brewster!")
        stopInteraction()
    }
}

function danceTiles(tiles){
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance")
            tile.addEventListener("animationend", () => {
                tile.classList.remove("dance")
            }, {once: true})
        }, (index * DANCE_ANIMATION_DURATION) /5)

    })
}

