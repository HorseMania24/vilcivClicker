const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var deltaTime = 0

const failed_transaction = new Audio('sounds/insufficient_funds.mp3');
const valid_transaction = new Audio('sounds/valid_funds.mp3');
const click_sound = new Audio('sounds/mouse_click.mp3')
click_sound.volume = 0.25

var HitAudio = new Audio();
const woodHitVariations = new Array('sounds/Hits/WoodHit1.mp3', 'sounds/Hits/WoodHit2.mp3', 'sounds/Hits/WoodHit3.mp3', 'sounds/Hits/WoodHit4.mp3', 'sounds/Hits/WoodHit5.mp3');
const coalHitVariations = new Array('sounds/Hits/CoalHit1.mp3', 'sounds/Hits/CoalHit2.mp3');
var musicAudio = new Audio();
musicAudio.volume = 0
var music = new Array('sounds/day_time.mp3', 'sounds/Ice_cavern.mp3');
var musicIndex = 0;
var muteMusic = true;
musicAudio.loop = true

var isDayTime = true;
var isNightTime = false;
var rubles = 0
var resourceNames = new Array("Wood", "Coal", "Lumber");
var resourceAmounts = new Array();
var resourceEfficiency = new Array();
var resourceOptionIndex = 0
var SaveWaitTime = 30000

// Where we store items and their worth
let ShopItems = [
	{
		ItemName: 'Tent',
		Resources: ['Wood','Coal'],
		ResourceAmounts: [15, 15],
	},
	{

	}
]

// Where we store keybinds
let KeybindsConfig = [
	{
		"Action": "Switch Resource",
		"KeyAssigned": "T",
		"Description": "Switches the current mining resource of the player"
	},
	{
		"Action": "Cancel Placement",
		"KeyAssigned": "Q",
		"Description": "Cancels the placement/purchase of an object/building"

	},
	{
		"Action": "Easter-Egg",
		"KeyAssigned": "C",
		"Description": "Switches the current mining resource of the player"
	}
]

var KeybindActionNames = new Array()
var Keybinds = new Array()
var KeybindDescriptions = new Array()

// Sorts different characteristics of a keybind to different arrays for accessing
for(i = 0; i < KeybindsConfig.length; i++) {
	KeybindActionNames.push(KeybindsConfig[i].Action)
	Keybinds.push(KeybindsConfig[i].KeyAssigned)
	KeybindDescriptions.push(KeybindsConfig[i].Description)
}

// Creates a keybind UI element inside of the keybinds window for every keybind that exists
for(i = 0; i < KeybindActionNames.length; i++) {
	var KeybindDivContainer = document.createElement('div')

	var KeybindDescriptionText = document.createElement('p')
	KeybindDescriptionText.innerText = KeybindDescriptions[i]
	KeybindDescriptionText.classList.add('KeybindActionDesc')
	
	var KeybindActionText = document.createElement('p')
	KeybindActionText.innerText = KeybindActionNames[i] + ": "
	KeybindActionText.classList.add('KeybindActionText')

	var ChangeKeybindButton = document.createElement('button')
	ChangeKeybindButton.innerText = 'Key-Assigned: ' + Keybinds[i]
	ChangeKeybindButton.classList.add('Button95Style')
	ChangeKeybindButton.classList.add('KeybindButtonChange')

	document.getElementById('KeybindsContainer').appendChild(KeybindDivContainer)
	KeybindDivContainer.classList.add("ContentContainer")
	KeybindDivContainer.classList.add("Window95Inset")
	KeybindDivContainer.classList.add("Window95DoubleInset")
	KeybindDivContainer.appendChild(KeybindActionText)
	KeybindDivContainer.appendChild(KeybindDescriptionText)
	KeybindDivContainer.appendChild(ChangeKeybindButton)
}

function RandomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function wait(TimeSet) {
	  return new Promise(resolve => setTimeout(resolve, TimeSet));
}

function CloseWindow(WindowClosing) {
	document.getElementById(WindowClosing).style.display = "none"
	click_sound.play()
}

function OpenWindow(WindowOpening, displayStyle) {
	document.getElementById(WindowOpening).style.display = displayStyle
	click_sound.play()
}

function EaseInAudio(AudioSource, volume) {
	var currentVolume = volume

	setTimeout(function() {
		if (currentVolume < 0.5) {
			currentVolume += 0.01
			AudioSource.volume = currentVolume
			EaseInAudio(AudioSource, currentVolume)
		}
	}, 10)
}

function EaseOutAudio(AudioSource, volume) {
	var currentVolume = volume

	setTimeout(function() {
		if (currentVolume > 0) {
			currentVolume -= 0.01
			if(currentVolume <= 0) {
				currentVolume = 0
				AudioSource.volume = currentVolume
				AudioSource.pause();
			} else {
				AudioSource.volume = currentVolume
				EaseOutAudio(AudioSource, currentVolume)
			}
		}
	}, 10)
}

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
        musicAudio.src = music[RandomNum(0, music.length)];
        musicAudio.play();
		EaseInAudio(musicAudio, 0)
        muteMusic = false;
		document.getElementById('musicButton').innerHTML = "Music: On"
    } else if(muteMusic == false) {
        EaseOutAudio(musicAudio, musicAudio.volume)
        muteMusic = true;
		document.getElementById('musicButton').innerHTML = "Music: Off"
    }
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
	document.getElementById('CurrentResource').innerHTML = resourceNames[resourceOptionIndex];
	document.getElementById('ResourceEfficiency').innerHTML = resourceEfficiency[resourceOptionIndex];
}

function BuyItem(ItemBought) {

}

function update() {
	oldTime = Date.now()
	requestAnimationFrame(function() {
		update()
		deltaTime = Date.now() - oldTime / 1000
	})
}


document.addEventListener('keydown', function(e) {
	if(e.key == 't') {
		console.log("E pressed");
		switchResource();
	}
}, false);

setInterval(SaveData, SaveWaitTime)
update()