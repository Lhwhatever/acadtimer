$(document).ready(function() {

	$('.centre-v').css({
		'position': 'absolute',
		'top': '50%',
		'margin-top': function() {return -$(this).outerHeight() / 2}
	});

	$('.centre-h').css({
		'position': 'absolute',
		'left': '50%',
		'margin-left': function() {return -$(this).outerWidth() / 2}
	});
})

