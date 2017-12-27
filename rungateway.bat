@echo off

REM set API_GATEWAY_URL=http://dlusshek273879.sapient.com:8765
REM set TRADE_QUERY_SERVICE_BASE_URL=/services/tradeservice
REM set TRADE_QUERY_SERVICE_PREFIX=/trades
REM set TRADE_COMMAND_SERVICE_BASE_URL=/services/tradeservice
REM set TRADE_COMMAND_SERVICE_PREFIX=/trades

node services\gatewayservice\bin\run.js
