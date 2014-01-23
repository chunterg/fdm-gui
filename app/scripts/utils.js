var $ = global.jQuery;
var npm = require('npm');
var fs = require('fs');
var ncp = require('ncp').ncp;
var path = require('path');
var jade = require('jade');
exports.triggerContent = function(tar){
	if(tar=='fdm'){
		$('#content .content').show();
		$('#content iframe').hide();
        $('#body').removeClass('overflow');
	}else{
		$('#content .content').hide();
        $('#body').addClass('overflow');
        $('#content iframe').show();
	}
}

exports.npmInstall = function(name,callback){
	npm.load({}, function (err) {
		  npm.commands.install([name], function (er, data) {
		  		if(er) throw er;
		    	if(callback){
		    		callback();
		    	}
		  });
		  npm.on("log", function (message) {
		    console.log(message);
		  });
		});
}

exports.getFdmRepo = function(keyword,callback) {
    var keyword = keyword||'fdmplugin';
    var http = require('http');
    var reqUrl = 'http://registry.npmjs.org/-/_view/byKeyword?startkey=[%22'+keyword+'%22]&endkey=[%22'+keyword+'%22,{}]&group_level=3';
    var buffers = '';

    http.get(reqUrl, function(res) {
        if (res.statusCode == 200) {
            res.on('data', function(data) {
                buffers += data;
            });
            res.on("end", function() {
                var data = JSON.parse(buffers.toString());
                console.log();
                console.log(keyword=="fdmplugin"?"插件列表":"模板列表");
                data.rows.forEach(function(d) {
                    console.log(' ' + d.key[1].green + ' ' + d.key[2]);
                });
                console.log();
                if(callback){
                	callback(data);
                }
            });
        } else {
            console.log("Request failed".red);
        }

    }).on('error', function(e) {
        console.log("Error: " + e.message.red);
    });
}

// Get home dir
exports.getHomeDir = function() {
    var homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) {
        homeDir = process.env.HOMEDRIVE + process.env.HOMEPATH;
    }

    return homeDir;
}

// Get template dir
exports.getTempDir = function(templatePath) {

    var pathType = this.parsePath(templatePath);
    var templateDir = '';
    
    if (pathType != 'local') {
        var homeDir = this.getHomeDir();
        var templatePath = templatePath.split('/');

        templatePath = templatePath[templatePath.length - 1].replace(/(.*\/){0,}([^.]+).*/ig, '$2');

        templateDir = path.join(homeDir, '.fdm', 'init', 'templates', templatePath);
        if (fs.existsSync(templateDir)) {
            return templateDir;
        }

        var arr = templateDir.split(path.sep);
        for (var i = 2, l = arr.length; i <= l; i++) {
            var p = arr.slice(0, i).join(path.sep);
            if (fs.existsSync(p)) continue;
            fs.mkdirSync(p);
        }
    } else {
        templateDir = templatePath;
    }


    return templateDir;
}

exports.copyFile = function(from, to, done) {

    ncp(from, to, {
        filter: /^(?!\.git)/
    }, function(err) {
        if (err) {
            return console.error(err);
        }
        console.log();
        console.log('Copied files to '.green + to + ' successfully'.green);
        if (done) {
            done();
        }
    });
}

exports.parsePath = function(arg) {
    if (/^(.+\/)|^(.+\\)/.test(arg)) {
        return 'local';
    } else if (/(^https:\/\/github)|(^git@github)/g.test(arg)) {
        return 'github';
    } else if (/^[0-9a-zA-Z]/.test(arg)) {
        return 'alias';
    } else {
        return 'other';
    }
}

exports.fileWalk = function(dir){
    var files = [],
        folders = [],
        unFolders = [];
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        files = []
    }
    if (files.length > 0) {

        for (var i = 0; i < files.length; i++) {
            stats = fs.lstatSync(dir + files[i]);
            if (stats.isDirectory()) {
                folders.push({
                    name: files[i],
                    src: dir+files[i],
                    isDir: true
                });
            } else {
                unFolders.push({
                    name: files[i],
                    src: dir+files[i],
                    isDir: false
                });
            }
        }
        files = folders.concat(unFolders);
    }
    return files
}

exports.sidebarRefresh = function(){
    global.cfg = fs.readFileSync(global.cfgPath, 'utf8');
    global.cfg = JSON.parse(global.cfg);
    jade.renderFile('app/template/sidebar.jade',{menulist:global.cfg.customMenu},function(err,html){
        if(err) throw err;
        $('div.content','#sidebar').html(html);
    });
}