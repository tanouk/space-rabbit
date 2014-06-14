var stage;
var preloadCount = 0;
var PRELOADTOTAL = 13;
var img_joueur = new Image();
var obj_joueur;

var PLAYERSPEED = 6;
var touches = {};

var img_sky = [new Image(), new Image(), new Image()];
var obj_sky = [];

var SAUCISSECOUNT = 10;
var img_saucisse = [new Image(), new Image(), new Image()];
var obj_saucisse = [];

var score = 0;
var scoreTexte;

var img_tir = new Image(); var obj_tir;

var vies = 3; var highScore = 0;
var viesTexte; var highScoreTexte;

var difficulte = 1;
var menuTexte = [];
var inMenu = true;

var img_joueur_hit = new Image();
var invincibleTimer = 0;
var invincibleCligno = false;

var level = 1; var levelTexte;
var levelProgress;

var progresBord; var progresContenu;

var pointsDeVie = 100;
var pointsDeVieTexte;

addEventListener("keydown", function (e)
{
	touches[e.keyCode] = true;
	// disable default behavior of arrow keys:
	if ((e.keyCode >= 37) && (e.keyCode <= 40)) e.preventDefault();

	// disable default behavior of space keys:
	if (e.keyCode == 32) e.preventDefault();

	// disable default behavior of F1/F2/F3 keys:
	if ((e.keyCode >= 112) && (e.keyCode <= 114)) e.preventDefault();
	return false;
});

addEventListener("keyup", function (e)
{
	delete touches[e.keyCode];
	return false;
});

function startGame() {
	preloadAssets();
}

function preloadAssets() {
	// player img preload
	img_joueur.onload = preloadUpdate();
	img_joueur.src = "media/joueur.png";
	img_joueur_hit.onload = preloadUpdate();
	img_joueur_hit.src = "media/joueur_hit.png";

	// sky img preload
	for (var i=0; i<3; i++) {
		img_sky[i].onload = preloadUpdate();
		img_sky[i].src = "media/ciel" + i + ".png";
	}

	// sausages img preload
	for (var i=0; i<3; i++) {
		img_saucisse[i].onload = preloadUpdate();
		img_saucisse[i].src = "media/saucisse" + i + ".png";
	}

	// Sounds
	createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
	createjs.Sound.addEventListener("loadComplete", preloadUpdate);
	createjs.Sound.registerSound("media/boing.mp3|media/boing.ogg", "boing");
	createjs.Sound.registerSound("media/music.mp3|media/music.ogg", "music");
	createjs.Sound.registerSound("media/pouet.mp3|media/pouet.ogg", "pouet");
	createjs.Sound.registerSound("media/panpan.mp3|media/panpan.ogg", "panpan");

	// shoots assets
	img_tir.onload = preloadUpdate();
	img_tir.src = "media/tir.png";
}

function preloadUpdate() {
	preloadCount++;
	if (preloadCount == PRELOADTOTAL) launchGame();
}

