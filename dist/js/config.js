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
