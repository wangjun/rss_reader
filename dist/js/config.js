var expire = 30 * 60; //数据自动更新时间,单位分钟
var decting = 10 * 1000; //定时更新时间,单位秒
var page_num = 32;
var page = 0;
var field = 4;
var field_container = 3;

var ajax_url = 'http://loop.zhimo.ink';

/* 屏幕宽度判断 */
var width = document.body.clientWidth;
if (width >= 1600) {
	field = 6;
	field_container = 2;
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
