const statisticContainer = document.getElementById('StatisticsInfo');
const canvas = document.getElementById('canvas');
canvas.width = Math.round(window.innerWidth *  0.6);
canvas.height = Math.round(window.innerHeight * 0.7);
canvas.style.filter = 'saturate(0.75) hue-rotate(50deg) brightness(45%)';
const ctx = canvas.getContext('2d');
ctx.translate(canvas.width*0.5,canvas.height*0.5);
ctx.imageSmoothingEnabled = false;
var CameraPosX = 0;
var CameraPosY = 0;
var CameraVelX = 0;
var CameraVelY = 0;
var CameraZoomScale = 3;
const MaxZoom = 3;
const MinZoom = 1;
const MinRenderDistance = 400;
var CurrentRenderDistance = 400;

const failed_transaction = new Audio('sounds/insufficient_funds.mp3');
const valid_transaction = new Audio('sounds/valid_funds.mp3');
const click_sound = new Audio('sounds/mouse_click.mp3');
click_sound.volume = 0.1;

var HitAudio = new Audio();
const woodHitVariations = new Array('sounds/Hits/WoodHit1.mp3', 'sounds/Hits/WoodHit2.mp3', 'sounds/Hits/WoodHit3.mp3', 'sounds/Hits/WoodHit4.mp3', 'sounds/Hits/WoodHit5.mp3');
const coalHitVariations = new Array('sounds/Hits/CoalHit1.mp3', 'sounds/Hits/CoalHit2.mp3');
var musicAudio = new Audio();
musicAudio.volume = 0;
var music = new Array('music/day_time.mp3', 'music/ice_cavern.mp3','music/osr_autumn.mp3','music/osr_forest.mp3','music/osr_harmony.mp3','music/osr_newbie.mp3','music/osr_start.mp3','music/osr_stillnight.mp3','music/osr_venture.mp3');
var musicIndex = 0;
var muteMusic = true;
musicAudio.loop = true;

var isDayTime = true;
var isNightTime = false;
var statisticalResourceNames = new Array('Rubles', 'AvailableHousing', 'TotalHousing');
var statisticalResourceAmounts = new Array();

var resourceNames = new Array("Wood", "Coal", "Lumber");
var resourceAmounts = new Array();
var resourceEfficiency = new Array();
var resourceOptionIndex = 0;
var workers = new Array();
var ChunkCache = new Array();
var SaveWaitTime = 30000;

function Draw(SpriteRendering, PosX, PosY, SpriteWidth, SpriteHeight, AnimationFrame) {
	if(Math.abs(CameraPosX + PosX) > CurrentRenderDistance || Math.abs(CameraPosY + PosY) > CurrentRenderDistance) {
		return
	} else {
		ctx.drawImage(SpriteRendering, (SpriteWidth * AnimationFrame) - SpriteWidth, 0, SpriteWidth, SpriteHeight, Math.round((PosX + CameraPosX) * CameraZoomScale),Math.round((PosY + CameraPosY) * CameraZoomScale), SpriteWidth * CameraZoomScale, SpriteHeight * CameraZoomScale)
	}
}

// Sets up the player states
const PlayerStates = {
	None: "None",
	Placing: "Placing"
}
var CurrentPlayerState = PlayerStates.None

