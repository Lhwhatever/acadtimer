var localStorage;
var localStorageItemKey = 'acadtimeroptions';

getOptions = function() {
	return {
		'duration': $('select[name=duration]').val(),
		'countdown': $('select[name=countdown-duration').val(),
		'text1': $('input[name=text1]').val(),
		'text2': $('input[name=text2]').val(),
		'playMusic': $('input[name=play-music]').prop('checked'),
		'counting': $('input[name=counting]:checked').val(),
		'alertLast15': $('input[name=alert15]').prop('checked'),
		'recolourLast15': $('input[name=recolour15]').prop('checked')
	}
}

setDefaultOptions = function() {
	localStorage.setItem(localStorageItemKey, JSON.stringify(getOptions()));
}

applyOptions = function(options) {
	if(options.duration) $('select[name=duration]').val(options.duration);
	if(options.countdown) $('select[name=countdown-duration').val(options.countdown);
	if(options.text1) $('input[name=text1]').val(options.text1);
	if(options.text2) $('input[name=text2]').val(options.text2);
	if(options.playMusic !== null) $('input[name=play-music]').prop('checked', options.playMusic);
	if(options.counting) $('input[name=counting]').val([options.counting]);
	if(options.alertLast15 !== null) $('input[name=alert15]').prop('checked', options.alertLast15);
	if(options.recolourLast15 !== null) $('input[name=recolour15]').prop('checked', options.recolourLast15);
}

restoreDefaultOptions = function() {
	var options = JSON.parse(localStorage.getItem(localStorageItemKey));
	if(options !== null) applyOptions(options);
}

resetDefaultOptions = function() {
	localStorage.setItem(localStorageItemKey, '{"duration":"60","countdown":"-1","text1":"","text2":"","playMusic":true,"counting":"up","alertLast15":true,"recolourLast15":false}');
}

$( document ).ready(function() {
	localStorage = window.localStorage;

	restoreDefaultOptions();
});