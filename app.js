import express from 'express';
import cors from 'cors';
import http from 'http';
import createError from 'http-errors';
import dotenv from 'dotenv-safe';
import chatWhatsappRoute from './src/routes/chat-whatsapp.route.js';
import cons from 'consolidate';
import path from 'path';
import {fileURLToPath} from 'url';
dotenv.config({
    allowEmptyValues: true
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);

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

export default app