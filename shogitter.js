function Shogitter(shogi, id){
	this.shogi = shogi;
	this.id = "#"+id;
}
Shogitter.prototype={
	onMoveCallback: function(){},
	kifulist: null,
	//domを作る
	init: function(show){
		var that = this;
		var shogi = this.shogi;
		$(function(){
			$(that.id).append('<table class="shogitter">\
			<tbody>\
				<tr>\
					<td>\
						<div class="inlineblock players">\
							<div class="mochi teban mochi1">\
								<div class="tebanname">☖</div>\
								<div class="mochimain"></div>\
							</div>\
							<div class="mochi">\
								<select class="kifulist" size="7"></select>\
							</div>\
						</div>\
					</td>\
					<td style="text-align:center">\
						<table class="ban">\
							<tbody>\
							</tbody>\
						</table>\
					</td>\
					<td>\
						<div class="inlineblock players">\
							<div class="mochi info">\
							</div>\
							<div class="mochi mochi0">\
								<div class="tebanname">☗</div>\
								<div class="mochimain"></div>\
							</div>\
						</div>\
					</td>\
				</tr>\
				<tr>\
					<td colspan=3 style="text-align:center">\
						<ul class="inline go" style="margin:0 auto;">\
							<li><button data-go="start">|&lt;</button></li>\
							<li><button data-go="-10">&lt;&lt;</button></li>\
							<li><button data-go="-1">&lt;</button></li>\
							<li>\
								<form action="?" style="display:inline">\
									<input type="text" name="tesuu" size="3" style="text-align:center">\
								</form>\
							</li>\
							<li><button data-go="1">&gt;</button></li>\
							<li><button data-go="10">&gt;&gt;</button></li>\
							<li><button data-go="end">&gt;|</button></li>\
						</ul>\
						<ul class="inline panel" style="margin:0 auto;">\
							<li><button class="dl" data-type="json">JSON</button></li>\
							<li><button class="dl" data-type="kif">KIF</button></li>\
						</ul>\
						<textarea style="width:100%" rows=10 class="comment"></textarea>\
					</td>\
				</tr>\
			</tbody>\
		</table>');
		
			document.body.addEventListener("drop", function(e){
				e.preventDefault();
				console.log(e)
				
                var reader = new FileReader();
                reader.onload = function(e) {
                    // 読み込んだファイルの中身をテキストエリアにセット
                    //alert(e.target.result);
                    shogi.loadKif(e.target.result)
                    shogitter.show()
                };
                
                // テキストとしてファイルを読み込む
                // reader.readAsText(file);
                // セレクトフォームで選択している関数名でファイル読み込み
                reader.readAsText(e.dataTransfer.files[0],"SJIS");
			});
		
			that.kifulist = $("select.kifulist", that.id);
			that.kifulist.change(function(){
				that.goto($(this).val());
				that.refresh();
			});
			$("ul.go", that.id).on("click", "button", function(){
				that.go($(this).attr("data-go"));
				that.refresh();
			});
			$("ul.panel", that.id).on("click", "button.dl", function(){
				var str;
				switch($(this).attr("data-type")){
					case "json":
						str=shogi.toJSON();
						break;
					case "kif":
						str=shogi.toKIF();
						break;
					default:
						throw "未対応";
				}
				$("textarea.comment", that.id).val(str);
			});
			$("ul.go form", that.id).submit(function(){
				that.goto($("input", this).val());
				that.refresh();
				return false;
			});
			if(show) that.show();
		});
	},
	//棋譜の読み込み後に吐き出す
	show: function(){
		var size = this.shogi.rule.getSize();
		var append =[{x:"prependTo", y:"appendTo"}, {x:"appendTo", y:"appendTo"}];
		
		//盤面用意
		var tbody = $("table.ban tbody", this.id);
		tbody.children().remove();
		var tr= $("<tr><th></th></tr>").appendTo(tbody);
		this.tds=[];
		for(var i=1; i<=size[0]; i++){
			this.tds.push([]);
			$("<th>"+i+"</th>")[append[0].x](tr);
		}
		for(var j=1; j<=size[1]; j++){
			var tr = $("<tr></tr>")[append[0].y](tbody);
			$("<th>"+this.shogi.getKanjiByNum(j)+"</th>").appendTo(tr);
			for(var i=1; i<=size[0]; i++){
				this.tds[i-1][j-1]=$("<td><img></td>")[append[0].x](tr);
			}
		}
		
		//棋譜用意
		var kifulist = $("select.kifulist", this.id);
		i=0;
		kifulist.children().remove();
		this.shogi.kifu.forEach(function(obj){
			$("<option value='"+i+"'>"+i+": "+(this.shogi.kifu.getReadable(i)||"初期局面")+(this.shogi.kifu.existsComment(i)?"*":"")+"</option>").appendTo(kifulist);
			i++;
		}.bind(this));
		
		
		var data = this.shogi.getData();
		var dl = $("<dl></dl>");
		for(var i in data){
			switch(i){
				case "players":
					for(var j=0; j<=1; j++){
						this.setPlayer(j, data.players[j].name);
					}
					break;
				case "結果":
					var text = (data[i]=="先手"||data[i]=="後手"?data[i]+"の"+(data["理由"]||"")+"勝ち":data[i]);
					$("select.kifulist").append("<option value='99999'>"+text+"</option>")
					dl.append($("<dt></dt>").text("結果"));
					dl.append($("<dd></dd>").text(text));
					break;
				case "date":
					if(data.date.start){
						dl.append($("<dt>開始日時</dt>"));
						var date = new Date(data.date.start);
						dl.append($("<dd></dd>").text((new DateFormat("yyyy-MM-dd HH:mm")).format(date)));
					}
					if(data.date.end){
						dl.append($("<dt>終了日時</dt>"));
						var date = new Date(data.date.end);
						dl.append($("<dd></dd>").text((new DateFormat("yyyy-MM-dd HH:mm")).format(date)));
					}
					break;
				case "tesuu":
					dl.append($("<dt></dt>").text("手数"));
					dl.append($("<dd></dd>").text(data[i]));
					break;
				case "理由":
					break;
				default:
					dl.append($("<dt></dt>").text(i));
					dl.append($("<dd></dd>").text(data[i]));
			}
		}
		var dom = $("div.info", this.id);
		dom.children().remove();
		dom.append(dl);

		
		this.refresh();
	},
	//盤面を再生した後に吐き出す
	refresh: function(){
		//盤面描画
		this.shogi.ban.forEach(this.setKoma.bind(this));
		//持ち駒描画
		for(var direction=0; direction<=1; direction++){
			this.getMochigomaDom(direction).children().remove()
			this.shogi.mochigoma.forEach(direction, function(species, value){
				this.setMochigoma(direction, species, value);
			}.bind(this));
		}
		
		//手数描画
		var tesuu = this.shogi.tesuu;
		$("ul.go form input", this.id).val(tesuu);
		try{$("select.kifulist option", this.id)[tesuu].selected="selected"}catch(e){};
		//コメント描画
		$("textarea.comment", this.id).val(this.shogi.kifu.getComment(tesuu));
	},
	setKoma: function(xy, koma){
		var dom = $("img", this.tds[xy[0]-1][xy[1]-1]);
		var src = this.getKomaImg(koma);
		if(dom.attr("src")!=src){
			dom.attr("src",src);
		}
	},
	getMochigomaDom: function(direction){
		return $("div.mochi.mochi"+direction+" div.mochimain", this.id);
	},
	setMochigoma: function(direction, species, value){
		var span = $("<span class='mochigoma'></span>");
		span.append("<img src='"+this.getKomaImg(direction, species)+"'>");
		if(value>1){
			span.append("<span class='maisuu'>"+this.shogi.getKanjiByNum(value)+"</span>");
		}
		span.appendTo(this.getMochigomaDom(direction));
		console.log(span);					
	},
	getKomaImg: function(koma, species){
		if(typeof species != "undefined"){
			koma = new Koma(koma, species);
		}
		return "rule/hirate/"+(koma.isNull()?"___":koma.direction+"-"+koma.species)+".png";
	},
	goto: function(tesuu){
		if(isNaN(tesuu)) return;
		this.shogi.goto(tesuu);
		this.onMoveCallback(this.shogi.tesuu);
	},
	go: function(tesuu){
		if(tesuu=="start"){
			this.shogi.goto(0);
		}else if(tesuu=="end"){
			this.shogi.goto(Infinity);
		}else{
			tesuu = parseInt(tesuu);
			if(isNaN(tesuu)) return;
			this.shogi.go(tesuu);
		}
		this.onMoveCallback(this.shogi.tesuu);
	},
	setPlayer: function(direction, name){
		$("div.mochi.mochi"+direction+" .tebanname", this.id).text(this.shogi.getTebanMark(direction)+name);
	},
	onMove: function(callback){
		this.onMoveCallback = callback;
	}
};