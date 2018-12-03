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
	initColoum();
	dbInit();
	if (window.location.hash.substring(1) == '') {
		firstItem();
	} else {
		getItemFromDb(window.location.hash.substring(1), page);
	}
	getAllData();
	monitor();	
	initBaseData();
	syncLocaldata();
	syncFromRemote();
}           

/**
* 初始化基础同步信息
*/
var name;
var email;
var userID;
var login_status = 0;
var sync_last_time = window.localStorage.getItem('zhimo_RSS_last_time');
var cur_time = Date.parse(new Date()) / 1000;

function initBaseData() {
	name = window.localStorage.getItem('zhimo_RSS_name') == null ? "Visitor" : window.localStorage.getItem('zhimo_RSS_name');
	email = window.localStorage.getItem('zhimo_RSS_email') == null ? "" : window.localStorage.getItem('zhimo_RSS_email');
	userID = window.localStorage.getItem('zhimo_RSS_user') == null ? "" : window.localStorage.getItem('zhimo_RSS_user');
	last_sync = window.localStorage.getItem('last_sync_time') == null ? "未同步" : window.localStorage.getItem('last_sync_time');
	if (userID != '') {
		login_status = 1;
		document.getElementById('induce_info').style.display = 'none';
		document.getElementById('account_info').style.display = 'block';
		document.getElementById('user_email').innerHTML = email;
		document.getElementById('last_sync_time').innerHTML = last_sync;
		// 
	} 
	document.getElementById('user_name').innerHTML = name;
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
	downloadDBasJson();
});

/**
* 导入订阅文件
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
        window.setTimeout(function() {
        	window.location.href="/#2"
        }, 3000);
    }
});

/**
* demo
*/
function deafultDemo() {
	var subscribe = '[{"title":"正在上映的电影","desc":"正在上映的电影 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/douban/movie/playing","last_update":"1543302418.0"},{"title":"AppSolution：智能手机更好用的秘密","desc":"AppSolution：智能手机更好用的秘密 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/ifanr/app","last_update":"1543302418.0"},{"title":"The Verge -  All Posts","desc":"The Verge -  All Posts - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/verge","last_update":"1543302464.0"},{"title":"腾讯大家","desc":"腾讯大家 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/dajia","last_update":"1543302485.0"},{"title":"iDownloadBlog","desc":"iDownloadBlog - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/iDownloadBlog","last_update":"1543302519.0"},{"title":"pixiv 周排行","desc":"2018年11月27日 pixiv 周排行 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/pixiv/ranking/week","last_update":"1543302533.0"},{"title":"微博热搜榜","desc":"实时热点，每分钟更新一次 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/weibo/search/hot","last_update":"1543302586.0"},{"title":"安全客-漏洞cve报告","desc":"安全客-漏洞cve报告 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/aqk/vul","last_update":"1543302617.0"},{"title":"电影首发站","desc":"高清电影 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/dysfz","last_update":"1543302655.0"},{"title":"电影天堂","desc":"电影天堂RSS - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/dytt","last_update":"1543302668.0"},{"title":"動畫瘋最後更新","desc":"動畫瘋最後更新 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/anigamer/new_anime","last_update":"1543302692.0"},{"title":"央视新闻 world","desc":"央视新闻 world - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/cctv/world","last_update":"1543302726.0"},{"title":"中央气象台全国气象预警","desc":"中央气象台全国气象预警 - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)","link":"http://rss.zhimo.ink/weatheralarm","last_update":"1543302748.0"}]';
	addFromFile(JSON.parse(subscribe));
    window.setTimeout(function() {
    	window.location.href="/#1"
    }, 3000);
}

/**
* 禁用部分交互
*/
document.oncontextmenu = function(){
    event.returnValue = false;
}

document.onselectstart = function(){
    event.returnValue = false;
}

document.oncopy = function(){
    event.returnValue = false;
}

/**
* 对已有数据的同步
* 只同步订阅，不同步具体内容
*/
function syncForLocalData(link, title, desc, channel) {
	var xhr = new XMLHttpRequest();
    var form = new FormData();
    form.append('user', userID);
    form.append('link', link);
    form.append('title', title);
    form.append('desc', desc);
    xhr.open("POST", ajax_url+'/addRss', true);
    xhr.onreadystatechange = function () {
        var returnData = JSON.parse(xhr.responseText);
        if (returnData.code == 200) {
        	var myDate = new Date();
            window.localStorage.setItem("last_sync_time", myDate);
            updateSyncStatus(channel);
        } else {
            layer.msg(returnData.message);
        }
    }
    xhr.send(form);
}

/**
* 数据拉取
*/
function pullDataFromRemote(channel) {
	var xhr = new XMLHttpRequest();
    xhr.open("GET", ajax_url+'/getArticles?last='+sync_last_time+"&channel="+channel, true);
    xhr.onreadystatechange = function () {
        var returnData = JSON.parse(xhr.responseText);
        if (returnData.code == 200) {
        	insertDetail(channel, returnData.data.title, returnData.data.desc, returnData.data.link);
        } else {
            layer.msg(returnData.message);
        }
    }
    xhr.send();
}