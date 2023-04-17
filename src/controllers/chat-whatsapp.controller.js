import axios from 'axios';
import pkgWhatsApp from 'whatsapp-web.js';
import Puppeteer, { Page, Browser } from "puppeteer";
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode'
import dotenv from 'dotenv-safe';
import { io } from 'socket.io-client';
import fs from 'fs';
dotenv.config({
    allowEmptyValues: true
});

const { Client, RemoteAuth, LocalAuth, MessageMedia } = pkgWhatsApp;

var globals = global;

const socket = io("http://localhost:3010");

// var clientId = 'teste'+id;
var clientId = 'client1';
var sessions = {};

export async function initializeClient(id){
    try {

        let sessionId = String(id).replace(".","").replace(".","").replace(".","").replace(":","").replace(":","");

        const client = new Client({
            authStrategy: new LocalAuth({
                clientId:clientId
            }),
        });

        console.log('iniciando client');

        client.on('qr', async(qr) => {
            // qrcode.generate(qr, {small: true});
            let qrCodeBase64 = await QRCode.toDataURL(qr);
            socket.emit('sendQr', qrCodeBase64);
        });        
        
        client.on('ready', async() => {
            console.log('Client is ready!');
            globals.iniciado = true;
            socket.emit("clientIniciado");

        });

        client.on('disconnected', () => {
            console.log('desconectado');
        })

        client.on('message', async(message) => {
            console.log(message.body);
            let getContato = await message.getContact();
            let contato = getContato.number;
            let contatoNome = getContato.name;
            let mensagem = message.body;
            let mediaType = false;
            let isMedia = false;

            if(message.hasMedia == true){
                isMedia = true;
                let mediaFile = await message.downloadMedia();
                mediaType = mediaFile?.mimetype;
                mensagem = mediaFile?.data;
            }else{
                mediaType = false;
                isMedia = false;
            }

            socket.emit("reciveMessage", mensagem, contato, contatoNome, mediaType, isMedia);
        });  

    
        client.initialize();

        socket.on("getContactChat", async function(contact){
            console.log("obtendo chat");
            // let contatos = await client.getContacts();
            let numberId = await client.getNumberId(contact);
            let numberFormatado = numberId._serialized;

            let contato = await client.getContactById(numberFormatado);
            let chat = await contato.getChat();

            // for (let index = 0; index < contatos.length; index++) {
                // const contatosArray = contatos[index];
                
                // if(contatosArray.number == contact){
                    // let contato = contatosArray.number;
                    // let contatoNome = contatosArray.name;
                    let contatoNome = contato.pushname;
                    let isMedia = false;
                    let mediaType = null;

                    // let chat = await contatos[index].getChat();

                    let messages = await chat.fetchMessages({limit: 9999});

                    for (let index = 0; index < messages.length; index++) {
                        var messagesArray = messages[index];

                        if(messagesArray.hasMedia == true){
                            isMedia = true;
                            let mediaFile = await messagesArray.downloadMedia();
                            mediaType = mediaFile?.mimetype;

                            messagesArray = mediaFile?.data;

                            socket.emit('resSearchMessage', messagesArray, contatoNome, isMedia, mediaType);

                        }else{
                            mediaType = false;
                            isMedia = false;

                            socket.emit('resSearchMessage', messagesArray, contatoNome, isMedia, mediaType);
                        }
                        
                    }


                    // break;
                // }
            // }
        })

        socket.on("sendMessage", async function (msg, contadoSelecionado) {

            console.log("enviando mensagem")

            // let contatos = await client.getContacts();
            let numberId = await client.getNumberId(contadoSelecionado);

            // if(contatos){
            //     for (let index = 0; index < contatos.length; index++) {
            //         const contatosArray = contatos[index];
    
            //         if(contatosArray.number == contadoSelecionado){
            //             let chat = await contatosArray.getChat();
            //             let chatId = chat.id;
    
            //             await chat.sendStateTyping();
    
            //             console.log("enviando mensagem")
            //             await client.sendMessage(chatId._serialized, msg);
    
            //             await chat.clearState();
            //         }
                    
            //     }
            // }else{
                // let numberId = await client.getNumberId(contadoSelecionado);
                let numberFormatado = numberId._serialized;

                let contato = await client.getContactById(numberFormatado);
                let chat = await contato.getChat();
                await chat.sendStateTyping();
    
                console.log("enviando mensagem")
                await client.sendMessage(numberFormatado, msg);

                await chat.clearState();
            // }

        })
          
    } catch (error) {
        console.log(error);
        return error;
    }
}