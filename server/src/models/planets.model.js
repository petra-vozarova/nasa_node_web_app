 const fs = require('fs');
const path = require('path');
const { parse } = require("csv-parse");

const planets = require('./planets.mongo');

const results = [];

//const habitablePlanets = [];

function isHabitablePlanet(planet){
    return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData(){
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '../../','data', 'kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true,
        }))
        .on('data', async (data)=>{
            if (isHabitablePlanet(data)) {
                //habitablePlanets.push(data);
                //TODO: replace below with upsert
                //insert + update = upsert (insert only if it doesnt exist yet)
                //to avoid creating the same data whenever page loads
                // await planets.create({
                //     keplerName: data.kepler_name,
                // });
                savePlanet(data);
            }
            //results.push(data);
        })
        .on('error', (err)=>{
            console.log(err);
            reject(err)
        })
        .on('end', async ()=>{
            //console.log(`${habitablePlanets.length} habitable planets found.`);
            const countPlanetsFound = (await getAllPlanets()).length;
            console.log(`${countPlanetsFound} habitable planets found.`);
            resolve();
        });
    })
}

async function getAllPlanets(){
    // planets.find({},{'keplerName': 1})
    // first object defined whether all or only specific items should be returned
    // empty {} for all
    // second defines what attributes should be included,
    // 1 for included 0 for omitter
    return await planets.find({},{
        //which properties to exclude
        '_id' : 0,
        '__v': 0,
    });
}

async function savePlanet(planet){
    try{
            await planets.updateOne({
            keplerName: planet.kepler_name,
        }, {
            keplerName: planet.kepler_name,
        },{
            upsert: true,
        });
    }catch(err){
        console.error(`Could not save a planet ${err}`);
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
}
