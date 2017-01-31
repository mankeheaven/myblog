var prepage=8;
var page=1;
var pages=0;
var comments=[];

$("#messageBtn").on("click", function() {
    if(!$("#messageContent").val()){return ;}
    $.ajax({
        type: 'POST',
        url: '/api/comment/post',
        data: {
            contentid: $("#contentId").val(),
            content: $("#messageContent").val()
        },
        success: function(responseData) {
            $("#messageContent").val("");
            comments=responseData.data.comments.reverse();
            renderComment();
        }
    })
});

//根据所有评论渲染
function renderComment() {

    $(".messageCount").html(comments.length);
    
    pages=Math.max(1,Math.ceil(comments.length/prepage));
    var $lis=$(".pager li");
    $lis.eq(1).html(page+"/"+pages);
    if(page<=1){
        page=1;
        $lis.eq(0).html('<span>没有上一页了</span>')
    }else{
        $lis.eq(0).html('<a href="javascript:;">上一页</a>')
    }
    if(page>=pages){
        page=pages;
        $lis.eq(2).html('没有下一页了')
    }else{
         $lis.eq(2).html('<a href="javascript:;">下一页</a>')
    }

    var start=Math.max(0,(page-1)*prepage);
    var end=Math.min((start+prepage),comments.length);

    var html = "";
    for (var i = start; i < end; i++) {
        html += '<div class="messageBox">' +
            '<p class="name clearfix">' +
            '<span class="fl">' + comments[i].username + '</span>' +
            '<span class="fr">' + formateDate(comments[i].postTime) + '</span>' +
            '</p>' +
            '<p class="content">' + comments[i].content + '</p>' +
            '</div>';
    }
    if(comments.length==0){
        html='<div class="messageBox"><p>还没有留言</p></div>';
    }
    $(".messageList").html(html);
}
//每次页面加载完发一个请求获取评论
$.ajax({
    type:'GET',
    url: '/api/comment',
    data: {
        contentid: $("#contentId").val()
    },
    success: function(responseData) {
        comments=responseData.data.comments.reverse();
        renderComment();
    }
})

$(".pager").delegate("a","click",function(){
    if($(this).parent().hasClass('previous')){
        page--;
    }else{
        page++;
    }
    console.log(page);

    renderComment();
})


//格式化时间
function　 formateDate(d) {
    var date = new Date(d);
    this.year = date.getFullYear();
    this.month = date.getMonth() + 1;
    this.date = date.getDate();
    this.day = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")[date.getDay()];
    this.hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    this.minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    this.second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    var currentTime = this.year + "年" + this.month + "月" + this.date + "日 " + this.hour + ":" + this.minute + ":" + this.second + " " + this.day;
    return currentTime;
}
