const fs = require("fs");
process.chdir("dist");

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
		  await doConvert(port);
		  var dur = Date.now()-tb;
		  console.info("TEST RUN #"+i+" in "+dur+" ms");      
			}
		var gdur = Date.now()-gtb;
		console.info("TOTAL DURATION "+gdur+" ms");      
	}, 6000);
});

//------------------------------------------------------------------------
async function doConvert(port) {
	const name = "EXAMPLE4.xls";
	const buf = fs.readFileSync(name);
	const arr = Uint8Array.from(buf);
	const from = '/tmp/input_' + name;
	FS.writeFile(from, arr);
	await new Promise((resolve, error) => {
		port.postMessage({ cmd: 'convert', name, from, to: '/tmp/output.pdf' });
		port.onmessage = function(e) {
			switch (e.data.cmd) {
				case 'converted':
					try {
						try { FS.unlink(e.data.from); } catch { }  // for easier debugging
						const data = FS.readFile(e.data.to);
						fs.writeFileSync("OUTPUT.pdf", data);
						resolve();
					} catch (x) {
						 error(x);
					}
			}
		};
	})
}