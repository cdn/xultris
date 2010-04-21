var version;

// user defined variables
var speed = 0; // overall game speed: -10 to +10, 0 is normal
var scores = [1,0,10,25,50,100]; // fall, spawn, 1line, 2line, 3line, 4line
var highscores = true;

var instructionsURL = "http://no-home/mozilla/xultris/instructions.html";
var highscoresScript = "http://no-home/mozilla/xultris/highscores.cgi";
var highscoresURL = "http://no-home/mozilla/xultris/highscores.xml";

var debug = true;

// define pieces here. you can add as many as you like
var Pieces = [
	//each piece is 4x4 .. each array is one horizontal row
	//[x,y,x2,y2,x3,y3,x4,y4]
	new Piece([1,0,1,1,1,2,0,2],[0,0,0,1,1,1,2,1],[1,0,2,0,1,1,1,2],[0,1,1,1,2,1,2,2],"background-color: yellow;"), /* mirrored L */
	new Piece([0,0,1,1,0,1,1,0],[0,0,1,1,0,1,1,0],[0,0,1,1,0,1,1,0],[0,0,1,1,0,1,1,0],"background-color: red;"), /* square */
	new Piece([1,0,1,1,1,2,1,3],[0,1,1,1,2,1,3,1],[1,0,1,1,1,2,1,3],[0,1,1,1,2,1,3,1],"background-color: purple;"), /* line */
	new Piece([0,1,1,1,2,1,2,0],[1,0,1,1,1,2,2,2],[0,2,0,1,1,1,2,1],[0,0,1,0,1,1,1,2],"background-color: green;"), /* normal L */
	new Piece([0,0,0,1,1,1,1,2],[0,1,1,1,1,0,2,0],[0,0,0,1,1,1,1,2],[0,1,1,1,1,0,2,0],"background-color: pink;"), /* squiggle */
	new Piece([0,2,0,1,1,1,1,0],[0,0,1,0,1,1,2,1],[0,2,0,1,1,1,1,0],[0,0,1,0,1,1,2,1],"background-color: cyan;"), /* other squiggle */
	new Piece([1,0,1,1,0,1,2,1],[1,0,1,1,1,2,2,1],[0,1,1,1,2,1,1,2],[1,0,1,1,1,2,0,1],"background-color: orange;") /* 3 pronged thing */
];

// internal vars
var curposx;
var curposy;
var curpiece;
var nextpiece;
var widthofgrid;
var heightofgrid;
var gameison=false;
var pauseison=false;
var intervalID;
var grid;
var score;  //current score
var level;  //current level
var startlevel = 1; //the level to start at in a new 1p game
var junklevel = 0;  //the level of junk to start with in a new 1p game
var fastfall = false;  //fall style for down-arrow (true = immediate, false = slow (normal))
//var bgimage = "true";  //bgimage option
var gridborder = true; //whether or not grid has grey border
var pieceoffclass = "off";  //piece off class.  either "off" or "offnoborder"
var totalrows;	//total # of rows completed in the current game
var inputEnabled = true; //must disable (ignore) input for certain parts of the game.
var netPlayer;
var is2player;
var fullpiece = new Piece([0,0,0,1,0,2,0,3,1,0,1,1,1,2,1,3,2,0,2,1,2,2,2,3,3,0,3,1,3,2,3,3],[0,0,0,1,0,2,0,3,1,0,1,1,1,2,1,3,2,0,2,1,2,2,2,3,3,0,3,1,3,2,3,3],[0,0,0,1,0,2,0,3,1,0,1,1,1,2,1,3,2,0,2,1,2,2,2,3,3,0,3,1,3,2,3,3],[0,0,0,1,0,2,0,3,1,0,1,1,1,2,1,3,2,0,2,1,2,2,2,3,3,0,3,1,3,2,3,3],"");
var playerName;

