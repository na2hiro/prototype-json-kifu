<?php 
	echo "array(\n";
	for($j=0; $j<2; $j++){
		echo "\tarray(\n";
		for($i=0; $i<14; $i++){
			echo "\t\tarray(\n";
			for($x=0; $x<9; $x++){
				echo "\t\t\tarray(";
				for($y=0; $y<9; $y++){
					echo "0x".dechex(((rand(0x0000, 0xffff)<<16 | rand(0x0000, 0xffff))<<16|rand(0x0000, 0xffff))<<16|rand(0x0000, 0xffff)), ",";
				}
				echo "),\n";
			}
			echo "\t\t),\n";
		}
		echo "\t),\n";
	}
	echo ")\n";