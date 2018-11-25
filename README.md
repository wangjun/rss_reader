## RSS 阅读器

### 说明

本项目的数据来源于[RSShub](https://github.com/DIYgod/RSSHub)，界面展示采用[AdminLTE](https://adminlte.io)。

项目1.0阶段采用传统的HTML页面搭建，数据都保存在Web SQL中。

当前使用界面比较丑，仅仅做了订阅数据的展示，尚未优化前端展示样式。

**测试可用浏览器** [建议升至最新版]

- Chrome 
- ~~Safari~~
- ~~Firefox~~

[About Me](https://zhimo.ink/about/)

![使用截图](/dist/img/v1.2.1.png)

### 开发进展

项目demo[展示地址](http://reader.zhimo.ink/)

**version 1.0**

- [x] RSShub搭建
- [x] 基本展示界面搭建
- [x] 基本数据库
- [x] 数据读取/展示
- [x] 频道切换

**version 1.1**

- [x] 数据库存储结构优化（拆分/优化数据库结构）
- [x] 定时更新（30分钟一次）

**version 1.2**

- [x] 展示样式调整，减少因某些数据量过大而出现过多空白
- [ ] ~~自定义订阅频道名称~~
- [x] 添加分页展示
- [ ] 查看详细内容功能
- [ ] 个人设置中心（可取消已订阅的频道）

**version 1.3**

- [ ] 数据云端同步功能,可多端同时使用（添加账户登入功能）


**version 2.0**

- [ ] 在确保基本功能正常的情况下，采用VUE重构前端


### 订阅列表

**统一订阅服务域名**

http://rss.zhimo.ink/

订阅说明详见[RSShub文档](https://docs.rsshub.app/#社交媒体)

