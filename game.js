var failed_transaction = new Audio('sounds/insufficient_funds.mp3');
var valid_transaction = new Audio('sounds/valid_funds.mp3');
var HitAudio = new Audio();
var woodHitVariations = new Array('sounds/Hits/WoodHit1.mp3', 'sounds/Hits/WoodHit2.mp3', 'sounds/Hits/WoodHit3.mp3', 'sounds/Hits/WoodHit4.mp3', 'sounds/Hits/WoodHit5.mp3');
var coalHitVariations = new Array('sounds/Hits/CoalHit1.mp3', 'sounds/Hits/CoalHit2.mp3');

var SaveWaitTime = 5000

var musicAudio = new Audio();
var music = new Array('sounds/day_time.mp3', 'sounds/Ice_cavern.mp3');
var musicIndex = 0;
var muteMusic = true;
musicAudio.loop = true

var isDayTime = true;
var isNightTime = false;
var isShowingKeybinds = false;
var rubles = 0
var resourceNames = new Array("Wood", "Coal", "Lumber");
var resourceAmounts = new Array();
var resourceEfficiency = new Array();
var resourceOptionIndex = 0

var tentWood = 15;
var tentCoal = 15;

document.getElementById("KeybindsWindow").style.display = "none"


function RandomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function sleep(TimeSet) {
	  return new Promise(resolve => setTimeout(resolve, TimeSet));
}

document.addEventListener('keydown', function(e) {
	if(e.key == 't') {
		console.log("E pressed");
		switchResource();
	}
}, false);

function SaveData() {
	console.log("We just saved data")
	for (i = 0; i < resourceNames.length; i++) {
		// Saves the resource amount
		localStorage.setItem(resourceNames[i] + "Amount", resourceAmounts[i])
		// Saves the gather effeciancy of the resource
		localStorage.setItem(resourceNames[i] + "Efficiency", resourceEfficiency[i])
	}
}

function LoadData() {
	for (i = 0; i < resourceNames.length; i++) {
		// Loads the resource amount
		var resourceAmountLoad = localStorage.getItem(resourceNames[i] + "Amount")
		resourceAmounts.push(Number(resourceAmountLoad))
		// Saves the gather effeciancy of the resource
		var resourceEfficiencyLoad = localStorage.getItem(resourceNames[i] + "Efficiency")
		resourceEfficiency.push(Number(resourceEfficiencyLoad))
		document.getElementById(resourceNames[i]).innerHTML = resourceAmounts[i];
	}
}

if (localStorage.getItem(resourceNames[0] + "Amount") != null) {
	LoadData()
	console.log("we just found and loaded data!")
} else {
	console.log("we didn't find any data, creating new data")
	for (i = 0; i < resourceNames.length; i++) {
		resourceAmounts.push(0)
		resourceEfficiency.push(1)
	}

}

function MusicManager() {
    if(muteMusic == true) {
        musicAudio.src = music[musicIndex];
        musicAudio.play();
        musicAudio.volume = 0.5;
        muteMusic = false;
        console.log(muteMusic);
		document.getElementById('musicButton').innerHTML = "Music: On"
    } else if(muteMusic == false) {
        musicAudio.pause();
        muteMusic = true;
        console.log(muteMusic);
		document.getElementById('musicButton').innerHTML = "Music: Off"
    }
}

function CloseWindow(WindowClosing) {
	document.getElementById(WindowClosing).style.display = "none"
}

function OpenWindow(WindowOpening) {
	document.getElementById(WindowOpening).style.display = ""
}

function resourceClicker() {
	if(resourceOptionIndex == 0) {
        HitAudio.src = woodHitVariations[RandomNum(0, woodHitVariations.length)];
        HitAudio.play();
	} else if(resourceOptionIndex == 1) {
        HitAudio.src = coalHitVariations[RandomNum(0, coalHitVariations.length)];
        HitAudio.play();
	}
	resourceAmounts[resourceOptionIndex] += resourceEfficiency[resourceOptionIndex]
	document.getElementById(resourceNames[resourceOptionIndex]).innerHTML = resourceAmounts[resourceOptionIndex];
}

function switchResource() {
	resourceOptionIndex += 1;
	if(resourceOptionIndex >= resourceNames.length) {
		resourceOptionIndex = 0
	}
	document.getElementById('currentResource').innerHTML = resourceNames[resourceOptionIndex];
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

async function SaveDataTimed() {
	await sleep(SaveWaitTime)
	SaveData()
}

SaveDataTimed()
