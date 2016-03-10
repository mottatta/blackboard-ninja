var canvas, stage, exportRoot;
var W,H;
var FPS = 24;
//
var gravity = 10;
var gravityO = gravity;
var ground;
var refreshFrames = 0;
//

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;
//
var back = null;
//var hero = null;
var circlesArray = null;
var shurikensArray = null;
var swordsArray = null;
var thornsArray = null;
var masksArray = null;
var platformsArray = null;
var timeTxt = null;
var floor = null;
var hint = null;
//game state vars
var Paused = false;
var isPlaying = false;
var currentLevel = 0;//this is set to 0 on mainMenuPlayBtn click
var levels = 5;
var levelTime = 0;
var currentScenario = 0;//shows what to add on every 10 seconds
var scenarios = new Array();
var secondsToScenario;
var framesToSword = -1;
var framesToShuriken = -1;
var secToEnemy;
var secToEnemy1;
var secToEnemy2;

var heroes;
//
var leftButton = null;
var rightButton = null;
var jumpButton = null;
var overAnimation = null;
var instructions = null;
var instructionsFrames;
var levelClearedMenu = null;
var gameOverMenu = null;
var areYouSureMenu = null;
var credits = null;
var mainMenu = null;
var betweenScreen = null;
var allLevelsCleared = null;
var pauseLabel = null;
var levelLabel = null;
var toAdd = '';
var toRemove = '';
var toRemove1 = '';
//SOUNDS
var mutedMusic = false;
var mutedSFX = false;
var music;
var sound;
var musicTxt = '';
var soundBtn;
var SFXBtn;
var pauseBtn = null;
var quitBtn = null;
var loader;
var allFilesLoaded = false;

function init() {
	canvas = document.getElementById("canvas");
	images = images||{};
	exportRoot = new lib.BlackboardNinja();
	stage = new createjs.Stage(canvas);
	W = stage.canvas.width;
	H = stage.canvas.height;
	
	progressText = new createjs.Text("", "40px Anton", "#000000");
	progressText.x = (W/2) - 120;
	progressText.y = H/2-30;
	stage.addChild(progressText);
	stage.update();

	var manifest = [
		{src:"images/Bitmap1.png", id:"Bitmap1"},
		{src:"images/Bitmap2.png", id:"Bitmap2"},
		{src:"images/Bitmap3.png", id:"Bitmap3"},
		{src:"images/Bitmap4.png", id:"Bitmap4"},
		{src:"images/Bitmap5.png", id:"Bitmap5"},
		{src:"images/Bitmap6.png", id:"Bitmap6"},
		{src:"images/Bitmap7.png", id:"Bitmap7"},
		{src:"images/Bitmap8.png", id:"Bitmap8"},
		{src:"images/Bitmap9.png", id:"Bitmap9"},
		{src:"images/Bitmap10.png", id:"Bitmap10"},
		{src:"images/btw1.png", id:"btw1"},
		{src:"images/btw2.png", id:"btw2"},
		{src:"images/btw3.png", id:"btw3"},
		{src:"images/btw4.png", id:"btw4"},
		{src:"images/btw5.png", id:"btw5"},
		{src:"images/btw6.png", id:"btw6"},
		{src:"images/btw7.png", id:"btw7"},
		{src:"images/btw8.png", id:"btw8"},
		{src:"images/btw9.png", id:"btw9"},
		{src:"images/Sound1.png", id:"Sound1"},
		{src:"images/Sound2.png", id:"Sound2"},
		{src:"images/Sound3.png", id:"Sound3"},
		{src:"images/Sound4.png", id:"Sound4"},
		{src:"images/PauseBmp.png", id:"PauseBmp"},
		{src:"images/QuitBmp.png", id:"QuitBmp"},
		{src:"images/Background.png", id:"Background"},
		{id:"soundJump", src:"sounds/SoundJump.ogg"},
		{id:"soundHit", src:"sounds/SoundHit.ogg"},
		{id:"soundLand", src:"sounds/SoundLand.ogg"},
		{id:"soundThorn", src:"sounds/SoundThorn.ogg"},
		{id:"soundShuriken", src:"sounds/SoundShuriken.ogg"},
		{id:"soundOver", src:"sounds/SoundOver.ogg"},
		{id:"soundLevel", src:"sounds/SoundLevel.ogg"},
		{id:"soundMainMenu", src:"sounds/SoundMainMenu.ogg"}
	];

	loader = new createjs.LoadQueue(false);
	loader.installPlugin(createjs.Sound); 
	loader.addEventListener("fileload", handleFileLoad);
	loader.addEventListener("progress", handleFileProgress);
	loader.addEventListener("complete", handleComplete);
	loader.loadManifest(manifest);
	//
	scenarios[0] = new Array('sword','shuriken');
	scenarios[1] = new Array('circle','shuriken','sword');
	scenarios[2] = new Array('sword','circle','shuriken');
	scenarios[3] = new Array('circle','sword','shuriken');
	scenarios[4] = new Array('circle','sword','shuriken');
}

function handleFileProgress(event) {
    progressText.text = (loader.progress*100|0) + " % Loaded";
    stage.update();
}

function handleFileLoad(evt) {
	if (evt.item.type == "image") { images[evt.item.id] = evt.result; }
	if(evt.item.id == "soundMainMenu") console.log('last is loaded');
}

function handleComplete() {
	ground = H - 10;
	stage.addChild(exportRoot);
	stage.update();
	stage.enableMouseOver(40); 
	createjs.Touch.enable(stage);
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", tick);
	//add sound btns
	soundBtn = new lib.SoundSymbol();
	SFXBtn = new lib.SFX();
	soundBtn.name = 'soundBtn';
	SFXBtn.name = 'SFXBtn';
	soundBtn.cursor = 'pointer';
	SFXBtn.cursor = 'pointer';
	soundBtn.addEventListener("click",onBtnClick);
	SFXBtn.addEventListener("click",onBtnClick);
	soundBtn.x = 20;
	soundBtn.y = 20;
	soundBtn.gotoAndStop(0);
	SFXBtn.x = 60;
	SFXBtn.y = 20;
	SFXBtn.gotoAndStop(0);
	stage.addChild(soundBtn);
	stage.addChild(SFXBtn);
	soundBtn.cache(-20,-20,40,40);
	SFXBtn.cache(-20,-20,40,40);
	//add back (black board)
	back = new createjs.Bitmap('images/Background.png');
	back.regX = 0;
	back.regY = 0;
	back.x = 0;
	back.y = 0;
	back.cache(0,0,W,H);
	stage.addChild(back);
	addStuff('mainMenu');
}

