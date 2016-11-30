$(function(){
	//登录注册
	var $login=$("#login");
	var $register=$("#register");
	var $userInfo=$("#userInfo");
	var $login_btn=$login.find(".login_btn").find("input");
	var $register_btn=$register.find(".register_btn").find("input");
	//登录注册切换
	$login.find("a#toRegister").click(function(){
		$login.hide();
		$register.show();
	});
	$register.find("a#toLogin").click(function(){
		$register.hide();
		$login.show();
	});
	//登录
	$login_btn.click(function(){
		var username=$login.find("input[name='username']").val();
		var password=$login.find("input[name='password']").val();
		$.ajax({
			type:"post",
			url:"/api/user/login",
			data:{
				username:username,
				password:password
			},
			dataType:"json",
			success:function(result){
				$login.find(".result").find("em").html(result.message);
				if(!result.code){
					// $register.find(".result").find("em").css("color","green");
					// setTimeout(function(){
					// 	$register.hide();
					// 	$login.hide();
					// 	$userInfo.show();
					// 	$userInfo.find(".user").html(username);
					// }, 1000);
					window.location.reload();
				}

			}
		});
	});
	//注册
	$register_btn.click(function(){
		var username=$register.find("input[name='username']").val();
		var password=$register.find("input[name='password']").val();
		var repassword=$register.find("input[name='repassword']").val();
		
		$.ajax({
			type:"post",
			url:"/api/user/register",
			data:{
				username:username,
				password:password,
				repassword:repassword
			},
			dataType:"json",
			success:function(result){
				$register.find(".result").find("em").html(result.message);
				if(!result.code){
					$register.find(".result").find("em").css("color","green");
					setTimeout(function(){
						$register.hide();
						$login.show();

					}, 1000);
				}else{
					$register.find(".result").find("em").css("color","red");
				}
				
			}
		});
	});
	//logout
	$("#logout").click(function(){
		$.ajax({
			url:"/api/user/logout",
			success:function(result){
				if(!result.code){
					window.location.reload();
				}
			}
		})
	})

});