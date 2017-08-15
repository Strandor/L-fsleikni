/*
  Code created by Steinar <steinar[at]leikirnir.is>
  All rights reserved
*/

/*
  Variables
*/
const version = '1.0';

var canvas; // GameCanvas for the game id='gameCanvas'
var ctx; // Context to draw on the gameCanvas

var GAMESTATE = {  // Enums for the current state of the game
  MENU : {name: "Menu"},
  SELECTOR : {name: "Selector"},
  INFO : {name: "Info"},
  GAME : {name: "Game"},
  PAUSED : {name: "Paused"},
  QUESTIONS : {name: "Questions"},
  DEAD : {name: "Dead"},
  END : {name: "End"}
};

var currentGameState = GAMESTATE.MENU; // Stores the currentState of the game
const framesPerSecond = 30; // Value for how many times the canvas should be updated per sec
var gameUpdate;

//Extra
var canJump = true;

// Mouse
var mouseX = 0;
var mouseY = 0;

// Audio
var theme_menu_song;
var game_menu_song = new Audio("assets/sound/game_menu.mp3");
game_menu_song.loop = true;

var questionSong = new Audio('assets/sound/question.mp3');

var endSong = new Audio('assets/sound/end.mp3');
endSong.loop = true;

/*
  Events
  (Events for the website)
*/
window.onLoad = new function() { //Start function onLoad
  canvas = document.getElementById("gameCanvas"); // Sets the value for the gameCanvas
  ctx = canvas.getContext("2d"); // Sets the value for the context

  updateCanvas(); // Update the canvas size to the full size of client screen
  gameUpdate = setInterval(drawGame, 1000/framesPerSecond); // Repeats the function 1000/frames per second
  startMenu(); // Starts the menu song
  gameLog('Game has finished loading the menu screen');
}
window.addEventListener('contextmenu', event => event.preventDefault()); // Cancel right click on the wbsite
window.addEventListener("resize", function() {
  updateCanvas();
  if(currentGameState == GAMESTATE.END) {
      drawEnd();
  } else if(currentGameState == GAMESTATE.PAUSED) {
    drawPause();
  }
}, false); // Update canvas size on window size change
canvas.addEventListener('mousemove', function(evt) {
  mouseX = event.clientX;
  mouseY = event.clientY;
}, false);
canvas.addEventListener('click', function() {
  if((currentGameState == GAMESTATE.SELECTOR) && (selectorContains())) {
    shouldFade = true;
  } else if(currentGameState == GAMESTATE.MENU) {
    if(mouseX >= canvas.width-credit.width*1.5 && mouseY >= canvas.height-credit.width) {
      openCredits();
    }
  } else if(currentGameState == GAMESTATE.END) {
    if(endMenuContains() == true) {
      stopEnd();
      startMenu();
      setState(GAMESTATE.MENU);
    } else if(endMenuContainsSecond() == true) {
      openCredits();
    }
  }
}, false);
document.onkeypress = function(e) { // Listen if user clicks on a key
    e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;

    if (charCode) {
        if(String.fromCharCode(charCode) == " ") {
            if(currentGameState == GAMESTATE.MENU) {
              var audio = new Audio('assets/sound/start.ogg');
              audio.play();
              setState(GAMESTATE.SELECTOR);
            } else if(currentGameState == GAMESTATE.DEAD) {
              setState(GAMESTATE.GAME);
              setupGame();
            }
        } else if(String.fromCharCode(charCode) == "p" || String.fromCharCode(charCode) == "P") {
          gameLog('The music has been stopped by keystroke');
          theme_menu_song.pause();
        }
    }
};
document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key == "Escape" || evt.key == "Esc");
    } else {
        isEscape = (evt.keyCode == 27);
    }
    if (isEscape) {
        if(currentGameState == GAMESTATE.SELECTOR) {
          setState(GAMESTATE.MENU);
        } else if(currentGameState == GAMESTATE.GAME) {
          setState(GAMESTATE.PAUSED);
        } else if(currentGameState == GAMESTATE.PAUSED) {
          setupGame();
          setState(GAMESTATE.GAME);
        }
    }

    if(currentGameState == GAMESTATE.GAME) {
      if(evt.keyCode == 32 && canJump == true){
          canJump = false;
          hivY = hivY - 100;
      }
    } else if(currentGameState == GAMESTATE.QUESTIONS) {
      if(evt.keyCode == 40) {
        if(currentQuestionID == 3) {
          currentQuestionID = 1;
        } else {
          currentQuestionID += 1;
        }
      } else if(evt.keyCode == 38) {
        if(currentQuestionID == 1) {
          currentQuestionID = 3;
        } else {
          currentQuestionID -= 1;
        }
      } else if(evt.keyCode == 13) {
        answearQuestion();
      }
    }
};

