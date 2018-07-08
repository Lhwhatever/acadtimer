var startCount;
var duration;
var counting;
var showSec;
var startTime;
var recolourLast15;
var alertLast15;
var timeout15;
var canPlayMusic;

playMusic = __;
pauseMusic = __;

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

yieldLast15 = function() {
	doRecolour = recolourLast15 ? function() {
		$('body').css('background-color', '#3f0000');
		recolourLast15 = false;
	} : __;

	playSiren = alertLast15 ? function() {
		$('#siren').get(0).play();
		alertLast15 = false;
	} : __;

	return function() {
		doRecolour();
		playSiren();
		playMusic();
	}
}

handlePlayPause = function() {
	if(startTime == null) { // was paused
		startTime = Date.now();

		timeTillLast15 = (duration - getCounter() - 900) * 1000;
		if(timeTillLast15 > 0) timeout15 = setTimeout(yieldLast15(), timeTillLast15);

		renderLoop = setInterval(function() {
			var counter = getCounter();
			if(counter < duration) renderTime(counter);
			else endTimer();
		}, renderInterval);

		playMusic();

	} else { // was playing
		if(timeout15 !== null) {
			clearTimeout(timeout15);
			timeout15 = null;
		}
		clearInterval(renderLoop);
		startCount += (Date.now() - startTime) / 1000;
		startTime = null;

		pauseMusic();
	}
}

endTimer = function() {
	clearInterval(renderLoop);
	startTime = null;
	$('#time').text('Time\'s Up!');
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

setupAudio = function() {
	if(alertLast15) {
		$('#siren').on('loadeddata', function() {
			alertLast15 = true;
		});
		alertLast15 = false;
		$('#siren').attr('src', '../soundeffects/siren.mp3');
	}

	if(canPlayMusic) {
		var musicAvailable = [[__, __], [__, __]];

		$('#music-last15').attr('src', '../music/last15.mp3');
		$('#music-last15').on('loadeddata', function() {
			musicAvailable[1] = [function() {
				$('#music-last15').get(0).play();
			}, function() {
				$('#music-last15').get(0).pause();
			}];
		});

		var minutes = Math.floor(duration / 60);
		$('#music').attr('src', '../music/' + Math.floor(minutes / 60) + 'h' + (minutes % 60).toString().padStart(2, '0') + 'min.mp3');
		$('#music').on('loadeddata', function() {
			musicAvailable[0] = [function() {
				$('#music').get(0).play();
			}, function() {
				$('#music').get(0).pause();
			}];
		});
		

		playMusic = function() {
			if(getCounter() <= duration - 900) musicAvailable[0][0]();
			else musicAvailable[1][0]();
		}

		pauseMusic = function() {
			if(getCounter() <= duration - 900) musicAvailable[0][1]();
			else musicAvailable[1][1]();
		}
	}
}

$(document).ready(function() {

	var text1 = getUrlParam('text1');
	if(text1 == null) $('#text1').remove()
	else $('#text1').text(text1);

	var text2 = getUrlParam('text2');
	if(text2 == null) $('#text2').remove()
	else $('#text2').text(text2);

	setup();
	setupFontSizes();

	duration = getUrlParam('duration') * 60;
	$('#endtext').html('DURATION: ' + formatTime(duration, false));

	counting = getUrlParam('count');
	if(counting == 'up') roundingFunc = Math.floor;
	else if(counting == 'down') roundingFunc = Math.ceil;
	else throw new Exception('counting: expected up or down, received ' + counting);

	showSec = getUrlParam('showSec') == null;
	recolourLast15 = getUrlParam('recolour15') != null;
	renderInterval = Math.min(Math.max(getUrlParam('refresh') || 200, 10), 500);

	alertLast15 = getUrlParam('siren') !== '0';
	canPlayMusic = getUrlParam('music') !== '0';

	setupAudio();

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
		console.log(event.originalEvent.data);
		if(event.originalEvent.data == 'play' || event.originalEvent.data == 'pause') handlePlayPause();
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
