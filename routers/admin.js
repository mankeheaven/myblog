var express=require("express");
var User=require("../models/User");
var router=express.Router();

router.use(function(req,res,next){

	if(!req.userInfo.isAdmin){
		res.send("对不起，只有管理员才能进入管理页面");
		return;
	}
	next();
})

//首页
router.get("/",function(req,res,next){
	res.render("admin/index",{
		userInfo:req.userInfo
	});
});
//用户管理
router.get("/user",function(req,res,next){
	var page=Number(req.query.page||1);
	var limit=10;
	var pages=0;
	User.count().then(function(count){

		//计算总页数
		pages=Math.ceil(count/limit);
		page=Math.min(page,pages);
		page=Math.max(page,1);

		var skip=(page-1)*limit;

		User.find().limit(limit).skip(skip).then(function(users){
			res.render("admin/user_index",{
				userInfo:req.userInfo,
				users:users,
				page:page,
				count:count,
				pages:pages,
				page:page,
				limit:limit

			})
		});

	})



})

module.exports=router;