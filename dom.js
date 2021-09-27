function ShogitterDom(shogi){
	this.shogi = shogi;
}
ShogitterDom.prototype={
	imgsize: {
		original: {},
		normal: {},
		half: {}
	},
	imgsizehalf: {},
	reverseMode: 0,
	loadedflag: false,
	dom: {
		rulelist: null,
		kifu: null,
		dragging: null
	},
	flag: {
		moving: null
	},
	lastXY: [],
	soundKoma: function(){
		if(this.soundObj){
			this.soundObj.play();
		}else{
			this.soundEmbed();
		}
	},
	writeMain: function(title){
		document.write("<div class=\"shogitter select1\" id=\""+this.getId("main")+"\">
		<div class='radiuswithmenu'>\
			<div id=\""+this.getId("block1")+"\" class=\"block1\">\
				<div id=\""+this.getId("relative")+"\" class=\"inlineblock\" style=\"position:relative;\">\
					<div id=\""+this.getId("onmenu")+"\" class=\"onmenu show0 show2\">\
						<div class=\"inlineblock onmenu2\" id=\""+this.getId("onmenu2")+"\">\
							<p id=\""+this.getId("status")+"\"></p>\
							<p id=\""+this.getId("initialize")+"\"></p>\
						</div>\
						<div class=\"inlineblock\" style=\"height:100%;vertical-align:middle;\">&nbsp;</div>\
					</div>\
					<div style=\"text-align:center\">\
						<div id=\""+this.getId("rule")+"\"></div>\
						<div class=\"show1\" id=\""+this.getId("toppanel")+"\"></div>\
					</div>\
					<table>\
						<tr>\
							<td>\
								<div class=\"inlineblock players\">\
									<div id=\""+this.getId("mochiback1")+"\" class=\"mochiback\">\
										<div id=\""+this.getId("mochiplate1")+"\" class=\"tebanname\">&nbsp;</div>\
										<div id=\""+this.getId("mochi1")+"\" class=\"mochimain\" style=\"margin-bottom:0;margin-top:auto;\">&nbsp;</div>\
									</div>\
									<div id=\""+this.getId("mochiback2")+"\" class=\"mochiback\">\
										<div id=\""+this.getId("mochiplate2")+"\" class=\"tebanname\">&nbsp;</div>\
										<div id=\""+this.getId("mochi2")+"\" class=\"mochimain\">&nbsp;</div>\
									</div>\
								</div>\
							</td>\
							<td>\
								<div style=\"margin:0 0px;\">\
									<div id=\""+this.getId("ban")+"\"></div>\
								</div>\
							</td>\
							<td>\
								<div class=\"inlineblock players\">\
									<div id=\""+this.getId("mochiback3")+"\" class=\"mochiback\">\
										<div id=\""+this.getId("mochiplate3")+"\" class=\"tebanname\">&nbsp;</div>\
										<div id=\""+this.getId("mochi3")+"\" class=\"mochimain\" style=\"margin-bottom:0;margin-top:auto;\">&nbsp;</div>\
									</div>\
									<div id=\""+this.getId("mochiback0")+"\" class=\"mochiback\">\
										<div id=\""+this.getId("mochiplate0")+"\" class=\"tebanname\">&nbsp;</div>\
										<div id=\""+this.getId("mochi0")+"\" class=\"mochimain\">&nbsp;</div>\
									</div>\
								</div>\
							</td>\
						</tr>\
					</table>\
					<div align=\"center\">\
						<form action=\"/self.php\" method=\"POST\" id=\""+this.getId("makeself")+"\" style=\"display: inline\">\
							<input type=\"submit\" value=\"検討\">\
							<input type=\"hidden\" name=\"lasttext\" value=\"\">\
						</form>\
						<button id=\""+this.getId("reverse")+"\">反転</button>\
						<ul class=\"inline\" id=\""+this.getId("go")+"\">\
							<li><button data-go=\"start\">|&lt;</button>\
							<li><button data-go=\"-10\">&lt;&lt;</button>\
							<li><button data-go=\"-1\">&lt;</button>\
							<li>\
								<form action=\"?\" id=\""+this.getId("goform")+"\" style=\"display:inline\">\
									<input type=\"text\" name=\"tesuu\" id=\""+this.getId("tesuu")+"\" size=3 style=\"text-align:center\">\
								</form>\
							<li><button data-go=\"1\">&gt;</button>\
							<li><button data-go=\"10\">&gt;&gt;</button>\
							<li><button data-go=\"end\">&gt;|</button>\
						</ul>\
						<label><input type='checkbox' id='"+this.getId("chakuconfirm")+"'>着手確認</label>\
					</div>\
				</div>\
				<div id=\""+this.getId("footer")+"\"></div>\
			</div>\
		</div>\
		<DIV id=\""+this.getId("id_sound")+"\" style=\"visibility:hidden\"></DIV>\
	</div>\
");
		var dom = this.gid("rule");
		dom.appendChild((function(){
			var b = document.createElement("b");
			b.appendChild(document.createTextNode("ルール："));
			b.appendChild((function(){
				var a = document.createElement("a");
				a.href="";
				a.target="_blank";
				a.innerHTML = "?";
				this.dom.rule = a;
				return a;
			}.bind(this))());
			return b;
		}.bind(this))());
		dom.appendChild(document.createTextNode(" "));
		dom.appendChild((function(){
			var a = document.createElement("a");
			a.innerHTML = "?";
			a.href="javascript:void(0);";
			
			ShogitterLib.myAddEventListener(a, "click", function(e){
				this.message(this.rule["abstract"]);
				try{
					e.preventDefault();
				}catch(ev){
					e.returnValue = false;
				}
			}.bind(this));
			
			return a;
		}.bind(this))());
		
		var toppanel = this.gid("toppanel");
		toppanel.appendChild((function(){
			var b = document.createElement("b");
			b.appendChild(document.createTextNode("次の手番："));
			b.appendChild((function(){
				var span = document.createElement("span");
				this.dom.teban = span;
				return span;
			}.bind(this))());
			return b;
		}.bind(this))());
		toppanel.appendChild(this.getPlayerPanel());
	},
	addEvents: function(){
		ShogitterLib.myAddEventListener(this.gid("menu"), "click", function(e){
			var target = e.target || e.srcElement;
			if(target.tagName=="LI"){
				this.changeMenu(ShogitterLib.data(target, "menu"));
			}
		}.bind(this));
		
		ShogitterLib.myAddEventListener(this.gid("go"), "click", function(e){
			var target = e.target || e.srcElement;
			if(target.tagName=="BUTTON"){
				var go = ShogitterLib.data(target, "go");
				if(go=="start"){
					this.shogitter.ban.go(0);
				}else if(go=="end"){
					this.shogitter.ban.go(this.shogitter.ban.tesuu);
				}else{
					this.shogitter.ban.go(parseInt(go), true);
				}
			}
		}.bind(this));
		
		ShogitterLib.myAddEventListener(this.gid("reverse"), "click", function(e){
			this.reverse();
		}.bind(this));
		
		ShogitterLib.myAddEventListener(this.gid("makeself"), "submit", function(e){
			this.makeSelf((e.target||e.srcElement).lasttext);
		}.bind(this));
		
		ShogitterLib.myAddEventListener(this.gid("goform"), "submit", function(e){
			var target = e.target || e.srcElement;
			if(isNaN(target.tesuu.value)){
				target.tesuu.value=this.shogitter.ban.replay;
			}else{
				this.shogitter.ban.go(target.tesuu.value);
			}
			try{
				e.preventDefault();
			}catch(ev){
				e.returnValue=false;
			}
		}.bind(this));
	},
	
	makeSelf: function(dom){
		var inc = parseInt(localStorage.getItem("selfbanIncrement"));
		if(isNaN(inc)) inc = 0;
		
		this.gid("makeself").target = "selfban"+inc;
		
		window.open("", "selfban"+inc, "width=800; height=768;");
		inc++;
		localStorage.setItem("selfbanIncrement", inc);
		var json=this.shogitter.getJSONFormat();
		json.status={num: 1};
		dom.value = JSON.stringify(json);
	},
	calcImgSize: function(){
		this.imgsize.normal = {
			width: Math.floor(this.imgsize.original.width*this.scale),
			height: Math.floor(this.imgsize.original.height*this.scale)
		};
		this.imgsize.half = {
			width: Math.floor(this.imgsize.original.width*this.scale/2),
			height: Math.floor(this.imgsize.original.height*this.scale/2)
		};
	},
	getXYByNum: function(num){
		if(num==null) return this.shogitter.createXY(null, null);
		var kifulength=this.shogitter.kifulength;
		return this.shogitter.createXY(num.substr(0,kifulength), num.substr(kifulength,kifulength));
	},

	//マス目のidから座標オブジェクトを返す
	getXYById: function(id){
		if(id==null) return this.shogitter.createXY(null, null);
		var kifulength=this.shogitter.kifulength;
		return this.shogitter.createXY(id.substr(1,kifulength), id.substr(1+kifulength,kifulength));
	},

	//座標x,yまたは座標オブジェクトを受け取り，マス目のidを返す
	getIdByXY: function(x,y){
		return this.shogitter.createXY(x,y);
	},
	/**
	 * 盤面を反転する
	 * プレイ人数が二人なら１８０度反転のみにする
	 */
	reverse: function(mode){
		if(this.shogitter.ban.noreverse=="ban") return;
		if(!isNaN(mode)){
			this.reverseMode = mode;
		}else if(this.reverseMode%2 && this.shogitter.maxplayernum==2){
			this.reverseMode=0;
		}else{
			this.reverseMode=(this.reverseMode+(this.shogitter.maxplayernum==2?2:1))%4;
		}

		this.shogitter.ban.show();
		this.shogitter.ban.mochigoma.show();
	},
	showRule: function(ruleid, rulename, abs){
		this.rule={
			id: ruleid,
			name: rulename,
			"abstract": abs
		};
		var a = this.dom.rule;
		a.href="/rule/"+ruleid;
		a.innerHTML = rulename;
	},
	getMasuDom: function(XY){
		return this.gid(XY).firstChild;
	},
	getObj: function(){
		return "ShogitterLib.array.Shogitter["+this.shogitter.key+"]";
	},
	getId: function(name){
		return "shogitter"+this.shogitter.key+"_"+name;
	},
	soundObj: (function(){
		try{
			var audio = new Audio("");
			audio.removeAttribute("src");
			[
				["ogg", "audio/ogg"],
				["mp3", "audio/mp3"],
				["wav", "audio/wav"]
			].forEach(function(thissource){
				var source = document.createElement("source");
				source.src="/sound/komaoto."+thissource[0];
				source.type=thissource[1];
				audio.appendChild(source);
			});
			return audio;
		}catch(e){
			return null;
		}
	})(),
	soundEmbed: function(){
		var dom = this.gid("id_sound");
		ShogitterLib.removeChildAll(dom);
		dom.appendChild((function(){
			var embed = document.createElement("embed");
			embed.src="/sound/komaoto.wav";
			embed.autostart="true";
			embed.hidden="true";
			return embed;
		}.bind(this))());
	},
	fixReverse: function(flag){
		if(flag){
			this.reverseMode=0;
			this.gid("reverse").disabled=true;
		}else{
			this.gid("reverse").disabled=false;
		}	
	},
	initKifuList: function(){
		var kifulist = document.createElement("select");
		kifulist.id=this.getId("kifulist");
		kifulist.className='kifulist';
		kifulist.size=(this.imgsize.height*this.size.y/2<15*7?3:7);
		
		ShogitterLib.myAddEventListener(kifulist, "change", function(e){
			var target = e.target || e.srcElement;
			return this.shogitter.ban.go(target.options[target.selectedIndex].value)
		}.bind(this));
		
		ShogitterLib.removeChildAll(this.dom.kifu);
		this.dom.kifu.appendChild(kifulist);
	},
	showKifuList: function(kifu){
		var kifulist = this.gid("kifulist");
		ShogitterLib.removeChildAll(kifulist);
		kifulist.appendChild((function(){
			var option = document.createElement("option");
			option.value=0;
			option.innerHTML="0: 初期局面";
			return option;
		})());
		
		for(var i=0, l=kifu.getTesuu(); i<l; i++){
			kifulist.appendChild((function(){
				var option = document.createElement("option");
				option.value=i+1;
				option.innerHTML=(i+1)+": "+kifu.getDisp(i);
				return option;
			})());
		}
	},
	setDownloadName: function(playerinfo, rulename){
		var date = new Date();
		var playername = [];
		for(var i in playerinfo){
			if(typeof playerinfo[i] == "function") continue;
			playername[i]=playerinfo[i].name;
		}
		var filename=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"_"+playername.join("-")+"("+rulename+")";
		if(filename!=this.savefilename){
			this.gid("download").kifufilename.value=filename;
			this.savefilename=filename;
		}
	},
	focusKifu: function(replay){
		if(this.gid("kifulist").selectedIndex!=replay){
			this.gid("kifulist").selectedIndex=replay;
		}
	},
	moveConfirm: function(){
		if(this.gid("chakuconfirm").checked && !window.confirm("着手確認")){
			return false;
		}
		return true;
	},
	//選択駒を設定し，駒のマスをカラーリング
	setMoving: function(dom, position){
		this.dom.dragging=dom;
		this.flag.moving={komatype: ShogitterLib.data(dom, "komatype")};
		switch(this.flag.moving.komatype){
			case "bankoma":
				this.flag.moving.species = ShogitterLib.data(dom, "species");
				this.flag.moving.direction = ShogitterLib.data(dom, "direction");
			case "banspace":
				this.flag.moving.XY = this.shogitter.createXY(ShogitterLib.data(dom, "x"), ShogitterLib.data(dom, "y"));
				break;
			case "mochigoma":
				this.flag.moving.species = ShogitterLib.data(dom, "species");
				this.flag.moving.direction = ShogitterLib.data(dom, "direction");
		}
		console.log("setMoving", this.flag.moving);
		if(this.dndMode){
			ShogitterLib.classList(dom.parentNode).add("moving");
			this.setPosition(position);
		}else{
			ShogitterLib.classList(dom.parentNode).add("moving-abs");
		}
	},
	//選択駒を取り消し，移動可能域の色を消す
	resetMoving: function(){
		if(this.flag.moving==null) return;
		this.uncolorMovable();
		this.colorLastXY();
		this.flag.moving=null;
		this.nowcoloring=null;
	},
	//移動可能箇所を受け取る
	colorMovable: function(XY){
		this.nowcoloring={XY: XY};
		this.shogitter.getMovable(XY, function(movable){
			if(this.nowcoloring && XY.equals(this.nowcoloring.XY)){
				for(var i in movable){
					if(typeof movable[i] == "function") continue;
					ShogitterLib.classList(this.gid(movable[i])).add("movable");
				}
				this.nowcoloring.arr = movable;
			}
		}.bind(this));
	},
	uncolorMovable: function(){
		if(!this.nowcoloring || !this.nowcoloring.arr) return;
		var arr = this.nowcoloring.arr;
		for(var i in arr){
			if(typeof arr[i] == "function") continue;
			ShogitterLib.classList(this.gid(arr[i])).remove("movable");
		}
	},
	showBan: function(array){
		var table = document.createElement("table");
		table.className = "ban";
		table.id = this.getId("bantable");
		//盤面を表示
		var insertDirection=[
			{x: false, y: true},
			{x: true, y: true},
			{x: true, y: false},
			{x: false, y: false}
		];
		
		if(this.reverseMode==0 || this.reverseMode==2){
			
				var tr = table.insertRow(0);
				tr.appendChild(document.createElement("th"));
				for(var x=1; x<=this.size.x; x++){
					tr.insertBefore((function(){
						var th = document.createElement("th");
						th.className = "number";
						th.innerHTML = x;
						return th;
					}.bind(this))(), insertDirection[this.reverseMode].x?null:tr.firstChild);
				}
			
			for(var y=1; y<=this.size.y; y++){
				var tr = table.insertRow(insertDirection[this.reverseMode].y?table.rows.length:0);
				tr.appendChild((function(){
					var th = document.createElement("th");
					th.className="number";
					th.innerHTML = ShogitterLib.getKanjiByNum(y);
					return th;
				}.bind(this))());
				for(var x=1; x<=this.size.x; x++){
					tr.insertBefore((function(){
						var td = document.createElement("td");
						td.id = this.getId(this.getIdByXY(x,y));
						td.appendChild(array[x-1][y-1].getTag(x,y));
						return td;
					}.bind(this))(), insertDirection[this.reverseMode].x?null:tr.firstChild);
				}
			}
		}else{
			var tr = table.insertRow(0);
			tr.appendChild(document.createElement("th"));
			for(var y=1; y<=this.size.y; y++){
				tr.insertBefore((function(){
					var th = document.createElement("th");
					th.className = "number";
					th.innerHTML = ShogitterLib.getKanjiByNum(y);
					return th;
				}.bind(this))(), insertDirection[this.reverseMode].y?null:tr.firstChild);
			}
			
			for(var x=1; x<=this.size.x; x++){
				var tr = table.insertRow(insertDirection[this.reverseMode].x?table.rows.length:0);
				tr.appendChild((function(){
					var th = document.createElement("th");
					th.className="number";
					th.innerHTML = x;
					return th;
				}.bind(this))());
				for(var y=1; y<=this.size.y; y++){
					tr.insertBefore((function(){
						var td = document.createElement("td");
						td.id = this.getId(this.getIdByXY(x,y));
						td.appendChild(array[x-1][y-1].getTag(x,y));
						return td;
					}.bind(this))(), insertDirection[this.reverseMode].y?null:tr.firstChild);
				}
			}
		}

		ShogitterLib.removeChildAll(this.gid("ban"));
		this.gid("ban").appendChild(table);

		//最終の指し手
		//ヘッダ行数
		var last=this.shogitter.kifu.getLast();
		if(last!=false){
			var tmp=this.shogitter.kifu.getXYByKifu(last);
			this.setLastXY(tmp.to, tmp.from);
		}

		this.gid("tesuu").value=this.shogitter.ban.tesuu;

		//プレイヤー名反映
		this.showPlayerName();
		
		if(this.loadedflag==false && location.hash.length>1){
			this.go(parseInt(location.hash.substr(1),10));
			this.loadedflag=true;
		}
		this.makePermaLink();
	},
	showMochigoma: function(array){
		//持ち駒表示
		for(var i in array){
			if(typeof array[i] == "function") continue;
			var muki=this.getMukiByDir(i);
			var dom = this.gid("mochi"+muki);

			ShogitterLib.removeChildAll(dom);
			for(var j in array[i]){
				dom.appendChild(this.getMochigomaTag(j,i,array[i][j]));
			}
			
			if(this.shogitter.isPlaying()&&this.shogitter.getNowDirection()==i){
				//対局中かつ手番
				ShogitterLib.classList(this.gid("mochiback"+muki)).add("teban");
			}else{
				//手番でない
				ShogitterLib.classList(this.gid("mochiback"+muki)).remove("teban");
			}
		}
		return true;
	},
	//現在の手数へのパーマリンクをフォームにペーストする
	makePermaLink: function(hash){
		this.gid("permalink").value=location.href.split("#")[0]+hash;
	},
	showKoma: function(XY, koma){
		var dom = this.gid(XY);
		ShogitterLib.removeChildAll(dom);
		dom.appendChild(koma.getTag(XY.x,XY.y));
	},
	colorLastXY: function(){
		if(this.lastXY.length==0) return;
		ShogitterLib.classList(this.gid(this.lastXY[0])).add("lastto");
		if(this.lastXY[1]!=null) ShogitterLib.classList(this.gid(this.lastXY[1])).add("lastfrom");
	},
	uncolorLastXY: function(){
		if(this.lastXY.length!=0){
			ShogitterLib.classList(this.gid(this.lastXY[0])).remove("lastto");
			if(this.lastXY[1]!=null) ShogitterLib.classList(this.gid(this.lastXY[1])).remove("lastfrom");
		}
	},
	getMukiByDir: function(direction){
		if(direction<0 || 3<direction) return 9;//それ以外
		return [0,2,1,3][([0,2,1,3][direction]-this.reverseMode+4)%4];
	},
	getDirByMuki: function(muki){
		return [0,2,1,3][([0,2,1,3][muki]+this.reverseMode)%4];
	},
	getReverseModeByPlayer: function(player){
		return [0,2,1,3][player];
	},
	setKomaSize: function(imgsize){
		this.imgsize.original = imgsize;
		this.calcImgSize();
		ShogitterLib.addStyleRule(".koma","width:"+(this.imgsize.normal.width)+";height:"+(this.imgsize.normal.height)+";");
	},
	setBanSize: function(bansize){
		this.size=bansize;
	},
	getMochigomaTag: function(species, direction, number){
		var muki=this.getMukiByDir(direction);
		return (function(){
			var span = document.createElement("span");
			span.className = "mochigoma";
			span.id = this.getId(direction+species);
			span.style.display="inline-block";
			
			span.appendChild((function(){
				var img = document.createElement("img");
				img.src=this.shogitter.getPath("komaDir")+"/"+muki+species+".png";
				img.className = "koma";
				ShogitterLib.data(img, "komatype", "mochigoma");
				ShogitterLib.data(img, "direction", direction);
				ShogitterLib.data(img, "species", species);
				return img;
			}.bind(this))());
			
			if(number>1){
				span.appendChild((function(){
					var span = document.createElement("span");
					span.className = "maisuu";
					span.innerHTML = ShogitterLib.getKanjiByNum(number);
					return span;
				})());
				span.appendChild((function(){
					var span = document.createElement("span");
					span.className = "submaisuu";
					if(number!=2){
						span.innerHTML = ShogitterLib.getKanjiByNum(number-1);
					}
					return span;
				})());
				span.appendChild((function(){
					var img=document.createElement('img');
					img.src=this.shogitter.getPath("komaDir")+"/"+this.getMukiByDir(parseInt(direction))+species+".png";
					img.className="subkoma";
					return img
				}.bind(this))());
			}
			return span;
		}.bind(this))()
	},
	getKomaTag: function(x, y, direction, species){	
		return (function(){
			var img = document.createElement("img");
			img.className = "koma";
			ShogitterLib.data(img, "x", x);
			ShogitterLib.data(img, "y", y);
			if(!species){
				ShogitterLib.data(img, "komatype", "banspace");
				img.src=this.shogitter.getPath("komaDir")+"/___.png";
			}else{
				ShogitterLib.data(img, "komatype", "bankoma");
				img.src=this.shogitter.getPath("komaDir")+"/"+(this.shogitter.ban.noreverse=="koma"?direction:this.getMukiByDir(direction))+species+".png";
				ShogitterLib.data(img, "species", species);
				ShogitterLib.data(img, "direction", direction);
			}
			return img;
		}.bind(this))();
	},
	setLastPhase: function(flag){
		var cl = ShogitterLib.classList(this.gid("onmenu"));
		if(flag){
			cl.add("show2");
		}else{
			cl.remove("show2");
		}
	},
	setTesuu: function(replay){
		if(this.gid('kifulist').selectedIndex!=replay){
			this.gid('kifulist').selectedIndex=replay;
		}
		this.gid("tesuu").value=replay;
	},
	setLastXY: function(id,id2){
		this.lastXY[0]=id;
		this.lastXY[1]=(id2!=""&&String(id2).substr(0, 1)!="_")?id2:null;
		this.colorLastXY();
	},
	resetLastXY: function(){
		this.lastXY=[];
	},
	showPlayerName: function(){
		for(var direction=0; direction<this.shogitter.maxplayernum; direction++){
			var dom = this.gid("mochiplate"+this.getMukiByDir(direction));
			ShogitterLib.removeChildAll(dom);
			
			dom.appendChild(document.createTextNode(this.shogitter.getTebanMark(direction)));
			
			var info = this.shogitter.getPlayerInfo(direction);
			console.log("hoge",info);
			for(var i in info.user){
				if(typeof info.user[i] == "function") continue;
				var tag;
				if(info.user[i]){
					tag = this.getPlayerTag(info.user[i]);
				}else{
					tag = this.getNullPlayerTag(info.user[i], direction, i);
				}
				if(this.shogitter.turn==i) $(tag).addClass("turn");
				dom.appendChild(tag);
			}
		}
	},
	getPlayerTag: function(user){
		var div = document.createElement("div");
	//	div.style.clear="left";
		div.appendChild((function(){
			var a = document.createElement("a");
			a.href="/u/"+user.name;
			a.appendChild((function(){
				var img = document.createElement("img");
				img.src="http://api.twitter.com/1/users/profile_image/"+user.name+"?size=mini";
				img.className = 'twittericonmini middle';
			//	img.style.height="1em";
			//	img.style.width="1em";
				return img;
			})());
			a.appendChild(document.createTextNode("@"+user.name));
			return a;
		})());
		return div;
	},
	getNullPlayerTag: function(user, direction, turn){
		var div = document.createElement("div");
		div.innerHTML = "@(入室待ち)";
		return div;
	},
	initReverseMode: function(){
		
	},
	finalizeDraw: function(){
		
	}
};

