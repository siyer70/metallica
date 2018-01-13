cd ..
cd metallica-deploy\v1
start java -jar discovery-service.jar
TIMEOUT /T 20 /NOBREAK
start java -jar gateway-service-local.jar
cd ..\..\
cd metallica
rem start node services\tradeservice\bin\run.js
start node services\tradequeryservice\bin\run.js
start node services\tradecommandservice\bin\run.js
start node services\referencedataservice\bin\run.js
start node services\notificationservice\bin\run.js
start node services\marketdataservice\bin\run.js
