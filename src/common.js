roundingFunc = Math.ceil;

__ = function() {} // a function which does nothing

getUrlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}

setup = function() {
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
}

formatTime = function(seconds, showSec) {
	seconds = roundingFunc(seconds);

	var neg = seconds < 0;
	if(neg) {
		if(seconds >= -60) return seconds;

		seconds *= -1;
		var ss = seconds % 60;
		var mm = Math.floor(seconds / 60);
		return '-' + mm + ':' + ss.toString().padStart(2, '0');
	} else if(showSec) {
		var ss = seconds % 60;
		var mm = (seconds - ss) / 60 % 60;
		var h = Math.floor(seconds / 3600);
		return h + ':' + mm.toString().padStart(2, '0') + ':' + ss.toString().padStart(2, '0');
	} else {
		var mm = Math.floor(seconds / 60) % 60;
		var h = Math.floor(seconds / 3600);
		return h + ':' + mm.toString().padStart(2, '0')
	}
	
}