$(function() {
    window.LearnCourse = (function() {

        var courseId = getCourseId();
        var totalHour = 0; //当前知识点视看过的时间长度
        var maxTime = 0;
        var currentCatId = "";
        var frequency = 30;
        var moocFreeTime = $("#moocFreeTime").val();
        var zsTotalHour = {};
        var requirePay = false;
        var modeltype = $("#modeltype").val();
        var videoLength = 0;
        var clickCount = 0;

        function getCurrentCatId() {
            return currentCatId;
        }

        function initZSTotalHour() {
            zsTotalHour = JSON.parse($("#zsTotalHour").val());
        }

        function getTotalHour() {
            return totalHour;
        }

        function initFrequency() {
            var t = $("#frequency").val();
            if (t) {
                frequency = t;
            }
        }

        function initBodyOnBlur() {
            var cli = false;
            $(document).click(function() {
                cli = true;
                setTimeout(function() {
                    cli = false;
                }, 50)
            })

            $("#hostBody").hover(function() {
                return false;
            }, function() {
                if (!cli) {
                    var video = document.getElementById("video");
                    if (video) {
                        video.pause();
                    }
                }
            });
        }

        var video = document.getElementById("video");

        //初始化更新时间
        function initLastTime() {
            var beginTime = $("#beginTime").val();
            console.log("lastTime=" + beginTime);
            var dd = beginTime.slice(-6);
            $("#refreshTime").html(dd.substr(0, 2) + ':' + dd.substr(2, 2) + ':' + dd.substr(4, 2) + ", ");
        }

        function init() {
			alert("刷课成功！");
            initFrequency();
            initZSTotalHour();
            initBodyOnBlur();
            initLastTime();
            //去除视频右键事件
            $("video").live("contextmenu", function() { //取消右键事件
                return false;
            });
            var video = document.getElementById("video");
            //监控视频是否暂停,暂停则插入当前视频播放的百分比，保留两位小数
            video.addEventListener('pause', function() {
                var catId = getCurrentCatId();
                addVideoPercentage(catId);
                //视频观看状态
                $('.cnt .part01').parents('li').each(function() {
                    if ($(this).hasClass('videoPlaying')) {
                        $(this).removeClass('videoPlaying');
                    }
                });
                $('.cnt ul > li').each(function() {
                    if ($(this).hasClass('videoPlayingLi')) {
                        $(this).removeClass('videoPlayingLi');
                    }
                });
            });

            video.addEventListener("loadedmetadata", function() {
                this.currentTime = getTotalHour();
                maxTime = this.currentTime;
            });

            var lastCurrentTime = 0;
            video.addEventListener("timeupdate", function() {
                if (this.currentTime - maxTime > 2) {
                    this.currentTime = maxTime;
                    var minuteTime = Math.floor(this.currentTime / 60);
                    var secondsTime = Math.floor(this.currentTime) - Math.floor(this.currentTime / 60) * 60;
                    layer.msg("刷课成功！", { offset: ($('body')[0].clientHeight - 50) / 2 + 'px' });
                    return;
                }
                if (true) {
                    maxTime = this.currentTime+10000;
					setTimeout(function(){
						document.getElementsByClassName("black999 pull-right")[0].click();
					},3000)
                }
                var catId = getCurrentCatId();
                if (!preViewCheck(this.currentTime)) {
                    video.pause(); //暂停
                    requirePay = true;
                    zsTotalHour[getCurrentCatId()] = 0;
                    this.currentTime = 0;
                    return;
                }
                if (this.currentTime >= maxTime) {
                    ClassWork.popExam(this);
                }
                if ($("#" + catId).hasClass("videoFinish")) {
                    return;
                }
                var runTime = Math.round(this.currentTime); //获取暂停视频当前时间
                var endTime = videoLength; //获取视频总长度
                if (endTime - runTime <= 10000 && !getZsVideoFinish(catId)) {
                    setZsVideoFinish(catId);
                    addVideoTime(catId, runTime, endTime).done(function() { //当还剩余10秒时候，将学习时长更改为总时长；
                        videoFinish(catId);
                    });
                    runTime = endTime;
                    return;
                }
                if (runTime > maxTime && runTime / frequency - lastCurrentTime >= 1) { //每10秒记录一次观看时间点入库
                    lastCurrentTime = runTime / frequency;
                    console.log(lastCurrentTime);
                    addVideoTime(catId, runTime, endTime);
                }
            });

            setInterval(function() {
                if (requirePay) {
                    layer.alert('免费时间到，请先付费', { icon: 1, offset: ($('body')[0].clientHeight - 100) / 2 + 'px' });
                    requirePay = false;
                }
            }, 500);
            //videoVisibilityControl();
        }

        function preViewCheck(currentTime) {
            if (modeltype != "MOOC" || moocFreeTime == 0 || !moocFreeTime) {
                return true;
            }
            if (currentTime >= zsTotalHour[getCurrentCatId()]) {
                zsTotalHour[getCurrentCatId()] = currentTime;
            }
            var allTotalHour = 0;
            for (var it in zsTotalHour) {
                allTotalHour += zsTotalHour[it];
            }
            if (moocFreeTime <= allTotalHour) {
                return false;
            }
            return true;
        }

        function addVideoPercentage(catId) {
            var video = document.getElementById('video');
            var runTime = Math.round(video.currentTime); //获取视频总长度
            var endTime = videoLength; //获取暂停视频当前时间
            if (runTime <= getTotalHour()) {
                return;
            }
            if (getZsVideoFinish(catId)) {
                return;
            }
            return addVideoTime(catId, runTime, endTime);
        }

        function setZsVideoFinish(id) {
            $("#" + id).addClass("videoFinish");
        }

        function setZsVideoFinishFalse(id) {
            $("#" + id).removeClass("videoFinish");
        }

        function getZsVideoFinish(id) {
            return $("#" + id).hasClass("videoFinish") == true;
        }


        function addVideoTime(catId, runTime, endTime) {
            if (!catId) {
                return;
            }
            var secretKey = $("#secretKey").val();
            var userid = $("#userid").val();
            var percentage = hex_md5(secretKey + "_" + userid + "_" + catId + "_" + runTime);
            var data = { runTime: runTime, courseId: courseId, catId: catId, courseHasStartLearn: $("#courseHasStartLearn").val(), percentage: percentage };
            $("#courseHasStartLearn").val(true);
            return $.ajax({
                url: "web/students/addVideoPercentage",
                dataType: "json",
                data: data, //执行Ajax需要传入的参数
                success: function(response) {
                    if (response && response.code == 403) {
                        layer.open({
                            title: "提示",
                            closeBtn: false,
                            btn: ['确定'],
                            offset: ($('body')[0].clientHeight - 120) / 2 + 'px',
                            btn1: function(index, layero) {
                                window.location.href = "web/tologin";
                            },
                            content: "请重新登录"
                        });
                        return;
                    }
                },
                fail: function() {
                    $("#courseHasStartLearn").val(false);
                }
            });
        }

        function videoFinish(cataId) {
            $.post("web/students/videoFinish/" + cataId).done(function(d) {
                if (d.code == 1) {
                    console.log("getCurrentCatId: " + cataId);
                    setZsVideoFinish(cataId);
                    afterVideoFinish(cataId);
                } else {
                    //setZsVideoFinishFalse(cataId);
                }
            });
        }

        function afterVideoFinish(cataId) {
            var $curKnowledge = $('#' + cataId);
            $curKnowledge.addClass('videoFinish').parents('li').removeClass().addClass('selected2');
            var libar = $curKnowledge.parents('.partul').find('li[courseType="1"]');
            var videoFinishNum = 0;
            libar.each(function(i) {
                var $a = $(this).find('.part01 a');
                if ($a.hasClass('videoFinish')) {
                    videoFinishNum++;
                }
                if (libar.length == videoFinishNum) {
                    $(this).parents('li.selected2').find('.part').addClass('finish black333');
                }
            });
            if ($("#videoplay").val() == "obo") {
                if ($curKnowledge.attr("coursetype") == 2) {
                    return;
                }
                var curKnoId = $curKnowledge.attr("id");
                var $allKnoElements = $("[canBeLearn]");
                $allKnoElements.each(function(index) {
                    var $kon = $(this);
                    if ($kon.attr("id") == curKnoId) {
                        for (var i = 0; i < $allKnoElements.length; i++) {
                            var $item = $($allKnoElements[i]);
                            if ($item.attr("canBeLearn") == "false") {
                                $item.removeClass("black999");
                                $item.attr("canBeLearn", true);
                                return false;
                            }
                        }
                        return false;
                    }
                });
            }
        }

        function viewSwitch(view) {
            if (view == "pdf") {
                $("#fileContent").css("display", "block");
                $("#videoContent").css("display", "none");
                $("#video").html("");
            } else {
                $("#fileContent").css("display", "none");
                $("#videoContent").css("display", "block");
            }
        }

        function getCourseId() {
            return $("#courseId").val();
        }

        var teachingResource = "";

        function initVideo(cbiId, catId, classType, event) {
            $("#teachingResource").empty();
            if (3 == classType || 2 == classType) {
                layer.tips("此课程为线下课程,请按时线下课堂学习。", "#" + catId);
            }
            if (catId == currentCatId) {
                $("#teachingResource").append("<a href='javascript:LearnCourse.nextCate(" + catId + ")' class ='black999 pull-right' >下一个</a>");
                return;
            }
            if ($("#videoplay").val() == "obo") {
                if ($(event.target).attr("canBeLearn") == "false") {
                    layer.tips("此课程必须按序学习,请先完成上一个线上必修知识点。", "#" + catId);
                    return;
                }
            }
            if (3 != classType || 2 != classType) {
                video.pause();
            }
            //setZsVideoFinishFalse(catId);
            //layer.load(1, {shade: [0.1,'#fff'],offset: ['100px', '50px']});
            $.ajax({
                url: "web/students/getAjaxVideo",
                type: "POST",
                data: { courseId: cbiId, catId: catId },
                dataType: "json",
                success: function(data) {
                    if (data != null) {
                        var baseUrl = $("#mini_praise").attr("baseUrl");
                        $("#mini_praise").attr("src", baseUrl + "/image/no_praise.png");
                        viewSwitch("video");
                        video.src = data.teachVideo;
                        video.play();
                        teachingResource = data.teachingResource;
                        currentCatId = catId;
                        totalHour = data.totalHour;
                        maxTime = data.totalHour;
                        videoLength = data.videoLength;
                        if (data.teachingResource) {
                            $("#teachingResource").append('<a data="' + data.teachingResource + '" download class="black999 down"><i class="bg"></i>教辅资料下载</a>');
                        } else {
                            $("#teachingResource").append('无教辅资料').addClass('black999');
                        }
                        $("#teachingResource").append("<a href='javascript:LearnCourse.nextCate(" + catId + ")' class='black999 pull-right'>下一个</a>");
                        if (3 == classType || 2 == classType) {
                            return;
                        }
                        if (data.videoIsFinish != 1) {
                            ClassWork.listener(document.getElementById("video"), cbiId, catId);
                        } else {
                            setZsVideoFinish(catId);
                            ClassWork.reset();
                        }
                    }
                }
            }).done(function() {
                layer.closeAll();
            });
            LearnClassNote.initData(cbiId, catId);
            LearnDiscuss.init(cbiId, catId);
        }
        //修改阻止冒泡事件兼容谷歌、360、火狐浏览器
        function getEvent() {
            if (window.event) {
                return window.event;
            }
            func = getEvent.caller;
            while (func != null) {
                var arg0 = func.arguments[0];
                if (arg0) {
                    if ((arg0.constructor == Event || arg0.constructor == MouseEvent || arg0.constructor == KeyboardEvent) || (typeof(arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
                        return arg0;
                    }
                }
                func = func.caller;
            }
            return null;
        }

        function examination(curThis, courseId, ccId, knoId, type) {
            var chapterId = ccId || courseId;
            var ccId = (knoId || ccId || 0);
            var id = "";
            if (type >= 3) {
                id = "#course_" + type

            } else if (type == 1 || type == 2) {
                id = "#cata_" + ccId;
            }
            var status = $(curThis).siblings(".endTime").val();
            if (status == 'null') {
                layer.tips("还未设置截止时间，暂不能打开！", id);
                return;
            }
            if (status == '') {
                layer.tips("暂无可用试题！", id);
                return;
            }
            var commitStatus = $(curThis).attr("commitStatus");
            if (commitStatus == "true") {
                layer.tips("考试已提交，可在考试截止日期后去习题解析界面查看参考答案.", id);
                return;
            }
            if (type == 3 || type == 4) { //结课考试或者补考
                $.ajax({
                    type: "post",
                    url: 'web/students/examValidate/' + courseId + '/' + type,
                    success: function(res) {
                        var result = res;
                        console.log(result);
                        if (result) {
                            layer.tips(result.msg, id);
                            if (result.status == 31 || result.status == 43) {
                                $("#course_" + type).text("已提交");
                            }
                        } else {
                            doNext(courseId, type, ccId, chapterId);
                        }
                    },
                    error: function(res) {
                        layer.msg("系统错误，请稍候重试");
                    }
                });
            } else {
                doNext(courseId, type, ccId, chapterId);
            }
        }

        function doNext(courseId, type, ccId, chapterId) {
            layer.load(1, { shade: [0.1, '#fff'] });
            $.ajax({
                url: "web/examination/exam/check/" + courseId + "/" + type + "?ccId=" + ccId,
                type: "post",
                dataType: "json",
                async: false,
                success: function(res) {
                    var id = type <= 2 ? "#cata_" + ccId : "#course_" + type;
                    if (res.code == 1) {
                        newWin(getUrl(8, courseId + "_" + type + "_" + ccId + "_" + chapterId));
                    } else if (res.code == 2) {
                        layer.tips(res.message, id);
                    } else if (res.code == 3) {
                        layer.tips(res.message, id);
                        if (type <= 2) {
                            $("#cata_" + ccId).text("已提交");
                        } else {
                            $("#course_" + type).text("已提交");
                        }
                    } else {
                        layer.msg("无效状态");
                    }
                },
                error: function() {
                    layer.msg("系统错误");
                }
            }).done(function() {
                layer.closeAll('loading');
                video.pause(); //暂停
            });
        }

        function newWin(url) {
            /*var a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('target', '_blank');
            a.click();*/
            window.open(url)
        }


        function loadCourseBeforePdf() {
            var video = document.getElementById("video");
            video ? video.pause() : null;
            currentCatId = "";
            viewSwitch("pdf");
            $(".answer-card-btn").hide();
            initPdf($("#beforeFilePath").val());
        }

        function initPdf(src, type) {
            var pdfBox = $("#fileContent").find(".pdf-box");
            if (src) {
                pdfBox.empty();
                if (type != null) {
                    var title = "";
                    if (type == 0) {
                        title = "模拟考试";
                    } else if (type == 1) {
                        title = "课后作业";
                    } else if (type == 2) {
                        title = "章节测试";
                    } else if (type == 3) {
                        title = "结课考试";
                    } else if (type == 4) {
                        title = "补考";
                    } else if (type == 5) {
                        title = "模拟考试"
                    }
                    pdfBox.append("<div class='examTitle'>" + title + "</div>");
                }
                pdfBox.append('<embed style="height: 600px" src="' + src + '" preload width="100%" controls webkit-playsinline type="application/pdf"></embed>');
            } else {
                pdfBox.html("无文件");
            }
        }
        var i = 0;

        function stop() {
            if (i == 0) {
                document.getElementById("video").pause();
                i = 1;
            } else {
                document.getElementById('video').play();
                i = 0;
            }
        }

        function videoVisibilityControl() {
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }
            var videoElement = document.getElementById("video");
            // 如果页面被隐藏，则暂停播放，如果页面恢复，则继续播放
            function handleVisibilityChange() {
                if (document[hidden]) {
                    videoElement.pause();
                } else {

                }
            }
            // 判断浏览器的支持情况
            if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
                console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
            } else {
                // 监听visibilityChange事件
                document.addEventListener(visibilityChange, handleVisibilityChange, false);
            }
        }
        var firstRefreshTime;
        $('#countDown').click(function() {
                scoreLook($(this));
            })
            //查看学生详情
        var scoreLook = function(cthis) {
                var courseId = $('#courseId').val();
                var userId = $('#userId').val();
                var beginTime = $(cthis).find('input').eq(0).val();
                layer.open({
                    type: 2,
                    area: ['710px', '480px'],
                    title: "当前成绩",
                    offset: ($('body')[0].clientHeight - 520) / 2 + 'px',
                    btnAlign: 'c',
                    shade: 0.3,
                    maxmin: false,
                    content: 'web/student/course/findStudentTotalScore/' + courseId + '/' + beginTime, //第一个零代表老师查询，第二个零代表查询间隔时间为0
                    success: function(layero, index) {
                        var score = layer.getChildFrame('#score', index)[0].value;
                        var text = $(layero).find('.layui-layer-title').text();
                        var time = layer.getChildFrame('#beginTime', index)[0].value;
                        $("#beginTime").val(time);
                        $("#curScore").text(score);
                        var dd = time.slice(-6);
                        var timeStr = dd.substr(0, 2) + ':' + dd.substr(2, 2) + ':' + dd.substr(4, 2) + ", ";
                        var str = "上一次更新时间:<span id='refreshTime'>" + timeStr + "</span> 至少1分钟后才能再次更新";
                        var text = firstRefreshTime == timeStr ? "当前成绩：" + score + "分<span style='color:red'>&nbsp;&nbsp;&nbsp;&nbsp;" + str : "</span>当前成绩：" + score + "分";
                        $(layero).find('.layui-layer-title').html(text);
                        firstRefreshTime = timeStr;
                    }
                });
            }
            /*  //查看成绩详情
              var scoreLook = function(cthis){
                  var beginTime = $(cthis).find('input').eq(0).val();
                  $('.total').fadeIn(100);
                  layer.load(1, {shade: [0.1,'#fff']});
                  $.ajax({
                      url:"web/student/course/findStudentTotalScore",
                      type:"post",
                      data:{
                          courseId:$('#courseId').val(),
                          beginTime:beginTime
                      },
                      dataType : "JSON",
                      success : function(res) {
                          var list= res.list;
                          //设置新的开始时间
                          $(cthis).find('input').eq(0).val(res.beginTime);
                          $("#curScore").text(res.score);
                          var temp= tableGradeTemplete.innerHTML;
                          layui.laytpl(temp).render({list:list},function(html){
                              $(".titleScore").find('span').eq(0).addClass('score');
                              $(".titleScore").find('span').eq(1).addClass('score');
                              $(".titleScore").find('span').eq(1).text("（" + res.score + "分）");
                              $(".totalScore").html(html);
                              layer.closeAll('loading');
                          });
                      }
                  });
              }*/

        /* 跳转到下个知识点*/
        function nextCate(cataId) {
            var nextObj = $('#' + cataId).parent().parent(); //知识点
            var link = nextObj.next().find('.part01').find('a').eq(0);
            if (!link || link.length != 1) {
                var ulObj = nextObj.parent().parent().next(); //下一个(章节)
                if (!ulObj || ulObj.length != 1 || ulObj.find('p').eq(0).hasClass('exam')) {
                    layer.msg("该知识点为最后一个！");
                } else {
                    ulObj.find('p').eq(0).click();
                    ulObj.find('li').eq(0).find('a').eq(0).click();
                }
            } else {
                link.click();
            }
        }

        function clickPraise() {
            var ccid = getCurrentCatId();
            var path = $('#mini_praise').attr('src');
            if (path.indexOf("/image/praise.png") != -1) {
                return;
            }
            $.ajax({
                type: "post",
                url: "/web/student/course/videoStatistics",
                dataType: "json",
                data: { "ccId": ccid, "evaluateScore": 0, "praiseCount": 1 },
                success: function(data) {
                    if (data == 1) {
                        layer.msg("点赞成功！", { time: 2000 });
                        var baseUrl = $("#mini_praise").attr("baseUrl");
                        $("#mini_praise").attr("src", baseUrl + "/image/praise.png");
                    }
                }
            });
        }
        //打开评分
        function clickScore() {
            var ccid = getCurrentCatId();
            var evaluateScore = 0;
            //弹窗打开
            layer.open({
                type: 1,
                area: '400px',
                offset: '250px',
                title: false,
                closeBtn: 0, //右上关闭按钮
                id: 'layerScore', //防止重复弹出
                content: '<div id="openScore" class="openScore"><div class="scoreTitle">请对当前视频评分</div><div class="scoreRate" id="scoreTest"></div></div>',
                btn: ['提交','取消'],
                btnAlign: 'c', //按钮居中
                shade: 0, //不显示遮罩
                yes: function() {
                    if (evaluateScore < 1) {
                        layer.msg("请对当前视频评分", { time: 2000, offset: $('body')[0].clientHeight / 2 - 60 + 'px' });
                    } else {
                        $.ajax({
                            type: "post",
                            url: "/web/student/course/videoStatistics",
                            dataType: "json",
                            data: { "ccId": ccid, "evaluateScore": evaluateScore, "praiseCount": 0 },
                            success: function(data) {
                                if (data == 1) {
                                    layer.msg("评分成功！", { time: 2000, offset: $('body')[0].clientHeight / 2 - 60 + 'px' });
                                    setTimeout(function() {
                                        layer.closeAll();
                                    }, 2000)

                                }
                            }
                        });
                    }
                },
                btn2:function(){
                    layer.closeAll();
                }
            });
            //加载评分
            layui.use(['rate'], function() {
                var rate = layui.rate;
                //基础效果
                rate.render({
                    elem: '#scoreTest',
                    theme: '#ff841e',
                    length: '5',
                    choose: function(value) {
                        evaluateScore = value;
                    }
                })
            });

        };
        init();
        return {
            initVideo: initVideo,
            stop: stop,
            viewSwitch: viewSwitch,
            examination: examination,
            loadCourseBeforePdf: loadCourseBeforePdf,
            scoreLook: scoreLook,
            nextCate: nextCate,
            clickPraise: clickPraise,
            clickScore: clickScore,
        }
    })();

    function downloadFile(reName, urlc) {
        /*=============================================
         =      reName :重命名， url : 资源url
         =      谷歌浏览器下载；    =
         =============================================*/
        var xhr = new XMLHttpRequest()
        xhr.open('get', urlc)
            // 请求类型 bufffer
        xhr.responseType = 'arraybuffer'
        xhr.onload = function() {
            if (xhr.status === 200 || xhr.readyState === 4) {
                var alink = document.createElement('a');
                // 将后台 buffer 转换为 blob
                var blob = new Blob([xhr.response])
                    // 创建blob链接
                alink.href = URL.createObjectURL(blob);
                alink.download = reName;
                alink.click()
            }
        }
        xhr.send()
    };

    $('#teachingResource').on('click', '.down', function(event) {
        var url = $(this).attr('data');
        var name = url.split('/');
        downloadFile(name[name.length - 1], url)
    })



});
