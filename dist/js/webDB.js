/**
* 创建数据库
*/

var db = openDatabase('zhimo', '1.0', 'rss_reader_db', 50 * 1024 * 1024);

/**
* 数据表初始化
*/
function dbInit() {
    // db.transaction(function (tx) {  
    //    tx.executeSql('drop table reader_subscribe');
    // });

    // db.transaction(function (tx) {  
    //    tx.executeSql('drop table reader_data');
    // });

	db.transaction(function (tx) {  
	   tx.executeSql('CREATE TABLE IF NOT EXISTS reader_subscribe (id INTEGER PRIMARY KEY, title VARCHAR, desc VARCHAR, link unique, last_update VARCHAR, sync_status INTEGER default 0)');
	});

    db.transaction(function (tx) {  
       tx.executeSql('CREATE TABLE IF NOT EXISTS reader_data (id INTEGER PRIMARY KEY, channel_id INTEGER, title VARCHAR, desc VARCHAR, link unique)');
    });
}

/**
* 页面初始化
*/
function firstItem() {
    var selectALLSQL = 'SELECT * FROM reader_subscribe limit 1';
    db.transaction(function(ctx) {
        ctx.executeSql(selectALLSQL, [], function(ctx, result) {
            if (result.rows.length != 0) {
                getRows(result.rows[0]['id'], 0);
            } 
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}

/**
* 读取任意一条数据
*/
function getItemFromDb(id, page) {
    var selectSQL = 'SELECT * FROM reader_subscribe WHERE id = ?'
    db.transaction(function(ctx) {
        ctx.executeSql(selectSQL, [id], function(ctx, result) {
            getRows(result.rows[0]['id'], page);
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}

/**
* 写入订阅关系数据表
*/
function insterSubscribe(title, desc, link, time, data) {
    var insterTableSQL = 'INSERT INTO reader_subscribe (title, desc, link, last_update) VALUES (?,?,?,?)';
    db.transaction(function(ctx) {
        ctx.executeSql(insterTableSQL, [title, desc, link, time], function(ctx, result) {
            layer.msg("插入" + title + "成功");
            domParser = new DOMParser();
            if (data == '') {
                getNewer(link, result['insertId']);
            }
            xmlDoc = domParser.parseFromString(data, 'text/xml');
            var items = xmlDoc.getElementsByTagName('item');
            for (var i = 0; i < items.length; i++) {
                var item_title = items[i].getElementsByTagName("title")[0].firstChild.nodeValue;
                var item_desc = items[i].getElementsByTagName("description")[0].firstChild.nodeValue;
                var item_link = items[i].getElementsByTagName("link")[0].firstChild.nodeValue;
                insertDetail(result['insertId'] ,item_title, item_desc, item_link);
            }
            if (result['insertId'] == 1) {
                getRows(result['insertId']);
            }
            getAllData();
        },
        function(tx, error) {
            layer.msg(title+"该链接已订阅");
        });
    });
}

/**
* 更新
*/
function getNewer(link, channel) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', link);
    var data = '';
    xhr.onreadystatechange = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
            data = xhr.responseText;
            domParser = new DOMParser();
            xmlDoc = domParser.parseFromString(data, 'text/xml');
            var items = xmlDoc.getElementsByTagName('item');
            for (var i = 0; i < items.length; i++) {
                var item_title = items[i].getElementsByTagName("title")[0].firstChild.nodeValue;
                var item_desc = items[i].getElementsByTagName("description")[0].firstChild.nodeValue;
                var item_link = items[i].getElementsByTagName("link")[0].firstChild.nodeValue;
                insertDetail(channel ,item_title, item_desc, item_link);
                var now = parseInt(Date.parse(new Date()) / 1000);
            }
            updateLastUpdate(channel, now);
            getAllData();
        }
    };
    xhr.send();
}

/**
* 更新上次更新时间字段
*/
function updateLastUpdate(id, time) {
    var updateDataSQL = 'UPDATE reader_subscribe SET last_update = ? WHERE id = ?';
    db.transaction(function(ctx, result) {
        ctx.executeSql(updateDataSQL, [time, id], function(ctx, result) {
            console.log("更新成功");
        }, function(tx, error) {
            console.error('更新失败:' + error.message);
        });
    });
}


/**
* 写入内容数据表
*/
function insertDetail(channel_id, title, desc, link) {
    var insterTableSQL = 'INSERT INTO reader_data (channel_id, title, desc, link) VALUES (?,?,?,?)';
    db.transaction(function(ctx) {
        ctx.executeSql(insterTableSQL, [channel_id, title, desc, link], function(ctx, result) {
            console.log(result['insertId']);
        });
    });
}

/**
* 数据库读出
* select distinct s.*, (select count(id) from reader_data where channel_id = s.id) as num from reader_subscribe s left join reader_data d on s.id = d.channel_id
*/
function getAllData() {
    var selectALLSQL = 'select distinct s.*, (select count(id) from reader_data where channel_id = s.id) as num from reader_subscribe s left join reader_data d on s.id = d.channel_id order by s.id asc';
    db.transaction(function(ctx) {
        ctx.executeSql(selectALLSQL, [], function(ctx, result) {
            var len = result.rows.length;
            /* demo 展示 */
            if (len == 0) {
                layer.confirm('是否加载默认订阅配置文件？', {
                  btn: ['是的','不需要'] //按钮
                }, function(){
                  deafultDemo(); // demo使用，正式使用建议删掉
                }, function(){
                  layer.msg('请尽情使用~');
                });
            }
            var head = '<li class="header">我的订阅</li><li><a href="#"><i class="fa fa-rss"></i> <span>我的订阅列表</span></a></li>';
            var temp = '<li><a href="#SUBSCRIBEID"><i class="fa fa-circle"></i> <span>SUBSCRIBENAME</span><span class="pull-right-container"><span class="label label-default pull-right">SUBSCRIBEROWS</span></span></a></li>';
            for (var i = 0; i < len; i++) {
                if (result.rows.item(i).title.length > 10) {
                    var title = result.rows.item(i).title.substring(0,13) + '...';
                } else {
                    var title = result.rows.item(i).title;
                }
            	var newStr = temp.replaceAll('SUBSCRIBENAME', title);
                newStr = newStr.replaceAll('SUBSCRIBEID', result.rows.item(i).id);
                newStr = newStr.replaceAll('SUBSCRIBEROWS', result.rows.item(i).num);
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
    var selectSQL = 'SELECT * FROM reader_subscribe WHERE title = ?'
    db.transaction(function(ctx) {
        ctx.executeSql(selectSQL, [title], function(ctx, result) {
            if (result.rows.length > 0) {
                layer.msg('您已订阅该频道！');
            }
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}

/**
* 刷新数据
*/
function refreshDB() {
    var selectSQL = 'SELECT * FROM reader_subscribe'
    db.transaction(function(ctx) {
        ctx.executeSql(selectSQL, [], function(ctx, result) {
            var now = parseInt(Date.parse(new Date()) / 1000);
            for (var row = 0; row < result.rows.length; row++) {
                if (now - result.rows[row]['last_update'] > expire) {
                    getNewer(result.rows[row]['link'], result.rows[row]['id']);
                }
            }
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
    getAllData();
}

/**
* 全局替换
*/
String.prototype.replaceAll = function(s1,s2){
　　return this.replace(new RegExp(s1,"gm"),s2);
}

/**
* 数据展示
*/
function getRows(rowid, page) {
    var start = page * page_num;
    var selectSQL = 'SELECT * FROM reader_data WHERE channel_id = ? order by id desc limit ' + start + ' , ' + page_num;
    db.transaction(function(ctx) {
        ctx.executeSql(selectSQL, [rowid], function(ctx, result) {
            if (result.rows.length == 0) {
                layer.msg('该频道暂无更多内容');
            } else {
                var temp_content = '<div class="box box-solid"><div class="box-header with-border"><h3 class="box-title">ITEMTITLE</h3></div><div class="box-body rss-item">ITEMDESC</div><div class="box-footer"><div class="pull-right"><a href="ITEMLINK" target="_blank">阅读原文</a></div></div></div>';
                for (var i = 0; i < result.rows.length; i++) {
                    var remainder = parseInt(result.rows[i]["id"]) % field;
                    var insert = temp_content.replace('ITEMTITLE', result.rows[i]["title"]);
                    insert = insert.replace('ITEMDESC', result.rows[i]["desc"]);
                    insert = insert.replace('ITEMLINK', result.rows[i]["link"]);
                    document.getElementById('rss_content_'+remainder).innerHTML += insert;
                }
            }
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}

/***
* 导出json文件
*/
function downloadDBasJson() {
    var selectALLSQL = 'select * from reader_subscribe';
    db.transaction(function(ctx) {
        ctx.executeSql(selectALLSQL, [], function(ctx, result) {
            var len = result.rows.length;
            var data = [];
            for (var i = 0; i < len; i++) {
                var item = {};
                item['title'] = result.rows.item(i).title;
                item['desc'] = result.rows.item(i).desc;
                item['link'] = result.rows.item(i).link;
                item['last_update'] = result.rows.item(i).last_update;
                data.push(item);
            }
            var json = JSON.stringify(data);
            var blob = new Blob([json], { type: "" });
            saveAs(blob, "ree_reader.json");
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}

/**
* 从json读取内容并保持
*/
function addFromFile(data) {
    for (var i = 0; i < data.length; i++) {
        insterSubscribe(data[i]['title'], data[i]['desc'], data[i]['link'], data[i]['last_update'] - 3000, '');
    }
    getAllData();
}

/***
* 同步本地数据到云
*/
function syncLocaldata() {
    var selectALLSQL = 'select * from reader_subscribe where sync_status=0';
    db.transaction(function(ctx) {
        ctx.executeSql(selectALLSQL, [], function(ctx, result) {
            var len = result.rows.length;
            var data = [];
            for (var i = 0; i < len; i++) {
                title = result.rows.item(i).title;
                desc = result.rows.item(i).desc;
                link = result.rows.item(i).link;
                syncForLocalData(link, title, desc);
            }
        },
        function(tx, error) {
            console.error('查询失败: ' + error.message);
        });
    });
}