function Piece(p1,p2,p3,p4,style)
{
	this.rot1 = p1;
	this.rot2 = p2;
	this.rot3 = p3;
	this.rot4 = p4;
	this.style = style;

	this.maxleft1 = Piece_getMaxLeft(this.rot1);
	this.maxright1 = Piece_getMaxRight(this.rot1);
	this.maxbot1 = Piece_getMaxBot(this.rot1);
	this.maxleft2 = Piece_getMaxLeft(this.rot2);
	this.maxright2 = Piece_getMaxRight(this.rot2);
	this.maxbot2 = Piece_getMaxBot(this.rot2);
	this.maxleft3 = Piece_getMaxLeft(this.rot3);
	this.maxright3 = Piece_getMaxRight(this.rot3);
	this.maxbot3 = Piece_getMaxBot(this.rot3);
	this.maxleft4 = Piece_getMaxLeft(this.rot4);
	this.maxright4 = Piece_getMaxRight(this.rot4);
	this.maxbot4 = Piece_getMaxBot(this.rot4);

	this.rotateclockwise = Piece_rotateclockwise;
	this.rotateanticlockwise = Piece_rotateanticlockwise;
	this.init = Piece_init;

	this.init();
}
function Piece_init()
{
	this.currot = this.rot1;
	this.maxleft = this.maxleft1;
	this.maxright = this.maxright1;
	this.maxbot = this.maxbot1;
}
function Piece_rotateclockwise()
{
	if (!inputEnabled) return;

	if (this.currot == this.rot1) {
		this.currot = this.rot2;
		this.maxleft = this.maxleft2;
		this.maxright = this.maxright2;
		this.maxbot = this.maxbot2;
	} else if (this.currot == this.rot2) {
		this.currot = this.rot3;
		this.maxleft = this.maxleft3;
		this.maxright = this.maxright3;
		this.maxbot = this.maxbot3;
	} else if (this.currot == this.rot3) {
		this.currot = this.rot4;
		this.maxleft = this.maxleft4;
		this.maxright = this.maxright4;
		this.maxbot = this.maxbot4;
	} else if (this.currot == this.rot4) {
		this.currot = this.rot1;
		this.maxleft = this.maxleft1;
		this.maxright = this.maxright1;
		this.maxbot = this.maxbot1;
	}
}

function Piece_rotateanticlockwise()
{
	if (!inputEnabled) return;

	if (this.currot == this.rot1) {
		this.currot = this.rot4;
		this.maxleft = this.maxleft4;
		this.maxright = this.maxright4;
		this.maxbot = this.maxbot4;
	} else if (this.currot == this.rot2) {
		this.currot = this.rot1;
		this.maxleft = this.maxleft1;
		this.maxright = this.maxright1;
		this.maxbot = this.maxbot1;
	} else if (this.currot == this.rot3) {
		this.currot = this.rot2;
		this.maxleft = this.maxleft2;
		this.maxright = this.maxright2;
		this.maxbot = this.maxbot2;
	} else if (this.currot == this.rot4) {
		this.currot = this.rot3;
		this.maxleft = this.maxleft3;
		this.maxright = this.maxright3;
		this.maxbot = this.maxbot3;
	}

}
function Piece_getMaxLeft(c)
{
	var ret=2;
	for (var i=0 ; i<c.length ; i=i+2)
	{
		if (c[i] < ret)
		{
			ret = c[i];
		}
	}
	return ret;
}
function Piece_getMaxRight(c)
{
	var ret=0;
	for (var i=0 ; i<c.length ; i=i+2)
	{
		if (c[i] > ret)
		{
			ret = c[i];
		}
	}
	return ret;
}
function Piece_getMaxBot(c)
{
	var ret=0;
	for (var i=1 ; i<c.length ; i=i+2)
	{
		if (c[i] > ret)
		{
			ret = c[i];
		}
	}
	return ret;
}

function getVersion()
{
	return version;
}

function startup()
{
    readPrefs();

	widthofgrid=document.getElementById("columns").childNodes.length;
	heightofgrid=document.getElementById("rows").childNodes.length;

	grid = new Array(widthofgrid);

	for (var i=0 ; i<widthofgrid ; i++)
	{
		grid[i] = new Array(heightofgrid);
	}
	drawPreview(fullpiece, pieceoffclass);

	// hide the options button if playing over web
	// (open dialog not allowed)
    /*
	if (new String(window.location).indexOf("http") == 0)
	{
	  document.getElementById("buttonOptions").setAttribute("style","display: none;");
	}
    */

	netPlayer = new NetPlayer();
	netPlayer.init();

	version = document.getElementById("version").getAttribute("value");
}

