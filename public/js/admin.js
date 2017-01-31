$(function(){

	//搜索
	$(".wd").keyup(function(event) {
		$(".baidu_list").css("display","block");
		$(".baidu_list").get(0).innerHTML="";
		var url="http://suggestion.baidu.com/su?wd="+$(".wd").eq(0).val()+"&cb=?"
		$.ajax({
			type:"get",
			url:url,
			dataType:'jsonp',
			success:function(result){
				var str="";

				for(var i=0;i<result.s.length;i++){
					
					var oA='<a target="_blank" href="http://www.baidu.com/s?wd='+result.s[i]+'" class="list-group-item list-group-item-info">'+result.s[i]+'</a>'
					str+=oA;
				}
				$(".baidu_list").get(0).innerHTML=str;
			},
			error:function(xhr,textStatus){
		        console.log('错误')
		        console.log(xhr)
		        console.log(textStatus)
		    },
		})
	})
	$(".wd").focus(function(event){
		$(".baidu_list").css("display","block");
	})
	$(document).click(function(){
		$(".baidu_list").css("display","none");
	})
	$("#goSearch").click(function(){
		var html=$(".wd").val();
		window.open("http://www.baidu.com/s?wd="+html);
	})
	//天气
	$.ajax({
		url:'/api/weather',
		success:function(data){
			var d=JSON.parse(data);
			var $ul=$('.weather ul');
			if(!d.length){
				$ul.html('<li class="list-group-item">****暂无数据</li>')
			}else{
				$ul.html('');
				for(var i=0;i<d.length;i++){
					var $li=$('<li class="list-group-item">');
					$li.html(d[i].day+" : "+d[i].weather+"&nbsp;&nbsp;&nbsp;&nbsp;温度:"+d[i].tempture);
					$ul.append($li);
				}
			}
		},

	})
})