function launchGame() {
	stage = new createjs.Stage(document.getElementById("gameCanvas"));

	// background objects creation
	for (var i=0; i<3; i++) {
		obj_sky[i] = new createjs.Bitmap(img_sky[i]);
		stage.addChild(obj_sky[i]);
	}

	// sausages objects creation
	for (var i=0; i<SAUCISSECOUNT; i++) {
		obj_saucisse[i] = new createjs.Bitmap(img_saucisse[0]);
		stage.addChild(obj_saucisse[i]);
		preparerSaucisse(i);
	}

	// player object creation
	obj_joueur = new createjs.Bitmap(img_joueur);
	stage.addChild(obj_joueur);

	// Shoot onject creation
	obj_tir = new createjs.Bitmap(img_tir);
	stage.addChild(obj_tir);
	obj_tir.x = 10000;

	// game HUD : score, high score, lives, level
	scoreTexte = new createjs.Text("Score : 0", "24px Arial", "#000000");
	scoreTexte.x = 8; scoreTexte.y = 450;
	stage.addChild(scoreTexte);
	viesTexte = new createjs.Text("Vies : 3", "24px Arial", "#000000");
	viesTexte.x = 8; viesTexte.y = 420;
	stage.addChild(viesTexte);
	highScoreTexte = new createjs.Text("highScore: 0", "24px Arial", "#000000");
	highScoreTexte.x = 300; highScoreTexte.y = 450;
	stage.addChild(highScoreTexte);
	levelTexte = new createjs.Text("", "24px Arial", "#000000");
	highScoreTexte.x = 8; highScoreTexte.y = 390;
	stage.addChild(levelTexte);
	pointsDeVieTexte = new createjs.Text("100%", "32px Arial", "#000000");
	pointsDeVieTexte.x = 8; pointsDeVieTexte.y = 320;
	stage.addChild(pointsDeVieTexte);

	// game HUD : progress bar
	var g = new createjs.Graphics();
	g.setStrokeStyle(1);
	g.beginStroke(createjs.Graphics.getRGB(0,0,0));
	g.drawRect(0, 360, 164, 24);
	g.endStroke();
	progresBord = new createjs.Shape(g);
	progresBord.x = 8;
	stage.addChild(progresBord);

	var g2 = new createjs.Graphics();
	g2.beginFill(createjs.Graphics.getRGB(255,0,0));
	g2.drawRect(0, 361, 162, 22);
	g2.endFill();
	progresContenu = new createjs.Shape(g2);
	progresContenu.x = 8;
	stage.addChild(progresContenu);

	// Menu
	for (var i=0; i<3; i++)
	{
		menuTexte[i] = new createjs.Text("", "48px Arial", "#000000");
		menuTexte[i].textAlign = "center";
		menuTexte[i].x = 320; menuTexte[i].y = 130 + 60*i;
		switch (i)
		{
			case 0: menuTexte[i].text = "F1 Facile"; break;
			case 1: menuTexte[i].text = "F2 Moyen"; break;
			case 2: menuTexte[i].text = "F3 Difficile"; break;
		}
		stage.addChild(menuTexte[i]);
	}
	viesTexte.visible = false;
	scoreTexte.visible = false;
	highScoreTexte.visible = false;
	obj_joueur.visible = false;
	levelTexte.visible = false;
	progresBord.visible = false;
	progresContenu.visible = false;
	pointsDeVieTexte.visible = false;

	// Ticker
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick", mainTick);

	// game music
	createjs.Sound.play("music", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.4);
}

function startNewGame(diffi) {
	difficulte = diffi;
	inMenu = false;
	viesTexte.visible = true;
	scoreTexte.visible = true;
	highScoreTexte.visible = true;
	obj_joueur.rotation = 0;
	obj_joueur.image = img_joueur;
	obj_joueur.visible = true;
	invincibleTimer = 0;
	invincibleCligno = false;
	level = 1;
	levelProgress = 0;
	levelTexte.text = "Niveau 1";
	levelTexte.visible = true;
	for (var i=0; i<3; i++) {
		menuTexte[i].visible = false;
	}
	progresBord.visible = true;
	progresContenu.visible = true;
	progresContenu.scaleX = 0;
	pointsDeVie = 100;
	pointsDeVieTexte.text = "100%";
	pointsDeVieTexte.visible = true;
}

function endGame() {
	inMenu = true;
	viesTexte.visible = false;
	scoreTexte.visible = false;
	obj_joueur.visible = false;
	highScoreTexte.visible = false;
	levelTexte.visible = false;
	for (var i=0; i<3; i++) {
		menuTexte[i].visible = true;
	}
	progresBord.visible = false;
	progresContenu.visible = false;
	pointsDeVieTexte.visible = false;
}