function playMusic(what){
	/*
	if(musicTxt != what){
		musicTxt = what;
		if(music)
			music.pause();
		music = null;

		if(!mutedMusic){
			createjs.Sound.setVolume(0.2);
			music = createjs.Sound.play(what, {loop: -1});
		}
	}
	*/	
}

function disableMusic(p){
	/*
	console.log('Muted music '+p)
	if(p){
		mutedMusic = true;
		music.pause();
	}else{
		mutedMusic = false;
		music.resume();
	}
	*/
}

function playSFX(what,howLoud){
	if(!mutedSFX){
		//createjs.Sound.setVolume(howLoud);
		createjs.Sound.play(what);
	}
}

function setVars(){
	switch(currentLevel){
		case 1:
			secToEnemy = new Array(1,1.5);
		break;
		case 2:

		break;
		case 3:

		break;
		case 4:

		break;
		case 5:

		break;
	}
}

function addGameControls(){
	var buttonsY = H * 0.90;
	var offsetX = W * 0.10;
	var buttonsWidth = W * 0.03;

 var child1 = new createjs.Shape(
     new createjs.Graphics().beginFill("#999999")
         .drawCircle(0, 0, buttonsWidth));

         var child2 = new createjs.Shape(
     new createjs.Graphics().beginFill("#999999")
         .drawCircle(0, 0, buttonsWidth));

         var child3 = new createjs.Shape(
     new createjs.Graphics().beginFill("#999999")
         .drawCircle(0, 0, buttonsWidth));

	leftButton = new createjs.MovieClip();
	leftButton.addChild(child1);
	leftButton.gotoAndStop(0);
	leftButton.x = offsetX;
	leftButton.y = buttonsY;
	leftButton.scaleX = 2.50;
	leftButton.scaleY = 2.50;
	rightButton = new createjs.MovieClip();
	rightButton.addChild(child2);
	rightButton.gotoAndStop(0);
	rightButton.x = leftButton.x + buttonsWidth * 2 + offsetX;
	rightButton.y = buttonsY;
	rightButton.scaleX = 2.50;
	rightButton.scaleY = 2.50;
	jumpButton = new createjs.MovieClip();
	jumpButton.addChild(child3);
	jumpButton.gotoAndStop(0);
	jumpButton.x = W - offsetX;
	jumpButton.y = buttonsY;
	jumpButton.scaleX = 2.50;
	jumpButton.scaleY = 2.50;

	leftButton.name = "leftButton";
	leftButton.addEventListener("mousedown", onLeftButtonDown);
	leftButton.addEventListener("click", onLeftButtonUp);

	rightButton.name = "rightButton";
	rightButton.addEventListener("mousedown", onRightButtonDown);
	rightButton.addEventListener("click", onRightButtonUp);

	jumpButton.name = "jumpButton";
	jumpButton.addEventListener("mousedown", onJumpButtonDown);
	jumpButton.addEventListener("click", onJumpButtonUp);

	stage.addChild(leftButton);
	stage.addChild(rightButton);
	stage.addChild(jumpButton);
}

function removeGameControls(){
	stage.removeChild(leftButton);
	stage.removeChild(rightButton);
	stage.removeChild(jumpButton);
	leftButton = null;
	rightButton = null;
	jumpButton = null;
}

function onLeftButtonDown(e){
	if(heroes[0])	
		heroes[0].left_ = true;
}

function onLeftButtonUp(e){
	if(heroes[0])
		heroes[0].left_ = false;
}

function onRightButtonDown(e){
	if(heroes[0])	
		heroes[0].right_ = true;
}

function onRightButtonUp(e){
	if(heroes[0])	
		heroes[0].right_ = false;
}

function onJumpButtonDown(e){
	if(heroes[0])	
		heroes[0].up_ = true;
}

function onJumpButtonUp(e){
	if(heroes[0])	
		heroes[0].up_ = false;
}

function onPressDown(e){
	switch(e.currentTarget.name){
		case "leftButton":
			if(heroes[0])	
				heroes[0].left_ = true;
		break;
		case "rightButton":
			if(heroes[0])	
				heroes[0].right_ = true;
		break;
		case "jumpButton":
			if(heroes[0])	
				heroes[0].up_ = true;
		break;
	}
}

function onPressUp(e){
	switch(e.currentTarget.name){
		case "leftButton":
			if(heroes[0]){	
				heroes[0].left_ = false;
				heroes[0].y = 0;
			}
		break;
		case "rightButton":
			if(heroes[0])	
				heroes[0].right_ = false;
		break;
		case "jumpButton":
			if(heroes[0])	
				heroes[0].up_ = false;
		break;
	}
}