document.onkeyup = function(evt) {
  evt = evt || window.event;
  if(currentGameState == GAMESTATE.GAME) {
    if(evt.keyCode == 32){
      canJump = true;
    }
  }
}

/*
  Draw functions
*/
var button = 0; // LocY for the start text
var fade = 0.0; // Fade value for the start text

var skyY = 0;
var skySpeed = 0.7;

var backImg = new Image();
backImg.src = 'assets/image/background.png';
var backSkyImg = new Image();
backSkyImg.src = 'assets/image/background_sky.png';
var logoImg = new Image();
logoImg.src = 'assets/image/logo.png';
var credit = new Image();
credit.src = 'assets/image/credits.png';


// Draw the menu
function drawGame() {
    //Default Background
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // Background Image
    drawImageProp(ctx, backImg, 0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    drawImageProp(ctx, backSkyImg, 0, skyY, canvas.width, canvas.height);

    //Copyright
    ctx.font = "10px Arial";
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText("Leikirnir Network 2017 | Version: " + version ,5, canvas.height-5);

    // Play Text
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = "rgba(255, 255, 255, " + fade + ")";
    ctx.textAlign = 'center';
    ctx.fillText('SMELLTU Á "BIL" TAKKANN TIL AÐ SPILA LEIKINN!',canvas.width/2, canvas.height/20*19-button);

    // Logo image
    ctx.drawImage(logoImg,calcMiddle(canvas.width, logoImg.width),canvas.height/5*1);

    // credits
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(credit,canvas.width-(credit.width)*1.5-5,canvas.height-(credit.height)*1.5-5, credit.width*1.5, credit.height*1.5);

    skyY = skyY + skySpeed;
    if(skyY >= 30) {
      skySpeed = -skySpeed;
    } else if(skyY <= -30) {
      skySpeed = -skySpeed;
    }
    // Change the value for the start text
    if(button <= 50) {
      button = button + 2;
    }

    if(fade <= 1.0) {
      fade = fade + 0.03;
    }
}

// Selector Images
var stoneBackground = new Image();
stoneBackground.src = 'assets/image/menu_background.png';

var menu = new Image();
menu.src = 'assets/image/menu_selection.png';

var stage1a = new Image();
stage1a.src = 'assets/image/menu_1.png';

var stage1b = new Image();
stage1b.src = 'assets/image/menu_12.png';

// var
var selection = 0;
var selectionSpeed = 15;
var stage1Time = 0;
var shouldFade = false;
var fadeSelection = 0.0;
function drawSelection() {
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width, canvas.height);

  //Stone background
  ctx.imageSmoothingEnabled = false;
  drawImageProp(ctx, stoneBackground, 0, 0, canvas.width, canvas.height);

  // Menu
  ctx.drawImage(menu, 0, 0, canvas.width, canvas.height);

  // Stage1
  ctx.font = canvas.height/40 + "px 'Press Start 2P'";
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText("HIV/AIDS",canvas.width/4.5, canvas.height/5*2.2-selection/2);

  if(stage1Time <= 30) {
    ctx.drawImage(stage1a, 0, 0, canvas.width, canvas.height - selection);
  } else {
    ctx.drawImage(stage1b, 0, 0, canvas.width, canvas.height - selection);
    if(stage1Time >= 60) {
      stage1Time = 0;
    }
  }

  stage1Time = stage1Time + 1;
  if((selection <= 30) && (selectorContains() == true)) {
      selection = selection + selectionSpeed;
  } else if((selection >= 0) && !(selectorContains() == true)) {
    // !(mouseX <= canvas.width/3.166 && mouseX >= canvas.width/7.6)
    selection = selection - selectionSpeed;
  }

  // Fade Out
  if(shouldFade == true) {
    ctx.fillStyle = "rgba(0, 0, 0, " + fadeSelection + ")";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    theme_menu_song.volume = 1.0 - fadeSelection;
    if(fadeSelection < 1.0) {
      fadeSelection = fadeSelection + 0.05;
    }
  }
   if(fadeSelection > 1.0) {
    setState(GAMESTATE.INFO);
    theme_menu_song.pause();
  }
}


