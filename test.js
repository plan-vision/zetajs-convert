const fs = require("fs");
const fspath = require("path");
process.chdir("dist");
//-------------------------------------------------------------------------------------
const { createCanvas } = require('canvas');
const canvas = createCanvas(200, 200);
canvas.id = '#qtcanvas';
canvas.transferControlToOffscreen = function() {
	return { TYPE: 'canvas', width: canvas.width, height: canvas.width, id: canvas.id };
};
global.XMLHttpRequest = require("./emulxmlhttpreq");
global.WebGLRenderingContext = function() { }; // dummy allow instanceof only (always false)
//------------------------------------------------------------------------
const { Module, FS } = require('./dist/soffice.DEBUG.js');
Module.canvas = canvas;
Module.locateFile = function(path, prefix) {
	return prefix ? prefix + path : path;
}
//------------------------------------------------------------------------
Module.uno_scripts = ['file://zeta.js', 'file://office_thread.js'];
//------------------------------------------------------------------------
//next();
//------------------------------------------------------------------------

Module.uno_main.then(function(port) {
	console.warn(" **** START !!!! ")
	setTimeout(async function() {
		var gtb = Date.now();
		for (var i = 0; i < 20; i++) {
			var tb = Date.now();
		  	await doConvert(port,"../data/EXAMPLE4.xls","../data/EXAMPLE4.pdf");//,i != 0);
		  	var dur = Date.now()-tb;
		  	console.info("TEST RUN #"+i+" in "+dur+" ms");      
		}
		var gdur = Date.now()-gtb;
		console.info("TOTAL DURATION "+gdur+" ms");      
	}, 6000);
});

//------------------------------------------------------------------------
async function doConvert(port,input,output) {
	const name = fspath.basename(input);
	const from = '/tmp/input_' + name;
	const buf = fs.readFileSync(input);
	const arr = Uint8Array.from(buf);
	FS.writeFile(from, arr);
	await new Promise((resolve, error) => {
		port.postMessage({ cmd: 'convert', name, from, to: '/tmp/output.pdf' });
		port.onmessage = function(e) {
			switch (e.data.cmd) {
				case 'converted':
					try {
						try { FS.unlink(e.data.from); } catch { }  // for easier debugging
						const data = FS.readFile(e.data.to);
						fs.writeFileSync(output, data);
						resolve();
					} catch (x) {
						 error(x);
					}
			}
		};
	})
}