function addStuff(what,howMany,howMany1,btwScrAdd,btwScrRmv,btwScrRmv1){
	switch(what){
		case 'level':
			isPlaying = true;
			Paused = false;
			//
			playMusic('soundLevel');
			quitBtn = new lib.QuitBtn();
			quitBtn.x = W-20;
			quitBtn.y = 20;
			quitBtn.name = 'levelMenuQuitBtn';
			quitBtn.cursor = 'pointer';	
			quitBtn.addEventListener('click',onBtnClick);
			stage.addChild(quitBtn);
			quitBtn.cache(-15,-15,30,30);
			pauseBtn = new lib.PauseBtn();
			pauseBtn.x = W-60;
			pauseBtn.y = 20;
			pauseBtn.name = 'levelMenuPauseBtn';
			pauseBtn.cursor = 'pointer';	
			pauseBtn.addEventListener('click',onBtnClick);
			stage.addChild(pauseBtn);
			pauseBtn.cache(-15,-15,30,30);	
			//
			framesToSword = -1;
			currentScenario = 0;
			heroes = new Array();
			refreshFrames = 0;//this will update stage while hero hit animation is played
			setVars();
			timeTxt = new createjs.Text('30','50px Anton','#FFFFFF');
			timeTxt.x = W/2 - 30;
			timeTxt.y = H/2 - 50;
			timeTxt.cache(0,0,timeTxt.getBounds().width,timeTxt.getBounds().height*2);
			stage.addChild(timeTxt);
			levelTime = 30*FPS;
			floor = new lib.Bitmap7();
			floor.regX = 0;
			floor.regY = 0;
			floor.x = 0;
			floor.y = H - floor.getBounds().height;
			back.cache(0,0,W,H);
			addObject('hero',0);
			if(currentLevel == 0){
				addStuff('insctructions');
				instructionsFrames = 5 * FPS;
			}
			addEnemies();
			stage.addChild(floor);
			addGameControls();
			stage.update();
		break;
		case 'levelLabel':
			if(!levelLabel){
				levelLabel = new lib.LevelLabel();
				levelLabel.x = -100;
				levelLabel.y = H/2;
				levelLabel.easing = .2;
				levelLabel.listener = 'in';
				levelLabel.gotoAndStop(currentLevel);
				levelLabel.alpha = .8;
				stage.addChild(levelLabel);
				levelLabel.cache(-170,-125,340,250);
			}
		break;
		case 'allLevelsCleared':
			if(!allLevelsCleared){
				allLevelsCleared = new lib.AllLevelsCleared();
				allLevelsCleared.x = W/2;
				allLevelsCleared.y = H/2;
				allLevelsCleared.quitBtn = 'allLevelsClearedQuitBtn';
				allLevelsCleared.quitBtn.cursor = 'pointer';
				allLevelsCleared.quitBtn.addEventListener('click',onBtnClick);
				allLevelsCleared.quitBtn.addEventListener('mouseover',onBtnOver);
				allLevelsCleared.quitBtn.addEventListener('mouseout',onBtnOut);
				stage.addChild(allLevelsCleared);
			}
		break;
		case 'overAnimation':
			if(!overAnimation){
				overAnimation = new lib.OverAnimation();
				overAnimation.x = howMany;
				overAnimation.y = howMany1;
				stage.addChild(overAnimation);
			}
		break;
		case 'insctructions':
			if(!instructions){
				instructions = new lib.Instructions();
				instructions.x = W/2;
				instructions.y = H/2 - 100;
				stage.addChild(instructions);
			}
		break;
		case 'levelClearedMenu':
			if(!levelClearedMenu){
				levelClearedMenu = new lib.LevelClearedMenu();
				levelClearedMenu.x = W/2;
				levelClearedMenu.y = H/2;
				levelClearedMenu.levelClearedPlayBtn.mouseChildren = false;
				levelClearedMenu.levelClearedPlayBtn.cursor = 'pointer';
				levelClearedMenu.levelClearedPlayBtn.name = 'levelClearedPlayBtn';
				levelClearedMenu.levelClearedPlayBtn.addEventListener('click',onBtnClick);
				levelClearedMenu.levelClearedPlayBtn.addEventListener('mouseover',onBtnOver);
				levelClearedMenu.levelClearedPlayBtn.addEventListener('mouseout',onBtnOut);
				stage.addChild(levelClearedMenu);
			}
		break;
		case 'areYouSureMenu':
			if(!areYouSureMenu && isPlaying){
				pauseIt(true,false);
				areYouSureMenu = new lib.AreYouSureMenu();
				areYouSureMenu.x = W/2;
				areYouSureMenu.y = (H/2)-40;
				areYouSureMenu.okBtn.cursor = 'pointer';
				areYouSureMenu.okBtn.name = 'areYouSureMenuOkBtn';
				areYouSureMenu.okBtn.addEventListener("click",onBtnClick);
				areYouSureMenu.okBtn.addEventListener("mouseover",onBtnOver);
				areYouSureMenu.okBtn.addEventListener("mouseout",onBtnOut);
				areYouSureMenu.noBtn.name = 'areYouSureMenuNoBtn';
				areYouSureMenu.noBtn.cursor = 'pointer';
				areYouSureMenu.noBtn.addEventListener("click",onBtnClick);
				areYouSureMenu.noBtn.addEventListener("mouseover",onBtnOver);
				areYouSureMenu.noBtn.addEventListener("mouseout",onBtnOut);
				stage.addChild(areYouSureMenu);
				areYouSureMenu.cache(-200,-160,440,400);
				//stage.update();
			}
		break;
		case 'gameOverMenu':
			if(!gameOverMenu){
				gameOverMenu = new lib.GameOverMenu();
				gameOverMenu.x = W/2;
				gameOverMenu.y = H/2;
				gameOverMenu.replayBtn.name = 'gameOverMenuReplayBtn';
				gameOverMenu.quitBtn.name = 'gameOverMenuQuitBtn';
				gameOverMenu.replayBtn.cursor = 'pointer';
				gameOverMenu.replayBtn.mouseChildren = false;
				gameOverMenu.quitBtn.cursor = 'pointer';
				gameOverMenu.replayBtn.addEventListener('click',onBtnClick);
				gameOverMenu.replayBtn.addEventListener('mouseover',onBtnOver);
				gameOverMenu.replayBtn.addEventListener('mouseout',onBtnOut);
				gameOverMenu.quitBtn.addEventListener('click',onBtnClick);
				gameOverMenu.quitBtn.addEventListener('mouseover',onBtnOver);
				gameOverMenu.quitBtn.addEventListener('mouseout',onBtnOut);
				stage.addChild(gameOverMenu);
				gameOverMenu.cache(-230,-250,460,500);
			}
		break;
		case 'betweenScreen':
			if(!betweenScreen){
				console.log('in btw')
				//playSFX('soundWoosh',.2);
				toAdd = btwScrAdd;
				toRemove = btwScrRmv;
				toRemove1 = btwScrRmv1;
				betweenScreen = new lib.BetweenScreen();
				betweenScreen.x = -5;
				betweenScreen.y = 0;
				stage.addChild(betweenScreen);
			}
		break;
		case 'credits':
			if(!credits){
				credits = new lib.Credits();
				credits.x = 0;
				credits.y = 0;
				credits.closeBtn.name = 'creditsCloseBtn';
				credits.closeBtn.cursor = 'pointer';
				credits.closeBtn.addEventListener("click",onBtnClick);
				credits.closeBtn.addEventListener("mouseover",onBtnOver);
				credits.closeBtn.addEventListener("mouseout",onBtnOut);
				credits.cache(0,0,W,H);
				stage.addChild(credits);
				//stage.update();
			}
		break;
		case 'pauseLabel':
			if(!pauseLabel){
				pauseLabel = new lib.PauseLabel();
				pauseLabel.x = W/2;
				pauseLabel.y = H/2;
				stage.addChild(pauseLabel);
				pauseLabel.cache(-190,-63,370,130);
				//stage.update();
			}
		break;
		case 'mainMenu':
			if(!mainMenu){
				console.log('main Menu');
				playMusic('soundMainMenu');
				mainMenu = new lib.MainMenu();
				mainMenu.x = 0;
				mainMenu.y = 0;
				mainMenu.playBtn.name = 'mainMenuPlayBtn';
				mainMenu.moreBtn.name = 'mainMenuMoreBtn';
				mainMenu.creditsBtn.name = 'mainMenuCreditsBtn';
				mainMenu.playBtn.cursor = 'pointer';
				mainMenu.moreBtn.cursor = 'pointer';
				mainMenu.creditsBtn.cursor = 'pointer';
				mainMenu.playBtn.addEventListener("click",onBtnClick);
				mainMenu.playBtn.addEventListener("mouseover",onBtnOver);
				mainMenu.playBtn.addEventListener("mouseout",onBtnOut);
				mainMenu.moreBtn.addEventListener("click",onBtnClick);
				mainMenu.moreBtn.addEventListener("mouseover",onBtnOver);
				mainMenu.moreBtn.addEventListener("mouseout",onBtnOut);
				mainMenu.creditsBtn.addEventListener("click",onBtnClick);
				mainMenu.creditsBtn.addEventListener("mouseover",onBtnOver);
				mainMenu.creditsBtn.addEventListener("mouseout",onBtnOut);
				stage.addChild(mainMenu);
				mainMenu.cache(-30,-30,W+30,H+30);
			}
		break;
	}
	if(soundBtn)
		stage.setChildIndex(soundBtn,stage.getNumChildren()-1);
	if(SFXBtn)
		stage.setChildIndex(SFXBtn,stage.getNumChildren()-1);
	stage.update();
}

