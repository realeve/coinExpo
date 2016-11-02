(function() {
	function getUrlParam(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = encodeURI(window.location.search).substr(1).match(reg);
		if (r !== null) return decodeURI(r[2]);
		return null;
	}
	var timestamp = getUrlParam('timestamp');
	var rectime = getUrlParam('rectime');
	var url = 'http://cbpc540.applinzi.com/index.php?s=/addon/GoodVoice/GoodVoice/getCoinExpoPrize&timestamp=' + timestamp + '&rectime=' + rectime;
	$.ajax({
			url: url,
			dataType: "jsonp",
			callback: "JsonCallback"
		})
		.done(function(obj) {
			if (obj.status != 2) {
				$('.weui_icon_msg').removeClass('weui_icon_success').addClass('weui_icon_warn');
			}
			$('.weui_msg_title').html(obj.msg);
		});
})();