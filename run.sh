#!/bin/sh

npm install # Instala las dependencias
&& 
node server.js & # Ejecuta node server.js en segundo plano
ssh -p 443 -R 0:localhost:"4000" a.pinggy.io

wait