function removeStuff(what){
	switch(what){
		case 'level':
			removeGameControls();
			framesToSword = -1;
			framesToShuriken = -1;
			removeStuff('overAnimation');
			removeStuff('instructions');
			removeStuff('levelLabel');
			quitBtn.removeAllEventListeners();
			pauseBtn.removeAllEventListeners();
			stage.removeChild(quitBtn);
			stage.removeChild(pauseBtn);
			if(heroes.length > 0){
				if(heroes[0])
				stage.removeChild(heroes[0]);
			}
			if(timeTxt)
			stage.removeChild(timeTxt);
			if(floor)
			stage.removeChild(floor);
			var i;
			if(circlesArray)
			for(i=0;i<circlesArray.length;i++)
				stage.removeChild(circlesArray[i]);
			if(thornsArray)
			for(i=0;i<thornsArray.length;i++)
				stage.removeChild(thornsArray[i]);
			if(swordsArray)
			for(i=0;i<swordsArray.length;i++)
				stage.removeChild(swordsArray[i]);
			if(shurikensArray)
			for(i=0;i<shurikensArray.length;i++)
				stage.removeChild(shurikensArray[i]);
			if(platformsArray)
			for(i=0;i<platformsArray.length;i++)
				stage.removeChild(platformsArray[i]);
			circlesArray = [];
			thornsArray = [];
			swordsArray = [];
			shurikensArray = [];
			if(hint)
				stage.removeChild(hint);
		break;
		case 'levelLabel':
			if(levelLabel){
				stage.removeChild(levelLabel);
				levelLabel = null;
				addStuff('level');
			}
		break;
		case 'instructions':
			if(instructions){
				stage.removeChild(instructions);
				insctructions = null;
			}
		break;
		case 'overAnimation':
			if(overAnimation){
				console.log('should remove anime')
				stage.removeChild(overAnimation);
				stage.update();
				overAnimation = null;
			}
		case 'levelClearedMenu':
			if(levelClearedMenu){
				levelClearedMenu.levelClearedPlayBtn.removeAllEventListeners();
				stage.removeChild(levelClearedMenu);
				levelClearedMenu = null;
				removeStuff('overAnimation');
			}
		break;
		case 'gameOverMenu':
			if(gameOverMenu){
				gameOverMenu.replayBtn.removeAllEventListeners();
				gameOverMenu.quitBtn.removeAllEventListeners();
				stage.removeChild(gameOverMenu);
				gameOverMenu = null;
				removeStuff('overAnimation');
			}
		break;
		case 'areYouSureMenu':
			if(areYouSureMenu){
				removeStuff('overAnimation');
				areYouSureMenu.okBtn.removeAllEventListeners();
				areYouSureMenu.noBtn.removeAllEventListeners();
				stage.removeChild(areYouSureMenu);
				areYouSureMenu = null;
				stage.update();
			}
		break;
		case 'betweenScreen':
			if(betweenScreen){
				stage.removeChild(betweenScreen);
				betweenScreen = null;
				stage.update();
			}
		break;
		case 'mainMenu':
			if(mainMenu){
				removeStuff('overAnimation');
				mainMenu.playBtn.removeAllEventListeners();
				mainMenu.moreBtn.removeAllEventListeners();
				mainMenu.creditsBtn.removeAllEventListeners();
				stage.removeChild(mainMenu);
				mainMenu = null;
				stage.update();
			}
		break;
		case 'credits':
			if(credits){
				removeStuff('overAnimation');
				credits.closeBtn.removeAllEventListeners();
				stage.removeChild(credits);
				credits = null;
				stage.update();
			}
		break;
		case 'pauseLabel':
			if(pauseLabel){
				stage.removeChild(pauseLabel);
				pauseLabel = null;
			}
		break;
	}
}

function addEnemies(){
	circlesArray = new Array();
	shurikensArray = new Array();
	thornsArray = new Array();
	swordsArray = new Array();
	masksArray = new Array();
	platformsArray = new Array();
	switch(currentLevel){
		case 0:
			console.log('in 0')
			secondsToScenario = 10;
			addObject('circle',1);
			addObject('thorn',-1);
		break;
		case 1:
			secondsToScenario = 9;
			addObject('circle',1);
			addObject('thorn',-1);
			addObject('platform',1,100,H-220);
			addObject('platform',1,W-100,H-120);
		break;
		case 2:
			secondsToScenario = 8;
			addObject('circle',1);
			addObject('thorn',-1);
			addObject('platform',1,30,H/2);
			addObject('platform',1,200,H-120);
			addObject('platform',1,W-130,H-160);
			addObject('platform',1,W/2,H-320);
		break;
		case 3:
			secondsToScenario = 7;
			addObject('circle',1);
			addObject('thorn',-1);
			addObject('platform',2,50,H-120);
			addObject('platform',1,W/2-30,H-280);
			addObject('platform',2,W-100,H-120);
		break;
		case 4:
			secondsToScenario = 6;
			addObject('circle',1);
			addObject('thorn',-1);
		break;
	}
}