function readPrefs()
{
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.xultris.");

    try
    {
        fastfall = !prefs.getBoolPref("fall-style-slow");
        gridborder = prefs.getBoolPref("grid-enabled"); 
        startlevel = prefs.getIntPref("start-level");
        junklevel = prefs.getIntPref("junk");
        playerName = prefs.getCharPref("player-name");
    }
    catch (e) {}

    invalidateGridBorder();
}

function invalidateGridBorder()
{
	var gridclass;

	if (gridborder) {
		gridclass = "greyborder";
		pieceoffclass = "off";
	} else {
		gridclass = "noborder";
		pieceoffclass = "offnoborder";
	}
	
	var mypiece;

	for (var i=0 ; i<widthofgrid ; i++)
	{
		for (var j=0 ; j<heightofgrid ; j++)
		{
			var prepareString = ("r" + make2digit(parseInt(j)) + "c" + make2digit(parseInt(i)));
			mypiece = document.getElementById(prepareString).getAttribute("class");
			if (mypiece != "on") {
				document.getElementById(prepareString).setAttribute("class",gridclass);
			}

			prepareString = ("p2r" + make2digit(parseInt(j)) + "c" + make2digit(parseInt(i)));
			mypiece = document.getElementById(prepareString).getAttribute("class");
			if (mypiece != "on") {
				document.getElementById(prepareString).setAttribute("class",gridclass);
			}
		}
	}
}

function newGame(inlevel, injunk)
{
	//inlevel = initial level to start at
	//injunk = how much initial junk 

	if (is2player)
	{
		inlevel = 1;
		injunk = 0;
	}

	resetScore();  //score to 0
	resetLevel(inlevel);
	resetRows();  //set totalrows to 0
	//gameOverMan();
	for (var i=0 ; i<widthofgrid ; i++)
	{
		for (var j=0 ; j<heightofgrid ; j++)
		{
			grid[i][j] = false;
			var prepareString = ("r" + make2digit(parseInt(j)) + "c" + make2digit(parseInt(i)));
			document.getElementById(prepareString).setAttribute("class",pieceoffclass);
			document.getElementById(prepareString).setAttribute("style","");
		}
	}
	initGridJunk(injunk);
	drawPreview(fullpiece,pieceoffclass);
	pause(true);
	gameison = true;
	pauseison = false;
	curpiece = null;
	nextpiece = null;
	clearInfoText();
	halt();
	unhalt();
	niceInfoText("Go!!!");
	spawnNewPiece();
}

function isMobile()
{
    return (document.getElementById("main-window").getAttribute("class") == "mobile");
}

function newOPGame() //new one-player game
{
    if (hasBlockingDialog()) return;

	if (gameison && !isMobile())
	{
		pause();
		if (confirm("Start new game?  (Abandon this one)"))
		{
            readPrefs();
			newGame(startlevel, 0);
		}else{
			pause();
		}
	} else {
        readPrefs();
		newGame(startlevel, junklevel);
	}
	//newGame(startlevel, junklevel);
	//junk code not implemented yet.
}

/*
function startNewTPGame() //new 2-player game
{
	if (gameison && !pauseison)
	{
		pause();
	}


	unfocus();openDialog('2player.xul','blank','chrome,modal',netPlayer);unfocus();

	netPlayer.win = window;

	if (netPlayer && netPlayer.isConnected())
	{
		document.getElementById("connected").setAttribute("style","display: block;");
		is2player = true;
        readPrefs();
		newGame(startlevel, 0);
	}
	else if (pauseison)
	{
		pause();
	}
}
*/

function tpDialogStartup()
{
	tpVars = window.arguments[0];

	version = tpVars.version;

	document.getElementById('cancelButton').focus();
}

function TPVars()
{
	this.version = version;
	this.go = false;
}

function pause(forceunpause, netPause)
{
    if (hasBlockingDialog()) return;
	if (!gameison && !forceunpause) return;

	if (pauseison || forceunpause)
	{
		pauseison = false;
		clearInfoText();
		document.getElementById("pauseButton").setAttribute("value","Pause");
		if (is2player && netPlayer && !netPause) netPlayer.pushUnpause();
		unhalt();
	} else {
		pauseison = true;
		setInfoText("Paused");
		if (is2player && netPlayer && !netPause) netPlayer.pushPause();
		document.getElementById("pauseButton").setAttribute("value","Unpause");
		halt();
	}
}

