var failed_transaction = new Audio('sounds/insufficient_funds.mp3');
var valid_transaction = new Audio('sounds/valid_funds.mp3');

var musicAudio = new Audio();
var music = new Array('sounds/day_time.mp3', 'sounds/Ice_cavern.mp3');
var musicIndex = 0;
musicAudio.loop = true

var isDayTime = true;
var isNightTime = false;

var HitAudio = new Audio();
var woodHitVariations = new Array('sounds/Hits/WoodHit1.mp3', 'sounds/Hits/WoodHit2.mp3', 'sounds/Hits/WoodHit3.mp3', 'sounds/Hits/WoodHit4.mp3', 'sounds/Hits/WoodHit5.mp3');
var coalHitVariations = new Array('sounds/Hits/CoalHit1.mp3', 'sounds/Hits/CoalHit2.mp3');
var woodHitVarMax = 4;
var coalHitVarMax = 2
var currentHit =0;

var muteMusic = true;

var woodAmount = 0 ;
var coalAmount = 0;
var lumberAmount = 0;
var rubles = 0;
var resourceOption = 1;

var woodEffeciancy = 1;
var coalEffeciancy = 1;

var tentWood = 15;
var tentCoal = 15;

document.addEventListener('keydown', function(e) {
	if(e.key == 't') {
		console.log("E pressed");
		switchResource();
	}
}, false);

function randomHit(min, max) {
    currentHit = Math.floor(Math.random() * (max - min) + min);
}

function MusicManager() {
    if(muteMusic == true) {
        musicAudio.src = music[musicIndex];
        musicAudio.play();
        musicAudio.volume = 0.5;
        muteMusic = false;
        console.log(muteMusic);
    } else if(muteMusic == false) {
        musicAudio.pause();
        muteMusic = true;
        console.log(muteMusic);
    }
}

function resourceClicker() {
	if(resourceOption == 1) {
        randomHit(0, woodHitVarMax);
        HitAudio.src = woodHitVariations[currentHit];
        console.log(currentHit);
        HitAudio.play();
		woodAmount += woodEffeciancy;
		document.getElementById('wood').innerHTML = woodAmount;
	} else if(resourceOption == 2) {
        randomHit(0, coalHitVarMax);
        HitAudio.src = coalHitVariations[currentHit];
        console.log(currentHit);
        HitAudio.play();
		coalAmount += coalEffeciancy;
		document.getElementById('coal').innerHTML = coalAmount;
	}
}

function switchResource() {
	resourceOption += 1;
	if(resourceOption > 2) {
		resourceOption = 1;
	} else if(resourceOption <= 0) {
		resourceOption = 1;
	}
	
	if (resourceOption == 1) {
		document.getElementById('currentResource').innerHTML = 'Wood';
	} else if (resourceOption == 2) {
		document.getElementById('currentResource').innerHTML = 'Coal';
	}
}

function buyTent() {
	if(woodAmount < tentWood  || coalAmount < tentCoal) {
		console.log('Not enough resources!!');
		failed_transaction.play();
	} else if (woodAmount >= tentWood  && coalAmount >= tentCoal) {
		console.log('Bought tent!!');
		woodAmount -= tentWood;
		coalAmount -= tentCoal;
		valid_transaction.play();
		document.getElementById('wood').innerHTML = woodAmount;
		document.getElementById('coal').innerHTML = coalAmount;
        document.getElementById('tentWood').innerHTML = tentWood + ' Wood,';
        document.getElementById('tentCoal').innerHTML = tentCoal + ' Coal';
	}
}