FROM ubuntu

apt install node

npm install --global yarn 

npx create-expo-app demo # asi creamos un proyecto

yarn init

yarn start 


-------iniciando el backend


yarn add express

yarn add socket.io

yarn add mongoose

yarn add body-parser

yarn add cors 

yarn add morgan

----solo en modo desarrollo --

yarn add nodemon -D

yarn dev
--------------------------

yarn add bcryptjs

yarn add jsonwebtoken

yarn add connect-multiparty