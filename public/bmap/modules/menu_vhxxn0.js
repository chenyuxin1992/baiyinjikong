/**/_jsload2&&_jsload2('menu', 'A.object.extend(Nc.prototype,{ya:function(a,b){if(this.R)return t;this.P=a;this.yl=b||q;this.Fa();var c=this,e=a.M.wc;b&&b.K.gf&&(e="pointer");this.R.style.cursor=e;this.Cd&&(this.Cd.style.cursor=e);A.V(document,"mousedown",function(){c.R&&c.$()});A.V(this.R,"click",function(a){c.$();ma(a)});e=this.m.ab;e||(e=a.ab);this.yl?this.yl.addEventListener("rightclick",function(a){c.R&&c.MI(a)}):a.addEventListener("rightclickex",function(a){c.R&&(!a.tb&&!a.Db)&&c.MI(a)});for(var e=0,f=this.Aa.length;e<f;e++)"menuitem"== this.Aa[e].Kb&&this.Aa[e].ya(a,this),"divider"==this.Aa[e].Kb&&(this.Ee[this.Aa[e].Ij].U=Db(this.R,"<div class=\'BMap_cmDivider\'></div>"));this.Cr()},mb:function(){this.P&&(this.ya(this.P,this.yl),this.Hh&&(this.Hh=t,this.show()))},remove:function(){this.R&&(this.R.parentNode.removeChild(this.R),this.R=q);this.Cd&&(this.Cd.parentNode.removeChild(this.Cd),this.Cd=q);for(var a=0,b=this.Aa.length;a<b;a++)"menuitem"==this.Aa[a].Kb&&(this.Aa[a].R=q);this.P=this.yl=q},Fa:function(){this.R=Db(this.P.ab,"<div unselectable=\'on\'></div>"); this.R.className="BMap_contextMenu";var a=this.R.style;a.font="12px "+H.fontFamily;9>A.fa.na?this.Cd=Db(this.P.ab,"<div class=\'BMap_cmShadow\'></div>"):a.SU=a.gP=a.WebkitBoxShadow="1px 2px 6px #666";return this.R},$v:function(a){if(a&&!("menuitem"!=a.Kb||""==a.Yg||0>=a.Vi)){for(var b=0,c=this.Aa.length;b<c;b++)if(this.Aa[b]===a)return;this.Aa.push(a);this.If.push(a);this.P&&(a.ya(this.P,this),A.U.hb(a.Yc(),"BMap_cmLstItem"),1<this.Aa.length?"menuitem"==this.Aa[this.Aa.length-2].Kb&&A.U.qc(this.Aa[this.Aa.length- 2].Yc(),"BMap_cmLstItem"):"menuitem"==this.Aa[0].Kb&&A.U.hb(this.Aa[0].Yc(),"BMap_cmFstItem"),this.Cr())}},removeItem:function(a){if(a&&"menuitem"==a.Kb){for(var b=0,c=this.Aa.length;b<c;b++)this.Aa[b]===a&&(this.Aa[b].remove(),this.Aa.splice(b,1),c--);b=0;for(c=this.If.length;b<c;b++)this.If[b]===a&&(this.If[b].remove(),this.If.splice(b,1),c--);this.R&&(0<this.Aa.length&&"menuitem"==this.Aa[this.Aa.length-1].Kb&&A.U.hb(this.Aa[this.Aa.length-1].Yc(),"BMap_cmLstItem"),this.Cr())}},zB:function(){this.Aa.push({Kb:"divider", Ij:this.Ee.length});this.Ee.push({U:q});this.R&&(this.Ee[this.Ee.length-1].U=Db(this.R,"<div class=\'BMap_cmDivider\'></div>"),this.Cr())},JE:function(a){if(this.Ee[a]){this.Ee[a].U&&this.Ee[a].U.parentNode&&this.Ee[a].U.parentNode.removeChild(this.Ee[a].U);for(var b=0,c=this.Aa.length;b<c;b++)this.Aa[b]&&("divider"==this.Aa[b].Kb&&this.Aa[b].Ij==a)&&(this.Aa.splice(b,1),c--),this.Aa[b]&&("divider"==this.Aa[b].Kb&&this.Aa[b].Ij>a)&&this.Aa[b].Ij--;this.Ee.splice(a,1);this.Cr()}},va:function(a,b){this.R.style.left= a+"px";this.R.style.top=b+"px";this.Cd&&(this.Cd.style.left=a+1+"px",this.Cd.style.top=b+2+"px")},show:function(){if(this.Hh!=p&&0!=this.If.length){this.Hh=p;this.R&&(this.R.style.visibility="visible");this.Cd&&(this.Cd.style.visibility="visible");var a=new P("onopen");a.point=this.Aw;a.pixel=this.Qr;this.dispatchEvent(a)}},$:function(){if(this.Hh!=t){this.Hh=t;this.R&&(this.R.style.visibility="hidden");this.Cd&&(this.Cd.style.visibility="hidden");var a=new P("onclose");a.point=this.Aw;a.pixel=this.Qr; this.dispatchEvent(a)}},f_:function(a){if(a&&(this.m.cursor=a,this.R&&(this.R.style.cursor=this.m.cursor),this.Cd))this.Cd.style.cursor=this.m.cursor},Cr:function(){this.R&&this.Cd&&(this.Cd.style.width=this.R.offsetWidth+"px",this.Cd.style.height=this.R.offsetHeight+"px")},MI:function(a){if(0!=this.If.length){this.Qr=a.$a;this.Aw=this.P.kg(this.Qr);var b=this.Yc().offsetHeight,c=this.Yc().offsetWidth,e=a.$a.x,f=a.$a.y;a.$a.x+c>this.P.width&&(e=a.$a.x-c);a.$a.y+b>this.P.height&&(f=a.$a.y-b);this.va(e, f);this.show()}}});V(Fg,{addItem:Fg.$v,removeItem:Fg.removeItem,addSeparator:Fg.zB,removeSeparator:Fg.JE});A.object.extend(Qc.prototype,{ya:function(a,b){if(this.R)return t;this.P=a;this.Ch=b;b.Yc()&&(this.Fa(),this.ga(),this.Fh||(this.Fh=p,this.disable()));return p},remove:function(){this.R&&(this.R.parentNode.removeChild(this.R),this.R=q);this.P=this.Ch=q},mb:function(){this.Ch&&this.P&&this.ya(this.P,this.Ch)},Fa:function(){var a=this.m.sm?"<div"+(this.m.id?" id=\'"+this.m.id+"\'":"")+" unselectable=\'on\'><div style=\'width: 17px;height: 17px;margin-right: 3px;display: inline-block;zoom: 1;*display: inline;vertical-align: middle;background: url("+ this.m.sm+") no-repeat;\'></div><span style=\'vertical-align: middle;\'>"+this.Yg+"</span></div>":"<div"+(this.m.id?" id=\'"+this.m.id+"\'":"")+" unselectable=\'on\'><span>"+this.Yg+"</span></div>";this.R=Db(this.Ch.Yc(),a);this.m.sm?(this.Zu=this.R.firstChild,this.wr=this.R.lastChild):this.wr=this.R;a=this.R.style;a.padding="2px 6px";a.margin="0 2px";a.fontSize="14px";a.MozUserSelect="none";a.lineHeight="17px";a.width=this.m.width+"px";this.Fh?(a.color="#000",a.cursor="pointer"):(a.color="#aaa",a.cursor= this.P.M.wc);return this.R},ga:function(){var a=this;A.V(this.R,"click",function(b){a.Fh?a.$y&&a.$y.call&&a.$y.call(a,a.Ch.Aw,a.Ch.Qr,a.Ch.yl):ma(b)});A.V(this.R,"mousedown",function(a){ma(a)});A.V(this.R,"mouseover",function(){a.Fh&&(a.R.style.color="#6688cc")});A.V(this.R,"mouseout",function(){a.Fh&&(a.R.style.color="#000")})},Gt:function(a){a&&(this.Yg=a+"",this.wr&&(this.wr.innerHTML="<span>"+this.Yg+"</span>"))},Ub:function(a){a&&(this.m.sm=a,this.Zu?this.Zu.style.background="url("+a+")":(this.R.innerHTML= "<div"+(this.m.id?" id=\'"+this.m.id+"\'":"")+" unselectable=\'on\'><div style=\'width: 17px;height: 17px;margin-right: 3px;display: inline-block;zoom: 1;*display: inline;vertical-align: middle;background: url("+this.m.sm+") no-repeat;\'></div><span style=\'vertical-align: middle;\'>"+this.Yg+"</span></div>",this.Zu=this.R.firstChild,this.wr=this.R.lastChild))},enable:function(){this.Fh=p;this.R&&(this.R.style.color="#000",this.R.style.cursor="pointer")},disable:function(){this.Fh=t;this.R&&(this.R.style.color= "#aaa",this.R.style.cursor=this.P.M.wc)}});V(Gg,{setIcon:Gg.Ub,setText:Gg.Gt,enable:Gg.enable,disable:Gg.disable}); ');