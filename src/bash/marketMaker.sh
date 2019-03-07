rm *.log
killall -s KILL node
npm run marketMaker tokens=ETH-100C-3H server env=uat $1 &> marketMaker.all.log &