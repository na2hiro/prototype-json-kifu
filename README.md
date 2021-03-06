# JSON棋譜プロトタイプ

JSONで将棋の棋譜を表すプロジェクトのプロトタイプと用例集です．

用例集はこちら https://na2hiro.github.io/prototype-json-kifu/

## このリポジトリについて

* これは単なるプロトタイプです．[na2hiro/json-kifu-format](https://github.com/na2hiro/json-kifu-format) がこれの後継となる，やや簡略化されたバージョンです．そちらはKifu for JSなどに使用されています．
  * json-kifu-formatとの最大の違いは，多ルール対応です．
* （2011年末から作られていたようです．2021年にna2hiroが発掘しました．）

## 動機

* 形式の統一: 現在広汎に使用されている将棋の棋譜のファイル形式であるKIFファイルなどは機械可読性よりは人間可読性を重視されており，ソフトウェアによって読み取る形式，書き出す形式に微妙な差異がある場合がある．これにより同一の形式であっても棋譜が読み込めないなどの問題が起こる．JSONを採用し，仕様書をオープンにすることで，真の意味で形式を統一し，これらの問題をなくす．
* 多ルール対応: 現行形式は本将棋ルールに対応しているものばかりである．どうぶつしょうぎなど普通の将棋以外のプレイも徐々に一般化してきており，棋譜ビューアなどの普及も急務である．本形式ではルールファイルを定義し，棋譜からそれを参照することによって，本形式の棋譜を扱うビューア等のソフトウェアが，未知のルールであってもソフトウェアの変更なしに動作することが可能になる．

## 仕様

書かれたものは存在せず，今のところ実装と用例集が仕様です．