function onBtnOver(e){
	addStuff('overAnimation',e.currentTarget.x+e.currentTarget.parent.x,e.currentTarget.y+e.currentTarget.parent.y);
	playSFX('soundOver');
}

function onBtnOut(e){
	removeStuff('overAnimation');
}

function onBtnClick(e){
	switch(e.currentTarget.name){
		case 'soundBtn':
			console.log('in soundBtn '+mutedMusic)
			if(!mutedMusic){
				disableMusic(true);
				soundBtn.gotoAndStop(1);	
			}else{
				disableMusic(false);
				soundBtn.gotoAndStop(0);
			}
			soundBtn.updateCache();
		break;
		case 'SFXBtn':
			if(!mutedSFX){
				SFXBtn.gotoAndStop(1);
				mutedSFX = true;
			}else{
				SFXBtn.gotoAndStop(0);
				mutedSFX = false;
			}
			SFXBtn.updateCache();
		break;
		case 'levelMenuPauseBtn':
			pauseIt(!Paused,true);
		break;
		case 'levelMenuQuitBtn':
			console.log('areYouSureMenu');
			addStuff('areYouSureMenu');
		break;
		case 'levelClearedPlayBtn':
			removeStuff('level');
			removeStuff('levelClearedMenu');
			addStuff('levelLabel');
		break;
		case 'gameOverMenuReplayBtn':
			removeStuff('level');
			removeStuff('gameOverMenu');
			addStuff('level');
		break;
		case 'gameOverMenuQuitBtn':
			console.log('in quit');
			removeStuff('level');
			removeStuff('gameOverMenu');
			addStuff('mainMenu');
		break;
		case 'areYouSureMenuOkBtn':
			removeStuff('level');
			removeStuff('areYouSureMenu');
			addStuff('mainMenu');
		break;
		case 'areYouSureMenuNoBtn':
			pauseIt(false,false);
			removeStuff('areYouSureMenu');
		break;
		case 'creditsCloseBtn':
			addStuff('betweenScreen',0,0,'mainMenu','credits','');
		break;
		case 'mainMenuPlayBtn':
			currentLevel = 0;
			addStuff('betweenScreen',0,0,'levelLabel','mainMenu','');
		break;
		case 'mainMenuMoreBtn':
			window.open("http://www.google.com","_blank")
		break;
		case 'mainMenuCreditsBtn':
			addStuff('betweenScreen',0,0,'credits','mainMenu','');
		break;
		case 'allLevelsClearedQuitBtn':
			removeStuff('allLevelsCleared');
			removeStuff('level');
			addStuff('mainMenu');
		break;
	}
}

function doBetweenScreen(){
	console.log('doBetweenScreen')
	removeStuff(toRemove1);
	removeStuff(toRemove);
	addStuff(toAdd);
	stage.update();
}

function addObject(what,pos,XX,YY){
	if(isPlaying && !Paused)
	switch(what){
		case 'hero':
			var hero = new Hero('images/BlackboardNinja.png');
			hero.dead = false;
			creatureAct(hero,'stand');
			if(pos == 0)
				hero.x = 300;
			else
				hero.x = 100;
			hero.player = pos;
			hero.dieFrames = -1;
			hero.y = 200;
			hero.pos = '';
			hero.oldY = hero.y;
			hero.gravityPlus = 3;
			hero.jumpSpeed = 0;
			hero.jumpSpeedO = 50;
			hero.jumpSlowing = 6;
			hero.speed = 15;
			hero.onGround = true;
			hero.slide = false;//if hero slides on a wall
			hero.slideLeft = false;
			hero.slideRight = false;
			hero.slideSpeed = 4;
			stage.addChild(hero);
			heroes.push(hero);
			creatureAct(hero,'stand');
		break;
		case 'circle':
			var circle = new createjs.Bitmap('images/Bitmap1.png');
			circle.x = W/2;
			if(circlesArray.length > 0)
				pos = -1;
			if(pos == -1){
				circle.x = 100;
			}
			circle.y = 0;
			circle.regX = 72.5;
			circle.regY = 73.5;
			circle.pos = pos;
			var speed = new Array(10,12,14,16,18);
			circle.speed = speed[currentLevel];
			circle.side = 1;//this means circle is on top (2 - means left/right side, 3 is bottom, 4 - left/right side)
			circlesArray.push(circle);
			stage.addChild(circle);
		break;
		case 'shuriken':
			playSFX('soundShuriken');
			var pic = 'images/Bitmap2.png';
			if(Math.random() > .5)
				pic = 'images/Bitmap4.png';
			var shuriken = new createjs.Bitmap(pic);
			if(pos == 1)
				shuriken.x = -20;
			else
				shuriken.x = W+20;
			shuriken.y = H-getRandom(60,360);
			shuriken.regX = 22.5;
			shuriken.regY = 22.5;
			shuriken.pos = pos;
			var speed = new Array(15,17,19,20,22);
			shuriken.speed = speed[currentLevel];
			shurikensArray.push(shuriken);
			stage.addChild(shuriken);
		break;
		case 'thorn':
			playSFX('soundThorn');
			var X = 400;
			var Y = 400;
			if(pos == 1){
				X = getRandom(10,W-10);
			}
			var w = 39;
			var h = 49;
			var rect = new createjs.Shape();
			rect.graphics.beginFill("#FF0000").drawRect(X-w/2,400-h,w,h);
			rect.visible = false;
			masksArray.push(rect);
			stage.addChild(rect);
			var thorn = new lib.Bitmap3();
			thorn.mask = rect;
			thorn.x = X;
			thorn.y = Y+h;
			thorn.regX = w/2;
			thorn.regY = h;
			//add hint
			hint = new createjs.Bitmap("images/Hint.png");
			hint.regX = 23.5;
			hint.regY = 23.5;
			hint.visible = true;
			hint.alpha = .5;
			hint.x = X; 
			hint.y = Y-2*h;
			stage.addChild(hint);
			console.log('hint');
			
			thorn.listener = 'in';
			thorn.upY = Y;
			thorn.downY = thorn.y;
			var speed = new Array(5,6,7,8,9);
			thorn.speed = speed[currentLevel];
			var waitFrames = new Array(30,25,20,15,10);
			thorn.waitFrames = 0;
			thorn.waitFramesO = waitFrames[currentLevel];
			thorn.ready = false;//give some time the hint to be seen, before thorn comes up
			thorn.framesToReady = 10;
			thornsArray.push(thorn);
			stage.addChild(thorn);
		break;
		case 'platform':
			var platform = new lib.Bitmap5();
			platform.regX = 0;
			platform.regY = 0;
			platform.x = XX;
			platform.y = YY;
			if(pos == 2){
				//moving platform
				platform.isMoving = true;
				if(platform.x < W/2){
					platform.pos = 1;
					console.log('11111')
				}else{
					platform.pos = -1;
					console.log('platform -1')
				}
				platform.movingSpeed = 5;
				if(platform.pos == 1){
					console.log('smt')
					platform.minX = platform.x;
					platform.maxX = platform.x + 300;
					
				}else{
					platform.maxX = platform.x;
					platform.minX = platform.x - 300;
				}
				console.log('min/max '+platform.minX +' '+platform.maxX)
			}else
				platform.isMoving = false;
			platform.hiddenFramesO = 3 * FPS;
			platform.hiddenFrames = -1;
			platform.fadeSpeed = .05;
			platform.hidden = false;
			stage.addChild(platform);
			platformsArray.push(platform);
		break;
		case 'sword':
			playSFX('soundShuriken');
			var sword = new createjs.Bitmap('images/Bitmap6');
			sword.regX = 15.5;
			sword.regY = 61;
			sword.x = getRandom(15,W-15);
			sword.y = -32;
			var speed = new Array(15,17,20,22,25);
			sword.speed = speed[currentLevel];
			stage.addChild(sword);
			swordsArray.push(sword);
		break;
	}
}

