exports.formateESC=function(str){
	return str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
}