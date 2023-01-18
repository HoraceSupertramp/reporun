#!/usr/bin/env node
import Config from './config';
import express from 'express';
import path from 'path';
import api from './api';
import dotenv from 'dotenv';
import history from 'connect-history-api-fallback';
import { createSocket } from './lib/socket';

dotenv.config();
const app = express();
const config = Config.get();
const socket = createSocket(config);
app.set('config', config);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', api);
app.use(history());
app.use(express.static(path.resolve(__dirname, '..', 'dist', 'public')));
const server = app.listen(8883, () => {
    console.log('Listening on http://localhost:8883');
});
server.on('upgrade', (request, channel, head) => {
    socket.handleUpgrade(request, channel, head, channel => {
        socket.emit('connection', channel, request);
    });
});
