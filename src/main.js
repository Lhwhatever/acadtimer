var localStorage;
var localStorageItemKey = 'acadtimeroptions';
var timerWindow;
var isPlaying;
var isStopped = true;

getOptions = function() {
	return {
		duration: $('select[name=duration]').val(),
		countdown: $('select[name=countdown-duration]').val(),
		'text1': $('input[name=text1]').val() || null,
		'text2': $('input[name=text2]').val() || null,
		playMusic: $('input[name=play-music]').prop('checked'),
		counting: $('input[name=counting]:checked').val(),
		alertLast15: $('input[name=alert15]').prop('checked'),
		recolourLast15: $('input[name=recolour15]').prop('checked'),
		showSec: $('input[name=showsec]').prop('checked'),
		refreshInterval: $('input[name=refresh-interval]').val()
	}
}

setDefaultOptions = function() {
	localStorage.setItem(localStorageItemKey, JSON.stringify(getOptions()));
}

applyOptions = function(options) {
	if(options.duration) $('select[name=duration]').val(options.duration);
	if(options.countdown) $('select[name=countdown-duration] > option[value=' + options.countdown + ']').prop('selected', true);
	if(options.text1) $('input[name=text1]').val(options.text1);
	if(options.text2) $('input[name=text2]').val(options.text2);
	if(options.playMusic !== null) $('input[name=play-music]').prop('checked', options.playMusic);
	if(options.counting) $('input[name=counting]').val([options.counting]);
	if(options.alertLast15 !== null) $('input[name=alert15]').prop('checked', options.alertLast15);
	if(options.recolourLast15 !== null) $('input[name=recolour15]').prop('checked', options.recolourLast15);
	if(options.showSec !== null) $('input[name=showsec]').prop('checked', options.showsec);
	if(options.refreshInterval) $('input[name=refresh-interval]').val(Math.max(Math.min(options.refreshInterval, 500), 10));
}

restoreDefaultOptions = function() {
	var options = JSON.parse(localStorage.getItem(localStorageItemKey));
	if(options !== null) applyOptions(options);
}

resetDefaultOptions = function() {
	localStorage.setItem(localStorageItemKey,
		'{"duration":"60","countdown":"defer","text1":null,"text2":null,"playMusic":true,"counting":"up",\
		"alertLast15":true,"recolourLast15":false,"showSec":true,"refreshInterval":200}'
		);
}

handlePlayPause = function(external) {
	if(external == undefined) external = false;
	if(isPlaying) {
		if(!external) timerWindow.postMessage('pause', '*');
		$('#btn-playpause').text('Play (Spacebar)');
		isPlaying = false;
	} else {
		if(!external) timerWindow.postMessage('play', '*');
		$('#btn-playpause').text('Pause (Spacebar)');
		isPlaying = true;
	}
}

handlePlayPauseInternal = function() {
	return handlePlayPause(false);
}

handlePlayPauseExternal = function() {
	return handlePlayPause(true);
}

handleStop = function() {
	$('#btn-playpause').text('Play (Spacebar)');
	$("#options").prop('hidden', false);
	$("#controls").prop('hidden', true);
	timerWindow.close();
	$('body').keydown(function() {});
	isPlaying = false;
	isStopped = true;
	timerWindow = null;
}

start = function() {
	$("#options").prop('hidden', true);
	$("#controls").prop('hidden', false);

	isStopped = false;

	var options = getOptions();
	var params = {
		duration: options.duration,
		countdown: options.countdown,
		count: options.counting,
		refresh: options.refreshInterval,
	};

	if(options.text1) params.text1 = options.text1;
	if(options.text2) params.text2 = options.text2;
	if(!options.showSec) params.showSec = 1;
	if(options.recolourLast15) params.recolour15 = 1;
	if(!options.alertLast15) params.siren = 0;
	if(!options.playMusic) params.music = 0;

	timerWindow = window.open('src/timer.html?' + $.param(params), 'timerWindow', '_open');
	if (timerWindow.outerWidth < screen.availWidth || timerWindow.outerHeight < screen.availHeight) {
		timerWindow.moveTo(0,0);
		timerWindow.resizeTo(screen.availWidth, screen.availHeight);
	}

	timerWindow.focus();

	isPlaying = options.countdown != 'defer';
	if(isPlaying) $('#btn-playpause').text('Pause (Spacebar)');
	else $('#btn-playpause').text('Play (Spacebar)');
	
}

$( document ).ready(function() {

	$('#row-music').prop('hidden', true);

	$('#audio-test').on('loadeddata', function() {
		$('#row-music').prop('hidden', false);
		$('#btn-mute').prop('hidden', false);
	});

	$('#audio-test').attr('src', 'music/last15.mp3');

	localStorage = window.localStorage;
	restoreDefaultOptions();

	$('#btn-playpause').bind('click', handlePlayPauseInternal);
	$('#btn-stop').bind('click', handleStop);

	$('body').keydown(function(event) {
		if(!isStopped) switch(event.which) {
			case 32:
				handlePlayPauseInternal();
				break;

			case 83:
				handleStop();
				break;

			default: break;
		}
	});

	$( window ).on('message', function(event) {
		if(!isStopped) {
			if(event.originalEvent.data == 'playpause') handlePlayPauseExternal();
			if(event.originalEvent.data == 'stop') handleStop();
		}
	});
});

$( window ).on('unload', function() {
	if(timerWindow !== null) timerWindow.close();
});
