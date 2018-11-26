var expire = 30 * 60; //数据自动更新时间,单位分钟
var decting = 10 * 1000; //定时更新时间,单位秒
var page_num = 32;
var page = 0;
var field = 4;
var field_container = 3;

/* 屏幕宽度判断 */
var width = document.body.clientWidth;
if (width >= 1600) {
	field = 6;
	field_container = 2;
} 

var core_link = 'http://rssreader.com';
var appid = 'TrqxKMCdrZ1z';
var appsecret = 'Gw1g5kdVJqcRrGa2BU7891Rz61Dc';
var expire = window.sessionStorage.getItem('rss_expire');
var accesstoken = window.sessionStorage.getItem('rss_token');
var timestamp = parseInt(new Date().getTime() / 1000);
var auth = '';
var current_campus = 1; // 当前校区

/**
* 获取access_token
*/
function calculateSign() {
	/* 组装成sign */
	var nonce = 'test';
	var mobile = '15692383272';
	// var mobile = '18513956017';
	var param = 'appid='+appid+'&mobile='+mobile+'&nonce='+nonce+'&timestamp='+timestamp+'&key='+appsecret;
	var sign = hex_md5(param);
	/* 请求access_token */
	var xhr = new XMLHttpRequest();
	var formData = new FormData();
	var link = core_link+"/v1/token";
	formData.append('appid', appid);
	formData.append('mobile', mobile);
	formData.append('nonce', nonce);
	formData.append('timestamp', timestamp);
	formData.append('sign', sign);
	/* FormData对象数据组装完成 */
	xhr.open('POST', link);
	/* AJAX POST数据请求 */
	xhr.onreadystatechange = function () {
	    var returnData = JSON.parse(xhr.responseText);
	    window.sessionStorage.setItem('rss_expire', returnData.data.expires_time);
	    window.sessionStorage.setItem('rss_token', returnData.data.access_token);
	    window.sessionStorage.setItem('rss_voucher', xhr.responseText);
	    var base = new Base64();  
		var code = base.encode(appid+':'+returnData.data.access_token+':'+returnData.data.client.uid);  
	    auth = 'authentication:'+returnData.data.client.uid+' '+code;
	    console.log(auth);
	    window.sessionStorage.setItem('rss_auth', auth);
	};
	xhr.send(formData);
}

/**
* 数组删除元素
*/
Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};


/**
* 读取classname相同的区块
*/
function getElementByClassName(className){
   var elems = [];
   if(!document.getElementsByClassName){
       alert("no exit");
       var dom = document.getElementByTagName('*');
       for(var i = 0;i<dom.length;i++){
           if(dom[i].className == className)
                elems.push(dom[i]);
       }
    }else{
        elems = document.getElementsByClassName(className);
        alert('exit');
    }
    return elems;
}

/**
* 判断数组中是否存在某值
*/
Array.prototype.exists = function (val) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == val) {
			return true;
		}
	}
	return false;
}