function removeObject(what,obj){
	var i;
	switch(what){
		case 'circle':
			for(i=0;i<circlesArray.length;i++)
				if(circlesArray[i] == obj){
					stage.removeChild(obj);
					circlesArray.splice(i,1);
					obj = null;
				}
		break;
		case 'shuriken':
			for(i=0;i<shurikensArray.length;i++)
				if(shurikensArray[i] == obj){
					stage.removeChild(obj);
					shurikensArray.splice(i,1);
					obj = null;
					var min = new Array(.5,.4,.3,.2,.1);
					var max = new Array(2,1.5,1,.5,.25);
					if(isPlaying && !Paused)
						framesToShuriken = getRandom(min[currentLevel],max[currentLevel]) * FPS;
				}
		break;
		case 'thorn':
			for(i=0;i<thornsArray.length;i++)
				if(thornsArray[i] == obj){
					stage.removeChild(obj);
					stage.removeChild(masksArray[i]);
					thornsArray.splice(i,1);
					masksArray.splice(i,1);
					obj = null;
					if(isPlaying && !Paused)
						addObject('thorn',1);
				}
		break;
		case 'sword':
			for(i=0;i<swordsArray.length;i++)
				if(obj == swordsArray[i]){
					stage.removeChild(obj);
					swordsArray.splice(i,1);
					obj = null;
					var min = new Array(.5,.4,.3,.2,.1);
					var max = new Array(2,1.5,1,.5,.25);
					if(isPlaying && !Paused)
						framesToSword = getRandom(min[currentLevel],max[currentLevel]) * FPS;
				}
		break;
	}
}

function doScenario(){
	if(currentScenario < scenarios[currentLevel].length){
		console.log('scenario '+scenarios[currentLevel][currentScenario])
		var P = -1;
		if(Math.random() > .5)
			P = 1;
		//speed up circles
		if(currentScenario == 2){
			if(currentLevel >= 3)
				for(var i=0;i<circlesArray.length;i++)
					circlesArray[i].speed += 5;
			else
				if(currentLevel >= 2)
					circlesArray[0].speed += 5;
		}
		addObject(scenarios[currentLevel][currentScenario],P);
		currentScenario++;
	}
}

function levelCleared(){
	console.log('LevelCleared');
	isPlaying = false;
	if(currentLevel < 4)
		addStuff('levelClearedMenu');
	else
		addStuff('allLevelsCleared');
	currentLevel++;
}

