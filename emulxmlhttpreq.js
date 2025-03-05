const fs = require("fs");

class FileXMLHttpRequest {
    constructor() {
      this.readyState = 0;
      this.status = 0;
      this.responseText = "";
      this.onload = null;
      this.onerror = null;
      //xhr.responseType = "arraybuffer";
      //xhr.overrideMimeType("application/json");
    }
    responseType;
    onreadystatechange;

    overrideMimeType(mime) {
        this.overrideMimeType=mime;
    }
    setRequestHeader(key,value) {
        console.warn("setRequestHeader",key,value);
    }
  
    open(method, url) {
      this.method = method;
      this.url = url;
      this.readyState = 1;
    }
  
    send() {
      if (this.method !== "GET") {
        if (this.onerror) this.onerror(new Error("Only GET method supported"));
        return;
      }
      console.warn(">>> EMULATE DOWNLOAD ",this.url);

      if (this.responseType == "arraybuffer") { 
        var buf = fs.readFileSync(this.url);
        setTimeout(()=>{ 
            this.readyState = 4;
            this.status = 200;
            this.response = buf;
            if (this.onload) this.onload();
            if (this.onreadystatechange) this.onreadystatechange();
        },0)
      } else {
        var txt = fs.readFileSync(this.url,'utf8');
        setTimeout(()=>{ 
            this.readyState = 4;
            this.status = 200;
            this.responseText = txt;
            if (this.onload) this.onload();
            if (this.onreadystatechange) this.onreadystatechange();
        },0)
      }
    }
  }
  
  module.exports = FileXMLHttpRequest;