function moveleft()
{
	if (!gameison || pauseison || !inputEnabled) return;
	if (checkifonscreen(curpiece,curposx-1,curposy) && checkifnothingintheway(curpiece,curposx-1,curposy))
	{
		deletepiece();
		curposx--;
		redraw();
	}
}

function moveright()
{
	if (!gameison || pauseison  || !inputEnabled) return;
	if (checkifonscreen(curpiece,curposx+1,curposy) && checkifnothingintheway(curpiece,curposx+1,curposy))
	{
		deletepiece();
		curposx++;
		redraw();
	}
}

function rotateanticlockwise()
{
	if (!gameison || pauseison || !inputEnabled) return;
	halt();
	deletepiece();
	curpiece.rotateclockwise();
	if (checkifonscreen(curpiece,curposx,curposy) && checkifnothingintheway(curpiece,curposx,curposy))
	{
	} else {
		curpiece.rotateanticlockwise();
	}
	redraw();
	unhalt();
} 

function rotateclockwise()
{
	if (!gameison || pauseison || !inputEnabled) return;
	deletepiece();
	curpiece.rotateanticlockwise();
	if (checkifonscreen(curpiece,curposx,curposy) && checkifnothingintheway(curpiece,curposx,curposy))
	{
	} else {
		curpiece.rotateclockwise();
	}
	redraw();
} 

function halt()
{
	if (intervalID) {
		window.clearInterval(intervalID);
		intervalID = 0;
	}
}

function unhalt()
{
	speed=speed%10;
	var spe;
	if (level >= 10)
	{
		spe = 100-(speed*40);
	} else {
		spe = 500-(level+speed)*40;
	}
	if (spe<50) spe=50;
	if (!intervalID) intervalID = window.setInterval("tick()",spe);
}

function tick() {
	fall(1);
}

function fall(by)
{
	if (!gameison) return;
	if (!by) by = 1;
	if (checkifonscreen(curpiece,curposx,curposy+by) && checkifnothingintheway(curpiece,curposx,curposy+by))
	{
		deletepiece();
		curposy=curposy+by;
		redraw();
	} else if (checkIfFull()) {
		gameOverMan();
	} else {
		setAsStuck(curpiece,curposx,curposy);
		checkForFullLine(curposy,curpiece.maxbot);
		spawnNewPiece();
	}
	increaseScore(scores[0]);
}

function checkIfFull()
{
	for (var i=0 ; i<widthofgrid ; i++)
	{
		if (grid[i][0]) return true;
	}
	return false;
}

function gameOverMan(youwin)
{
	mDump ("Game over man!\n");
	gameison = false;
	halt();
	if (!is2player) {
		setInfoText("Game Over!");
		/*
		if (score>6000 && confirm("Congratulations! You may have got a high score!\nClick OK to connect to the high score server."))
		{
			saveHighScore();
		}
		*/
	} else {
		if (youwin) {
			youWin();
		} else {
			youLose();
		}
	}

	is2player = false;
}

function youLose()
{
	setInfoText("You Lose!");
	//theSocket.write("<xultris:youwin/>\n");
	//netplayWrite("<xultris:youwin/>");

	if (netPlayer) netPlayer.pushWin();
}

function youWin()
{
	setInfoText("You Win!");
}

function checkForFullLine(start,range)
{
	halt();
	var prepareString;
	var totalCheck=0;
	//start++;
	//for (i=start-range ; i<start+range ; i++)
	for (var i=0 ; i<heightofgrid ; i++)
	{
		var thiscount=0;
		for (var j=0 ; j<widthofgrid ; j++){
			prepareString = ("r" + make2digit(parseInt(i)) + "c" + make2digit(parseInt(j)));
			if (grid[parseInt(j)][parseInt(i)])
			{
				thiscount++;
			}
		}
		if (thiscount == widthofgrid)
		{
			//dump("found full line at "+i+"\n");
			updateRows();
			clearRow(i);
			totalCheck++;
		}
	}
	increaseScore(scores[totalCheck+1]);
	if ((is2player)&&(totalCheck>1)&&netPlayer) netPlayer.pushLines(totalCheck);
	unhalt();
}

