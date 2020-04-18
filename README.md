# 创就业答题插件

## [创就业刷课插件点此](https://github.com/asd2323208/asd2323208.github.io/blob/master/CJYWatch.md)

瞎鸡儿弄了个脚本，方便各位同学“解决”问题。
本插件分为安装版和非安装版，没手的同学也可以使用。

**插件已修复，新添加手动查询。**

![1.png](https://i.loli.net/2020/03/26/yPqkSZWR5dKj83H.png)

# 安装版使用教程

## 安装油猴扩展：
[点击这里查看教程](https://blog.csdn.net/qq_31150365/article/details/90447934)

## 安装答题脚本：
**[点击这里](https://greasyfork.org/zh-CN/scripts/398765-cjyanswer)** **[或Github镜像](https://github.com/asd2323208/asd2323208.github.io/raw/master/js/CJYAnswer.user.js)**
![6.png](https://i.loli.net/2020/03/26/Tiy5SVhRbdJ8Q9c.png)

## 打开创就业网站：
[点击这里](http://ccsu.hunbys.com/web/student/course/list#0)
![](https://i.loli.net/2020/02/17/igFD6SN5fml38pV.jpg)

## 点击作业考试进入答题页面：
![2.jpg](https://i.loli.net/2020/03/26/TdJsCmcLbIM9ZwR.jpg)

## 第一次使用请点击总是允许此域名：
![5.jpg](https://i.loli.net/2020/03/26/TAxHu7oKmyB3hrU.jpg)

# 非安装版使用教程

## 打开创就业网站：
[点击这里](http://ccsu.hunbys.com/web/student/course/list#0)
![](https://i.loli.net/2020/02/17/igFD6SN5fml38pV.jpg)

## 点击作业考试进入答题页面：
![2.jpg](https://i.loli.net/2020/03/26/TdJsCmcLbIM9ZwR.jpg)


## 按下F12打开开发者工具：
（以360浏览器为例）
在下方可以看到控制台
![3.jpg](https://i.loli.net/2020/03/26/c5QkyVq3pTsmuCf.jpg)

## 输入答题代码：

    (function($){var questions=document.getElementsByClassName("pointer radio");function getAnswer(i){$.ajax({url:"http://daniao.phpnet.us/?q="+questions[i].innerText,type:"GET",dataType:"JSONP",success:function(data){questions[i].innerHTML+='<b style="color:red">'+data+"</b>"},error:function(){alert("查询失败，网络异常！")}})}for(var i=0;i<questions.length;i++){setTimeout(getAnswer(i),"500")}})(jQuery);

![4.jpg](https://i.loli.net/2020/03/26/OxT1F3b6i82o5Qy.jpg)
输入完成后按下回车，稍等片刻即可出现答案。

# 常见问题
* 答案出现了偏差：我也没说是标准答案啊；
* 查询失败，网络异常！：刷新重试吧，你要是把服务器试炸了。。。<table><tr><td bgcolor=black> 反正我早就把题答完了哈哈；</td></tr></table> 
* 网页报500错误：他们服务器炸了，待会再来吧；
* 需要重新登陆：手机登录会把网页挤下去；
* 你说没手也能用，可是我还是不会用，更别说嘴了：[解决方法](https://www.baidu.com/s?wd=%E4%BD%A0%E6%98%AF%E5%BC%B1%E6%99%BA%E5%90%97&ie=UTF-8)；
* 你怎么骂人啊：那你去找物管啊！

# 特别鸣谢
**Zeshawn**——BUG修复
**启成哥**——插件测试

# 免责声明
本人提供的插件仅用于个人学习、研究或交流。本人不保证插件的正确性。通过使用本插件随之而来的风险与本人无关。

访问者可将本插件的内容或服务用于个人学习、研究或交流，以及其他非商业性或非盈利性用途，但同时应遵守著作权法及其他相关法律的规定，不得侵犯相关权利人的合法权利。


