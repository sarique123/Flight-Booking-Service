const express = require('express');

const { ServerConfig,QueueConfig } = require('./config');

const apiRoutes = require('./routes');

const app = express();
const CRON = require('./utils/common/cron-jobs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT,async ()=>{
    console.log(`Successfully started the server on the PORT : ${ServerConfig.PORT}`);
    CRON();
    await QueueConfig.connectQueue();
})