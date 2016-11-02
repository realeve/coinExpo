var viewList = [
	"index"
];

var taskList = {};

viewList.map(function(item) {
	taskList[item] = require('./view/' + item + '.js');
});

module.exports = taskList;