function tick(e){
	//levelLabel
		if(levelLabel){
			var dx;
			switch(levelLabel.listener){
				case 'in':
					if(Math.abs(W/2-levelLabel.x)>1){
						dx = (W/2 - levelLabel.x) * levelLabel.easing;
						levelLabel.x += dx;
					}else{
						levelLabel.waitFrames = 10;
						levelLabel.listener = 'wait';
					}
				break;
				case 'wait':
					levelLabel.waitFrames--;
					if(levelLabel.waitFrames <= 0)
						levelLabel.listener = 'out';
				break;
				case 'out':
					if(Math.abs((W+100) - levelLabel.x)>2){
						 dx = ((W+100) - levelLabel.x) * levelLabel.easing;
						 levelLabel.x += dx;
					}else
						removeStuff('levelLabel');
				break;
			}
		}
	if(!Paused && isPlaying){
		var i,j,k;
		if(levelTime>0){
			levelTime--;
			if(levelTime % FPS == 0){
				timeTxt.text = Math.round(levelTime/FPS);
				timeTxt.updateCache();
				stage.update();
				//do new scenario
				if(Math.round(levelTime/FPS) % 10 == 0)
					doScenario();
			}
			if(levelTime <= 0)
				levelCleared();
		}
		if(instructionsFrames > 0){
			instructionsFrames--;
			if(instructionsFrames <= 0)
				removeStuff('instructions');
		}
		var j;
		var hero;
		for(j=0;j<heroes.length;j++){
			hero = heroes[j];
			if(hero.up_ && !hero.dead){
				if(!hero.slide)
					jump(hero);
				else{
					if(( hero.pos == '' && hero.right_) || (hero.pos == 1 && hero.left_))
						jump(hero);
				}		
				console.log('left ' + hero.left_ + ' right ' + hero.right_)
			}
			if(hero.left_ && !hero.dead){
				//walk
				
				hero.pos = '';
				if(hero.x - hero.speed > 0){
					hero.x -= hero.speed;
					hero.slide = false;
				}else
					if(hero.jumpSpeed <= 0){
						//slide on left wall
						hero.x = 0;
						creatureAct(hero,'slide'+hero.pos);
						//hero.up_ = false;
						if(hero.y < ground)
							hero.slide = true;
					}
				if(hero.onGround)
					creatureAct(hero,'walk');
			}else
				if(hero.right_ && !hero.dead){
					
					hero.pos = 1;
					if(hero.x + hero.speed < W){
						hero.x += hero.speed;
						hero.slide = false;
					}else
						if(hero.jumpSpeed <= 0){
							//slide on right wall
							hero.x = W;
							creatureAct(hero,'slide'+hero.pos);
							//hero.up_ = false;
							if(hero.y < ground)
								hero.slide = true;
						}
					if(hero.onGround)
						creatureAct(hero,'walk1');
				}else
					if(hero.onGround && !hero.dead)
						creatureAct(hero,'stand'+hero.pos);
			//grvity(hero)
			if(hero.y > hero.oldY && !hero.dead){
				if(!hero.slide)
					creatureAct(hero,'fall'+hero.pos);
				else
					creatureAct(hero,'slide'+hero.pos);
				hero.isFalling = true;
				gravity += hero.gravityPlus;
			}else{
				hero.isFalling = false;
			}
		
			//check if hero has landed on a platform
			if(platformsArray){
				hero.onPlatform = false;
				for(j=0;j<platformsArray.length;j++){	
					if(platformsArray[j])					
					if(hero.x >= platformsArray[j].x && !platformsArray[j].hidden && hero.x <= platformsArray[j].x+platformsArray[j].getBounds().width && hero.oldY <= platformsArray[j].y && hero.y+gravity >= platformsArray[j].y){
						//if(!platformsArray[j].isMoving)
						platformsArray[j].alpha -= platformsArray[j].fadeSpeed;//slowly fadeOut when hero is on it
						hero.onPlatform = true;
						hero.isFalling = false;
						gravity = gravityO;
						if(!hero.onGround)
							playSFX('soundLand');
						hero.onGround = true;
						hero.y = platformsArray[j].y;
						if(!hero.left_ && !hero.right_)
							creatureAct(hero,'stand'+hero.pos);
						break;
					}
				}
			}
			hero.oldY = hero.y;
			if(hero.jumpSpeed > 0){
				hero.y -= hero.jumpSpeed;
				hero.jumpSpeed -= hero.jumpSlowing;
			}
			if(hero.y < ground && !hero.onPlatform && !hero.dead){
				hero.onGround = false;
				//console.log(hero.slide)
				if(!hero.slide){
					
					if(!hero.onGround){
						//add gravity to hero
						if(hero.y + gravity <= ground)
							hero.y += gravity;
						else
							hero.y = ground;
					}
				}else{
					if(hero.y + hero.slideSpeed <= ground)
						hero.y += hero.slideSpeed;
					else
						hero.y = ground;
				}
			}else
				if(hero.y >= ground && !hero.dead){
					if(!hero.onGround)
						playSFX('soundLand');
					hero.isFalling = false;
					gravity = gravityO;
					hero.onGround = true;
					hero.y = ground;
					if(!hero.left_ && !hero.right_)
						creatureAct(hero,'stand'+hero.pos);
				}
		}
		//move circles
		for(i=0;i<circlesArray.length;i++){
			circlesArray[i].rotation -= circlesArray[i].speed;
			switch(circlesArray[i].side){
				case 1:
					circlesArray[i].x += circlesArray[i].speed * circlesArray[i].pos;
					//reach the end, then go to next side
					if(circlesArray[i].x < 0 || circlesArray[i].x > W){
						circlesArray[i].pos *= -1;
						circlesArray[i].side++;
					}
				break;
				case 2:
					circlesArray[i].y += circlesArray[i].speed;
					//reach the end, then go to next side
					if(circlesArray[i].y < 0 || circlesArray[i].y > H){
						circlesArray[i].side++;
					}
				break;
				case 3:
					circlesArray[i].x += circlesArray[i].speed * circlesArray[i].pos;
					//reach the end, then go to next side
					if(circlesArray[i].x < 0 || circlesArray[i].x > W){
						circlesArray[i].pos *= -1;
						circlesArray[i].side++;
					}
				break;
				case 4:
					circlesArray[i].y -= circlesArray[i].speed;
					//reach the end, then go to next side
					if(circlesArray[i].y < 0 || circlesArray[i].y > H){
						circlesArray[i].side = 1;
					}
				break;
			}
			var collision;
			//collision between circles and hero
			for(j=0;j<heroes.length;j++){
				hero = heroes[j];
				if(hero){
					collision = ndgmr.checkPixelCollision(hero,circlesArray[i],1);
					if(collision)
						die(hero);
				}
			}
		}//close for(i=0;i<circlesArray.length;i++)---------------------
		//move shurikens
		if(framesToShuriken > 0){
			framesToShuriken--;
			if(framesToShuriken <= 0){
				var P = -1;
				if(Math.random() > .5)
					P = 1;
				addObject('shuriken',P);
			}
		}
		for(i=0;i<shurikensArray.length;i++){
			shurikensArray[i].x += shurikensArray[i].speed * shurikensArray[i].pos;
			shurikensArray[i].rotation += shurikensArray[i].speed * shurikensArray[i].pos;
			for(j=0;j<heroes.length;j++){
				collision = ndgmr.checkPixelCollision(hero,shurikensArray[i],1);
				if(collision)
					die(hero);
			}
			if(shurikensArray[i].x < -100 || shurikensArray[i].x > W + 100)
				removeObject('shuriken',shurikensArray[i]);
		}
		//move thorns
		for(i=0;i<thornsArray.length;i++){
			//thornsArray[i].rotation += 10;
			if(thornsArray[i].ready){
				switch(thornsArray[i].listener){
					case 'in':
						if(thornsArray[i].y > thornsArray[i].upY){
							thornsArray[i].y -= thornsArray[i].speed;
						}else{
							hint.visible = false;
							thornsArray[i].y = thornsArray[i].upY;
							thornsArray[i].listener = 'wait';
							thornsArray[i].waitFrames = thornsArray[i].waitFramesO;
						}
					break;
					case 'out':
						if(thornsArray[i].y < thornsArray[i].downY){
							thornsArray[i].y += thornsArray[i].speed;
						}else{
							thornsArray[i].y = thornsArray[i].downY;
							removeObject('thorn',thornsArray[i]);
						}
					break;
					case 'wait':
						if(thornsArray[i].waitFrames > 0)
							thornsArray[i].waitFrames--;
							
						else{
							thornsArray[i].listener = 'out';
						}
					break;
				}
				//collision between thorns and hero
				for(j=0;j<heroes.length;j++){
					hero = heroes[j];
					if(thornsArray[i]){
						collision = ndgmr.checkPixelCollision(hero,thornsArray[i],1);
						if(collision)
							die(hero);
					}
				}
			}else{
				thornsArray[i].framesToReady--;
				if(thornsArray[i].framesToReady <= 0)
					thornsArray[i].ready = true;
			}
			//move/collision swords
			if(framesToSword > 0){
				framesToSword--;
				if(framesToSword <= 0){
					addObject('sword',-1);
				}
			}
			for(i=0;i<swordsArray.length;i++){
				swordsArray[i].y += swordsArray[i].speed;
				for(j=0;j<heroes.length;j++){
					collision = ndgmr.checkPixelCollision(hero,swordsArray[i],1);
					if(collision)
						die(hero);
				}
				if(swordsArray[i].y > H+32)//if to remove the sword
					removeObject('sword',swordsArray[i]);
			}
		}
		if(hero.dieFrames > 0){
			hero.dieFrames--;
			if(hero.dieFrames <= 0)
				die(hero);
		}
		//platforms stuff
		for(i=0;i<platformsArray.length;i++){
			//if to hide platform
			if(platformsArray[i].alpha <= 0 && !platformsArray[i].hidden){
				platformsArray[i].hidden = true;
				platformsArray[i].hiddenFrames = platformsArray[i].hiddenFramesO;
			}
			//count time to show platform
			if(platformsArray[i].hiddenFrames > 0){
				platformsArray[i].hiddenFrames--;
				if(platformsArray[i].hiddenFrames <= 0){
					platformsArray[i].hidden = false;
					platformsArray[i].alpha = 1;
				}
			}
			if(platformsArray[i].isMoving){
				//console.log(platformsArray[i].movingSpeed)
				switch(platformsArray[i].pos){
					case 1:
						//console.log('1');
						platformsArray[i].x += platformsArray[i].movingSpeed;
						if(platformsArray[i].x >= platformsArray[i].maxX){
							platformsArray[i].pos = -1;
						}
					break;
					case -1:
						//console.log('in left')
						platformsArray[i].x -= platformsArray[i].movingSpeed;
						if(platformsArray[i].x <= platformsArray[i].minX){
							platformsArray[i].pos = 1;
							console.log('changed '+platformsArray[i].minX)
						}
					break;
				}
			}
		}
		stage.update(e);
	}else
		stage.update();
}

