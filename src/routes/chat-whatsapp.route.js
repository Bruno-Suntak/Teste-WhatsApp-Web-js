import express from 'express';
import dotenv from 'dotenv-safe';
import WppWeb from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode'
import puppeteer from 'puppeteer';
import requestIp from 'request-ip';
import { initializeClient, getInitializedClient } from '../controllers/chat-whatsapp.controller.js';
dotenv.config();

var globals = global

var router = express.Router();

router.get('/Home', async (req, res) => {
    res.render("../public/html/paginaInicial");
});

router.get("/", (req, res) => {
    res.redirect('/Home');
});

router.post('/iniciarSessao', async(req, res) => {

    try {

        let result;
        // let ip = req.ip;
        let ip = await requestIp.getClientIp(req);

        // if(global.WppClientId && global.WppClientId != ''){
        //     global.WppClientId = Number(global.WppClientId) + 1;
        // }else {
        //     global.WppClientId = req.body.id;
        // }
        
        // let clientId = global.WppClientId;

        res.status(200).json({message:"Iniciando Client"});
        
        if(globals.iniciado == true){
            result = await getInitializedClient("2");
        }else{
            result = await initializeClient(ip);
        }

        
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
    
});

export default router;