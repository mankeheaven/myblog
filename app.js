/*
*time:2016/11/22
*应用程序的启动（入口）文件
*/

var express=require("express");
var swig=require("swig");
var mongoose=require("mongoose");
var bodyParser = require('body-parser')
var Cookies=require("cookies");
var app=express();
var User=require("./models/User");

//设置模板引擎
app.engine("html",swig.renderFile);
app.set("views","./views");
app.set("view engine","html");
swig.setDefaults({cache:false});

//bodyparser
app.use(bodyParser.urlencoded({ extended: false }))

//cookies
app.use(function(req,res,next){
	req.cookies=new Cookies(req,res);
	//解析登录用户信息
	req.userInfo={};
	if(req.cookies.get("userInfo")){
		
		try{
			req.userInfo=JSON.parse(req.cookies.get("userInfo"));
			
			//获取当前登录用户的类型，是否是管理员
			User.findById(req.userInfo._id).then(function(userInfo){
				req.userInfo.isAdmin=Boolean(userInfo.isAdmin);
				next();
			})
		}catch(e){
			next();
		}
	}else{
		next();
	}
	
});

//静态文件
app.use("/public",express.static(__dirname+"/public"));

//路由处理
app.use("/admin",require("./routers/admin"));
app.use("/api",require("./routers/api"));
app.use("/",require("./routers/main"));


mongoose.connect("mongodb://localhost/blog",function(err){
	if(err){
		console.log("数据库连接失败");
	}else{
		console.log("数据库连接成功");
		app.listen(3000);
	}

});



