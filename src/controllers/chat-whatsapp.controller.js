import axios from 'axios';
import pkgWhatsApp from 'whatsapp-web.js';
import Puppeteer, { Page, Browser } from "puppeteer";
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode'
import dotenv from 'dotenv-safe';
import { MongoStore } from 'wwebjs-mongo';
import mongoose from 'mongoose';
import fsDefault from 'fs';
import fs from 'fs-extra';
import { promises as fsPromises } from 'fs';
import archiver from 'archiver';
import unzipper from 'unzipper';
import path from 'path';
import ip from 'ip';
dotenv.config();

const { Client, RemoteAuth, LocalAuth } = pkgWhatsApp;

var globals = global;

// var clientId = 'teste'+id;
var clientId = 'client1';
var dataPath = './.wwebjs_auth/';
var tempDir = `${dataPath}/wwebjs_temp_session`;
var sessionName = clientId ? `RemoteAuth-${clientId}` : 'RemoteAuth';
const dirPath = path.join(dataPath, sessionName);
var userDataDir = dirPath;
var requiredDirs = ['Default', 'IndexedDB', 'Local Storage'];
var sessions = {};

// let store
// mongoose.connect(process.env.MONGODB_URI).then( () => {
//     console.log('Conectado no Banco de Dados!');
//     store = new MongoStore({ mongoose: mongoose });
// });


export async function initializeClientDisabled(ip){
    try {

        // let id = await ipify({useIPv6: false});
        // let id = await ip.address();
        let id = ip;
        let qrCode;
        let generateQR;
        let clientId = String(id).replace(".","").replace(".","").replace(".","").replace(":","").replace(":","");

        const client = new WppWeb.Client({
            authStrategy: new WppWeb.LocalAuth({
                clientId:clientId
            }),
            puppeteer: {
                headless: false,
                defaultViewport: null,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--start-maximized',
                    '--no-default-browser-check',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                    '--disable-extensions',
                ],
            },
            userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36',
            bypassCSP:true
        });

        console.log('iniciando client');
        
        client.on('ready', () => {
            console.log('Client is ready!');
        });

        await client.initialize();
          
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function initializeClient(id){
    try {

        let sessionId = String(id).replace(".","").replace(".","").replace(".","").replace(":","").replace(":","");

        sessions[sessionId] = new Client({
            authStrategy: new LocalAuth({
                clientId:clientId
            }),
            puppeteer: {
                headless: false,
            },
        });

        console.log('iniciando client');
        
        sessions[sessionId].on('ready', () => {
            console.log('Client is ready!');
            globals.iniciado = true;
        });

        sessions[sessionId].on('remote_session_saved', () => {
            console.log("Sessão salva no banco de dados!");
        })

        sessions[sessionId].on('disconnected', () => {
            console.log('desconectado');
        })
    
        sessions[sessionId].initialize();
          
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function getInitializedClient(id){

    try {

        let sessionId = String(id).replace(".","").replace(".","").replace(".","").replace(":","").replace(":","");

        sessions[sessionId] = new Client({
            authStrategy: new LocalAuth({
                clientId:clientId,
            }),
            puppeteer: {
                headless: false,
            },
        });

        console.log('Buscando client');


    } catch (error) {
        console.log(error);
        return error;
    }

}

async function storeRemoteSession(store) {
    /* Compress & Store Session */
    const pathExists = await isValidPath(userDataDir);
    if (pathExists) {
        await compressSession();
        await store.save({session: sessionName});
        await fs.promises.unlink(`${sessionName}.zip`);
        await fs.promises.rm(`${tempDir}`, {
            recursive: true,
            force: true
        }).catch(() => {});
    }
}

async function compressSession() {
    const archive = archiver('zip');
    const stream = fs.createWriteStream(`${sessionName}.zip`);

    await fs.copy(userDataDir, tempDir).catch(() => {});
    await deleteMetadata();
    return new Promise((resolve, reject) => {
        archive
            .directory(tempDir, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

async function unCompressSession(compressedSessionPath) {
    var stream = fs.createReadStream(compressedSessionPath);
    await new Promise((resolve, reject) => {
        stream.pipe(unzipper.Extract({
            path: userDataDir
        }))
            .on('error', err => reject(err))
            .on('finish', () => resolve());
    });
    await fs.promises.unlink(compressedSessionPath);
}

async function extractRemoteSession(store) {
    const pathExists = await isValidPath(userDataDir);
    const compressedSessionPath = `${sessionName}.zip`;
    const sessionExists = await store.sessionExists({session: sessionName});
    if (pathExists) {
        await fs.promises.rm(userDataDir, {
            recursive: true,
            force: true
        }).catch(() => {});
    }
    if (sessionExists) {
        await store.extract({session: sessionName, path: compressedSessionPath});
        await unCompressSession(compressedSessionPath);
    } else {
        fs.mkdirSync(userDataDir, { recursive: true });
    }
}

async function deleteMetadata() {
    const sessionDirs = [tempDir, path.join(tempDir, 'Default')];
    for (const dir of sessionDirs) {
        const sessionFiles = await fs.promises.readdir(dir);
        for (const element of sessionFiles) {
            if (!requiredDirs.includes(element)) {
                const dirElement = path.join(dir, element);
                const stats = await fs.promises.lstat(dirElement);

                if (stats.isDirectory()) {
                    await fs.promises.rm(dirElement, {
                        recursive: true,
                        force: true
                    }).catch(() => {});
                } else {
                    await fs.promises.unlink(dirElement).catch(() => {});
                }
            }
        }
    }
}

async function isValidPath(path) {
    try {
        await fs.promises.access(path);
        return true;
    } catch {
        return false;
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}