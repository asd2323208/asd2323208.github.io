// ==UserScript==
// @name         CJYAnswer
// @namespace    asd2323208.github.io/
// @version      0.1
// @description  别看了，用就是了。
// @author       DANIAO
// @run-at       document-body
// @match        *://*.hunbys.com/student-exam/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

'use strict';
(function () {
    function initAnswer(){
        var questions = document.getElementsByClassName("pointer radio")
        function getAnswer(i){
            GM_xmlhttpRequest({
                method: "GET",
                url: 'http://daniao.phpnet.us/?q='+questions[i].innerText,
                onload: function(response) {
                    var data = eval(response.responseText)
                    console.log(data)
                    questions[i].innerHTML+='<b style="color:red">'+ data +'</b>'
                }
            });
        }
        for(var i=0;i<questions.length;i++){
            setTimeout(getAnswer(i),"500");
        }
    }
    setTimeout(initAnswer,"500");
})();
