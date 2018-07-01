var startCount;
var duration;
var counting;
var showSec;
var startTime;
var recolourLast15;

var renderLoop;
var renderInterval = 200;
var loopFunction;
var aboveZero;

getCounter = function() {
	return (startTime == null) ? startCount : startCount + (Date.now() - startTime) / 1000;
}

renderTime = function(counter) {
	var number = formatTime(counting == 'up' ? counter : duration - counter, showSec);
	if(!aboveZero && Math.ceil(counter) > 0) {
		aboveZero = true;
		$('#time').removeClass('neg');
	}
	$('#time').html(number);
}

yieldLoopFunction = function() {
	if(recolourLast15 == 1) {
		var recolourWhen = duration - 900;
		return function() {
			var counter = getCounter();
			if(recolourLast15 == 1 && counter >= recolourWhen) {
				$('body').css('background-color', '#3f0000');
				recolourLast15++;
			}
			if(counter < duration) renderTime(counter);
			else endTimer();
		}
	} else return function() {
		var counter = getCounter();
		if(counter < duration) renderTime(counter);
		else endTimer();
	}
}

handlePlayPause = function() {
	if(startTime == null) { // was paused
		startTime = Date.now();
		renderLoop = setInterval(yieldLoopFunction(), renderInterval);
	} else { // was playing
		clearInterval(renderLoop);
		startCount += (Date.now() - startTime) / 1000;
		startTime = null;
	}
}

endTimer = function() {
	clearInterval(renderLoop);
	startTime = null;
	$('#time').html('Time\'s Up!');
}

setupFontSizes = function() {
	$('#time').css({
		'font-size': function() {
			return Math.min(window.innerWidth * 1.46, window.innerHeight * 0.262);
		}
	});

	$('.minor').css({
		'font-size': function() {
			return Math.min(window.innerWidth * 0.292, window.innerHeight * 0.0524);
		}
	});
}

$(document).ready(function() {

	var text1 = getUrlParam('text1');
	if(text1 == null) $('#text1').remove()
	else $('#text1').html(text1);

	var text2 = getUrlParam('text2');
	if(text2 == null) $('#text2').remove()
	else $('#text2').html(text2);

	setup();
	setupFontSizes();

	duration = getUrlParam('duration') * 60;
	$('#endtext').html('DURATION: ' + formatTime(duration, false));

	counting = getUrlParam('count');
	if(counting == 'up') roundingFunc = Math.floor;
	else if(counting == 'down') roundingFunc = Math.ceil;
	else throw new Exception('counting: expected up or down, received ' + counting);

	showSec = getUrlParam('showSec') == null;
	recolourLast15 = getUrlParam('recolour15') == null ? 0 : 1;

	var start = parseInt(getUrlParam('countdown')) || 'defer';
	if(!isNaN(start)) {
		aboveZero = false;
		$('#time').addClass('neg');
		startCount = -start;
		handlePlayPause();
	} else {
		aboveZero = true;
		startCount = 0;
		renderTime(getCounter());
	}

	$(window).on('message', function(event) {
		if(event.originalEvent.data == 'playpause') handlePlayPause();
	});

	$('body').keypress(function(event) {
		switch(event.which) {
			case 32:
				window.opener.postMessage('playpause', '*');
				handlePlayPause();
				break;

			case 115:
				window.opener.postMessage('stop', '*');
				break;

			default:
				break;
		}
	});

})

$(window).on('unload', function() {
	if(window.opener !== null) window.opener.postMessage('stop', '*');
});
