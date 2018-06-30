var counter;
var duration;
var counting;
var showSec;
var active = false;

var renderTime = function() {

	var number;

	if(counting == 'up') {
		number = counter;
	} else if(counting == 'down') {
		number = duration - counter;
	} else throw new Exception('counting: expected up or down, received ' + counting);

	number = formatTime(number, showSec);
	if(counter < 0) number = '<span class="neg">' + number + '</span>';
	$('#time').html(number);
}

$(document).ready(function() {

	var text1 = getUrlParam('text1');
	if(text1 == null) $('#text1').remove()
	else $('#text1').html(text1);

	var text2 = getUrlParam('text2');
	if(text2 == null) $('#text2').remove()
	else $('#text2').html(text2);

	setup();

	duration = getUrlParam('duration') * 60;
	$('#endtext').html('DURATION: ' + formatTime(duration, false));

	counting = getUrlParam('count');

	var start = parseInt(getUrlParam('countdown'));
	if(start !== NaN) {
		counter = -start;
		active = true;
	} else counter = 0;

	showSec = getUrlParam('showSec') || false;
	renderTime();

})

