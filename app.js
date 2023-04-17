import express from 'express';
import cors from 'cors';
import http from 'http';
import createError from 'http-errors';
import dotenv from 'dotenv-safe';
import chatWhatsappRoute from './src/routes/chat-whatsapp.route.js';
import cons from 'consolidate';
import path from 'path';
import {fileURLToPath} from 'url';
import { Server } from 'socket.io';
import pkgWhatsApp from 'whatsapp-web.js';
import lodash from 'lodash';
dotenv.config({
    allowEmptyValues: true
});

const { Client, RemoteAuth, LocalAuth } = pkgWhatsApp;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}));

//ROUTES
app.use('/', chatWhatsappRoute);

//

app.get('/erro500', (req, res) => {
    throw new Error('Erro 500 do express!');
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

let port = process.env.PORT || 3010;
server.listen(port);
server.on('listening', onListening);

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    console.log(`Server escutando em ${bind}...`);
}

var sockets = {};

io.on("connection", function (socket) {

    socket.emit("hello", "world");

    socket.on("join", function(name){
    	console.log("Joined: " + name);
        sockets[socket.id] = name;
        socket.emit("update", "You have connected to the server.");
        socket.broadcast.emit("update", name + " has joined the server.")
    });

    socket.on("reqSendMessage", function(msg, contadoSelecionado){
        socket.broadcast.emit("sendMessage", msg, contadoSelecionado);
    });

    socket.on("reciveMessage", function(msg, contato, contatoNome, mediaType, isMedia){
        socket.broadcast.emit("recivedMessage", msg, contato, contatoNome, mediaType, isMedia);
    });

    socket.on("reqContact", function(contact){
        socket.broadcast.emit("getContactChat", contact);
    });

    socket.on("resContact", function(contact, chat){
        socket.broadcast.emit("reciveContact", contact);
    });

    socket.on("resSearchMessage", function(chat, contatoNome, isMedia, mediaType){
        socket.broadcast.emit("searchMessage", chat, contatoNome, isMedia, mediaType);
    });

    socket.on('sendQr', function(qr){
        socket.broadcast.emit("resQr", qr);
    });

    socket.on('clientIniciado', function(){
        socket.broadcast.emit("resClientIniciado");
    });

    socket.on("disconnect", function(){
    	console.log("Disconnect");
        io.emit("update", sockets[socket.id] + " has left the server.");
        delete sockets[socket.id];
    });
});

export default app