var infoFade = 0.1;
var fadeDone = false;
function drawInfo() {
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width, canvas.height);

  ctx.font = canvas.height/40 + "px 'Press Start 2P'";
  ctx.fillStyle = "rgba(255, 255, 255, " + infoFade + ")";
  ctx.textAlign = 'center';
  ctx.fillText("HIV/AIDS nær aðeins að berast gegnum blóð eða öðrum vökvum.",canvas.width/2, canvas.height/2-20);

  ctx.font = canvas.height/55 + "px 'Press Start 2P'";
  ctx.fillStyle = "rgba(255, 255, 255, " + infoFade + ")";
  ctx.textAlign = 'center';
  ctx.fillText("Það eru til lyf fyrir HIV en enginn þeirra nær að stoppa það!",canvas.width/2, canvas.height/2+20);

  ctx.font = 10 + "px 'Press Start 2P'";
  ctx.fillStyle = "rgba(255, 255, 255, " + infoFade + ")";
  ctx.textAlign = 'left';
  ctx.fillText("Heimild: aids.gov",10, canvas.height-10);

  if(infoFade < 4.0) {
    if(infoFade <= 0.0) {
      setState(GAMESTATE.GAME);
      setupGame();
    } else if(fadeDone == false) {
      infoFade = infoFade + 0.03;
    } else if(fadeDone == true) {
      infoFade = infoFade - 0.03;
    }
  } else if(infoFade >= 4.0 && fadeDone == false) {
    infoFade = 1.0;
    fadeDone = true;
  }
}

var bloodStream = new Image();
bloodStream.src = 'assets/image/blood_stream.png';

var info = new Image();
info.src = 'assets/image/info.png';

var hiv_1 = new Image();
hiv_1.src = 'assets/image/hiv_1.png';

var t_Helper = new Image();
t_Helper.src = 'assets/image/t_helper.png';

var t_Helper_Infected = new Image();
t_Helper_Infected.src = 'assets/image/t_helper-2.png';

var hivStopper = new Image();
hivStopper.src = 'assets/image/pill.png';

var portal = new Image();
portal.src = 'assets/image/portal.png';

var introFade = 1.0;
var backgroundGame = 0;
var shouldTellLevel = true;

// HIV
var hivX = 50;
var hivY = 0; // TODO remove only fro testing

var time = 0;
var points = 0;

var infoBoard = 0;
var infoBoardText1 = 'null';
var infoBoardText2 = 'null';
var shouldInfo = false;
var shouldGo = false;

var portalX = 0;

