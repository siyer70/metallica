cd ..
cd metallica-deploy\v2
start java -jar discovery-service.jar
TIMEOUT /T 20 /NOBREAK
start java -jar gateway-service-local.jar
cd ..\..\
cd metallica
