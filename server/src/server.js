const http = require('http');

//dotenv required at the top because, envirovnment needs to be populated 
//in all of the modules before we import them
require('dotenv').config();

const {mongoConnect} = require('./services/mongo');
const app = require('./app');
const {loadPlanetsData} = require('./models/planets.model');
const{loadLaunchesData} = require('./models/launches.model');
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);


// mongoooset.set('strictQuery', true);

async function startServer(){
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, () =>{
        console.log(`Listening on the port ${PORT}`);
    })
}
startServer();


