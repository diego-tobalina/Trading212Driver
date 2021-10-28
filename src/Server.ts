import Trading212Controller from "./app/Trading212Controller";
import App from './App'
import * as bodyParser from 'body-parser'
import validateToken from "./app/TokenValidatorMiddleware";

require('dotenv').config();

const app = new App({
    port: +process.env.PORT || 8080,
    controllers: [
        new Trading212Controller(),
    ],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({extended: true}),
        validateToken,
    ]
})

app.listen();
