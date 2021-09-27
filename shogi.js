if (!Function.prototype.bind) {  
  Function.prototype.bind = function (oThis) {  
    if (typeof this !== "function") {  
      // closest thing possible to the ECMAScript 5 internal IsCallable function  
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");  
    }  
  
    var aArgs = Array.prototype.slice.call(arguments, 1),   
        fToBind = this,   
        fNOP = function () {},  
        fBound = function () {  
          return fToBind.apply(this instanceof fNOP  
                                 ? this  
                                 : oThis || window,  
                               aArgs.concat(Array.prototype.slice.call(arguments)));  
        };  
  
    fNOP.prototype = this.prototype;  
    fBound.prototype = new fNOP();  
  
    return fBound;  
  };  
}  

function Koma(direction, species, shogi){
	this.direction = direction;
	this.species = species;
	this.shogi = shogi;
}
Koma.prototype = {
	direction: null,
	species: null,
	shogi: null,
	isNull: function(){ return false; },
	toArray: function(){ return [this.direction, this.species]; },
	promote: function(){
		this.species = this.shogi.rule.getPromoted(this.species);
	},
	unpromote: function(){
		this.species = this.shogi.rule.getUnpromoted(this.species);
	},
	getName: function(){
		return this.shogi.rule.getKomaInfo(this.species).name;
	},
	getShortName: function(){
		return this.shogi.rule.getKomaInfo(this.species).shortname;
	},
	getInfo: function(){
		return this.shogi.rule.getKomaInfo(this.species);
	},
	reverse: function(){
		this.direction = 1 - this.direction;
		return this;
	}
};

function NullKoma(shogi){
	this.shogi = shogi;
}
NullKoma.prototype = new Koma;
NullKoma.prototype.isNull = function(){ return true; };
NullKoma.prototype.toArray = function(){ return []; };


function Kifu(shogi){
	this.shogi = shogi;
	this.arr=[{}]
}
Kifu.prototype={
	shogi: null,
	arr: [{}],
	addKifu: function(kifu){
		this.arr.push({move: kifu});
	},
	addComment: function(comment){
		if("comment" in this.arr[this.getTesuu()]){
			this.arr[this.getTesuu()].comment+="\n"+comment;
		}else{
			this.arr[this.getTesuu()].comment = comment;
		}
	},
	getFormat: function(){
		return this.arr;
	},
	getTesuu: function(){ return this.arr.length-1; },
	get: function(tesuu){
		return this.arr[tesuu].move;
	},
	getComment: function(tesuu){
		return this.arr[tesuu].comment;
	},
	existsComment: function(tesuu){
		return this.arr[tesuu].comment?true:false;
	},
	forEach: function(callback){
		this.arr.forEach(callback);
	},
	getReadable: function(tesuu){
		var kifu = this.get(tesuu);
		if(!kifu) return null;
		return this.shogi.getTebanMark(kifu.direction||0)+this.getReadableXY(kifu.to)+this.shogi.rule.getKomaInfo(kifu.koma).shortname.traditional+(kifu.nari?"成":"");
	},
	getReadableXY: function(arr){
		return arr[0]+this.shogi.getKanjiByNum(arr[1]);
	}
};

function Mochigoma(arr, shogi){
	this.load(arr);
	this.shogi = shogi;
}
Mochigoma.prototype={
	shogi: null,
	load: function(arr){
		var ret = [];
		for(var i=0; i<arr.length; i++){
			ret[i]={};
			for(var j in arr[i]){
				ret[i][j]=arr[i][j];
			}
		}
		this.arr = ret;
	},
	get: function(player, species){
		if(!(species in this.arr[player])){
			var komaInfo = this.shogi.rule.getKomaInfo(species);
			throw (!komaInfo?komaInfo:komaInfo.name.traditional)+"は持っていません";
		}
		this.arr[player][species]--;
		if(this.arr[player][species]==0) delete this.arr[player][species];
		return this.shogi.createKoma([player, species]);
	},
	set: function(koma){
		if(!(koma.species in this.arr[koma.direction])) this.arr[koma.direction][koma.species]=0;
		this.arr[koma.direction][koma.species]++;
	},
	getArr: function(){return this.arr},
	forEach: function(direction, callback){
		for(var i in this.arr[direction]){
			callback(i, this.arr[direction][i]);
		}
	}
};