function updateRows()
{
	totalrows++;

	//update level every 10 completed rows
	if (!(totalrows % 10))
	{
		if (!is2player) increaseLevel(1);
	}
	document.getElementById("totalrows").setAttribute("value",totalrows);
}

function clearRow(r)
{
	var prepareString;
	for (var i=0 ; i<widthofgrid ; i++)
	{
		prepareString = ("r" + make2digit(parseInt(r)) + "c" + make2digit(parseInt(i)));
		document.getElementById(prepareString).setAttribute("class",pieceoffclass);
		document.getElementById(prepareString).setAttribute("style","");
		grid[i][r] = false;
	}
	//we also need to move the above onstyle cells down one.
	for (i=r ; i>=0 ; i--){
		for (var j=0 ; j<widthofgrid ; j++)
		{
			prepareString = ("r" + make2digit(parseInt(i)) + "c" + make2digit(parseInt(j)));
			if (grid[parseInt(j)][parseInt(i)])
			{
				//turn this off
				var thisstyle = document.getElementById(prepareString).getAttribute("style");
				document.getElementById(prepareString).setAttribute("class",pieceoffclass);
				document.getElementById(prepareString).setAttribute("style","");
				grid[j][i] = false;
				//turn the one beneath on
				prepareString = ("r" + make2digit(parseInt(i)+parseInt(1)) + "c" + make2digit(parseInt(j)));
				document.getElementById(prepareString).setAttribute("class","on");
				document.getElementById(prepareString).setAttribute("style",thisstyle);
				grid[j][i+1] = true;
			}
		}
	}
}

function spawnNewPiece()
{
	halt();
	if (!nextpiece)
	{
		//we're just started a new game
		curpiece = Pieces[Math.floor(Math.random()*Pieces.length)];
	} else {
		nextpiece.init();
		drawPreview(nextpiece,pieceoffclass);
		curpiece = nextpiece;
	}
	nextpiece = Pieces[Math.floor(Math.random()*Pieces.length)];
	curpiece.init();
	nextpiece.init();
	drawPreview(nextpiece,"on");
	curposx = Math.floor(widthofgrid/2);
	curposy = 0;
	if (checkIfFull())
	{
		gameOverMan();
	} else {
		redraw();
		increaseScore(scores[1]);
	}
	unhalt();
}

function droppiece()
{
	if (!gameison || pauseison) return;
	if (fastfall)
	{
		droppieceall();
	} else {
		fall(1);
	}
}

function droppieceall()
{
	if (!gameison || pauseison || !inputEnabled) return;
	disableInput();
	deletepiece();
	while (checkifonscreen(curpiece,curposx,curposy+1) && checkifnothingintheway(curpiece,curposx,curposy+1))
	{
		curposy=curposy+1;
		increaseScore(scores[0]);
	}
	setAsStuck(curpiece,curposx,curposy);
	enableInput();
	redraw();
}

function disableInput() {
   inputEnabled = false;
}

function enableInput() {
   inputEnabled = true;
}

function drawpiece(p,x,y,style)
{
	var prepareString;
	for (var i=0 ; i<p.currot.length ; i=i+2)
	{
		prepareString = ("r" + make2digit(parseInt(y)+parseInt(p.currot[i+1])) + "c" + make2digit(parseInt(x)+parseInt(p.currot[i])));
		document.getElementById(prepareString).setAttribute("class",style);
		if (style=="on")
		{
			document.getElementById(prepareString).setAttribute("style",p.style);
		} else {
			document.getElementById(prepareString).setAttribute("style","");
		}
	}
}

function redraw()
{
	drawpiece(curpiece,curposx,curposy,"on");
}

function deletepiece()
{
	drawpiece(curpiece,curposx,curposy,pieceoffclass);
}

function make2digit(n)
{
	if ((n < 10) || (n.length && (n.length == 1)))
	{
		return "0" + n;
	} else if (((n > 9) && (n < 100)) || (n.length == 2)) {
		return "" + n;
	} else {
		return "00";
	}
}

function checkifonscreen(p,x,y)
{
	return ((x + p.maxleft >= 0) && (x + p.maxright < widthofgrid) && (y + p.maxbot < heightofgrid));
}