function drawGame_AIDS() {
  var size = calculateAspectRatioFit(hiv_1.width, hiv_1.height, canvas.width/5, canvas.height/5);
  var realHivY =  (hivY/980)*canvas.height;

  // Blood background
  ctx.imageSmoothingEnabled = false;
  drawImageProp(ctx, bloodStream, 0, 0, canvas.width, canvas.height, backgroundGame, canvas.height/2);

  // Level Text
  if(shouldTellLevel == true) {
    ctx.font = (canvas.width - canvas.height)/20 + "px 'Press Start 2P'";
    ctx.fillStyle = "white";
    ctx.textAlign = 'left';
    ctx.fillText("HIV/AIDS: 1", canvas.width/4-(backgroundGame)*7500, canvas.height/2);
  }



  // Points
  ctx.font = (size.width+size.height)/40 + "px 'Press Start 2P'";
  ctx.fillStyle = "white";
  ctx.textAlign = 'left';
  ctx.fillText("Tími: " + Math.round(time/45), 20, 30);

  ctx.font = (size.width+size.height)/40 + "px 'Press Start 2P'";
  ctx.fillStyle = "white";
  ctx.textAlign = 'right';
  ctx.fillText("Stig: " + points, canvas.width-20, 30);



  hivY = hivY + 5;

  // t_helper
  for (i = 0; i < tcells.length; i++) {
    var cell = tcells[i];
    var realCellY = calcMiddle(canvas.height, t_Helper.height)+(cell.cellY/300)*canvas.height;

    cell.cellX = cell.cellX - 3;
    cell.cellY = cell.cellY + cell.cellSpeedY;

    var pointy = realHivY + size.height/2;
    var pointx = hivX + size.width/2;

    if(cell.cellY >= 30 || cell.cellY <= -30) {
      cell.cellSpeedY = -cell.cellSpeedY;
    }
    ctx.imageSmoothingEnabled = false;
    if(cell.infected == false) {
      ctx.drawImage(t_Helper, cell.cellX, realCellY, size.width, size.height);
    } else {
      ctx.drawImage(t_Helper_Infected, cell.cellX, realCellY, size.width, size.height);
    }

    if(!(cell.cellX        > (hivX + size.width) ||
         (cell.cellX     + size.width) <  hivX          ||
         realCellY          > (realHivY + size.height) ||
        (realCellY + size.height) <  realHivY) && cell.infected==false) {
      cell.infected = true;
      points = points+1;
    }

    if(cell.cellX <= -size.width) {
      tcells.splice(i, 1);
      i = i-1;
    }
  }

  if(points < 10) {
    if(time % 500 == 0) {
      createCell(canvas.width +  Math.floor((Math.random() * 29) + -29));
      if(points >= 3) {
        createPill(canvas.width, Math.floor((Math.random() * -canvas.height/10+1) + canvas.height/10-1), Math.floor((Math.random() * -3) + 3));
      }
    }
  }

  // Pills
  var pillSize = calculateAspectRatioFit(hivStopper.width, hivStopper.height, canvas.width/10, canvas.height/10);
  for (i = 0; i < pills.length; i++) {
    var pill = pills[i];
    var realPillY = calcMiddle(canvas.height, pillSize.height)+(pill.y/300)*canvas.height;
    pill.x -= 5;
    pill.y += (canvas.height/1000)*pill.pillSpeed;

    if(pill.y > canvas.height/10) {
      pill.y = canvas.height/10-1;
      pill.pillSpeed = -pill.pillSpeed;
    } else if(pill.y < -canvas.height/10) {
      pill.y = -canvas.height/10+1;
      pill.pillSpeed = -pill.pillSpeed;
    }

    // Kill HIV
    if(!(pill.x        > (hivX + size.width) ||
         (pill.x + pillSize.width) <  hivX          ||
         realPillY          > (realHivY + size.height) ||
        (realPillY + pillSize.height) <  realHivY)) {
          stopGame();
          setState(GAMESTATE.DEAD);
    }

    if(pill.x+pillSize.width <= 0) {
      pills.splice(i, 1);
      i = i-1;
    }

    ctx.drawImage(hivStopper, pill.x, realPillY, pillSize.width, pillSize.height);
  }

  // Hiv Characters
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(hiv_1, hivX,realHivY, size.width, size.height);

  // Inform
  switch(Math.round(time/45)) {
    case 3:
      drawGameInfo('HIV er vírus sem ræðst á ónæmiskerfið í líkamanum.', 'Þær ráðast á T-Frumurnar sem berjast gegn sjúkdómum.');
      break;
    case 18:
      drawGameInfo('Þær taka yfir frumurnar og láta þær framleiða fleiri', 'veirur fyrir sig.');
      break;
    case 33:
      drawGameInfo('HIV eyðileggur varnakerfi líkamans það mikið að', 'það verður meiri líkur að fá lífshættulega sjúkdóma.');
      break;
    case 48:
      drawGameInfo('Meira en 39 miljónir hafa HIV og talið að 1.8', 'miljónir barna hafi HIV (Samkvæmt rannsókn 2015).');
      break;
    case 63:
      drawGameInfo('1 af 4 sem finnast með HIV eru á aldrinum 13-24.', '60% af HIV+ táningum með HIV vita ekki að þeir hafi HIV.');
      break;
    case 78:
      drawGameInfo('Fyrstu fimm sem fundust með HIV í Bandaríkjunum', 'var árið 1981. Nú hafa meiri en 1.000.000 þar sjúkdóminn.');
      break;
    case 93:
      drawGameInfo('Aids er forsenda þess að hiv er í líkamanum.', 'Aids getur haft flókinn áhrif í líkamanum eins og hita.');
      break;
  }

  // Info board
  if(shouldInfo) {
    ctx.imageSmoothingEnabled = false;
    var asp = calculateAspectRatioFit(info.width, info.height, canvas.width/2, canvas.height/2);
    ctx.drawImage(info, calcMiddle(canvas.width, asp.width), canvas.height-asp.height+100-infoBoard, asp.width, asp.height);

    ctx.font = asp.width/60 + "px 'Press Start 2P'";
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.fillText(infoBoardText1, canvas.width/2, canvas.height-asp.height/5*3+100-infoBoard);

    ctx.font = asp.width/60 + "px 'Press Start 2P'";
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.fillText(infoBoardText2, canvas.width/2, canvas.height-asp.height/5*2+100-infoBoard);


    if(infoBoard <= 330) {
      if(infoBoard <= 110 && shouldGo == false) {
        infoBoard = infoBoard + 13;
      } else if(infoBoard <= 200 && shouldGo == false) {
        infoBoard = infoBoard + 0.15;
      } else {
          shouldGo = true;
          infoBoard = infoBoard - 13;
          if(infoBoard <= -info.height-15) {
            resetGameInfo();
          }
      }
    }
  }

  // Move background image
  backgroundGame = backgroundGame +0.0004;
  if(backgroundGame >= 1) {
    shouldTellLevel = false;
    backgroundGame = 0;
  }

    // Kill
  if((realHivY >= canvas.height || hivY <= -size.height) && points < 10) {
    stopGame();
    setState(GAMESTATE.DEAD);
  }

  // portal
  if(points >= 10) {
    var portalSize = calculateAspectRatioFit(portal.width, portal.height, canvas.width, canvas.height);
    if(canvas.width+portalSize.width-portalX <= 0) {
      setState(GAMESTATE.QUESTIONS);
      stopGame();
    }
    var realSound = (portalX/1900)*canvas.height*1.5;

    var soundVolume = 1-realSound/canvas.width;
    if(soundVolume >= 0 && soundVolume <= 1) {
      game_menu_song.volume = soundVolume;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(portal, canvas.width-portalX, 0, portalSize.width+3, portalSize.height);

    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width+portalSize.width-portalX-3,0,canvas.width,canvas.height);
    portalX += 2;
  }

  // Fade
  if(introFade > 0.0) {
    introFade = introFade - 0.05;

    ctx.fillStyle = "rgba(0, 0, 0, " + introFade + ")";
    ctx.fillRect(0,0,canvas.width, canvas.height);
  }

    time = time + 1;
}

