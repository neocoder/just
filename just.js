#!/usr/bin/env node
var Xproject = {
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
		        	path: "src", 
		        	files: "*.js"
						// files: [
						// 	"1.js",
						// 	"2.js",
						// 	"3.js"
						// ]
	        	}
				//{ text: "4.js",	path: "src/" }
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
		},
		{
			file: "solt.css",
			contents: [
				{ path: "src", files: "*.css" }
			]
		}
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


// ++ Some generic language enhancers

	function isArray(obj) {
		return typeof obj == 'object' && obj != null && obj.concat !== undefined;
	};
	
	function isNumber(object) {
	    return (typeof object == "number" && !isNaN(object));
	};
	
	function isString(obj) {
		return (typeof obj == 'string');
	};

	function regexQuote(str) {
		return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}=!<>\|\:])/g, function(s, p1){
			return '\\'+p1;
		});
	};	

// --

// File preprocessors 

var preprocessors = {
	js: {
		
	},
	css: {
		
	}
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

	function ltrimSlash(str) {
		return str.replace(new RegExp('^[/]*','ig'),'');
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

	function filenameMatchPattern(filename, pattern) {
		var rxp = regexQuote(pattern).replace('\*', '.*');
		var rx = new RegExp(rxp);
		return filename.match(rx);
	}

	/**
	 *  collectFiles([path, [recurse,]] callback);
	 */
	function collectFiles(path, opts) {
		opts = opts || {};

		var f = '';
		var files = [];
		var items = fs.readdirSync(path);
		
		for (var i=0; i < items.length; i++) {
			f = ensureTrailingSlash(path)+items[i];
			
			if ( fs.statSync(f).isFile() ) {
				if ( opts.pattern ) {
					if ( filenameMatchPattern(items[i], opts.pattern) )	{
						files.push(f);
					}
				} else {
					files.push(f);
				}				
			} else {
				if ( opts.recurse ) {
					files = files.concat(collectFiles(f, opts))	
				}
			}
		}	
		
		return files || [];
	}	


	function buildPackage(pkg) {
		var packOut = [],
			fullFile = '',
			writtenFiles = [];

			function alreadyWritten(fn) {
				for (var i = 0; i < writtenFiles.length; i++) {
					if ( writtenFiles[i] == fn ) {
						return true;
					}
				};
				return false;
			}

		var filename = pkg.file;

		if ( !filename ) {
			throw new Error('Package object missing filename property.');
		}

		var type = pkg.type || guessPackage(pkg.filename);
		var files = pkg.contents || pkg.fileIncludes || [];  // fileIncludes - for JSB2 support

		files.forEach(function(item){
			var path = item.path || process.cwd(),
				file = item.file || item.text,
				recurse = item.recurse || false;

			if ( file ) {
				fullFile = ensureTrailingSlash(path)+file;
				if ( !alreadyWritten(fullFile) ) {
					console.log(' 1 > '+fullFile);
					packOut.push( fs.readFileSync(fullFile)+'' );
					writtenFiles.push(fullFile);
				}
			} else if ( item.files ) {

				if ( isString(item.files) ) {
					collectFiles(item.path, { pattern: item.files, recurse: recurse }).forEach(function(file){
						fullFile = file;
						if ( !alreadyWritten(fullFile) ) {
							console.log(' 2 > '+fullFile);
							packOut.push( fs.readFileSync(file)+'' );
							writtenFiles.push(fullFile);
						}
					});										
				} else {
					item.files.forEach(function(file){
						fullFile = ensureTrailingSlash(path)+file;
						if ( !alreadyWritten(fullFile) ) {
							console.log(' 3 > '+fullFile);
							packOut.push( fs.readFileSync(fullFile)+'' );
							writtenFiles.push(fullFile);
						}
					});					
				}

			} else {
				throw new Error('Content item doesn\'t have file or files property.');
			}
		});

		fs.writeFileSync(ensureTrailingSlash(project.deployDir)+ltrimSlash(filename), packOut.join('\n'));
	}	


	ensureDirectory(project.deployDir, function(){
		project.pkgs.forEach(function(pkg){
			buildPackage(pkg);
		});		
	});

}



function showUsage() {
	console.log('Just - a javascript builder / pre-processor.');
	console.log('Usage:\n\t$ just <build-file>');
}

// ----- Processing Arguments

var args = process.argv;

//*

if ( args.length < 3 ) {
	showUsage()
} else {
	var project;
	var projectSrc = fs.readFileSync(args.pop())+'';	

	projectSrc = projectSrc
					.replace(/(?:[^"])\b(\w+):/ig, '"$1":')
					.replace(/(:\s+)'/ig, '$1"')
					.replace(/',/ig, '",');

	fs.writeFileSync('test.js', projectSrc);

	//console.log(projectSrc);

	//try {
		project = JSON.parse(projectSrc);
	// } catch(e) {
	// }

	if ( project ) {
		buildProject(project);	
	} else {
		console.log('Error. Wrong project file format.');
	}
	
}

//*/