function checkifnothingintheway(p,x,y)
{
	var prepareString;
	for (var i=0 ; i<p.currot.length ; i=i+2)
	{
		//prepareString = ("r" + make2digit(parseInt(y)+parseInt(p.currot[i+1])) + "c" + make2digit(parseInt(x)+parseInt(p.currot[i])));
		if (grid[parseInt(x)+parseInt(p.currot[i])][parseInt(y)+parseInt(p.currot[i+1])])
		{
			return false;
		}
	}
	return true;
}

function setAsStuck(p,x,y)
{
	var prepareString;
	for (var i=0 ; i<p.currot.length ; i=i+2)
	{
		//prepareString = ("r" + make2digit(parseInt(y)+parseInt(p.currot[i+1])) + "c" + make2digit(parseInt(x)+parseInt(p.currot[i])));
		grid[parseInt(x)+parseInt(p.currot[i])][parseInt(y)+parseInt(p.currot[i+1])] = true;
	}
}

function increaseScore(s)
{
	if (s)
	{
		s *= level;

		//if (Math.floor(score/1000) != Math.floor((s+score)/1000)) increaseLevel(1);

		//Old code increased level every 1000 points, which makes no sense at upper levels.
		//(Your level increases merely by the points accumulated from falling pieces!)
		//New method increases level every 10 completed lines. (see checkForFullLine() and updateRows())

		score+=s;
		document.getElementById("currentscore").setAttribute("value", score);
	}
}

function increaseLevel(l)
{
	if (is2player) return;
	if (!l) l=1;
	level+=1;
	document.getElementById("currentlevel").setAttribute("value", level);
	halt();
	unhalt(); // increases speed.
	niceInfoText("Level " + level + "!"); 
}

function initGridJunk(junklevel)
{
	for (var j=(heightofgrid - junklevel) ; j<heightofgrid ; j++)
	{
		var currentLineRandCount = 0; //this is to make sure we don't randomly create a full line on accident

		for (var i=0 ; i<widthofgrid ; i++)
		{
			var zbool; 
			zbool = Math.round(Math.random()*1.2);
			if (zbool)
			{
				currentLineRandCount++;
				if (currentLineRandCount < 9)
				{
					grid[i][j] = true;
					var prepareString = ("r" + make2digit(parseInt(j)) + "c" + make2digit(parseInt(i)));
					document.getElementById(prepareString).setAttribute("class","on");
					document.getElementById(prepareString).setAttribute("style","background-color: teal");
				}
			}
		}
	}
}

function resetScore()
{
	score=0;
	document.getElementById("currentscore").setAttribute("value", 0);
}

function resetLevel(l)
{
	level = l
	document.getElementById("currentlevel").setAttribute("value", level);
}

function resetRows()
{
	totalrows=0;
	document.getElementById("totalrows").setAttribute("value",0);
}

function setInfoText(t)
{
	document.getElementById("infotext").setAttribute("value",t);
}

function clearInfoText()
{
	setInfoText("");
}

function niceInfoText(intext)
{
	setInfoText(intext);
	setTimeout("clearInfoText()",1000);
}

function drawPreview(p,style)
{
	if (!p) return;
	var x=0;
	var y=0;
	if (p.maxright == 1) x=1;
	if (p.maxbot == 1) y=1;
	var prepareString;
	for (var i=0 ; i<p.currot.length ; i=i+2)
	{
		prepareString = ("pr" + make2digit(parseInt(y)+parseInt(p.currot[i+1])) + "c" + make2digit(parseInt(x)+parseInt(p.currot[i])));
		document.getElementById(prepareString).setAttribute("class",style);
		if (style=="on")
		{
			document.getElementById(prepareString).setAttribute("style",p.style);
		} else {
			document.getElementById(prepareString).setAttribute("style","");
		}
	}

}

function openHighScores()
{
	window.open(highscoresURL,"Xultris High Scores","menubar=false,directories=false,toolbar=false,location=false,width=300,height=400,resizable");
}

function saveHighScore()
{
	var prepareString = highscoresScript + "?score=" + score + "&referer=" + document.location;
	window.open(prepareString,"Xultris High Scores","menubar=false,directories=false,toolbar=false,location=false,width=300,height=400,resizable");
}