function drawPause() {
  ctx.fillStyle = "#4C0000";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  var grd = ctx.createLinearGradient(0,0,0,canvas.height);
  grd.addColorStop(0,"black");
  grd.addColorStop(1,"transparent");

  ctx.fillStyle = grd;
  ctx.fillRect(0,0,canvas.width, canvas.height);

  ctx.font = canvas.width/50 + "px 'Press Start 2P'";
  ctx.fillStyle = "white";
  ctx.textAlign = 'center';
  ctx.fillText("STOPPAÐ", canvas.width/2, canvas.height/2);
}

var hiv_back = new Image();
hiv_back.src = 'assets/image/back_hiv1.png';

var spell_1 = new Image();
spell_1.src = 'assets/image/spell_1.png';

var spell_2 = new Image();
spell_2.src = 'assets/image/spell_2.png';

var spell_3 = new Image();
spell_3.src = 'assets/image/spell_3.png';

var spell_4 = new Image();
spell_4.src = 'assets/image/spell_4.png';

var spell_5 = new Image();
spell_5.src = 'assets/image/spell_5.png';

var shouldMove = true;
var cellX = 0;
var cellY = 0;
var cellSpeed = 1.5;

var textFade = 0;
var textSpeed = 0.5;

var questionNumber = 1;
var currentQuestionID = 1;
var question = "null";
var q1 = "null";
var q2 = "null";
var q3 = "null";
var questionRight = 1;

var spell = 0;
var spellSpeed = 0.4;

var infected = false;

var questionFade = 0;
var questionShouldFade = false;

