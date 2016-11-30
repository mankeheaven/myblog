var express=require("express");
var User=require("../models/User");
var router=express.Router();

//统一返回格式
var responseData;
router.use(function(req,res,next){
	responseData={
		code:0,
		message:''
	}
	next();
});

//登录
router.post("/user/login",function(req,res,next){
	var username=req.body.username;
	var password=req.body.password;
	if(username==""||password==""){
		responseData.code=1;
		responseData.message="用户名或密码不能为空";
		res.json(responseData);
		return;
	}
	//查询数据库中相同用户名和密码的记录是否存在,如果存在，则登录成功
	User.findOne({
		username:username,
		password:password
	}).then(function(userInfo){
		if(!userInfo){
			responseData.code=2;
			responseData.message="用户名或密码错误";
			res.json(responseData);
			return;
		}

		responseData.message="登录成功";
		responseData.userInfo={
			_id:userInfo._id,
			username:userInfo.username
		}
		req.cookies.set("userInfo",JSON.stringify({
			_id:userInfo._id,
			username:userInfo.username
		}));
		res.json(responseData);
		return;
		
	});
	
});

/*
*注册
*/
router.post("/user/register",function(req,res,next){
	var username=req.body.username;
	var password=req.body.password;
	var repassword=req.body.repassword;
	if(username==""){
		responseData.code=1;
		responseData.message="用户名不能为空";
		res.json(responseData);
		return;
	}
	if(password==""){
		responseData.code=2;
		responseData.message="密码不能为空";
		res.json(responseData);
		return;

	}
	if(password!=repassword){
		responseData.code=3;
		responseData.message="两次输入的密码不一致";
		res.json(responseData);
		return;
	}
	User.findOne({
		username:username
	}).then(function(userInfo){
		
		if(userInfo){
			responseData.code=4;
			responseData.message="用户名已经被注册了";
			res.json(responseData);
			return;
		}
		var user=new User({
			username:username,
			password:password
		});
		return user.save();
	}).then(function(newUserInfo){
		
		responseData.message="注册成功";
		res.json(responseData);
	})

});

//退出
router.get("/user/logout",function(req,res){
	req.cookies.set("userInfo",null);
	res.json(responseData);
});

module.exports=router;