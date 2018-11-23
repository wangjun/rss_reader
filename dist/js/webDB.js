/**
* 创建数据库
*/

var db = openDatabase('zhimo', '1.0', 'rss_reader_db', 50 * 1024 * 1024);

/**
* 数据表初始化
*/
function dbInit() {
    // db.transaction(function (tx) {  
    //    tx.executeSql('drop table reader_data');
    // });

	db.transaction(function (tx) {  
	   tx.executeSql('CREATE TABLE IF NOT EXISTS reader_data (id INTEGER PRIMARY KEY, title VARCHAR, desc VARCHAR, link unique, data TEXT)');
	});
}

/**
* 页面初始化
*/
function firstItem() {
    var selectALLSQL = 'SELECT * FROM reader_data limit 1';
    db.transaction(function(ctx) {
        ctx.executeSql(selectALLSQL, [], function(ctx, result) {
            handleXML(result.rows[0]['data']);
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}

/**
* 读取任意一条数据
*/
function getItemFromDb(id) {
    var selectSQL = 'SELECT * FROM reader_data WHERE id = ?'
    db.transaction(function(ctx) {
        ctx.executeSql(selectSQL, [id], function(ctx, result) {
            handleXML(result.rows[0]['data']);
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}

/**
* 数据库写入
*/
function insterData(title, desc, link, data) {
    var insterTableSQL = 'INSERT INTO reader_data (title, desc, link, data) VALUES (?,?,?,?)';
    db.transaction(function(ctx) {
        ctx.executeSql(insterTableSQL, [title, desc, link, data], function(ctx, result) {
            layer.msg("插入" + title + "成功");
        },
        function(tx, error) {
            layer.msg(title+"该链接已订阅");
        });
    });
}

/**
* 数据库读出
*/
function getAllData() {
    var selectALLSQL = 'SELECT * FROM reader_data';
    db.transaction(function(ctx) {
        ctx.executeSql(selectALLSQL, [], function(ctx, result) {
            var len = result.rows.length;
            var head = '<li class="header">我的订阅</li><li><a href="#"><i class="fa fa-rss"></i> <span>我的订阅列表</span></a></li>';
            var temp = '<li><a href="#SUBSCRIBEID"><i class="fa fa-circle"></i> <span>SUBSCRIBENAME</span></a></li>';
            for (var i = 0; i < len; i++) {
            	var newStr = temp.replaceAll('SUBSCRIBENAME', result.rows.item(i).title);
                newStr = newStr.replaceAll('SUBSCRIBEID', result.rows.item(i).id);
            	head += newStr;
            }
            document.getElementById('reader_list').innerHTML = head;
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}

/**
* 数据库按title读取
*/
function getOneData(title) {
    var selectSQL = 'SELECT * FROM reader_data WHERE title = ?'
    db.transaction(function(ctx) {
        ctx.executeSql(selectSQL, [title], function(ctx, result) {
                if (result.rows.length > 0) {
                    layer.msg('您已订阅该频道！');
                    return 1;
                }
            },
            function(tx, error) {
                console.error('查询失败: ' + error.message);
            });
    });
}

/**
* 全局替换
*/
String.prototype.replaceAll = function(s1,s2){
　　return this.replace(new RegExp(s1,"gm"),s2);
}

/**
* 处理XML
*/
function handleXML(xml) {
    domParser = new DOMParser();
    xmlDoc = domParser.parseFromString(xml, 'text/xml');
    var items = xmlDoc.getElementsByTagName('item');
    var temp_content = '<div class="col-md-3"><div class="box box-solid"><div class="box-header with-border"><h3 class="box-title">ITEMTITLE</h3></div><div class="box-body text-center">ITEMDESC</div><div class="box-footer"><div class="pull-right"><a href="ITEMLINK" target="_blank">阅读原文</div></div></div></div>';
    var data = '';
    for (var i = 0; i < items.length; i++) {
        var insert = temp_content.replace('ITEMTITLE', items[i].getElementsByTagName("title")[0].firstChild.nodeValue);
        insert = insert.replace('ITEMDESC', items[i].getElementsByTagName("description")[0].firstChild.nodeValue);
        insert = insert.replace('ITEMLINK', items[i].getElementsByTagName("link")[0].firstChild.nodeValue);
        data += insert;
    }
    document.getElementById('rss_content').innerHTML = data;
}