function drawQuestions() {
  var size = calculateAspectRatioFit(t_Helper.width, t_Helper.height, canvas.width/4, canvas.height/4);
  var realCellX = (cellX/1900)*canvas.height;

  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Tcell
  if(infected) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(t_Helper_Infected, canvas.width - realCellX, canvas.height/8 + cellY, size.width, size.height);
  } else {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(t_Helper, canvas.width - realCellX, canvas.height/8 + cellY, size.width, size.height);
  }

  if(spell > 0 && spell <= 6) {
    if(spell >= 0 && spell < 1) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spell_5, canvas.width - realCellX*2.2, canvas.height/8*2.5 + cellY, size.width*2, size.height*2);
    } else if(spell >= 1 && spell < 2) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spell_4, canvas.width - realCellX*2.2, canvas.height/8*2.5 + cellY, size.width*2, size.height*2);
    } else if(spell >= 2 && spell < 3) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spell_3, canvas.width - realCellX*2.2, canvas.height/8*2.5 + cellY, size.width*2, size.height*2);
    } else if(spell >= 3 && spell < 4) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spell_2, canvas.width - realCellX*2.2, canvas.height/8*2.5 + cellY, size.width*2, size.height*2);
    } else if(spell >= 4 && spell < 5) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spell_1, canvas.width - realCellX*2.2, canvas.height/8*2.5 + cellY, size.width*2, size.height*2);
    } else {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spell_1, canvas.width - realCellX*2.2, canvas.height/8*2.5 + cellY, size.width*2, size.height*2);
      spellSpeed = -spellSpeed;

      var spellAudio = new Audio('assets/sound/shoot.wav');
      spellAudio.play();
    }

    spell = spell+spellSpeed;
  } else if(spell < 0 && spellSpeed <= 0) {
    spellSpeed = 0.4;
    spell = 0;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(hiv_back, canvas.width - realCellX*3.5, canvas.height/8*3 + cellY, size.width*2, size.height*2);

  // Question Text
  ctx.font = (size.width+size.height)/20 + "px 'Press Start 2P'";
  ctx.fillStyle = "rgba(255,255,255," + textFade +")";
  ctx.textAlign = 'left';
  ctx.fillText(question, 30, canvas.height/15);

  ctx.font = (size.width+size.height)/25 + "px 'Press Start 2P'";
  ctx.fillStyle = questionColor(1);
  ctx.textAlign = 'left';
  ctx.fillText("1) " + q1, 50, canvas.height/15*2);

  ctx.font = (size.width+size.height)/25 + "px 'Press Start 2P'";
  ctx.fillStyle = questionColor(2);
  ctx.textAlign = 'left';
  ctx.fillText("2) " + q2, 50, canvas.height/15*3);

  ctx.font = (size.width+size.height)/25 + "px 'Press Start 2P'";
  ctx.fillStyle = questionColor(3);
  ctx.textAlign = 'left';
  ctx.fillText("3) " + q3, 50, canvas.height/15*4);


  // Fade Text
  if(textFade < 1.0 && textSpeed > 0 || textFade >= 0 && textSpeed < 0) {
    textFade = textFade + textSpeed;
  }

  // Move char
  if(cellX <= 300 + size.width && shouldMove) {
    cellX += 30;
  }

  cellY = cellY + cellSpeed;
  if(cellY >= 20) {
    cellSpeed = -cellSpeed;
  } else if(cellY <= -20) {
    cellSpeed = -cellSpeed;
  }

  // Fade
  if(questionShouldFade == true && questionFade < 1) {
    questionFade += 0.01;
    if(questionFade <= 1) {
      questionSong.volume = 1-questionFade;
    } else {
      questionSong.pause();
    }
  } else if(questionFade >= 1 && questionShouldFade) {
    questionFade = 0;
    setState(GAMESTATE.END);
    resetQuestions();
  }

  ctx.fillStyle = "rgba(0,0,0," + questionFade +")";
  ctx.fillRect(0,0,canvas.width,canvas.height);
 }

var menuBox_1 = 0.5;
var menuBox_2 = 0.5;

const TEXT_2 = "CREDITS";
const borderSize = 20;
const BOX_SIZE = 5;
const TEXT_1 = "MAIN";

function drawEnd() {
  var size = calculateAspectRatioFit(hiv_1.width, hiv_1.height, canvas.width/5, canvas.height/5);

  ctx.fillStyle = "#C6FFFF";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.font = (size.width+size.height)/10 + "px 'Press Start 2P'";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText("ENDIR", canvas.width/2, canvas.height/15);

  var metrics = ctx.measureText('ENDIR');
  var width = metrics.width;

  var middle = calcMiddle(canvas.width, width);

  ctx.fillStyle = "black";
  ctx.fillRect(middle,canvas.height/15+10,width,BOX_SIZE);

  // Box 1
  ctx.fillStyle = "rgba(0,148,255," + 0.5 +")";
  ctx.fillRect(canvas.width/10+(borderSize/2)-40, canvas.height/5*2+(borderSize/2)+40, canvas.width/5-borderSize, canvas.height/5-borderSize);

  ctx.imageSmoothingEnabled = false;
  drawImageProp(ctx, backImg, canvas.width/10, canvas.height/5*2, canvas.width/5, canvas.height/5)

  ctx.fillStyle = "rgba(0,148,255," + menuBox_1 +")";
  ctx.fillRect(canvas.width/10+(borderSize/2), canvas.height/5*2+(borderSize/2), canvas.width/5-borderSize, canvas.height/5-borderSize);

  ctx.rect(canvas.width/10, (canvas.height/5*2), canvas.width/5, (canvas.height/5));
  ctx.lineWidth=borderSize;
  ctx.strokeStyle="#003C68";
  ctx.stroke();

  // Text 1
  ctx.font = (size.width+size.height)/10 + "px 'Press Start 2P'";
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(TEXT_1, canvas.width/10+(canvas.width/5/2), canvas.height/5*2+(canvas.height/5/2)+4);

  //Box 2

  ctx.fillStyle = "rgba(0,148,255," + 0.5 +")";
  ctx.fillRect(canvas.width/10*7+(borderSize/2)+40, canvas.height/5*2+(borderSize/2)+40, canvas.width/5-borderSize, canvas.height/5-borderSize);

  ctx.imageSmoothingEnabled = false;
  drawImageProp(ctx, bloodStream, canvas.width/10*9-canvas.width/5, canvas.height/5*2, canvas.width/5, canvas.height/5)

  ctx.fillStyle = "rgba(0,148,255," + menuBox_2 +")";
  ctx.fillRect(canvas.width/10*9-canvas.width/5+(borderSize/2), canvas.height/5*2+(borderSize/2), canvas.width/5-borderSize, canvas.height/5-borderSize);

  ctx.rect(canvas.width/10*9-canvas.width/5, (canvas.height/5*2), canvas.width/5, (canvas.height/5));
  ctx.lineWidth=borderSize;
  ctx.strokeStyle="#003C68";
  ctx.stroke();

  // Text 1
  ctx.font = (size.width+size.height)/10 + "px 'Press Start 2P'";
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(TEXT_2, canvas.width/10*9-(canvas.width/5/2), canvas.height/5*2+(canvas.height/5/2)+4);
}

