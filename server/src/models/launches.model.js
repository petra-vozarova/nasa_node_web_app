const axios = require('axios');

const launchesDB = require('./launches.mongo');
const planets = require('./planets.mongo');

//to make api stateless both below needs to be strored in DB externally
//stateless - all clusters to be able to handle all requests and get exactly the same behaviour, using the same state
//state is outside of the api's memory
//const launches = new Map();

//let latestFlightNumber = 100;
const DEFAULT_FLIGHT_NUMBER = 100;

//no longer needed as data comming from spaceX api
// const launch = {
//     flightNumber: 100, //flight_number
//     mission: 'Kepler Exploration X', //name
//     rocket: 'Explorer IS1', //rocket.name
//     launchDate: new Date('December 27, 2030'), //date_local
//     target: 'Kepler-442 b', //not applicable
//     customers: ['ZTM', 'NASA'], //payload.customers for each payload
//     upcoming: true, //upcomming
//     success: true, //success
// };
//saveLaunch(launch);

//launches.set(launch.flightNumber, launch);
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if (response.status !==200){
        console.log('problem downloading launch data');
        throw new error('Launch data download failed');
    }
    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcomming: launchDoc['upcomming'],
            success: launchDoc['success'],
            customers: customers,
        }
        //paginating = splitting large data into easier managable pieces - pages, that are faster load 
        //set 'page' number and 'limit' of items per page in 'options' for pginated data
        //or pagination to false to get all items
        
        console.log(`${launch.flightNumber} ${launch.mission}`);
    
        await saveLaunch(launch);
    }
}

async function loadLaunchesData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if(firstLaunch){
        console.log('launch data already loaded');
    }
    else{
        await populateLaunches();
    }
}

async function findLaunch(filter){
   return await launchesDB.findOne(filter);
}

async function getAllLaunches(skip, limit){
    //return Array.from(launches.values());
    return await launchesDB
    .find({}, {'_id': 0, '__v': 0})
    //to get data back in order (1 for ascending -1 for descending)
    .sort({flightNumber: 1})
    //how many items to be returned and how many skipped
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch){
    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    })
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if(!planet){
        //lower layer, not in the controller, so no access
        //to req and res to use to send an error
        //return undef object/null or throw error
        //new keyword necessary as we are creating new instances
        //of an error object
        throw new Error('No matching planet was found');
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        success: true,
        upcoming: true,
        customers: ['Zero To Mastery', 'NASA'],
    });

    await saveLaunch(newLaunch);
}

// function addNewLaunch(launch){
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch, {
//             flightNumber: latestFlightNumber,
//             success: true,
//             upcoming: true,
//             customer: ['Zero To Mastery', 'NASA'],
//         })
//     );
// }

async function existsLaunchId(id){
    return await findLaunch({
        flightNumber: id,
    });
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDB
    .findOne()
    .sort('-flightNumber');

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function abortLaunchId(id){
    const aborted = await launchesDB.updateOne({
        flightNumber: id
    },{
        upcoming: false,
        success: false,
    })
       return aborted.modifiedCount === 1;
    // const aborted = launches.get(id);
    // aborted.success = false;
    // aborted.upcoming = false;
    //return aborted
}

module.exports = {
    loadLaunchesData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchId,
    abortLaunchId
}