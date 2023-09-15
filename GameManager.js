const statisticContainer = document.getElementById('StatisticsInfo')
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var deltaTime = 0

const failed_transaction = new Audio('sounds/insufficient_funds.mp3');
const valid_transaction = new Audio('sounds/valid_funds.mp3');
const click_sound = new Audio('sounds/mouse_click.mp3')
click_sound.volume = 0.1

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
var statisticalResourceNames = new Array('Rubles', 'AvailableHousing', 'TotalHousing')
var statisticalResourceAmounts = new Array();

var resourceNames = new Array("Wood", "Coal", "Lumber");
var resourceAmounts = new Array();
var resourceEfficiency = new Array();
var resourceOptionIndex = 0

var SaveWaitTime = 30000

// Sets up the player states
const PlayerStates = {
	None: "None",
	Placing: "Placing"
}
var CurrentPlayerState = PlayerStates.None

// Where we store keybinds
let KeybindsConfig = [
	{
		Action: "Switch Resource",
		KeyAssigned: "T",
		Description: "Switches the current mining resource of the player"
	},
	{
		Action: "Cancel Placement",
		KeyAssigned: "Q",
		Description: "Cancels the placement/purchase of an object/building"

	},
	{
		Action: "Easter-Egg",
		KeyAssigned: "C",
		Description: "I have no idea"
	},
]

// Where we store items and their worth
let ShopItems = [

	{
		ItemName: 'Tent',
		ResourcesList: ['Wood', 'Coal'],
		ResourceAmounts: [15, 15],
	},
	{
		ItemName: 'Worker',
		ResourcesList: ['AvailableHousing', 'Coal'],
		ResourceAmounts: [1, 20],
	}
]

var KeybindActionNames = new Array()
var Keybinds = new Array()
var KeybindDescriptions = new Array()

// Creates a keybind UI element inside of the keybinds window for every keybind that exists

function RandomNum(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function wait(TimeSet) {
	return new Promise(resolve => setTimeout(resolve, TimeSet));
}

function CloseWindow(WindowClosing) {
	document.getElementById(WindowClosing).style.display = "none"
}

function OpenWindow(WindowOpening, displayStyle) {
	document.getElementById(WindowOpening).style.display = displayStyle
}

function EaseInAudio(AudioSource, volume) {
	var currentVolume = volume

	setTimeout(function () {
		if (currentVolume < 0.5) {
			currentVolume += 0.01
			AudioSource.volume = currentVolume
			EaseInAudio(AudioSource, currentVolume)
		}
	}, 10)
}

function EaseOutAudio(AudioSource, volume) {
	var currentVolume = volume

	setTimeout(function () {
		if (currentVolume > 0) {
			currentVolume -= 0.01
			if (currentVolume <= 0) {
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
	for(i = 0; i < resourceNames.length; i++) {
		// Saves the resource amount
		localStorage.setItem(resourceNames[i] + "Amount", resourceAmounts[i])
		// Saves the gather effeciancy of the resource
		localStorage.setItem(resourceNames[i] + "Efficiency", resourceEfficiency[i])
	}
	for(i = 0; i < statisticalResourceNames; i++) {
		localStorage.setItem(statisticalResourceNames[i] + "Amount", statisticalResourceAmounts[i])
	}
}

function LoadData() {
	for(i = 0; i < resourceNames.length; i++) {
		// Loads the resource amount
		var resourceAmountLoad = localStorage.getItem(resourceNames[i] + "Amount")
		console.log(resourceAmountLoad)
		resourceAmounts.push(Number(resourceAmountLoad))
		// Saves the gather effeciancy of the resource
		var resourceEfficiencyLoad = localStorage.getItem(resourceNames[i] + "Efficiency")
		resourceEfficiency.push(Number(resourceEfficiencyLoad))
	}
	for(i = 0; i < statisticalResourceNames.length; i++) {
		var statisticalResourceAmountLoad = localStorage.getItem(statisticalResourceNames[i] + "Amount")
		statisticalResourceAmounts.push(Number(statisticalResourceAmountLoad))
	}
}

function CheckData() {
	if(localStorage.getItem(resourceNames[0] + "Amount") != null) {
		LoadData()
		console.log("we just found and loaded data!")
	} else {
		console.log("we didn't find any data, creating new data")
		for(i = 0; i < resourceNames.length; i++) {
			resourceAmounts.push(0)
			resourceEfficiency.push(1)
		}
		for(i = 0; i < statisticalResourceNames.length; i++) {
			statisticalResourceAmounts.push(0)
		}

	}
}

function SetupKeybinds() {
	// Sorts different characteristics of a keybind to different arrays for accessing
	for(i = 0; i < KeybindsConfig.length; i++) {
		KeybindActionNames.push(KeybindsConfig[i].Action)
		Keybinds.push(KeybindsConfig[i].KeyAssigned)
		KeybindDescriptions.push(KeybindsConfig[i].Description)
	}
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
}

function SetupStatistics() {
	for(i = 0; i < statisticalResourceNames.length; i++) {
		var newInfoLabel = document.createElement('p')
		newInfoLabel.classList.add('infoText')
		newInfoLabel.id = statisticalResourceNames[i]
		newInfoLabel.innerText = statisticalResourceNames[i] + " : " + statisticalResourceAmounts[i]
		statisticContainer.appendChild(newInfoLabel)
	}
	for(i = 0; i < resourceNames.length; i++) {
		var newInfoLabel = document.createElement('p')
		newInfoLabel.classList.add('infoText')
		newInfoLabel.id = resourceNames[i]
		newInfoLabel.innerText = resourceNames[i] + " : " + resourceAmounts[i]
		statisticContainer.appendChild(newInfoLabel)
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
	document.getElementById(resourceNames[resourceOptionIndex]).innerHTML = resourceNames[resourceOptionIndex] + " : " + resourceAmounts[resourceOptionIndex];
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
	var ItemObject = ShopItems.filter(obj => obj.ItemName === ItemBought)[0];
	console.log(ItemObject)
}

function update() {
	oldTime = Date.now()
	requestAnimationFrame(function () {
		update()
		deltaTime = Date.now() - oldTime / 1000;
	})
}

document.addEventListener('keyup', function (e) {
	if(e.key == 't') {
		console.log("Switched Resource");
		switchResource();
	} else if(e.key == "q") {
		console.log("Pressed Q");
	}
}, false);

document.addEventListener('click', function () {
	click_sound.currentTime = 0;
	click_sound.play();
}, false)

addEventListener("selectstart", event => event.preventDefault());

setInterval(SaveData, SaveWaitTime);
CheckData()
SetupStatistics()
SetupKeybinds()
update();