// Where we store keybinds
let KeybindsConfig = [
	{
		Action: "Move-Up",
		KeyAssigned: "W",
		Description: "Moves the player's viewport UP"
	},
	{
		Action: "Move-Down",
		KeyAssigned: "S",
		Description: "Moves the player's viewport DOWN"
	},
	{
		Action: "Move-Left",
		KeyAssigned: "A",
		Description: "Moves the player's viewport LEFT"
	},
	{
		Action: "Move-Right",
		KeyAssigned: "D",
		Description: "Moves the player's viewport RIGHT"
	},
	{
		Action: "Zoom-Out",
		KeyAssigned: "Q",
		Description: "Zoomes the player's viewport OUT"
	},
	{
		Action: "Zoom-In",
		KeyAssigned: "E",
		Description: "Zoomes the player's viewport IN"
	},
	{
		Action: "Switch Resource",
		KeyAssigned: "T",
		Description: "Switches the current mining resource of the player"
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

const MaleFirstNames = new Array('Joe', 'Bob', 'Horse', 'Jerry', 'Robert','Nair','Sloe','Kai','Ronald','Richard','Ulysis')
const FemaleFirstnames = new Array('Rebecca', 'Emily', 'Rowanda', 'Keesha', 'Roe', 'Jessica', 'Marline', 'Molly')
const LastNames = new Array('Smith', 'Coal', 'Roe')

class SpriteObject {
	constructor(startX, startY, SpriteGiven, Width, Height) {
		this.PosX = startX
		this.PosY = startY
		this.Sprite = SpriteGiven
		this.SpriteWidth = SpriteGiven.Width
		this.SpriteHeight = SpriteGiven.Height
	}
}

class Particle {
	constructor(density, VerticalSpeed, HorizontalSpeed, ParticleSprite, MaxParticleWidth, MinParticleHeight) {
		this.ParticleAmount = density
		this.SpeedX = HorizontalSpeed
		this.SpeedY = VerticalSpeed
		this.SizeX = ParticleWidth
		this.SizeY = ParticleHeight
		this.ParticleAmount = density
		this.ParticleContainer = new Array()
		for(i = 0; i < this.ParticleAmount; i++) {

		}
	}
}

class Worker {
	constructor(startX, startY) {
		this.CurrentAnimation = new Image()
		this.AnimationFrames = 0
		this.CurrentAnimationFrame = 1
		this.SpriteWidth = 24
		this.SpriteHeight = 24
		this.Facing = 'Down'
		this.VelocityX = 0
		this.VelocityY = 0

		this.WalkAnimations = {
			Walkdown: 'sprites/MaleVillager/MaleVillager_WalkDown.png',
			Walkup: 'sprites/MaleVillager/MaleVillager_WalkUp.png',
			Walkleft: 'sprites/MaleVillager/MaleVillager_WalkLeft.png',
			Walkright: 'sprites/MaleVillager/MaleVillager_WalkRight.png',
			AnimationFrames: 8
		}

		this.CurrentAnimation.src = this.WalkAnimations.Walkdown
		this.AnimationFrames = this.WalkAnimations.AnimationFrames

		this.WorkerStates = {
			Working: "Working",
			Resting: "Resting",
		}
		this.AvailableJobs = {
			Lumberjack: "Wood",
			CoalMiner: "Coal"
		}

		this.CurrentWorkerState = 'None'
		this.CurrentWorkerJob = "None"
		this.Gender
		this.FirstName
		this.LastName
		if(RandomNum(0,2) == 1) {
			this.Gender = "Male"
			this.FirstName = MaleFirstNames[RandomNum(0, MaleFirstNames.length)]
		} else {
			this.Gender = "Female"
			this.FirstName = FemaleFirstnames[RandomNum(0, FemaleFirstnames.length)]
		}
		this.LastName = LastNames[RandomNum(0, LastNames.length)]
		this.PosY = startX
		this.PosX = startY
	}

	ChangeState(StateChanged) {
		var newState = Object.keys(this.WorkerStates).find(key => this.WorkerStates[StateChanged] == StateChanged)
		if (newState != null) {
			this.CurrentWorkerState = newState
		} else {
			console.log('Invalid State')
		}
	}

	MoveWorker() {
		this.PosX += 0.5
		this.PosY += 0.5
	}

	GatherResource() {
		if (this.CurrentWorkerJob == this.WorkerStates.Lumberjack) {
			
		}
	}

	ChangeAnimation() {
		if(this.Facing == "Down") {
			this.CurrentAnimation.src = this.WalkAnimations.Walkdown
		} else if(this.Facing == "Down"== 'Up') {
			this.CurrentAnimation.src = this.WalkAnimations.Walkup
		}else if(this.Facing == "Down" == 'Left') {
			this.CurrentAnimation.src = this.WalkAnimations.Walkleft
		}else if(this.Facing == "Down" == 'Right') {
			this.CurrentAnimation.src = this.WalkAnimations.Walkright
		}
	}

	PlayAnimation() {
		this.CurrentAnimationFrame += 1
		if (this.CurrentAnimationFrame > this.AnimationFrames) {
			this.CurrentAnimationFrame = 1
			return
		}
	}

	HandleWorker() {
		Draw(this.CurrentAnimation, this.PosX, this.PosY, this.SpriteWidth, this.SpriteHeight, this.CurrentAnimationFrame)
	}
}

class GrassChunk {
	constructor(startX, startY) {
		this.Sprite = new Image()
		this.Sprite.src = 'sprites/World/GrassChunk.png'
		this.SpriteHeight = this.Sprite.height
		this.SpriteWidth = this.Sprite.width
		this.PosX = startX
		this.PosY = startY
	}

	DrawChunk() {
		Draw(this.Sprite, this.PosX, this.PosY, this.SpriteWidth, this.SpriteHeight, 1)
	}
}

var KeybindActionNames = new Array()
var Keybinds = new Array()
var KeybindDescriptions = new Array()

function RandomNum(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
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
	var CanBuy = true
	for(i = 0; i < ItemObject.ResourcesList.length; i++) {
		if (CanBuy == false) {
			break
		} 
		var ResourceTaken = resourceNames.find((resourceFound) => resourceFound == ItemObject.ResourcesList[i])
		if (ResourceTaken != null) {
			var ResourceAmountIndex = resourceNames.indexOf(ResourceTaken)
			if(ItemObject.ResourceAmounts[i] <= resourceAmounts[ResourceAmountIndex]) {
				CanBuy = true
			} else {
				CanBuy = false
			}
		} else if(ResourceTaken == null) {
			ResourceTaken = statisticalResourceNames.find((resourceFound) => resourceFound == ItemObject.ResourcesList[i])
			var ResourceAmountIndex = statisticalResourceNames.indexOf(ResourceTaken)
			if(ItemObject.ResourceAmounts[i] <= statisticalResourceAmounts[ResourceAmountIndex]) {
				CanBuy = true
			} else {
				CanBuy = false
			}
		}
	}
	
	if (CanBuy == true) {
		for(i = 0; i < ItemObject.ResourcesList.length; i++) {
			var ResourceSubtracted = resourceNames.find((resourceFound) => resourceFound == ItemObject.ResourcesList[i])
			if (ResourceSubtracted != null) {
				var ResourceSubtractedIndex = resourceNames.indexOf(ResourceSubtracted)
				resourceAmounts[ResourceSubtractedIndex] -= ItemObject.ResourceAmounts[i]
				document.getElementById(resourceNames[ResourceSubtractedIndex]).innerHTML = resourceNames[ResourceSubtractedIndex] + " : " + resourceAmounts[ResourceSubtractedIndex];
			} else if(ResourceSubtracted == null) {
				ResourceSubtracted = statisticalResourceNames.find((resourceFound) => resourceFound == ItemObject.ResourcesList[i])
				var ResourceAmountIndex = statisticalResourceNames.indexOf(ResourceSubtracted)
				statisticalResourceAmounts[ResourceAmountIndex] -= ItemObject.ResourceAmounts[i]
				document.getElementById(resourceNames[ResourceSubtractedIndex]).innerHTML = statisticalResourceNames[ResourceSubtractedIndex] + " : " + statisticalResourceAmounts[ResourceSubtractedIndex];

			}
		}
		valid_transaction.play()
	} else if(CanBuy == false) {
		failed_transaction.play()
	}
}

// All of the player input
document.addEventListener('keyup', function (input) {
	if(input.key == 't') {
		console.log("Switched Resource");
		switchResource();
	} else if(input.key == "w") {
		if(CameraVelY == 0) {
			CameraVelY = -2
		} else {
			CameraVelY = 0
		}
	} else if(input.key == "s") {
		if(CameraVelY == 0) {
			CameraVelY = 2
		} else {
			CameraVelY = 0
		}
	} else if(input.key == "a") {
		if(CameraVelX == 0) {
			CameraVelX = -2
		} else {
			CameraVelX = 0
		}
	} else if(input.key == 'd') {
		if(CameraVelX == 0) {
			CameraVelX = 2
		} else {
			CameraVelX = 0
		}
	}
}, false);

document.addEventListener('keydown', function(input) {
	if(input.key == "w") {
		if(CameraVelY == -2) {
			CameraVelY = 0
		} else {
			CameraVelY = 2
		}
	} else if(input.key == "s") {
		if(CameraVelY == 2) {
			CameraVelY = 0
		} else {
			CameraVelY = -2
		}
	} else if(input.key == "a") {
		if(CameraVelX == -2) {
			CameraVelX = 0
		} else {
			CameraVelX = 2
		}
	} else if(input.key == 'd') {
		if(CameraVelX == 2) {
			CameraVelX = 0
		} else {
			CameraVelX = -2
		}
	} else if(input.key == 'e') {
		var newScale = CameraZoomScale + 0.1
		if (newScale > MaxZoom) {
			CameraZoomScale = MaxZoom
		} else {
			CameraZoomScale = newScale
		}
		CurrentRenderDistance = Math.round(MinRenderDistance * (MaxZoom - CameraZoomScale))
		if(CurrentRenderDistance < MinRenderDistance) {
			CurrentRenderDistance = MinRenderDistance
		}
	} else if(input.key == 'q') {
		var newScale = CameraZoomScale - 0.1
		console.log(newScale)
		if (newScale < MinZoom) {
			CameraZoomScale = MinZoom
		} else {
			CameraZoomScale = newScale
		}
		CurrentRenderDistance = Math.round(MinRenderDistance * (MaxZoom - CameraZoomScale))
		if(CurrentRenderDistance < MinRenderDistance) {
			CurrentRenderDistance = MinRenderDistance
		}
	}
}, false);

// Plays a click sound when mouse clicks
document.addEventListener('click', function () {
	click_sound.currentTime = 0;
	click_sound.play();
}, false)

function GetMousePosition(input) {
	var rect = canvas.getBoundingClientRect()
	return {
		X: (((input.clientX - rect.left) / CameraZoomScale) - CameraPosX) - (canvas.width / 2 / CameraZoomScale),
		Y: (((input.clientY - rect.top) / CameraZoomScale) - CameraPosY) - (canvas.height / 2 / CameraZoomScale)
	}
}

canvas.addEventListener('click', function (mouse) {
	var ClickPos = GetMousePosition(mouse)
	var NewWorker5 = new Worker(ClickPos.Y, ClickPos.X)
	workers.push(NewWorker5)
}, false)


// Resizes canvas to fit the actual game
function ResizeCanvas() {
	canvas.width = window.innerWidth *  0.6
	canvas.height = window.innerHeight * 0.7
	ctx.imageSmoothingEnabled = false
	ctx.translate(canvas.width*0.5,canvas.height*0.5);
}
window.onresize = ResizeCanvas

function CreateChunks() {
	for(y = 0; y < 25; y++) {
		for(x = 0; x < 25; x++) {
			var NewChunk = new GrassChunk(x * 200, y * 200)
			var NewChunk2 = new GrassChunk(-x * 200, y * 200)
			var NewChunk3 = new GrassChunk(-x * 200, -y * 200)
			var NewChunk4 = new GrassChunk(x * 200, -y * 200)
			ChunkCache.push(NewChunk)
			ChunkCache.push(NewChunk2)
			ChunkCache.push(NewChunk3)
			ChunkCache.push(NewChunk4)
		}
	}
}
function UpdateChunks() {
	for(i =  0; i < ChunkCache.length; i++) {
		ChunkCache[i].DrawChunk()
	}
}

function UpdateWorkers() {
	for(i = 0; i < workers.length; i++) {
		workers[i].HandleWorker()
	}
}

function UpdateCamera() {
	if(CameraVelX != 0) {
		CameraPosX += CameraVelX
	}
	if(CameraVelY != 0) {
		CameraPosY += CameraVelY
	}
}

function FixedUpdate() {
	for(i = 0; i < workers.length; i++) {
		workers[i].PlayAnimation()
	}
}

function Update() {
	ctx.clearRect(0,0, canvas.width, canvas.height)
	UpdateCamera()
	UpdateChunks()
	UpdateWorkers()
	requestAnimationFrame(Update)
}

window.addEventListener('load', function () {
	CheckData()
	SetupStatistics()
	SetupKeybinds()
	CreateChunks()
	setInterval(FixedUpdate, 100)
	Update();
  })

addEventListener("selectstart", event => event.preventDefault());
setInterval(SaveData, SaveWaitTime);