var project = {
    projectName: "solt",
    deployDir: "solt-deploy",
    licenseText: "solt framework {version}\nCopyright(c) 2010-{[new Date().format('Y')]}, {company}\n{contactEmail}\n{site}",
    variables: {
        "company":"Alex Ladyga",
        "version":"1.0",
        "contactEmail":"alexladyga@glocksoft.com",
        "site":"http://www.soltjs.com/"
    },
    pkgs: [
	    {
	        file: "solt.js",
	        // type: "js",
	        //fileIncludes: [
	        contents: [
	        	{ 
		        	path: "src/", 
	        		files: [
						"1.js",
						"2.js",
						"3.js"
	        		]
	        	},
				{ text: "4.js",	path: "src/" }
				// { text: "string.js",		path: "src/" },
				// { text: "array.js",			path: "src/" },
				// { text: "log.js",			path: "src/" },
				// { text: "f.js",				path: "src/" },
				// { text: "wand.js",			path: "src/" },
				// { text: "css.js",			path: "src/" },
				// { text: "paths.js",			path: "src/paths/" },
				
				// { text: "events.js",		path: "src/events/" },
				
				// { text: "dom.js",			path: "src/dom/" },
				// { text: "element.js",		path: "src/dom/" },				
				// { text: "metaNode.js",		path: "src/dom/" },
				// { text: "selector.js",		path: "src/dom/" },
				// { text: "nObject.js",		path: "src/dom/" },

				// { text: 'control.js', 		path: "src/ui/control/" },
				// { text: 'app.js', 			path: "src/ui/app/" },

				// { text: 'hflexbox.js', 		path: "src/ui/layout/hflexbox/" },
				// { text: 'button.js', 		path: "src/ui/button/" }				
			]	
		}
		// {
		// 	name: "solt.ui.css",
		// 	file: "solt.ui.css",
		// 	type: "css",
		// 	isDebug: true, 
		// 	dest: "css/",
		// 	fileIncludes: [
		// 		{ text: "main.css",	path: "src/ui/button/" },
		// 		{ text: 'main.css',	path: "src/ui/layout/hflexbox/" }
		// 	]
		// }
	],
	resources: [
		{ src: "src/ui/button/", dest: "images/", filters: ".*[\\.jpg|\\.png|\\.gif]" }
	],
    "// resources": [
		{
			src: "glock/",
			dest: "/",
			filters: ".*[\\.html]"
		},
		{
			src: "glock.ui/images/",
			dest: "images/",
			filters: ".*[\\.jpg|\\.png|\\.gif]"
		}
    ]
};

// -- Loading NODE stuff

var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;

var config = {
	defaultPackageType: 'js'
};

function buildProject(project) {

	function guessPackage(filename) {
		var res;
		if ( res = /\.(\w+)$/.exec(filename) ) {
			return res[1].toLowerCase();
		} else {
			return config.defaultPackageType;
		}
	}

	function ensureTrailingSlash(path) {
		return ( path[path.length-1] === '/' ) ? path : path+'/';
	}

	function ensureDirectory(path, callback) {
		//TODO: drop ext process dependency
		child = exec('mkdir -p '+path,
		  function (error, stdout, stderr) {
		    if (error !== null) {
		    	throw new Error('[ensureDirectory]: '+error);
		    } else {
		    	callback();
		    }
		});		
	}

	function buildPackage(pkg) {
		var packOut = [];

		var filename = pkg.file;

		if ( !filename ) {
			throw new Error('Package object missing filename property.');
		}

		var type = pkg.type || guessPackage(pkg.filename);
		var files = pkg.contents || pkg.fileIncludes || [];  // fileIncludes - for JSB2 support

		files.forEach(function(item){
			var path = item.path || process.cwd(),
				file = item.file || item.text;

			if ( file ) {
				packOut.push( fs.readFileSync(ensureTrailingSlash(path)+file)+'' );		
			} else if ( item.files ) {
				
				item.files.forEach(function(file){
					packOut.push( fs.readFileSync(ensureTrailingSlash(path)+file)+'' );
				});

			} else {
				throw new Error('Content item doesn\'t have file or files property.');
			}
		});

		fs.writeFileSync(ensureTrailingSlash(project.deployDir)+filename, packOut.join(''));
	}	


	ensureDirectory(project.deployDir, function(){
		project.pkgs.forEach(function(pkg){
			buildPackage(pkg);
		});		
	});

}

buildProject(project);










