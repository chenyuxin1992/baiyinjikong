/**/_jsload2&&_jsload2('buslinesearch', 'A.extend(ef.prototype,{Rd:function(){for(var a=0,b=this.Ta.length;a<b;a++){var c=this.Ta[a];this[c.method].apply(this,c.arguments)}delete this.Ta},Qu:function(a,b,c){a=T.Wa(a);return D.fp+"?c="+a.lng+","+a.lat+"&i="+b+","+encodeURIComponent(c)+"&s="+encodeURIComponent("tpl:LinesQuery")},getBusList:function(a){var b=this;this.Og(this.Ad,function(c){c?ve.pb(function(a,c){b.VP(a,c)},{qt:b.nP,c:c,wd:a},{yb:a}):(this.tc=new bj({yb:a,city:"",ni:"",Bh:""}),b.Za(5),b.La(X.gu,this.tc))})},VP:function(a,b){this.clearResults(); var c=a.result;if(!a.content||0!=c.error||c.type!=this.pP)this.tc=new bj({yb:b.yb,city:a.current_city.name,ni:"",Bh:a.current_city.code}),this.Za(7),this.La(X.gu,this.tc);else{for(var c=a.content,e=[],f=0,g=c.length;f<g;f++)e.push({name:c[f].name,ek:c[f].uid,Bh:a.current_city.code,Qj:f,kA:b.yb,Qi:c[f].poiType||2});this.tc=new bj({yb:b.yb,city:a.current_city.name,ni:this.Qu(db.Ae(a.current_city.geo,p).point,a.current_city.code,b.yb),lM:e,Bh:a.current_city.code});this.Za(0);this.La(X.gu,this.tc);this.qT(); this.oS(a.current_city.geo,a.current_city.level,a.current_city.code)}},qT:function(){if(this.m.pa.Oa&&this.m.pa.Oa.appendChild&&this.tc&&0<this.tc.zs()){var a=L("div",{style:"font:12px "+H.fontFamily+";background:#fff"});a.id="divResult"+this.ca;for(var b=this.tc.zs(),c=[],e=0;e<b;e++){var f=this.tc.fD(e).name;c.push(\'<dl style="margin:3px 3px"><dt><span style="cursor:pointer" onclick=Instance(\\\'\'+this.ca+"\')._selectBusListItem("+e+")><img id=imgBLIcon"+e+" src="+ef.$u+\' style="border:none" /></span>&nbsp;&nbsp;<a style="color:blue" href="javascript:void(0)" onclick=Instance(\\\'\'+ this.ca+"\')._selectBusListItem("+e+")>"+f+"</a></dt><dd id=ddBLInfo"+e+\' style="display:none;margin:2px 0px"></dd></dl>\')}b="";this.tc.moreResultsUrl&&(b=b+"<div style=\'color:#7777cc;background:#e5ecf9;overflow:hidden;padding:2px;text-align:right\'>"+("<a style=\'color:#7777cc\' href=\'"+this.tc.moreResultsUrl+"\' target=\'_blank\'>\\u5230\\u767e\\u5ea6\\u5730\\u56fe\\u67e5\\u770b&#187;</a>"),b+="&nbsp;</div>");a.innerHTML=c.join("")+b;this.m.pa.Oa.appendChild(a);this.La(X.SF,a)}},oS:function(a,b,c){var e=this.m.pa.map; e&&(a=db.Ae(a,p).point,this.KA?this.KA!=c&&(e.od(a,b),this.KA=c):(e.od(a,b),this.KA=c))},bU:function(a){if(this.tc)for(var b=0,c=this.tc.zs();b<c;b++){var e=A.Ec("ddBLInfo"+b),f=A.Ec("imgBLIcon"+b);b==a?"none"==e.style.display?(e.style.display="block",f.src=ef.gS):(e.style.display="none",f.src=ef.$u):(e.style.display="none",f.src=ef.$u)}},_selectBusListItem:function(a,b){if(!b){var c=A.Ec("ddBLInfo"+a),e=A.Ec("imgBLIcon"+a);if("block"==c.style.display){c.style.display="none";e.src=ef.$u;return}}if(this.tc&& this.tc[a]&&0<this.tc[a].Po())this.Fc=this.tc[a],this.Za(0),this.La(X.fu,this.Fc),this.qI(a),this.pI(a);else{var f=this,c=this.tc.fD(a);ve.pb(function(b,c){f.UP(b,c,a)},{qt:f.mP,c:c.Bh,uid:c.ek},{name:c.name,Qi:c.Qi})}},clearResults:function(){delete this.tc;delete this.Fc;delete this.Ti;delete this.K1;this.Fj();this.m.pa.Oa&&(this.m.pa.Oa.innerHTML="")},getBusLine:function(a){a&&("object"==typeof a&&a.ek&&""!=a.ek&&"undefined"!=typeof a.Bh&&""!=a.Bh.toString()&&"undefined"!=typeof a.Qj&&""!=a.Qj.toString()&& "undefined"!=typeof a.kA&&""!=a.kA.toString())&&(this.tc&&0<this.tc.zs()&&a.Bh==this.tc.Bh&&a.kA==this.tc.keyword)&&this._selectBusListItem(a.Qj,p)},UP:function(a,b,c){var e=a.result;if(!a.content||!a.content[0]||0!=e.error||e.type!=this.oP)this.Fc=new cj({name:b.name}),this.Za(7),this.La(X.fu,this.Fc);else{var a=a.content[0],f=e="",g="",i={},k=[],e=a.startTime,f=a.endTime,g=a.company;a.geo&&(i=db.Ae(a.geo,p),i=new od(i.ka));if(a.stations)for(var m=0,n=a.stations.length;m<n;m++)if(a.stations[m].geo){var o= db.Ae(a.stations[m].geo,p);k.push({name:a.stations[m].name,position:o.point,ek:a.stations[m].uid})}this.Fc=new cj({name:b.name,startTime:e,wW:f,oV:g,CZ:i,XN:k,Qi:b.Qi});this.Za(0);this.La(X.fu,this.Fc);this.tc[c]=this.Fc;this.qI(c);this.pI(c)}},qI:function(a){if(this.m.pa.Oa&&this.m.pa.Oa.appendChild&&this.Fc&&0<this.Fc.Po()){this.bU(a);var b=A.Ec("ddBLInfo"+a);if(b){var c=[];c.push(\'<table style="width:100%;background:#CDCDCD;font:12px \'+H.fontFamily+\'" cellspacing="1" cellpadding="1" ><tbody>\'); c.push(\'<tr><td style="width:95px;line-height:22px;padding:0px 8px;text-align:left;vertical-align:top;background:#F4F4F4" >\\u9996\\u672b\\u8f66\\u65f6\\u95f4</th><td  style="background:#FFFFFF;line-height:22px;padding:0px 8px" >\'+this.Fc.startTime+"-"+this.Fc.endTime+"</td></tr>");c.push(\'<tr><td style="width:95px;line-height:22px;padding:0px 8px;text-align:left;vertical-align:top;background:#F4F4F4" >\\u6240\\u5c5e\\u516c\\u53f8</th><td  style="background:#FFFFFF;line-height:22px;padding:0px 8px" >\'+this.Fc.company+ "</td></tr>");c.push("</tbody></table>");4==this.Fc.Qi?c.push(\'<p style="margin:2px 0px;font:12px \'+H.fontFamily+\';">\\u6cbf\\u7ebf\\u5730\\u94c1\\u7ad9:</p>\'):c.push(\'<p style="margin:2px 0px;font:12px \'+H.fontFamily+\';">\\u6cbf\\u7ebf\\u516c\\u4ea4\\u7ad9\\u70b9:</p>\');c.push(\'<table style="width:100%;font:12px \'+H.fontFamily+\';" ><tbody>\');for(var e=0,f=this.Fc.Po();e<f;e++)c.push(\'<tr><td style="width:20px">\'+(e+1)+"</th><td><a id=aStop_"+a+"_"+e+\' style="color:blue" href="javascript:void(0)" onclick=Instance(\\\'\'+ this.ca+"\')._selectBusStop("+a+","+e+")>"+this.Fc.Ow(e).name+"</a></td></tr>");c.push("</tbody></table>");b.innerHTML=c.join("")}a=A.Ec("divResult"+this.ca);this.La(X.RF,a)}},pI:function(a){if(this.m.pa.map&&this.Fc&&0<this.Fc.Po()){this.Fj();ue.no(this.m.pa.map,this.Fc.Ue());var b=this.Fc.So();this.La(X.hu,b);var c=this;this.Ti=[];for(var e=0,f=this.Fc.Po();e<f;e++){var g=this.Fc.Ow(e).position,i=this.Fc.Ow(e).name,g=ue.wU(this.m.pa.map,g,i);(function(b,e,f){b.addEventListener("click",function(g){var i= ["<div style=\'font:12px "+H.fontFamily+"\'>"];i.push("<div style=\'margin:10px 1em 24px 0\'><b>"+e+"</b></div>");i.push("</div>");var v=new bd(i.join(""),{title:"",height:0,width:220,margin:[10,10,20,10]});v.addEventListener("open",function(){var b=A.Ec("aStop_"+a+"_"+f);b&&(b.style.backgroundColor="#cccccc")});v.addEventListener("close",function(){var b=A.Ec("aStop_"+a+"_"+f);b&&(b.style.backgroundColor="#ffffff")});i=c.m.pa.map;i.M.NC?yf.ML(v,i.getCurrentCity().code,{panoInstance:i.W,lngLat:g.target.la(), titleTip:e,type:"busline"},function(){b.$c(v)}):b.$c(v)})})(g,i,e);g.fB=i;this.Ti.push(g)}this.La(X.Mp,this.Ti);this.m.pa.ah&&this.m.pa.map.vh(b.Ue(),{margins:[5,5,5,5]})}},_selectBusStop:function(a,b){if(this.m.pa.map&&this.Ti&&0<this.Ti.length){var c=this.Ti[b];if(c.fB){var e=["<div style=\'font:12px "+H.fontFamily+"\'>"];e.push("<div style=\'margin:10px 1em 24px 0\'><b>"+c.fB+"</b></div>");e.push("</div>");var f=new bd(e.join(""),{title:"",height:0,width:220,margin:[10,10,20,10]});f.addEventListener("open", function(){var c=A.Ec("aStop_"+a+"_"+b);c&&(c.style.backgroundColor="#cccccc")});f.addEventListener("close",function(){var c=A.Ec("aStop_"+a+"_"+b);c&&(c.style.backgroundColor="#ffffff")});e=this.m.pa.map;e.M.NC?yf.ML(f,e.getCurrentCity().code,{panoInstance:e.W,lngLat:c.la(),titleTip:c.fB,type:"busline"},function(){c.$c(f)}):c.$c(f)}}else{this.eN&&(this.eN.style.backgroundColor="#ffffff");if(e=A.Ec("aStop_"+a+"_"+b))e.style.backgroundColor="#cccccc";this.eN=e}},Fj:function(){this.m.pa.map&&this.m.pa.map.SJ()}, Za:function(a){"number"==typeof a?this.Le=a:delete this.Le}});function bj(a){this.keyword=a.yb||"";this.city=a.city;this.moreResultsUrl=a.ni;this.pA=a.lM&&a.lM.slice(0)||[];this.Bh=a.Bh}A.extend(bj.prototype,{fD:function(a){if(this.pA[a])return this.pA[a]},zs:function(){return this.pA.length}});var dj=bj.prototype;V(dj,{getNumBusList:dj.zs,getBusListItem:dj.fD});function cj(a){this.name=a.name||"";this.startTime=a.startTime||"";this.endTime=a.wW||"";this.company=a.oV||"";this.Xj=a.CZ||{};this.hB=a.XN&&a.XN.slice(0)||[];this.Qi=a.Qi||2}A.extend(cj.prototype,{Ow:function(a){if(this.hB[a])return this.hB[a]},Po:function(){return this.hB.length},So:x("Xj"),Ue:function(){if(this.Xj.Ue())return this.Xj.Ue()}});var ej=cj.prototype;V(ej,{getNumBusStations:ej.Po,getBusStation:ej.Ow,getPath:ej.Ue,getPolyline:ej.So}); ');
