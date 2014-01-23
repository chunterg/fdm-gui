var $= global.jQuery;
var cfg = global.cfg;
var jade = require('jade');
var utils = require('./../scripts/utils');
var path = require('path');
var fs = require('fs');
var npm = require("npm");
var currentTemp = '';
var tempLocalPath = '';
var projPath = '';
function fdmInit(){
	$('#content .step1 li').on('click',function(){
		currentTemp = $(this).find('a').attr('data-name');
		tempLocalPath = utils.getTempDir(currentTemp.replace('fdm-init-',''));
		copyTempToProj();return;
		$('#initProj').trigger('click');
	});
}

function setInfo(info,callback){
	$('#infoBox .modal-body').text(info)
}

function copyTempToProj(){
	// setInfo('正在复制模板...');
	// $('#infoBox').modal();
	if(fs.existsSync(tempLocalPath+'/template.js')){
		var tempConfig = require(tempLocalPath+'/template.js');
	}
	return;
	utils.copyFile(tempLocalPath,projPath,function(){
		// setInfo('复制完成');
		 $('#infoBox').modal('hide');
		 goNextStep();
    	// tempSetup();
   });
}

function goNextStep(){
	$('#content .maven-content').animate({marginLeft:"-="+$('.step').width()},500);
}
function goPrevStep(){
	$('#content .maven-content').animate({marginLeft:"+="+$('.step').width()},500);
}
$(function(){

	$('#initProj').bind('change', function () {
		projPath = $(this).val();
		if(projPath){
			// 如果本地已有模板
			if(fs.existsSync(tempLocalPath+'/template.js')){
				console.log('已有模板');
				copyTempToProj();
			// 如果模板已获取
			}else if (fs.existsSync(path.join('node_modules',currentTemp))) {
				setInfo('正在复制模板...');
				$('#infoBox').modal();
				utils.copyFile(path.join('node_modules',currentTemp),tempLocalPath,function(){
					copyTempToProj();
	            	// tempSetup();
	           });
	        }else{
	        	setInfo('正在获取模板...');
				$('#infoBox').modal();
	        	utils.npmInstall(currentTemp,function(){
					utils.copyFile(path.join('node_modules',currentTemp),tempLocalPath,function(){
						copyTempToProj();
		            	// tempSetup();
		           });
				});
	        }
		}
		

	});
	// 项目构建
	$('#content').delegate('.projlist a','click',function(e){
		e.preventDefault();
		var projDir = $(this).attr('data-dir');
		var projName = $(this).attr('data-name');
		var fileList = utils.fileWalk(projDir+'/');
		if(fileList.length){
			var fileListHtml = jade.renderFile('app/template/filelist.jade',{projName:projName,fileList:fileList},function(err,html){
				if(err) throw err;
				$('#content .step2 .content').html(html);
				goNextStep();
			});	
		}
		
	});
	$('#content').delegate('a.folder','click',function(e){
		e.preventDefault();
		var me = $(this);
		var nearFolder = me.next("div.filelist");
		if( nearFolder.length){
			if(nearFolder.is(":visible")){
				nearFolder.hide();
			}else{
				nearFolder.show();
			}
		}else{
			var fileDir = me.attr('data-dir');
			var fileList = utils.fileWalk(fileDir+'/');
			var fileListHtml = jade.renderFile('app/template/filelist.jade',{projName:false,fileList:fileList},function(err,html){
				if(err) throw err;
				me.parent().append(html);
				// goNextStep();
			});
		}
		
	});
	// 前进回退按钮
	$('#content').delegate('a.prev','click',function(e){
		e.preventDefault();
		goPrevStep();
	}).delegate('a.next','click',function(e){
		e.preventDefault();
		goNextStep();
	});

	// sidebar
	$('#create').on('click',function(e){
		if(!$('#content .content .init').length){
			e.preventDefault();
			$('#content').addClass('loading');
			utils.getFdmRepo('fdmtemplate',function(data){
				var tempListHtml = jade.renderFile('app/template/step.jade',{type:"init",templist:data.rows},function(err,html){
					if(err) throw err;
					$('#content').removeClass('loading');
					$('#content .content').html(html);
					fdmInit();
				});
				
			});
		}else{
			utils.triggerContent('fdm');
		}
		
	});
	$('#build').on('click',function(e){
		$('#content').addClass('loading');
		var projListHtml = jade.renderFile('app/template/step.jade',{type:"build",projList:cfg.projList},function(err,html){
				if(err) throw err;
				$('#content').removeClass('loading');
				$('#content .content').html(html);
			});
	})
	$('#addCus').on('click',function(e){
		// e.preventDefault();
		var confirmBox = $("#confirmBox");
		var okBtn = confirmBox.find('button.btn-primary');
		var cusData={};
		okBtn.unbind('click').on('click',function(e){
			cusData.name = $('#inputName').val();
			cusData.url = $('#inputUrl').val();
			cfg.customMenu[cusData.name] = cusData.url;
			fs.writeFile(global.cfgPath, JSON.stringify(cfg,null,4), function (err) {
			  if (err) throw err;
			  console.log('It\'s saved!');
			  utils.sidebarRefresh();
			  confirmBox.modal('hide');
			});
		});
	});

	
	
});