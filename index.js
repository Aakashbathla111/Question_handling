const express = require('express');
const app = express();
const path=require('path')

// const customMware=require('./config/middleware')
const db = require('./config/mongoose')
const bodyParser = require('body-parser');


let port = 8000;
// to tell breowser/server to use ejs as view engine

//session cookie req.flash requires session cookie  65b5585cca3069e6baac1a07

// it is use to handle middle ware here we are using express.urlenceode to use the parser
app.use(express.urlencoded());
app.use(bodyParser.json());

app.use('/',require('./routes')) 
app.listen(port,function(err){
    if(err){
        console.log(`error in running the ${port}`)
        return;
    }
    console.log(`Server is running @ ${port}`)
})