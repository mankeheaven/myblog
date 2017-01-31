var express=require("express");
var md5=require('md5');
var cheerio = require('cheerio');
var http = require('http');
var User=require("../models/User");
var Content=require("../models/Content");
var formateESC=require("../util/common").formateESC
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
		password:md5(password)
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
			password:md5(password)
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

//评论提交
router.post("/comment/post",function(req,res,next){
	var contentId=req.body.contentid||'';
	var postData={
		username:req.userInfo.username,
		postTime:new Date(),
		content:formateESC(req.body.content)
	}
	Content.findOne({
		_id:contentId
	}).then(function(content){
		content.comments.push(postData);
		return content.save()
	}).then(function(newContent){
		responseData.message='评论成功';
		responseData.data=newContent;
		res.json(responseData);
	})
})
//获取指定文章的所有评论
router.get('/comment',function(req,res,next){
	var contentId=req.query.contentid||'';
	
	Content.findOne({
		_id:contentId
	}).then(function(content){
		
		responseData.data=content;
		res.json(responseData);
	})
})

//获取天气
function handleWeather(req,res,html) {
    var $ = cheerio.load(html);
    var $7d = $('#7d');
    var $t = $7d.find('.t');
    //构造数据
    // [{
    // 	day:"30日(今天)",
    // 	weather:"多云",
    // 	tempture:"7/2℃",
    // 	wind:"微风"
    // }]
    var d = [];
    $t.find('li').each(function(item, i) {
        var every = {};
        every.day = $(this).find('h1').html().trim();
        every.weather = $(this).find('.wea').html().trim();
        every.tempture = $(this).find('.tem').text().replace(/\s/g,'');
        every.wind = $(this).find('.win i').html().trim();
        d.push(every);
    })
    res.send(JSON.stringify(d));
}

router.get('/weather', function(req, res, next) {
    var html;
    http.get('http://www.weather.com.cn/weather/101200101.shtml', function(r) {
        r.on('data', function(d) {
            html += d;
        })
        r.on('end', function() {
            //获取到后处理完自己需要的格式
            if(html){
            	handleWeather(req,res,html);
        	}else{
        		res.send(null);
        	}
        })
    }).on('error', function() {
        console.log('获取出错');
    });
});

module.exports=router;