function ShogiRule(ruleObject){
	this.obj = ruleObject;
}
ShogiRule.prototype = {
	obj: null,
	getSize: function(){ return this.obj.size; },
	getKomaInfo: function(komaid){ return this.obj.koma[komaid]; },
	getPlayerNumber: function(){ return this.obj.teban.length; },
	getPromoted: function(komaid){
		if(!(komaid in this.obj.nari)) throw this.getKomaInfo(komaid).name.traditional+"は成れません";
		return this.obj.nari[komaid];
	},
	getUnpromoted: function(komaid){
		for(var nama in this.obj.nari){
			if(this.obj.nari[nama] == komaid) return nama;
		}
		throw this.getKomaInfo(komaid).name.traditional+"を表に返せません";
	},
	getReversed: function(komaid){
		try{
			return this.getPromoted(komaid);
		}catch(e){
			try{
				return this.getUnpromoted(komaid);
			}catch(e){
				throw this.getKomaInfo(komaid).name.traditional+"を裏返せません";
			}
		}
	},
	findKoma: function(name){
		for(var species in this.obj.koma){
			if(this.obj.koma[species].shortname.traditional==name) return parseInt(species);
		}
		throw "不明な名前'"+name+"'";
	},
	getTebanByTesuu: function(tesuu){
		return this.obj.teban[tesuu%this.obj.teban.length];
	},
	getRule: function(){
		return this.obj ? this.obj.filename : null;
	}
};

function Ban(arr, shogi){
	this.load(arr);
	this.shogi = shogi;
}
Ban.prototype={
	shogi: null,
	arr: [],
	load: function(arr){
		ret = [];
		for(var i=0; i<arr.length; i++){
			ret[i]=[];
			for(var j=0; j<arr[i].length; j++){
				ret[i].push(arr[i][j]);
			}
		}
		this.arr = ret;
	},
	get: function(x, y){
		if(!y){
			y = x[1];
			x = x[0];
		}
		return this.shogi.createKoma(this.arr[x-1][y-1]);
	},
	set: function(x, y, koma){
		if(!y){
			y = x[1];
			x = x[0];
		}else if(!koma){
			koma = y;
			y = x[1];
			x = x[0];
		}
		var setArr = null;
		if(koma instanceof Koma){
			setArr = koma.toArray();
		}else{
			setArr = koma;
		}
		this.arr[x-1][y-1] = setArr;
	},
	forEach: function(callback){
		var imax = this.arr.length, jmax = this.arr[0].length;
		for(var i=1; i<=imax; i++){
			for(var j=1; j<=jmax; j++){
				callback([i,j], this.get(i, j));
			}
		}
	},
	pick: function(x, y){
		var koma = this.get(x, y);
		this.remove(x, y);
		return koma;
	},
	remove: function(x, y){
		this.set(x, y, []);
	}
};

