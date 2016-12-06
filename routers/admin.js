var express=require("express");
var User=require("../models/User");
var Category=require("../models/Category");
var Content=require("../models/Content");
var request=require("superagent");
var http=require("http");
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

});

//百度查询
// router.get("/search",function(req,res,next){
	
// 	var url="http://www.baidu.com/s?wd="+req.query.wd
// 	console.log(url)
// 	console.log(req.query)
// 	http.get(url,function(result){
// 		result.on('data', function(data) {  
// 			console.log("Got data: " + data);  
// 		});
// 	})
// });

//分类首页
router.get("/category",function(req,res){
	var page=Number(req.query.page||1);
	var limit=10;
	var pages=0;
	Category.count().then(function(count){

		//计算总页数
		pages=Math.ceil(count/limit);
		page=Math.min(page,pages);
		page=Math.max(page,1);

		var skip=(page-1)*limit;

		Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
			res.render("admin/category_index",{
				userInfo:req.userInfo,
				categories:categories,
				count:count,
				pages:pages,
				page:page,
				limit:limit

			})
		});

	})

});

//分类添加
router.get("/category/add",function(req,res){

	res.render("admin/category_add",{
		userInfo:req.userInfo
	});
});
router.post("/category/add",function(req,res){

	var name=req.body.name||"";
	if(name==""){
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:"名称不能为空"
		});
		return;
	}
	Category.findOne({
		name:name
	}).then(function(rs){
		if(rs){
			res.render("admin/error",{
				userInfo:req.userInfo,
				message:"名称已存在"
			})
			return Promise.reject();
		}else{
			return new Category({
				name:name
			}).save()
		}
	}).then(function(newCategory){
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"分类保存成功",
			url:"/admin/category"
		})
	})
});

//分类修改
router.get("/category/edit",function(req,res){
	var id=req.query.id||"";
	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			res.render("admin/error",{
				userInfo:req.userInfo,
				message:"分类信息不存在"
			});
		}else{
			res.render("admin/category_edit",{
				userInfo:req.userInfo,
				category:category
			})
		}
	})
});
router.post("/category/edit",function(req,res){
	var id=req.body.id||"";
	var name=req.body.name||"";
	Category.findOne({
		_id:id
	}).then(function(category){
		if(!category){
			res.render("admin/error",{
				userInfo:req.userInfo,
				message:"分类信息不存在"
			});
			return Promise.reject();
		}else{
			if(name==category.name){
				res.render("admin/error",{
					userInfo:req.userInfo,
					message:"修改成功",
					url:"/admin/category"
				});
				return Promise.reject();
			}else{
				return Category.findOne({
					_id:{$ne:id},
					name:name
				})
			}
		}
	}).then(function(sameCategory){
		if(sameCategory){
			res.render("admin.error",{
				userInfo:req.userInfo,
				message:"数据库中已经存在同名分类"
			});
			return Promise.reject();
		}else{
			return Category.update({
				_id:id
			},{
				name:name
			})
		}
	}).then(function(){
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"修改成功",
			url:"/admin/category"
		});
	})
});

//分类删除
router.get("/category/delete",function(req,res){
	var id=req.query.id||"";
	Category.remove({
		_id:id
	}).then(function(){
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"删除成功",
			url:"/admin/category"
		});
	})
});

//内容首页
router.get("/content",function(req,res){

	var page=Number(req.query.page||1);
	var limit=10;
	var pages=0;
	Content.count().then(function(count){

		//计算总页数
		pages=Math.ceil(count/limit);
		page=Math.min(page,pages);
		page=Math.max(page,1);

		var skip=(page-1)*limit;

		Content.find().sort({_id:-1}).limit(limit).skip(skip).populate("category").then(function(contents){
			res.render("admin/content_index",{
				userInfo:req.userInfo,
				contents:contents,
				page:page,
				count:count,
				pages:pages,
				limit:limit

			})
		});

	})
		
});
//内容添加
router.get("/content/add",function(req,res){

	Category.find().sort({_id:-1}).then(function(categories){
		res.render("admin/content_add",{
			userInfo:req.userInfo,
			categories:categories
		})
	})

		
});

//内容保存
router.post("/content/add",function(req,res){
	
	if(req.body.category==""){
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:"内容分类不能为空"
		});
		return;
	}
	if(req.body.title==""){
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:"内容标题不能为空"
		});
		return;
	}
	
	new Content({
		category:req.body.category,
		title:req.body.title,
		description:req.body.description,
		content:req.body.content
	}).save().then(function(rs){
		if(!rs){
			res.render("admin/success",{
				userInfo:req.userInfo,
				message:"内容保存失败"
			});
			return;
		}
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"内容保存成功",
			url:"/admin/content"
		});
	})
		

});

//修改内容
router.get("/content/edit",function(req,res){
	var id=req.query.id||"";
	Category.find().sort({_id:-1}).then(function(categories){
		Content.findOne({
			_id:id
		}).then(function(content){
			if(!content){
				res.render("admin/error",{
					userInfo:req.userInfo,
					message:"指定内容不存在"
				})
				return Promise.reject();
			}else{
				res.render("admin/content_edit",{
					userInfo:req.userInfo,
					content:content,
					categories:categories
				})
			}
		})
	})

});
//保存修改内容
router.post("/content/edit",function(req,res){
	var id=req.body.id||"";
	console.log(id)
	if(req.body.category==""){
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:"内容分类不能为空"
		});
		return;
	}
	if(req.body.title==""){
		res.render("admin/error",{
			userInfo:req.userInfo,
			message:"内容标题不能为空"
		});
		return;
	}
	Content.update({
		_id:id
	},{
		category:req.body.category,
		title:req.body.title,
		description:req.body.description,
		content:req.body.content
	}).then(function(rs){
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"内容保存成功",
			url:"/admin/content"
		})
	})
});
//内容删除
router.get("/content/delete",function(req,res){
	var id=req.query.id||"";
	Content.remove({
		_id:id
	}).then(function(){
		res.render("admin/success",{
			userInfo:req.userInfo,
			message:"删除成功",
			url:"/admin/content"
		})
	})
});

module.exports=router;