function die(hero){
	if(hero.dieFrames != -1 && hero.dieFrames <= 0){
		isPlaying = false;
		hero.visible = false;
		addStuff('gameOverMenu');
	}else{
		if(!hero.dead)
			playSFX('soundHit');
		creatureAct(hero,'hit'+hero.pos);
		hero.dead = true;
		refreshFrames = 4;
		hero.dieFrames = 5;
	}
}

function removeHero(hero){
	console.log('removeHero');
	stage.removeChild(hero);
}

function jump(hero){
	if(!Paused && isPlaying && (hero.onGround || hero.slide)){
		playSFX('soundJump');
		hero.onGround = false;
		hero.onPlatform = false;
		if(hero.slide)
			hero.jumpSpeed = hero.jumpSpeedO+hero.jumpSpeedO/2;
		else
			hero.jumpSpeed = hero.jumpSpeedO;
		hero.slide = false;
		creatureAct(hero,'jump'+hero.pos);
	}
}


	function creatureAct(who,how){
		if(how != 'pause' && how != 'unpause'){
			if(who.animation != how && !who.dead){
				//console.log(how)
				who.gotoAndPlay(how);
				who.animation = how;
			}
		}else
			if(how == 'pause'){
				//PAUSE
			}else{
				//UNPAUSE
			}
	}

function pauseIt(p,showLabel){
	var i;
	console.log('inPause '+isPlaying)
	if(p && !Paused && isPlaying){
		if(showLabel)
			addStuff('pauseLabel');
		Paused = true;
		if(heroes[0])
			creatureAct(heroes[0],'pause');
	}else
		if(!p && Paused && isPlaying){
			removeStuff('pauseLabel');
			Paused = false;
			if(heroes[0])
				creatureAct(heroes[0],'unpause');
		}
}

function handleKeyDown(e){
	if(!e){var e = window.event;};
	switch(e.keyCode){
		case 32:
			if(gameOverMenu){
				removeStuff('level');
				removeStuff('gameOverMenu');
				addStuff('level');
			}else
				if(levelClearedMenu){
					removeStuff('level');
					removeStuff('levelClearedMenu');
					addStuff('level');
				}
		break;
		case 80:
			pauseIt(!Paused,true);
		break;
		case 77:
			//mute
			if(!mutedMusic || !mutedSFX){
				disableMusic(true);
				soundBtn.gotoAndStop(1);
				mutedSFX = true;
				SFXBtn.gotoAndStop(1);
			}else{
				//unmute
				disableMusic(false);
				soundBtn.gotoAndStop(0);
				mutedSFX = false;
				SFXBtn.gotoAndStop(0);
			}
			soundBtn.updateCache();
			SFXBtn.updateCache();
		break;
		case 37:
			//LEFT
			if(heroes[0])	
				heroes[0].left_ = true;
		break;
		case 39:
			//RIGHT
			if(heroes[0])
				heroes[0].right_ = true;
		break;
		case 38:
			//UP
			/*if(hero.slide){
				if(hero.pos == 1){
					hero.left_ = true;
					hero.right_ = false;
				}else{
					hero.left_ = false;
					hero.right_ = true;
				}	
				jump();
			}else
				if(hero.onGround)
					jump();*/
			if(heroes[0])
				heroes[0].up_ = true;
		break;
	}
}

function handleKeyUp(e){
	if(!e){var e = window.event;};
	switch(e.keyCode){
		case 37:
			//LEFT
			if(heroes[0])
				heroes[0].left_ = false;
		break;
		case 39:
			//RIGHT
			if(heroes[0])
				heroes[0].right_ = false;
		break;
		case 38:
			//UP
			if(heroes[0])
				heroes[0].up_ = false;
		break;
	}
}

function getRandom(min,max){
    return Math.random() * (1 + max - min) + min;
}