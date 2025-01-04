const express = require('express');

const { ServerConfig } = require('./config');

const apiRoutes = require('./routes');

const app = express();
const CRON = require('./utils/common/cron-jobs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT,()=>{
    console.log(`Successfully started the server on the PORT : ${ServerConfig.PORT}`);
    CRON();
})