function drawDead() {
  var size = calculateAspectRatioFit(hiv_1.width, hiv_1.height, canvas.width/5, canvas.height/5);

  ctx.fillStyle = "#4E0000";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.font = (size.width+size.height)/5 + "px 'Press Start 2P'";
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText("LEIK LOKIÐ", canvas.width/2, canvas.height/8);

  ctx.font = (size.width+size.height)/15 + "px 'Press Start 2P'";
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('SMELLTU Á "BIL" TAKKAN TIL AÐ REYNA AFTUR!', canvas.width/2, canvas.height-canvas.height/10);
}

/*
  Npc's
*/


var tcells = new Array();
var Tcell = function() {
  this.infected = false;
  this.cellX = 0;
  this.cellY = 0;
  this.cellSpeedY = 0.3;

  var createCell = function(instance) {
    tcells.push(instance);
  }

  this.createCell = createCell;
}

var pills = new Array();
var hivPill = function() {
  this.x = 0;
  this.y = 0;
  this.pillSpeed = 2;

  var createPill = function(instance) {
    pills.push(instance);
  }

  this.createPill = createPill;
}

/*
  Utils
*/
function endMenuContains() {
  if(mouseX >= canvas.width/10 && mouseX <= canvas.width/10+canvas.width/5 && mouseY >= canvas.height/5*2 && mouseY <= canvas.height/5*3) {
    return true;
  } else {
    return false;
  }
}

function resetQuestions() {
   shouldMove = true;
   cellX = 0;
   cellY = 0;
   cellSpeed = 1.5;

   textFade = 0;
   textSpeed = 0.5;

   questionNumber = 1;
   currentQuestionID = 1;
   question = "null";
   q1 = "null";
   q2 = "null";
   q3 = "null";
   questionRight = 1;

   spell = 0;
   spellSpeed = 0.4;

   infected = false;

   questionFade = 0;
   questionShouldFade = false;
}

function endMenuContainsSecond() {
  if(mouseX >= canvas.width/10*9-canvas.width/5 && mouseX <= canvas.width/10*9+(canvas.height/5) && mouseY >= canvas.height/5*2 && mouseY <= canvas.height/5*3) {
    return true;
  } else {
    return false;
  }
}

function resetGameInfo() {
  infoBoard = 0;
  infoBoardText1 = 'null';
  infoBoardText2 = 'null';
  shouldInfo = false;
  shouldGo = false;
  return 'Done';
}

function questions() {
  switch(questionNumber) {
    case 1:
      setQuestion('Hvaða áhrif hefur Aids?', "Erfiðara að ganga", "Hita og meira", "Raddbönd verða mjórri", 2);
      break;
    case 2:
      setQuestion('Hvað gerir HIV við frumurnar?', "Láta þær framleiða fleiri veirur", "Drepa þær", "Taka orkuna úr þeim", 1);
      break;
    case 3:
      setQuestion('Hversu margir hafa HIV?', "83 Miljónir", "39 Miljónir", "2 Miljónir", 2);
      break;
    case 4:
      setQuestion('Hvernig berst HIV?', "Blóði og öðrum vökvum", "Moskítóbiti", "Drykkjar Vatni", 1);
      break;
    case 5:
      setQuestion('Hvað getur þú fengið með HIV?', "Verkefni til að tala um", "Leiðindi", "Lífshættulega sjúkdóma", 3);
      break;
    default:
      questionEnd();
      webLog('Thank you so much for playing the game. Please give us feedback @Strandor on twitter.');
      break;
  }
}

function questionEnd() {
  infected = true;
  questionFade = 0;
  questionShouldFade = true;
}

