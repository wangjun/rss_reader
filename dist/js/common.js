var core_link = 'http://wxapp.onps.com';
var appid = 'W1EQTJ4UnY3szughep69t6b3Qamo4Lh8';
var appsecret = '3ai291WAYs3C';
// var appid = 'Kfx241r6tA8q1t56fAV1Ph1QO3Dx2vFl';
// var appsecret = 'lh5KE7C6Wab5';
var expire = window.sessionStorage.getItem('wxapp_expire');
var accesstoken = window.sessionStorage.getItem('wxapp_token');
var timestamp = parseInt(new Date().getTime() / 1000);
var auth = '';
var current_campus = 1; // 当前校区

/**
* 所有页面的初始化动作
* 1、读取有效的auth认证信息
* 2、验证身份
*/
window.onload = function() {
	$(".main-sidebar").load("./nav.html");
	if (expire == null || accesstoken == null) {
		calculateSign();
		window.sessionStorage.clear();
		// window.location.href = "/admin/login.html";
	} else if (parseInt(timestamp) - parseInt(expire) > 7000) {
		layer.msg("登入超时!请重新登入", {time: 3000});
		window.setTimeout(function(){
			signOut()
		}, 1500);
	} else {
		auth = window.sessionStorage.getItem('wxapp_auth');
	}
	// if (window.localStorage.getItem("wxapp_retain") == '') {
	// 	window.location.href = "/admin/login.html";
	// }
	init();
}

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
	    window.sessionStorage.setItem('wxapp_expire', returnData.data.expires_time);
	    window.sessionStorage.setItem('wxapp_token', returnData.data.access_token);
	    window.sessionStorage.setItem('wxapp_voucher', xhr.responseText);
	    var base = new Base64();  
		var code = base.encode(appid+':'+returnData.data.access_token+':'+returnData.data.client.uid);  
	    auth = 'authentication:'+returnData.data.client.uid+' '+code;

	    window.sessionStorage.setItem('wxapp_auth', auth);
	};
	xhr.send(formData);
}	

/**
* 登出
*/
function signOut() {
	window.sessionStorage.removeItem('wxapp_expire');
	window.sessionStorage.removeItem('wxapp_token');
	window.sessionStorage.removeItem('wxapp_voucher');
	window.sessionStorage.removeItem('wxapp_auth');
	window.sessionStorage.removeItem('wxapp_retain');
	window.location.href = "/admin/login.html";
}

/**
* 读取校区信息
*/
function getCampus() {
    document.getElementById('campusSwitch').innerHTML = '';
    var xhr = new XMLHttpRequest();
    var link = core_link+'/v1/getCampus';
    xhr.open("GET", link);
    xhr.setRequestHeader('authentication', auth);
    xhr.onreadystatechange = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
            var returnData = JSON.parse(xhr.responseText);
            if (returnData.code == 200) {
                for (var i = 0; i < returnData.data.info.length; i++) {
                    document.getElementById('campusSwitch').innerHTML += "<option value='"+returnData.data.info[i].id+"'>"+returnData.data.info[i].name+"</option>";
                }
				current_campus = document.getElementById('campusSwitch').options[0].value;
            }
        } else {
            layer.msg(returnData.message);
        }
    }
    xhr.send();
}

/**
* 全局替换
*/
String.prototype.replaceAll = function(s1,s2){
　　return this.replace(new RegExp(s1,"gm"),s2);
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
