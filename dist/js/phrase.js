/**
* Route 待开发区域
*/
function Router() {
    this.routes = {};
    this.currentUrl = '';
}

Router.prototype.route = function(path, callback) {
    this.routes[path] = callback || function(){};
};

Router.prototype.refresh = function() {
    this.currentUrl = location.hash.slice(1) || '/';
    this.routes[this.currentUrl];
};

Router.prototype.init = function() {
    window.addEventListener('load', this.refresh.bind(this), false);
    window.addEventListener('hashchange', this.refresh.bind(this), false);
}

/**
* 页面初始化
* 考虑用Route方式，待完善
*/
window.Router = new Router();
window.Router.init();
window.onload = function() {
	calculateSign();
	initColoum();
	dbInit();
	if (window.location.hash.substring(1) == '') {
		firstItem();
	} else {
		getItemFromDb(window.location.hash.substring(1), page);
	}
	getAllData();
	monitor();
}           

/**
* 监听路由变化
*/
window.addEventListener('hashchange', function() {
	initColoum();
	page = 0;
	if (window.location.hash.substring(1) == '') {
		firstItem();
	} else {
		getItemFromDb(window.location.hash.substring(1), page);
	}
});

/**
* 加载下一页
*/
document.getElementById('loadMore').addEventListener('click', function() {
	page += 1;
	getItemFromDb(window.location.hash.substring(1), page);
});

/**
* 初始化栅格化系统
*/
function initColoum() {
	document.getElementById('rss_content').innerHTML = '';
	var temp = '<div class="col-md-FIELDWIDTH" id="rss_content_FIELDID"></div>';
	for (var i = 0; i < field; i++) {
		var spur = temp.replace('FIELDWIDTH', field_container);
		spur = spur.replace('FIELDID', i);
		document.getElementById('rss_content').innerHTML += spur;
	}
}

/**
* 简单处理读到的XML并写入数据库
*/
function resolve(xml, url) {
	domParser = new DOMParser();
	xmlDoc = domParser.parseFromString(xml, 'text/xml');
	var title = xmlDoc.getElementsByTagName('title')[0].firstChild.nodeValue;
	var desc = xmlDoc.getElementsByTagName('description')[0].firstChild.nodeValue;
	var link = xmlDoc.getElementsByTagName('link')[0].firstChild.nodeValue;
	var now = parseInt(Date.parse(new Date()) / 1000);
	insterSubscribe(title, desc, url, now, xml);
}

/**
* 添加频道
*/
function addChannel() {
	var link = document.getElementById('channel').value;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', link);
	var data = '';
	layer.load(1, {
	  shade: [0.1,'#fff'],
	  time: 1500
	});
	xhr.onreadystatechange = function () {
	    if (xhr.status === 200 && xhr.readyState === 4) {
	    	data = xhr.responseText;
	    	resolve(data, link);
		}
	};
	xhr.send();
	document.getElementById('channel').value = '';
}

/**
* 每隔几分钟刷新一次数据
*/
function monitor() {
	window.setInterval(function() {
		refreshDB();
	}, decting);
}

/**
* 导出订阅文件
*/
document.getElementById('output').addEventListener("click", function() {
	downloadDB();
});

/**
* 导出订阅文件
*/
document.getElementById('input').addEventListener("change", function() {
	var input = document.getElementById('input');
	if (input.value == '') {
        return;
    }
    var reader = new FileReader();
    reader.readAsText(input.files[0], "UTF-8");
    reader.onload = function(evt){ //读取完文件之后会回来这里
        var fileString = evt.target.result; // 读取文件内容
        addFromFile(JSON.parse(fileString));
    }
});
