#对统计数据的可视化。

环境要求：php+apache，建议使用一体式的AppServ。

1. cd到apache服务器根目录(httpd)，若是AppServ，则cd到www目录
2. `git clone git://github.com/KohPoll/vgraph.git`
3. 浏览器访问http://localhost/vgraph/app/index.php(**若你有修改端口号，请进行相应修改**)

---

note: 
* 由于一些原因，暂未提供数据文件(.csv)。
* 请在支持canvas的浏览器里查看(强烈推荐chrome)。

---

##add feature:
* url可以接受mode参数，如：http://localhost/vgraph/app/index.php?mode=dev，表示开发环境（请求js时会加上时间戳，避免被缓存）
* build目录是使用requireJS构建工具进行build时的脚本（暂提供windows环境下的脚本，需先安装nodejs、jdk）
  - 使用方法：cd到build目录，执行build.bat
  - 完成后会生成app-build目录，该目录即是构建后的应用，可以查看build.txt了解哪些js被根据依赖关系打包成了一个文件

---

##change log:
+ 2012.03.27 增加构建(build)脚本,增加url的mode参数
+ 2012.03.03 使用requireJS将js文件模块化,使用PubSub解耦部分代码
+ 2012.某年某日 重构后第一版,js文件依赖很强...
+ 2011.某月某日 第一版,混乱...

---

##todo:
1. 搜索内容时的方式，现在是直接使用==进行比较
2. 优化代码，目前有部分代码结构仍然有问题
3. 重构数据请求的php，目前比较依赖于数据文件(.csv)，重构为可以指定其它格式化的文件
4. 抽取主要模块，形成其它形式的demo
