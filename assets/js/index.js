(function() {
	//测试模式，正式上线需设置为false
	var testMode = true;

	//载入数据
	var coinexpo;

	var localData = (function() {
		function load() {
			coinexpo = localStorage.getItem('coinexpo');
			if (!(coinexpo == null)) {
				coinexpo = $.parseJSON(coinexpo);
			} else {
				coinexpo = {
					score: 0,
					times: 0
				};
			}
		}

		function save() {
			localStorage.setItem('coinexpo', JSON.stringify(coinexpo));
		}
		return {
			load: load,
			save: save
		};
	})();

	localData.load();


	var renderQrCode = function() {
		$('.qrcode').removeClass('hidden');
		var url = 'http://cbpm.applinzi.com/topic/coinExpo/prize.html?timestamp=' + coinexpo.timestamp + '&rectime=' + today();
		$('.qrcode').qrcode({
			width: 200,
			height: 200,
			text: url
		});
	};

	function setQrInfo(score, num) {

		coinexpo.score = score;
		coinexpo.times = 1;
		coinexpo.num = num;

		localData.save();

		if (score == 100 && num <= 60) {
			renderQrCode();
		}
	}

	function loadErrInfo() {

		if (coinexpo.score == 100 && coinexpo.num < 60) {
			$('[name="sucessInfo"] .weui_msg_desc').html('本次活动您一共得了<span name="totalScore" style="font-weight:bold;color:#445"> 100 </span>分');
			$('.weui_icon_msg').last().addClass('weui_icon_success').removeClass('weui_icon_warn');
			//显示提示信息
			$('.weui_msg_title').text('请凭二维码联系工作人员领取礼品').show();
			renderQrCode();
		} else {
			$('.weui_msg_desc').html('您的答题机会已经用完');
			$('.weui_msg_title').text('每人仅允许答题一次').show();
			$('.weui_msg').css('margin-top', '120px').removeClass('hidden').parent().css('background-color', '#fff');
		}

		$('.weui_msg').removeClass('hidden');

		$('#fullpage').fullpage({
			//sectionsColor: secColor,
			easingcss3: 'cubic-bezier(0.25, 0.5, 0.35, 1.15)', //'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
			afterLoad: function(anchor, index) {
				if (index == 2) {
					$('.iSlider-arrow').hide();
				} else {
					$('.iSlider-arrow').show();
				}
			}
		});

		setTimeout(function() {
			$.fn.fullpage.moveTo(2);
		}, 300);
	}

	//!testMode
	if (coinexpo.times && !testMode) {
		loadErrInfo();
		return;
	}

	var sportid = 10;

	var exam = {
		loadComplete: false,
		total: 0, //总分
		error: [], //错误题目（原顺序）
		answerList: [], //乱序后的答案顺序
		isAnswered: [], //题目回答状态
		timeReleased: false, //时间用尽
		isStarted: false, //活动是否开始
		timeLength: 0, //10 * 1000,//启用时间限制 0为不限制
		sourceList: [], //原题目顺序
		scoresPerAnswer: 0, //每道题目分数
		isSubmit: false, //数据是否提交
		isLogin: false, //是否登录
		loginData: {}, //用户登录信息
		maxAnswerNum: 5, //最大抽取多少道题目
		answerTimes: 1, //每个用户最多回答几次
		examPaper: "coin",
		endDate: '2016年11月4日至6日',
		examEnd: 1,
		sportid: 10,
		multiCheckAnswer: []
	};

	//页面总数
	var lastPage;
	var secColor = [];

	//隐藏提示信息
	$('[name="sucessInfo"] .weui_msg_title').hide();

	function getExamTemplate(data, i) {
		var ques = [];
		var arr = [];
		//选项乱序
		arr = getRandomArr(data.question.length);
		var oldOrder = [];
		arr.map(function(arrData, id) {
			oldOrder[arrData] = id;
		});
		var str = '<div class="section main-bg"';

		var multiAnswer = typeof data.answer == "object";
		var checkType = multiAnswer ? 'checkbox' : 'radio';

		function getAnswer() {
			if (!multiAnswer) {
				return (oldOrder[data.answer - 1] + 1);
			}

			var answerList = data.answer.map(function(item) {
				return oldOrder[item - 1] + 1;
			});

			return answerList.join(',');
		}


		str += '<h1 class="title"></h1>';
		str += '<div class="weui_cells_title answer-num">' + i + '.' + data.title + '</div>';

		str += '<div class="weui_cells weui_cells_checkbox weui_cells_dark' + '" data-id=' + (i - 1) + ' data-answer=' + getAnswer() + '>';

		data.question.map(function(qTitle, idx) {
			ques[idx] = '';
			ques[idx] += '    <label class="weui_cell weui_check_label">';
			ques[idx] += '<div class="weui_cell_hd">';
			ques[idx] += '    <input type="' + checkType + '" class="weui_check" name="radio' + (i - 1) + '">';
			ques[idx] += '    <i class="weui_icon_checked"></i>';
			ques[idx] += '</div>';
			ques[idx] += '<div class="weui_cell_bd weui_cell_primary" data-value=' + oldOrder[idx] + '>';
			ques[idx] += '    <p>' + qTitle + '</p>';
			ques[idx] += '</div></label>';
		});

		var strQues = '';
		for (var j = 0; j < data.question.length; j++) {
			strQues += ques[arr[j]];
		}
		//选项乱序 -END

		str += strQues + '</div></div>';
		return str;
	}

	//数组随机排序
	function randomsort(a, b) {
		return Math.random() > 0.5 ? -1 : 1;
	}

	function getRandomArr(len) {
		var arr = [];
		for (var i = 0; i < len; i++) {
			arr.push(i);
		}
		return arr.sort(randomsort);
	}

	$.getJSON("data/" + exam.examPaper + ".min.json", function(question) {
		var quesLen = question.length;
		//所有题目参与排序
		exam.sourceList = getRandomArr(quesLen);

		//只抽取maxAnswerNum个
		quesLen = (quesLen <= exam.maxAnswerNum) ? quesLen : exam.maxAnswerNum;
		exam.maxAnswerNum = quesLen;

		$('[name="nums"]').text(quesLen);
		exam.scoresPerAnswer = 100 / quesLen;
		$('[name="scores"]').text(exam.scoresPerAnswer.toFixed(0));

		for (var i = 0; i < quesLen; i++) {
			$('[name="sucessInfo"]').before(getExamTemplate(question[exam.sourceList[i]], i + 1));
			exam.isAnswered[i] = 0;
			exam.multiCheckAnswer[i] = [];
		}

		var str = '<div class="weui_opr_area"><p class="weui_btn_area"><a href="javascript:;" class="weui_btn weui_btn_primary_yellow" id="submit">提交</a></p></div>';
		$('.answer-num').last().parent().append(str);

		//间隔背景
		lastPage = quesLen + 2;
		for (i = 0; i < lastPage; i++) {
			secColor[i] = (i % 2) ? '#fff' : '#445';
		}

	}).done(function() {
		document.getElementById('autoplay').play();
		handleAnswer();
	});

	function jsRight(sr, rightn) {
		return sr.substring(sr.length - rightn, sr.length);
	}

	function today(type) {
		var date = new Date();
		var a = date.getFullYear();
		var b = jsRight(('0' + (date.getMonth() + 1)), 2);
		var c = jsRight(('0' + date.getDate()), 2);
		var d = date.getHours();
		var e = date.getMinutes();
		var f = date.getSeconds();
		return a + '-' + b + '-' + c + ' ' + d + ':' + e + ':' + f;
	}

	var loginTime = today(1);
	var handleAnswer = function() {

		function timeReleasedTip() {
			$.alert("答题时间到，系统将不再记录此后的得分，请提交当前成绩！", "时间到！", function() {
				$.fn.fullpage.moveTo(lastPage);
			});
		}

		function checkMultiAnswer(myAnswer, rightAnswer) {
			//多选，少选不给分
			var len = myAnswer.length;
			if (len != rightAnswer.length) {
				return 0;
			}

			myAnswer.sort();
			rightAnswer.sort();

			for (var i = 0; i < len; i++) {
				if (myAnswer[i] != rightAnswer[i]) {
					return 0;
				}
			}
			return 1;
		}

		var isTouch;
		$('.weui_check_label').on('click', function(event) {

			var answerPrnt = $(this).parents('.weui_cells');
			var answerInfo = $(this).find('.weui_cell_primary');
			var curID = answerPrnt.data('id');
			var curAnswer = answerInfo.data('value') + 1;
			var rightAnswer = '' + answerPrnt.data('answer');
			var isMulti = rightAnswer.indexOf(',') != -1;

			exam.isAnswered[curID] = 1;

			//单选
			if (!isMulti) {
				exam.answerList[curID] = (curAnswer == rightAnswer) ? 1 : 0;
				return;
			} else {
				rightAnswer = rightAnswer.split(',');
				var answerIndex = exam.multiCheckAnswer[curID].indexOf(curAnswer);
				if (answerIndex == -1) {
					//当前答案未答，增加
					exam.multiCheckAnswer[curID].push(curAnswer);
				} else {
					//当前答案取消选中
					exam.multiCheckAnswer[curID].splice(curAnswer, 1);
				}

				exam.answerList[curID] = checkMultiAnswer(exam.multiCheckAnswer[curID], rightAnswer);
			}

			//未到最后一题
			/*if (curID < exam.maxAnswerNum - 1) {
				setTimeout(function() {
					$.fn.fullpage.moveTo(curID + 3);
				}, 300);
			}*/
		});

		function pageChange(index, nextIndex, direction) {
			var idx = index - 1;

			if (direction == 'down' && idx > 0 && idx < lastPage - 1 && !exam.isAnswered[idx - 1]) {
				$.alert("第" + idx + "题您还没有作答！", "警告！", function() {
					$.fn.fullpage.moveTo(index);
				});
			}

			//最后一页隐藏箭头
			if (index > lastPage && (direction == 'down')) {
				$('.iSlider-arrow').hide();
			}
		}

		$('#fullpage').fullpage({
			//sectionsColor: secColor,
			easingcss3: 'cubic-bezier(0.25, 0.5, 0.35, 1.15)', //'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
			onLeave: function(index, nextIndex, direction) {
				pageChange(index, nextIndex, direction);
			},
			navigation: true,
			afterLoad: function(anchor, index) {

				//最后两页隐藏箭头
				if (index == lastPage - 1) {
					//console.log('进入倒数第二页');
					$('.iSlider-arrow').hide();
				} else if (index == lastPage) {
					//console.log('进入最后一页');
					$('.iSlider-arrow').hide();
					if (!exam.isSubmit) {
						setTimeout(function() {
							$.fn.fullpage.moveSectionUp();
						}, 500);
					}
				} else {
					$('.iSlider-arrow').show();
				}
			}
		});

		$('.weui_msg').removeClass('hidden');

		function handleTotalScore(iScore, num) {
			var tipStr = '';

			setQrInfo(iScore, num);

			if (iScore == 100 && num < 60) {
				tipStr = '请凭二维码联系工作人员领取礼品';
			} else {
				tipStr = '感谢您的参与！';
			}

			$('[name="sucessInfo"] .weui_msg_desc').html('提交成功，您一共得了<span name="totalScore" style="font-weight:bold;color:#445"> ' + iScore + ' </span>分');
			$('.weui_icon_msg').last().addClass('weui_icon_success').removeClass('weui_icon_warn');

			//显示提示信息
			$('[name="sucessInfo"] .weui_msg_title').text(tipStr).show();
		}

		function isAllQuestionAnswered() {
			var passed = true;
			exam.isAnswered.map(function(isAnswered, i) {
				if (!isAnswered) {
					var j = i + 1;
					$.toast("第" + j + "题尚未作答，请先填写完所有题目再交卷");
					passed = false;
				}
			});
		}

		function submitPaper(data) {

			$.ajax({
					url: 'http://cbpc540.applinzi.com/index.php?s=/addon/GoodVoice/GoodVoice/setSafeExamData',
					data: data,
					dataType: "jsonp",
					callback: "JsonCallback",
					success: function(obj) {
						if (obj.status == 0) {
							$('[name="sucessInfo"] .weui_msg_title').text('提交失败，请稍后重试');
						} else { //提交成功
							handleTotalScore(data.score, obj.uid);
						}

						$.fn.fullpage.moveSectionDown();
					},
					error: function(obj) {
						var tipStr = '提交失败，请退出页面重新进入';
						$('[name="sucessInfo"] .weui_msg_title').text(tipStr).show();
					}
				})
				.always(function() {
					exam.isSubmit = true;
					//隐藏提交按钮，防止二次提交数据
					$('#submit').hide();
				});
		}

		$('#submit').on('click', function(event) {
			//清空错误数据
			exam.error = [];
			//得分清零
			exam.total = 0;
			exam.answerList.map(function(scores, i) {
				exam.total += scores;
				if (!scores) {
					//错误题目推送原题目的顺序
					exam.error.push(exam.sourceList[i]);
				}
			});

			//是否所有题目均答完
			if (!isAllQuestionAnswered) {
				return;
			}

			var errStr = '';
			exam.error.map(function(elem) {
				errStr += elem + ',';
			});

			errStr = (errStr.length) ? errStr.substring(0, errStr.length - 1) : '-1';

			//时间标记+随机数字
			coinexpo.timestamp = new Date().getTime() + 't' + (Math.random() * 1000).toFixed(0) + (Math.random() * 1000).toFixed(0);

			var data = {
				score: (exam.total * exam.scoresPerAnswer).toFixed(0),
				rec_time: today(0),
				start_time: loginTime,
				uid: 0,
				iTimes: 1,
				oldScore: 0,
				sportid: sportid,
				errors: coinexpo.timestamp
			};

			$.confirm("您确定要交卷吗?", "交卷", function() {
				submitPaper(data);
			}, function() {
				$.fn.fullpage.moveTo(1);
			});

			$.modal({
				title: "提示",
				text: "您确定要交卷吗?",
				buttons: [{
					text: "交卷",
					onClick: function() {
						submitPaper(data);
					}
				}, {
					text: "检查一遍",
					onClick: function() {
						$.fn.fullpage.moveTo(2);
					}
				}]
			});


		});
	};
})();