function answearQuestion() {
  if(questionShouldFade == false) {
    if(currentQuestionID == questionRight) {
      spell = 0.1;
      questions();
    } else {
    questionSong.pause();
    setState(GAMESTATE.DEAD);
    }
  }
}

function setQuestion(_question, _q1, _q2, _q3, _qr) {
  questionNumber += 1;
  question = _question;
  q1 = _q1;
  q2 = _q2;
  q3 = _q3;
  questionRight = _qr;
}

function questionColor(id) {
  if(currentQuestionID == id) {
    return "rgba(0,255,255," + textFade +")";
  } else {
    return "rgba(220,220,220," + textFade +")";
  }
}

function drawGameInfo(text1, text2) {
  shouldInfo = true;
  infoBoardText1 = text1;
  infoBoardText2 = text2;
}

function stopEnd() {
  endSong.pause();
}

function openCredits() {
  var win = window.open('extra/credits.html', '_blank');
  win.focus();
}

function updateCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function gameLog(message) {
  console.log("[GAME]: " + message);
}
function calcMiddle(x1, x2) {
  return x1/2 - x2/2;
}
// TODO REMOVE
function startMenu() {
  fadeSelection = 0.0;
  shouldFade = false;

  // Theme Music
  theme_menu_song = new Audio('assets/sound/theme_menu.mp3');
  theme_menu_song.loop = true;
  theme_menu_song.volume = 1.0;
  theme_menu_song.play();
}
function setState(gameState) {
  currentGameState = gameState;
  clearInterval(gameUpdate);
  if(gameState == GAMESTATE.MENU) {
    gameUpdate = setInterval(drawGame, 1000/framesPerSecond); // Repeats the function 1000/frames per second
  }else if(gameState == GAMESTATE.SELECTOR) {
    gameUpdate = setInterval(drawSelection, 1000/framesPerSecond); // Repeats the function 1000/frames per second
  } else if(gameState == GAMESTATE.INFO) {
    gameUpdate = setInterval(drawInfo, 1000/framesPerSecond); // Repeats the function 1000/frames per second
  } else if(gameState == GAMESTATE.GAME) {
    gameUpdate = setInterval(drawGame_AIDS, 1000/framesPerSecond*0.5); // Repeats the function 1000/frames per second
  } else if(gameState == GAMESTATE.PAUSED) {
    drawPause();
    gameUpdate = null;
    game_menu_song.pause();
  } else if(gameState == GAMESTATE.QUESTIONS) {
    resetQuestions();
    gameUpdate = setInterval(drawQuestions, 1000/framesPerSecond); // Repeats the function 1000/frames per second
    questions();
    questionSong.currentTime = 0;
    questionSong.loop = true;
    questionSong.volume = 1.0;
    questionSong.play();
  } else if(gameState == GAMESTATE.END) {
    resetEnd();
    drawEnd();
    gameUpdate = null;
    endSong.play();
  } else if(gameState == GAMESTATE.DEAD) {
    gameUpdate = setInterval(drawDead, 1000/framesPerSecond); // Repeats the function 1000/frames per second
  }

  gameLog('GameState changed to: ' + gameState.name);
}
function selectorContains() {
  if((mouseX <= canvas.width/3.22 && mouseX >= canvas.width/7.6) && (mouseY >= canvas.height/2.981 && mouseY <= canvas.height/1.35724)) {
    return true;
  }
}

function resetEnd() {
  endSong.currentTime = 0;
}

function setupGame() {
  game_menu_song.volume = 1.0;
  game_menu_song.play();
}

function createCell(x) {
  var cell = new Tcell();
  cell.cellX = x;
  cell.cellY = Math.floor((Math.random() * 29) + -29);
  cell.createCell(cell);
}

function createPill(x, y, speed) {
  var pill = new hivPill();
  pill.x = x;
  pill.y = y;

  if(speed == 0) {
    speed = 1;
  }

  pill.pillSpeed = speed;

  pill.createPill(pill);
}

function stopGame() {
  pills = [];
  tcells = [];

   introFade = 1.0;
   backgroundGame = 0;
   shouldTellLevel = true;

  hivX = 50;
  hivY = 0; // TODO remove only fro testing

  time = 0;
  points = 0;

  infoBoard = 0;
  infoBoardText1 = 'null';
  infoBoardText2 = 'null';
  shouldInfo = false;
  shouldGo = false;

  portalX = 0;

   infoFade = 0.1;
  fadeDone = false;

  game_menu_song.currentTime = 0;
  game_menu_song.pause();
}
/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
*/
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio };
}
