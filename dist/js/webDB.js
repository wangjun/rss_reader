var db = openDatabase('zhimo', '1.0', 'rss_reader_db', 50 * 1024 * 1024);

/**
* 数据库初始化
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
* 数据库写入
*/
function insterData(title, desc, link, data) {
    // var exist = 0;
    // /*先查询*/
    // var selectSQL = 'SELECT * FROM reader_data WHERE title = ?'
    // db.transaction(function(ctx) {
    //     ctx.executeSql(selectSQL, [title], function(ctx, result) {
    //         console.log(result.rows.length);
    //             if (result.rows.length > 0) {
    //                 exist = 1;
    //                 console.log("丁越过了！！！");
    //                 return;
    //             }
    //         },
    //         function(tx, error) {
    //             console.error('查询失败: ' + error.message);
    //         });
    // });
    // console.log(exist);
    // if (exist == 1) {
    //     layer.msg('已订阅！');
    //     return;
    // }
    /* 再写入 */
    var insterTableSQL = 'INSERT INTO reader_data (title, desc, link, data) VALUES (?,?,?,?)';
    db.transaction(function(ctx) {
        ctx.executeSql(insterTableSQL, [title, desc, link, data], function(ctx, result) {
            layer.msg("插入" + title + "成功");
        },
        function(tx, error) {
            layer.msg(title+"该链接已订阅");
            // console.error('插入失败: ' + error.message);
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
            var temp = '<li><a href="#/SUBSCRIBEID"><i class="fa fa-circle"></i> <span>SUBSCRIBENAME</span></a></li>';
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
