var express=require("express");
var Category=require("../models/Category");
var Content=require("../models/Content");
var router=express.Router();
var data;
//通用数据
router.use(function(req,res,next){
	data={
		userInfo:req.userInfo,
		categories:[]
	}
	Category.find().then(function(categories){
		data.categories=categories;
		next();
	})
})

router.get("/",function(req,res,next){

	//判断是否是搜索
	var search=req.query.search||"";
	if(search){
		data.search=search;
		data.count=0;
		data.page=Number(req.query.page||1)
		data.limit=10;
		data.pages=0;
		
		Content.find({$or:[{description:new RegExp(search,"i")},{title:new RegExp(search,"i")}]}).count().then(function(count){
			data.count=count;
			data.pages=Math.ceil(data.count/data.limit);
			data.page=Math.min(data.page,data.pages);
			data.page=Math.max(data.page,1);
			var skip=(data.page-1)*data.limit;
			
			return Content.find({$or:[{description:new RegExp(search,"i")},{title:new RegExp(search,"i")}]}).sort({_id:-1}).limit(data.limit).skip(skip).populate(["category","user"]);
		}).then(function(contents){
			data.contents=contents;
			res.render("main/index",data);
		})


	}else{
		data.category=req.query.category||"";
		data.count=0;
		data.page=Number(req.query.page||1)
		data.limit=10;
		data.pages=0;
		var where={};

		if(data.category){
			where.category=data.category
		}
		Content.where(where).count().then(function(count){
			data.count=count;
			data.pages=Math.ceil(data.count/data.limit);
			data.page=Math.min(data.page,data.pages);
			data.page=Math.max(data.page,1);
			var skip=(data.page-1)*data.limit;
			
			
			return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(["category","user"]);
		}).then(function(contents){
			data.contents=contents;
			res.render("main/index",data);
		})
	}
});
//详情
router.get("/view",function(req,res){
	var contentId=req.query.contentId||"";
	data.category=req.query.category||"";
	Content.findOne({
		_id:contentId
	}).then(function(content){
		data.content=content;
		content.views++;
		content.save();
		res.render("main/view",data);
	})
});


module.exports=router;