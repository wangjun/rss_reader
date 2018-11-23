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

window.Router = new Router();
window.Router.init();

window.onload = function() {
	dbInit();
	getAllData();
}

var content = document.getElementById('rss_content');

var currentChannel = window.localStorage.getItem('zhimo_rss_reader');
if (currentChannel != null) {
	var channels = currentChannel.split('|');
}

function changeChannel(name) {
    // content.style.backgroundColor = color;
}

function resolve(xml, url) {
	domParser = new DOMParser();
	xmlDoc = domParser.parseFromString(xml, 'text/xml');
	var items = xmlDoc.getElementsByTagName('item');
	var title = xmlDoc.getElementsByTagName('title')[0].firstChild.nodeValue;
	var desc = xmlDoc.getElementsByTagName('description')[0].firstChild.nodeValue;
	insterData(title, desc, url, xml);
	// for (var i = 0; i < items.length; i++) {
	// 	console.log(items[i].getElementsByTagName("title")[0].firstChild.nodeValue); // 标题
	// 	console.log(items[i].getElementsByTagName("link")[0].firstChild.nodeValue);  // 链接 图片
	// 	console.log(items[i].getElementsByTagName("guid")[0].firstChild.nodeValue);  // 图片
	// 	console.log(items[i].getElementsByTagName("description")[0].firstChild.nodeValue); // 内容
	// }
}

function addChannel() {
	var link = document.getElementById('channel').value;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', link);
	var data = '';
	xhr.onreadystatechange = function () {
	    if (xhr.status === 200 && xhr.readyState === 4) {
	    	data = xhr.responseText;
	    	resolve(data, link);
		}
	};
	xhr.send();
}