function unfocus() {
	document.getElementById('maingrid').focus();
}

function mDump(str) {
	dump ("Xultris: "+str+"\n");
}

function addJunk(numLines) {
	var hole=Math.floor(Math.random()*widthofgrid)
	//dump("Added "+num+" netplay lines\n");
	halt();
    var prepareString;
	for (k=0 ; k<numLines ; k++) {
    //we also need to move the above onstyle cells down one.
	for (j=0 ; j<widthofgrid ; j++) {
		for (i=0 ; i<heightofgrid ; i++) {
			prepareString = ("r" + make2digit(parseInt(i)) + "c" + make2digit(parseInt(j)));
			if (grid[parseInt(j)][parseInt(i)]) {
				//turn this off
				var thisstyle = document.getElementById(prepareString).getAttribute("style");
				document.getElementById(prepareString).setAttribute("class",pieceoffclass);
				document.getElementById(prepareString).setAttribute("style","");
				grid[j][i] = false;
				//turn the one above on
				prepareString =
("r"+make2digit(parseInt(i)-parseInt(1))+"c"+make2digit(parseInt(j)));
				document.getElementById(prepareString).setAttribute("class","on");
				document.getElementById(prepareString).setAttribute("style",thisstyle);
				grid[j][i-1] = true;
			}
		}
	}

    for (i=0 ; i<widthofgrid ; i++)
    {
		if (i!=hole) {
	        prepareString = ("r"+make2digit(heightofgrid-1)+"c" + make2digit(parseInt(i)));
	        document.getElementById(prepareString).setAttribute("class","on");
	        document.getElementById(prepareString).setAttribute("style","background-color: white;");
	        grid[i][heightofgrid-1] = true;
		}
    }
	}
	unhalt();
}


/* -------- Begin instructions & options window code -------- */

function showInstructionsWindow()
{
	if (gameison && !pauseison)
	{
		pause();
	}

	window.openDialog('instructions.xul','blank','chrome,modal,centerscreen');unfocus();

	if (pauseison)
	{
		pause();
	}

}

