function ShogiPlugin(shogi){
	this.shogi = shogi;
	this.dominit();
}
ShogiPlugin.prototype={
	dom: {},
	print: function(){
		this.dom.ban.textContent = this.shogi.print();
		this.dom.comment.innerHTML = this.shogi.kifu.getComment(this.shogi.tesuu) || "";
	},
	dominit: function(){
		document.body.appendChild((function(){
			var div = document.createElement("div");
			div.appendChild((function(){
				var div = document.createElement("div");
				this.dom.ban = div;
				div.style.whiteSpace = "pre";
				return div;
			}.bind(this))());
			div.appendChild((function(){
				var div = document.createElement("div");
				this.dom.buttons = div;
				[
					[true, 0, "|<"],
					[false, -10, "<<"],
					[false, -1, "<"],
					[false, 1, ">"],
					[false, 10, ">>"],
					[true, Infinity, ">|"]
				].forEach(function(elem){
					div.appendChild((function(){
						var button = document.createElement("button");
						button.textContent = elem[2];
						button.addEventListener("click", function(){
							if(elem[0]){
								this.shogi.goto(elem[1]);
							}else{
								this.shogi.goto(this.shogi.tesuu+elem[1]);
							}
							this.print();
						}.bind(this));
						return button;
					}.bind(this))());
				}.bind(this));
				return div;
			}.bind(this))());
			div.appendChild((function(){
				var textarea = document.createElement("textarea");
				this.dom.comment = textarea;
				textarea.cols="100";
				textarea.rows="20";
				return textarea;
			}.bind(this))());
			return div;
		}.bind(this))());
	},
};