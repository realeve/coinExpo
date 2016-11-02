var audioInit = function() {
	function randomID(i) {
		return Math.ceil(Math.random() * i);
	}
	var bgmid = randomID(9);
	$('#autoplay').attr('src', '//cbpm.applinzi.com/bgm/bgm' + bgmid + '.mp3');
	var audio = document.getElementById('autoplay');
	var controller = document.getElementById('musicBtn');
	var controllerHint = document.getElementById('musicBtnTxt');
	audio.volume = 0.5;

	document.getElementById('musicBtn').addEventListener('touchstart', function() {
		controllerHint.style.display = '';
		if (audio.paused) {
			audio.play();
			controller.className = 'music-btn on';
			controllerHint.innerHTML = '开始';
		} else {
			audio.pause();
			controller.className = 'music-btn';
			controllerHint.innerHTML = '关闭';
		}

		setTimeout(function() {
			controllerHint.style.display = 'none';
		}, 1000);

	}, false);
}();