/*
function showOptionsWindow()
{
	if (gameison && !pauseison)
	{
		pause();
	}
	//gotta stuff variables into an object & pass it to the window due to scope
	var theOptions = new Options();
	openDialog('options.xul','options','chrome,modal', theOptions);
	//after the window has closed, set the game settings to the modified theOptions object properties
	startlevel = theOptions.lev;
	junklevel = theOptions.junk;
	fastfall = theOptions.fall;
	bgimage = theOptions.bgimage;
	gridborder = theOptions.gridborder;
	
	delete theOptions;  //just in case ...

	if (bgimage == "true")
	{
		document.getElementById("maingrid").setAttribute("class", "bgimage");
	} else {
		document.getElementById("maingrid").setAttribute("class", "nobgimage");
	}

	var gridclass;
	if (gridborder == "true") {
		gridclass = "greyborder";
		pieceoffclass = "off";
	} else {
		gridclass = "noborder";
		pieceoffclass = "offnoborder";
	}
	
	var mypiece;

	for (var i=0 ; i<widthofgrid ; i++)
	{
		for (var j=0 ; j<heightofgrid ; j++)
		{
			var prepareString = ("r" + make2digit(parseInt(j)) + "c" + make2digit(parseInt(i)));
			mypiece = document.getElementById(prepareString).getAttribute("class");
			if (mypiece != "on") {
				document.getElementById(prepareString).setAttribute("class",gridclass);
			}
		}
	}

	//for (i=0 ; i<4 ; i++)
	//{
    //	for (j=0 ; j<4 ; j++)
	//	{
	//		prepareString = ("pr" + make2digit(parseInt(j)) + "c" + make2digit(parseInt(i)));
	//		mypiece = document.getElementById(prepareString).getAttribute("class");
	//		if (mypiece != "on") {
	//			document.getElementById(prepareString).setAttribute("style","border-style: none;");
	//		}
	//	}
	//}

	drawPreview(fullpiece,pieceoffclass);
	drawPreview(nextpiece,"on");

	if (pauseison)
	{
		pause();
	}

	//redraw();	
}

function initOptionsWindow()
{
	var localoptions = window.arguments[0];

	if (localoptions.fall == "true")
	{
		document.getElementById("radioFallStyle").selectedIndex = 0;
	} else {
		document.getElementById("radioFallStyle").selectedIndex = 1;
	}

	if (localoptions.bgimage == "false")
	{
		document.getElementById("radioBGImage").selectedIndex = 0;
	} else {
		document.getElementById("radioBGImage").selectedIndex = 1;
	}

	if (localoptions.gridborder == "false")
	{
		document.getElementById("radioGridBorder").selectedIndex = 0;
	} else {
		document.getElementById("radioGridBorder").selectedIndex = 1;
	}

	document.getElementById("startlevel").selectedIndex = localoptions.lev-1;
	document.getElementById("junk").selectedIndex = localoptions.junk;

	//document.getElementById("scrollStartLevel").setAttribute("curpos", " " + Math.abs(localoptions.lev - 10));
	//document.getElementById("scrollJunkLevel").setAttribute("curpos", " " + Math.abs(localoptions.junk - 5));
	//document.getElementById("textStartLevel").setAttribute("value", " " + localoptions.lev);
	//document.getElementById("textJunkLevel").setAttribute("value", " " + localoptions.junk);

	document.getElementById('cancelButton').focus();	
}

function closeOptionsWindow()
{
	//why it is necessary to do this again, I'm not sure, but it is.
	var localoptions = window.arguments[0];
	//localoptions.lev = (9 - (document.getElementById("scrollStartLevel").getAttribute("curpos")) + 1);
	//localoptions.junk = (5 - (document.getElementById("scrollJunkLevel").getAttribute("curpos")));
	localoptions.lev = document.getElementById("startlevel").selectedIndex + 1;
	localoptions.junk = document.getElementById("junk").selectedIndex;
	localoptions.fall = document.getElementById("radioFallStyle").getAttribute("value");

	window.close();
}

function Options () {
	this.lev = startlevel;
	this.junk = junklevel;
	this.fall = fastfall;
	this.bgimage = bgimage;
	this.gridborder = gridborder;
}

function updateStartLevel()
{
	var localoptions = window.arguments[0];	

	localoptions.lev = (9 - (document.getElementById("scrollStartLevel").getAttribute("curpos")) + 1);
	document.getElementById("textStartLevel").setAttribute("value", " " + localoptions.lev);
}

function updateJunkLevel()
{
	var localoptions = window.arguments[0];

	localoptions.junk = (5 - (document.getElementById("scrollJunkLevel").getAttribute("curpos")));
	document.getElementById("textJunkLevel").setAttribute("value", " " + localoptions.junk);
}

function updateFallStyle()
{
	var localoptions = window.arguments[0];
	localoptions.fall = (document.getElementById("radioFallStyle").getAttribute("value"));
}

function updateBGImage()
{
	var localoptions = window.arguments[0];
	localoptions.bgimage = (document.getElementById("radioBGImage").getAttribute("value"));
}

function updateGridBorder()
{
	var localoptions = window.arguments[0];
	localoptions.gridborder = (document.getElementById("radioGridBorder").getAttribute("value"));
}
*/

function showNetPlayDialog()
{
	if (gameison && !pauseison)
	{
		pause();
	}

    readPrefs();


    document.getElementById("netplay-player-name").value = playerName;

    var netplayList = document.getElementById("netplay-list");

    while (netplayList.itemCount > 0)
        netplayList.removeItemAt(0);

    invalidateNetPlayConnectButton();

    document.getElementById("superbox").style.opacity = "0.75";
    document.getElementById("netplay").collapsed = false;
    document.getElementById("netplay-player-name").focus();
}

function hasBlockingDialog()
{
    return (!document.getElementById("netplay").collapsed);
}

function invalidateNetPlayConnectButton()
{
    document.getElementById("netplay-connect-button").disabled = (document.getElementById("netplay-player-name").value == "");
}

function netPlayConnect()
{
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.xultris.");

    try {
        prefs.setCharPref("player-name", document.getElementById("netplay-player-name").value);
    } catch (e) {}

    // TODO magic
}

function hideNetPlayDialog()
{
    document.getElementById("superbox").style.opacity = "1";
    document.getElementById("netplay").collapsed = true;
}