function Shogi(){
	
}
Shogi.prototype={
	rule: null,
	ban: null,
	mochigoma: null,
	kifu: null,
	teban: null,
	data: {},
	tesuu: 0,
	initialize: function(ruleObject){
		if(ruleObject){
			this.ruleObject = ruleObject;
		}
		console.log("init")
		this.rule = new ShogiRule(this.ruleObject);
		this.ban = new Ban(this.ruleObject.initial.ban, this);
		this.mochigoma = new Mochigoma(this.ruleObject.initial.mochigoma, this);
		this.kifu = new Kifu(this);
		this.teban = this.ruleObject.teban[0];
		this.tesuu = 0;
		this.data = {};
	},
	rotateTeban: function(){
		this.teban++;
		this.teban%=this.rule.getPlayerNumber();
		this.tesuu++;
	},
	createKoma: function(arr){
		if(arr.length == 0){
			return new NullKoma(this);
		}else{
			return new Koma(arr[0], arr[1], this);
		}
	},
	addData: function(name, val){
		var names = name.split(".");
		var now = this.data;
		for(var i=0; i<names.length-1; i++){
			if(!(names[i] in now)){
				if(isNaN(names[i+1])){
					now[names[i]]={};
				}else{
					now[names[i]]=[];
				}
			}
			now = now[names[i]];
		}
		now[names[names.length-1]]=val;
	},
	getData: function(){
		return this.data;
	},
	move: function(obj){
		var fromKoma, pick=null;
		var toKoma = this.ban.pick(obj.to);
		if("from" in obj){
			//移動
			fromKoma = this.ban.pick(obj.from);
			var fromSpecies = fromKoma.species;
			if(fromKoma.isNull()) throw "元の座標に駒が存在しません";
			if(fromKoma.direction != this.teban) throw JSON.stringify(obj)+": "+this.getTebanName(this.teban)+"が"+this.getTebanName(fromKoma.direction)+"の駒を動かす事は出来ません";
			if(!toKoma.isNull()){
				if(toKoma.direction == fromKoma.direction) throw "味方の駒を取る事は出来ません";
				pick = toKoma.species;
				try{ toKoma.unpromote(); }catch(e){}
				this.mochigoma.set(toKoma.reverse());
			}
			var nariflag = false;
			if(obj.nari){
				try{
					fromKoma.promote();
					nariflag = true;
				}catch(e){}
			}
			this.ban.set(obj.to, fromKoma);
			var kifu = {from: obj.from, to: obj.to, koma: fromSpecies};
			var last = this.kifu.get(this.kifu.getTesuu());
			if(last && "to" in last && last.to[0]==kifu.to[0] && last.to[1]==kifu.to[1]) kifu.same=true;
			if(pick!=null) kifu.pick=pick;
			if(nariflag) kifu.nari=true;
			kifu.direction=this.teban;
			this.kifu.addKifu(kifu);
		}else{
			//駒打ち
			if(!toKoma.isNull()) throw "打つ場所には駒が存在します";
			fromKoma = this.mochigoma.get(this.teban, obj.koma);
			this.ban.set(obj.to, fromKoma);
			this.kifu.addKifu({koma: obj.koma, to: obj.to, direction:this.teban});
		}
		this.rotateTeban();
	},
	getTebanMark: function(player){
		return ["☗", "☖"][player];
	},
	getTebanName: function(player){
		return ["先手", "後手"][player];
	},
	getFormat: function(){
		var obj = {};
		obj.rule = this.rule.getRule();
		obj.info = this.data;
		obj.kifu = this.kifu.getFormat();
		return obj;
	},
	load: function(text, format){
		switch(format.toLowerCase()){
			case "kif":
				this.loadKif(text);
				break;
			case "json":
				this.loadJson(text);
				break;
			case "obj":
				this.loadObj(text);
				break;
			default:
				throw format+"フォーマットには対応していません";
		}
	},
	loadJson: function(text){
		var obj;
		try{
			obj = JSON.parse(text);
		}catch(e){
			throw "不正なJSONです"+e;
		}
		this.loadObj(obj);
	},
	loadObj: function(obj, noLoadRule){
		if((!this.rule || obj.rule != this.rule.getRule()) && !noLoadRule)this.openRuleFile(obj.rule);
		this.data = obj.info||obj.header;
		this.kifu.arr = obj.kifu;
	},
	loadKif: function(text){
		this.initialize()
		text.replace(/\r\n/, "\n");
		var arr = text.split("\n");
		var lastTo=null;
		for(var i=0; i<arr.length; i++){
			console.log(arr[i]);
			if(arr[i].substr(0, 1)=="*"){
				this.kifu.addComment(arr[i].substr(1));
				continue;
			}
			var datum = arr[i].split("：");
			if(datum.length==2){
				//データ
				switch(datum[0]){
					case "開始日時":
						this.addData("date.start", (new Date(datum[1])).toISOString());
						break;
					case "終了日時":
						this.addData("date.end", (new Date(datum[1])).toISOString());
						break;
					case "先手":
					case "下手":
						this.addData("players.0.name", datum[1]);
						break;
					case "後手":
					case "上手":
						this.addData("players.1.name", datum[1]);
						break;
					default: 
						this.addData(datum[0], datum[1]);
				}
				continue;
			}
			var res = arr[i].match(/(([１２３４５６７８９123456789])([一二三四五六七八九])|同\s*)(成?.)(成)?(打|\((\d)(\d)\))/);
			if(res){
				var kifu, to;
				if(!res[2]){
					//同の場合
					to = lastTo;
				}else{
					to = lastTo = [this.parseInt(res[2]), this.parseInt(res[3])];
				}
				if(res[7]){
					kifu = {
						from: [this.parseInt(res[7]), this.parseInt(res[8])],
						to: to,
						nari: res[5]?true:false
					};
				}else{
					//持ち駒
					kifu = {
						to: [this.parseInt(res[2]), this.parseInt(res[3])],
						koma: parseInt(this.rule.findKoma(res[4]))
					};
				}
				this.move(kifu);
				continue;
			}
			if(arr[i].indexOf("投了")>=0){
				console.log("投了");
				this.addData("結果", this.getTebanName(this.teban));
				continue;
			}
			if(arr[i].indexOf("勝ち")>=0){
				console.log("勝ち");
				this.addData("結果", this.getTebanName(this.teban));
				continue;
			}
			console.log("uncaught line", arr[i]);
		}
	},
	parseInt: function(num){
		var result;
		result = parseInt(num);
		if(!isNaN(result)) return result;
		
		var result = "１２３４５６７８９".indexOf(num);
		if(result>=0) return result+1;
		
		var result = "一二三四五六七八九".indexOf(num);
		if(result>=0) return result+1;
		throw "不明な数字:'"+num+"'";
	},
	forward: function(){
		var kifu = this.kifu.get(this.tesuu+1);
//		try{
			if("from" in kifu){
				//移動した
				
				if(kifu.pick!=null){
					//駒をとった
					var koma = this.ban.pick(kifu.to);
					try{ koma.unpromote(); }catch(e){}
					this.mochigoma.set(koma.reverse());
				}
				var fromKoma = this.ban.pick(kifu.from);
				if(kifu.nari){
					fromKoma.promote();
				}
				this.ban.set(kifu.to, fromKoma);
			}else{
				//駒を打った
				var koma = this.mochigoma.get(this.rule.getTebanByTesuu(this.tesuu), kifu.koma);
				var toKoma = this.ban.set(kifu.to, koma);
			}
			this.tesuu++;
//		}catch(e){}
	},
	backward: function(){
		var kifu = this.kifu.get(this.tesuu);
		try{
			if("from" in kifu){
				//移動した
				var toKoma = this.ban.pick(kifu.to);
				if(kifu.nari){
					toKoma.unpromote();
				}
				this.ban.set(kifu.from, toKoma);
				if(kifu.pick!=null){
					//駒をとった
					var nama;
					try{
						nama = this.rule.getUnpromoted(kifu.pick);
					}catch(e){
						nama = kifu.pick;
					}
					var koma = this.mochigoma.get(toKoma.direction, nama);
					koma.species = kifu.pick;
					this.ban.set(kifu.to, koma.reverse());
				}
			}else{
				//駒を打った
				var toKoma = this.ban.pick(kifu.to);
				this.mochigoma.set(toKoma);
			}
			this.tesuu--;
		}catch(e){
			throw "棋譜不整合エラー: "+e;
		}
	},
	goto: function(tesuu){
		this.go(tesuu - this.tesuu);
	},
	go: function(tesuu){
		if(tesuu<0){
			this.goBackward(-tesuu);
		}else{
			this.goForward(tesuu);
		}
	},
	goForward: function(tesuu){
		var maxTesuu = this.kifu.getTesuu();
		for(var i=0; i<tesuu; i++){
			if(this.tesuu == maxTesuu) break;
			this.forward();
		}
	},
	goBackward: function(tesuu){
		for(var i=0; i<tesuu; i++){
			if(this.tesuu==0) break;
			this.backward();
		}
	},
	letsHTTP: function()	//Let's HTTP!!
	{
		var http = null;
		try{
			http = new XMLHttpRequest();
		}catch(e){
			try{
				http = new ActiveXObject("Msxml2.XMLHTTP");
			}catch(e){
				try{
					http = new ActiveXObject("Microsoft.XMLHTTP");
				}catch(e){
					return null;
				}
			}
		}
		return http;
	},
	get: function(url, func){
		var getr=func;

		var http = this.letsHTTP();
		if(!http)return;

		http.onload = function(){
			func(this.responseText);
		};
		http.open("GET", url, false);
		http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		http.send();
	},
	openKifuFile: function(url){
		this.get(url, function(text){
			var token = url.split(".");
			try{
				this.load(text, token[token.length-1]);
			}catch(e){
				throw "棋譜読み込みに失敗しました";
			}
		}.bind(this));
	},
	openRuleFile: function(filename){
		this.get("./rule/"+filename, function(text){
			try{
				this.initialize(JSON.parse(text));
			}catch(e){
				throw "ルール"+filename+"読み込みに失敗しました"+e;
			}
		}.bind(this));
	},
	//漢数字へ変換
	getKanjiByNum: function(val){
		var kanji_str = ":一二三四五六七八九".match(/./g);
		var keta_str  = ":十百千".match(/./g);

		var keta_str2 = ":万億兆京".match(/./g);
		var i,j;
		if (val==0) return "零";
		val = val+"";
		val = val.match(/./g).reverse().join("");
		val = val.replace(/(\d{4})/g,"$1,").replace(/\,$/,"").split(",");
		for (i=0;i<val.length;i++){
			var str = "";
			for (j=val[i].length-1;0<=j;j--){
				str += kanji_str[val[i].charAt(j)] + keta_str[j];
			}
			str = str.replace(/:./g,"")+keta_str2[i];
			if (str.length==1) str="";
			val[i] = str.replace(/:/g,"");
			val[i] = val[i].replace(/一(百)|一(十)/g,"$1$2");
		}
		val = val.reverse().join("");
		return val;
	},
	toKIF: function(){
		var ret=[];
		for(var i in this.data){
			if(i=="players"){
				ret.push("先手："+this.data.players[0].name);
				ret.push("後手："+this.data.players[1].name);
			}else if(i=="date"){
				if(this.data.date.start){
					try{ ret.push("開始日時："+this.printDate(new Date(this.data.date.start))); }catch(e){}
				}
				if(this.data.date.end){
					try{ ret.push("終了日時："+this.printDate(new Date(this.data.date.end))); }catch(e){}
				}
			}else{
				if(typeof this.data[i] != "string") continue;
				ret.push(i+"："+this.data[i]);
			}
		}
		ret.push("手数----指手---------消費時間--");
		var tesuu=0;
		this.kifu.forEach(function(kifu){
			if(kifu.move){
				var sashite=this.ume(tesuu.toString(), " ",4)+" "
					+this.printXY(kifu.move.to)
					+this.rule.getKomaInfo(kifu.move.koma).shortname.traditional
					+(kifu.move.nari?"成":"")
					+(kifu.move.from?"("+kifu.move.from.join("")+")":"打");
				ret.push(sashite);
			}
			if(kifu.comment){
				ret.push("*"+kifu.comment.split("\n").join("\n*"));
			}
			tesuu++;
		}.bind(this));
		switch(this.data["結果"]){
			case "先手":
			case "後手":
				ret.push(this.ume(tesuu.toString(), " ",4)+" "+(this.data["理由"]||"投了"));
				ret.push("まで"+(tesuu-1)+"手で"+this.data["結果"]+"の勝ち");
				break;
			default:
				ret.push(this.ume(tesuu.toString(), " ",4)+" "+this.data["結果"]);
		}
		return ret.join("\r\n");
	},
	toJSON: function(){
		var obj = {
			header: this.data,
			kifu: this.kifu.arr,
			rule: this.rule.obj.filename
		};
		return JSON.stringify(obj);
	},
	printXY: function(arr){
		return "１２３４５６７８９"[arr[0]-1]+"一二三四五六七八九"[arr[1]-1]
	},
	printDate: function(date){
		return (date.getYear()+1900)+"/"+(date.getMonth()+1)+"/"+date.getDate()+" "
			+date.getHours()+":"+date.getMinutes();
	},
	ume: function(str, char, length){
		var ret="";
		for(var i=0, l=length-str.length; i<l; i++){
			ret+=char;
		}
		return ret+str;
	}
};

function PrintableShogi(){
	Shogi.apply(this, arguments);
}
PrintableShogi.prototype = new Shogi({});
PrintableShogi.prototype.print = function(){
	var ret = "";
	for(var y=1, l=this.rule.getSize()[1]; y<=l; y++){
		for(var x=this.rule.getSize()[0]; x>0; x--){
			var koma = this.ban.get(x, y);
			if(koma.isNull()){
				ret+="　　|";
			}else{
				ret+=this.getTebanMark(koma.direction)+koma.getShortName().traditional+"|";
			}
		}
		ret+=y+"\n";
	}
	var mochigoma = this.mochigoma.getArr();
	for(var i=0, l=this.rule.getPlayerNumber(); i<l; i++){
		ret+=this.getTebanName(i)+": ";
		for(var species in mochigoma[i]){
			ret+=this.rule.getKomaInfo(species).shortname.traditional+mochigoma[i][species];
		}
		ret+="\n";
	}
	return ret;
};

if(typeof module != "undefined"){
	module.export = Shogi;
}