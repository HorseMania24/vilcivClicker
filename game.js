var failed_transaction = new Audio('sounds/insufficient_funds.mp3');
var valid_transaction = new Audio('sounds/valid_funds.mp3')

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
	if(e.key == ' ') {
		console.log('space');
		resourceClicker();
	}
	else if(e.key == 't') {
		console.log("E pressed");
		switchResource();
	}
}, false);

function resourceClicker() {
	if(resourceOption == 1) {
		woodAmount += woodEffeciancy;
		document.getElementById('wood').innerHTML = woodAmount;
	} else if(resourceOption == 2) {
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
	}
}