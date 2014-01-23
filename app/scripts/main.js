
var fs = require('fs');
global.jQuery = $;
global.cfgPath = 'app/config.json';
global.cfg = fs.readFileSync(global.cfgPath, 'utf8');
global.cfg = JSON.parse(global.cfg);
var npm = require("npm");
var jade = require('jade');
var utils = require('./scripts/utils');
// pages
$(function(){
	
	
	
	utils.sidebarRefresh();

	// fdmaven
	require('./scripts/maven');

	// customMenu
	$('#sidebar').delegate('.maven a','click',function(e){
		$('#ifm').hide();
		utils.triggerContent('fdm');
		
	});
	$('#sidebar').delegate('.customMenu a','click',function(e){
		e.preventDefault();
		utils.triggerContent('cus');
		$('#ifm').attr('src',$(this).attr('data-href')).show();
	})
})