function mainTick() {
	// continuous background scrolling
	obj_sky[1].x--;
	obj_sky[2].x -= 4;
	if (obj_sky[1].x < -640) obj_sky[1].x += 640;
	if (obj_sky[2].x < -640) obj_sky[2].x += 640;

	// IN MENU
	if (inMenu)
	{
		if (112 in touches) startNewGame(1);
		else if (113 in touches) startNewGame(2);
		else if (114 in touches) startNewGame(3);
	}

	// IN GAME
	else
	{
		// player blinking if hit
		if (invincibleTimer > 0)
		{
			invincibleTimer--;
			invincibleCligno = !invincibleCligno;

			if (!invincibleCligno || invincibleTimer <= 0)
				obj_joueur.image = img_joueur;
			else
				obj_joueur.image = img_joueur_hit;
		}

		// player moves
		if ((38 in touches) && (obj_joueur.y > -32)) obj_joueur.y -= PLAYERSPEED;
		else if ((40 in touches) && (obj_joueur.y < 448)) obj_joueur.y += PLAYERSPEED;

		if ((37 in touches) && (obj_joueur.x > -64))
		{
			obj_joueur.x -= PLAYERSPEED;
			if (obj_joueur.rotation > -20) obj_joueur.rotation -=2;
		}
		else if ((39 in touches) && (obj_joueur.x < 576))
		{
			obj_joueur.x += PLAYERSPEED;
			if (obj_joueur.rotation < 20) obj_joueur.rotation +=2;
		}
		else
		{
			if (obj_joueur.rotation > 0) obj_joueur.rotation--;
			else if (obj_joueur.rotation < 0) obj_joueur.rotation++;
		}

		// player shoots & shoots moves
		if ((32 in touches) && (obj_tir.x > 640)) {
			createjs.Sound.play("panpan", createjs.Sound.INTERRUPT_NONE);
			obj_tir.x = obj_joueur.x + 64;
			obj_tir.y = obj_joueur.y;
		}
		if (obj_tir.x <= 640) obj_tir.x += 16;

		// sausages moves & collisions
		for (var i=0; i<SAUCISSECOUNT; i++) {
			// evil sausages are tracking the player:
			if (obj_saucisse[i].mechante)
			{
				if (obj_saucisse[i].y > obj_joueur.y) obj_saucisse[i].y -= 2;
				else if (obj_saucisse[i].y < obj_joueur.y) obj_saucisse[i].y += 2;
			}

			// sausages moves update:
			if (obj_saucisse[i].mechante) obj_saucisse[i].x -= 4 + difficulte*4 + level;
			else obj_saucisse[i].x -= 2 + difficulte*2 + level;

			// sausage went away from game screen:
			if (obj_saucisse[i].x < -64)
			{
				preparerSaucisse(i);
			}
			// sausage collision with player:
			else if ((obj_saucisse[i].x > obj_joueur.x - 40) && (obj_saucisse[i].x < obj_joueur.x + 96)
				 && (obj_saucisse[i].y > obj_joueur.y - 16) && (obj_saucisse[i].y < obj_joueur.y + 44))
			{
				// player hit by a bad sausage !
				if (obj_saucisse[i].pourrie && invincibleTimer <= 0)
				{
					invincibleTimer = 25;
					score -=2;
					createjs.Sound.play("pouet", createjs.Sound.INTERRUPT_NONE);
					pointsDeVie -= 20;
					if (pointsDeVie <= 0)
					{
						vies--;
						pointsDeVie = 100;
						obj_joueur.x = 0; obj_joueur.y = 0; obj_joueur.rotation = 0;
						if (vies < 1)
						{
							vies = 3;
							for (var j=0; j<SAUCISSECOUNT; j++) {preparerSaucisse(j);}
							obj_joueur.x = 0; obj_joueur.y = 0;
							obj_tir.x = 10000;
							if (score > highScore) highScore = score;
							highScoreTexte.text = "highScore : " + highScore;
							score = 0;
							endGame();
						}
						viesTexte.text = "Vies : " + vies;
					}
					pointsDeVieTexte.text = pointsDeVie + "%";
				}
				// player grabs a good sausage !
				else if (!obj_saucisse[i].pourrie)
				{
					score += difficulte;
					createjs.Sound.play("boing", createjs.Sound.INTERRUPT_NONE);
					levelProgress++;
					if (levelProgress == 15)
					{
						levelProgress = 0;
						level++;
						levelTexte.text = "Niveau " + level;
					}
					progresContenu.scaleX = (levelProgress / 15);
				}
				scoreTexte.text = "Score : " + score;
				preparerSaucisse(i);
			}
			// shoots collisions vs. sausages
			else if ((obj_saucisse[i].x > obj_tir.x - 40) && (obj_saucisse[i].x < obj_tir.x + 96)
				 && (obj_saucisse[i].y > obj_tir.y - 16) && (obj_saucisse[i].y < obj_tir.y + 44))
			{
				obj_tir.x = 10000;
				preparerSaucisse(i);
			}
		}
	}

	// display refresh
	stage.update();
}

function preparerSaucisse(index) {
	obj_saucisse[index].x = Math.floor((Math.random() * 448) + 640);
	obj_saucisse[index].y = Math.floor((Math.random() * 448));
	obj_saucisse[index].rotation = (Math.random()*10) - 5;

	obj_saucisse[index].pourrie = (Math.random() < .5);
	if (obj_saucisse[index].pourrie)
		obj_saucisse[index].mechante = (Math.random() < .25);
	else
		obj_saucisse[index].mechante = false;

	if (obj_saucisse[index].mechante)
		obj_saucisse[index].image = img_saucisse[2];
	else if (obj_saucisse[index].pourrie)
		obj_saucisse[index].image = img_saucisse[1];
	else
		obj_saucisse[index].image = img_saucisse[0];
}

































