/**/_jsload2&&_jsload2('pointcollection', 'A.extend(hd.prototype,{ya:function(a){var b=this;b.map=this.P=a;b.vc=document.createElement("canvas");b.vc.style.cssText="position: absolute; left: 0; top: 0;";b.ba=b.vc;a=b.map.xb();b.vc.width=a.width;b.vc.height=a.height;b.vc.id="myCanvasElement";b.map.Rf().at.appendChild(b.vc);b.jy=new Yg;b.Zh();b.map.addEventListener("click",function(a){a=Zg(b.jy,a.offsetX,a.offsetY);a!==q&&b.dispatchEvent("click",{point:a.point})});b.Ok=q;b.map.addEventListener("mousemove",function(a){for(var e=b.map.Zw(),f= e.length,g=q,i=0;i<f&&!(e[i]instanceof D.PointCollection&&(g=Zg(e[i].jy,a.offsetX,a.offsetY),g!==q));i++);g===q?(b.Ok!==q&&(b.dispatchEvent("mouseout",{point:b.Ok.point}),b.Ok=q),b.vc.style.cursor=""):(b.Ok===q?(b.dispatchEvent("mouseover",{point:g.point}),b.Ok=g):b.Ok!==g&&(b.dispatchEvent("mouseout",{point:b.Ok.point}),b.dispatchEvent("mouseover",{point:g.point}),b.Ok=g),b.vc.style.cursor="pointer")});return b.vc},Zh:function(){this.jy.data.cF=[];var a=this.map.xb();this.vc.width=a.width;this.vc.height= a.height;this.vc.style.left=this.map.ye.style.left;this.vc.style.top=this.map.ye.style.top;if(this.ha.ka&&this.ha.ka.length){this.vc.getContext("2d").clearRect(0,0,this.vc.width,this.vc.height);-1!==document.location.href.indexOf(".local")&&(console&&console.time)&&console.time("\\u904d\\u5386\\u7ed8\\u5236\\u9ebb\\u70b9");this.vc.getContext("2d").beginPath();for(var b=0,c;c=this.ha.ka[b];b++){var e=this.map.yc(c);if(!(0>e.x||0>e.y||e.x>a.width||e.y>a.height)){var f;switch(this.K.shape){case 1:f=new $g; break;case 2:f=new ah;break;case 4:f=new bh;break;case 5:f=new ch;break;case ed:f=new dh;break;default:f=new dh}switch(this.K.size){case 1:("circle"===f.type||"star"===f.type)&&f.uf(1);if("rectangle"===f.type||"rhombus"===f.type)f.wh(2),f.uh(2);break;case 2:("circle"===f.type||"star"===f.type)&&f.uf(2);if("rectangle"===f.type||"rhombus"===f.type)f.wh(4),f.uh(4);break;case 3:("circle"===f.type||"star"===f.type)&&f.uf(4);if("rectangle"===f.type||"rhombus"===f.type)f.wh(8),f.uh(8);break;case fd:("circle"=== f.type||"star"===f.type)&&f.uf(5);if("rectangle"===f.type||"rhombus"===f.type)f.wh(10),f.uh(10);break;case 5:("circle"===f.type||"star"===f.type)&&f.uf(8);if("rectangle"===f.type||"rhombus"===f.type)f.wh(16),f.uh(16);break;case 6:("circle"===f.type||"star"===f.type)&&f.uf(10);if("rectangle"===f.type||"rhombus"===f.type)f.wh(20),f.uh(20);break;case 7:("circle"===f.type||"star"===f.type)&&f.uf(15);if("rectangle"===f.type||"rhombus"===f.type)f.wh(30),f.uh(30);break;default:if(("circle"===f.type||"star"=== f.type)&&f.uf(5),"rectangle"===f.type||"rhombus"===f.type)f.wh(10),f.uh(10)}this.K.color&&("circle"===f.type||"star"===f.type||"rectangle"===f.type||"rhombus"===f.type)&&f.Lk(this.K.color);f.Co(this.vc.getContext("2d"),e.x,e.y);f.point=c;this.jy.data.cF.push(f)}}this.vc.getContext("2d").fillStyle=this.K.color;this.vc.getContext("2d").fill();-1!==document.location.href.indexOf(".local")&&(console&&console.timeEnd)&&console.timeEnd("\\u904d\\u5386\\u7ed8\\u5236\\u9ebb\\u70b9")}},v_:function(a){this.ha.ka= a;this.Zh()},ti:function(a){a.color&&(this.K.color=a.color);a.size&&(this.K.size=a.size);a.shape&&(this.K.shape=a.shape);this.Zh()},clear:function(){this.ha.ka=[];this.Zh()},remove:function(){this.clear();this.vc&&this.vc.parentNode&&this.vc.parentNode.removeChild(this.vc);this.dispatchEvent(new P("onremove"))}});hd.prototype.initialize=hd.prototype.ya;hd.prototype.draw=hd.prototype.Zh;hd.prototype.setPoints=hd.prototype.v_;hd.prototype.setStyles=hd.prototype.ti;hd.prototype.clear=hd.prototype.clear; hd.prototype.remove=hd.prototype.remove;function Yg(){this.data={cF:[]}}function Zg(a,b,c){for(var e=0,f;f=a.data.cF[e];e++)if(f.vk(),b>f.position.x-f.Wo()/2&&b<f.position.x+f.Wo()/2&&c>f.position.y-f.vk()/2&&c<f.position.y+f.vk()/2)return f;return q}function ah(){this.type="waterdrop";this.position={x:0,y:0}}var eh=document.createElement("img"),fh=t;eh.onload=function(){fh=p};eh.src=D.oa+"images/point-collection/red-marker-10x13.png";var gh=document.createElement("img");gh.onload=u(); gh.src=D.oa+"images/point-collection/blue-marke-15x16.png";ah.prototype.Co=function(a,b,c){var e=this;fh===t?setTimeout(function(){e.Co(a,b,c)},10):(e.v2=a,e.position.x=b,e.position.y=c,a.save(),a.translate(b-eh.width/2,c-eh.height/2),a.drawImage(eh,0,0,eh.width,eh.height,0,0,eh.width,eh.height),a.restore())};ah.prototype.la=x("position");ah.prototype.Wo=function(){return eh.width};ah.prototype.vk=function(){return eh.height}; function dh(a){this.type="circle";a=a||{};this.M={Da:a.radius||10,color:a.color||"#fa937e"};this.position={x:0,y:0}}ea=dh.prototype;ea.Co=function(a,b,c){this.position.x=b;this.position.y=c;a.save();a.translate(b,c);a.beginPath();a.fillStyle=this.M.color;a.arc(0,0,this.M.Da,0,2*Math.PI,t);a.fill();a.restore()};ea.uf=function(a){this.M.Da=a};ea.gL=function(){return this.M.Da};ea.Lk=function(a){this.M.color=a};ea.la=x("position");ea.Wo=function(){return 2*this.M.Da};ea.vk=function(){return 2*this.M.Da}; function $g(a){this.type="star";a=a||{};this.M={Da:a.radius||10,AE:a.pointsNumber||5,HW:a.fraction||0.4,color:a.color||"#fa937e"};this.position={x:0,y:0}}ea=$g.prototype;ea.Co=function(a,b,c){this.position.x=b;this.position.y=c;a.save();a.fillStyle=this.M.color;a.beginPath();a.translate(b,c);a.moveTo(0,0-this.M.Da);for(b=0;b<this.M.AE;b++)a.rotate(Math.PI/this.M.AE),a.lineTo(0,0-this.M.Da*this.M.HW),a.rotate(Math.PI/this.M.AE),a.lineTo(0,0-this.M.Da);a.fill();a.restore()}; ea.uf=function(a){this.M.Da=a};ea.Lk=function(a){this.M.color=a};ea.la=x("position");ea.Wo=function(){return 2*this.M.Da};ea.vk=function(){return 2*this.M.Da};function bh(a){this.type="rectangle";a=a||{};this.M={width:a.width||10,height:a.height||10,color:a.color||"#fa937e"};this.position={x:0,y:0}}ea=bh.prototype;ea.Co=function(a,b,c){this.position.x=b;this.position.y=c;a.save();a.translate(b-this.M.width/2,c-this.M.height/2);a.fillStyle=this.M.color;a.fillRect(0,0,this.M.width,this.M.height);a.restore()}; ea.wh=function(a){this.M.width=a};ea.Wo=function(){return this.M.width};ea.uh=function(a){this.M.height=a};ea.vk=function(){return this.M.height};ea.Lk=function(a){this.M.color=a};ea.la=x("position");function ch(a){this.type="rhombus";a=a||{};this.M={width:a.width||10,height:a.height||10,color:a.color||"#fa937e"};this.position={x:0,y:0}}ea=ch.prototype; ea.Co=function(a,b,c){this.position.x=b;this.position.y=c;a.save();a.fillStyle=this.M.color;a.translate(b-this.M.width/2,c-this.M.height/2);a.beginPath();a.moveTo(0+0.5*this.M.width,0);a.lineTo(0,0+0.5*this.M.height);a.lineTo(0+0.5*this.M.width,0+this.M.height);a.lineTo(0+this.M.width,0+0.5*this.M.height);a.lineTo(0+0.5*this.M.width,0);a.closePath();a.fill();a.restore()};ea.wh=function(a){this.M.width=a};ea.Wo=function(){return this.M.width};ea.uh=function(a){this.M.height=a};ea.vk=function(){return this.M.height}; ea.Lk=function(a){this.M.color=a};ea.la=x("position"); ');