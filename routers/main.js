var express=require("express");
var Category=require("../models/Category");
var router=express.Router();

router.get("/",function(req,res,next){
	Category.find().then(function(categories){
		res.render("main/index",{
			userInfo:req.userInfo,
			categories:categories
		});
	});

});
module.exports=router;