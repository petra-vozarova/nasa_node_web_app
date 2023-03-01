const request = require('supertest');
const app = require('../../app');
const { loadLaunchesData } = require('../../models/launches.model');
const {loadPlanetsData} = require('../../models/planets.model');
const {
    mongoConnect,
    mongoDisconnect,
} = require('../../services/mongo');

describe('Launches API', () => {
    beforeAll(async() => {
        await mongoConnect();
        await loadPlanetsData();
    });
    afterAll(async() => {
        await mongoDisconnect();
    })

    describe('Test GET launches', () =>{
        test('it should respond with 200 success', async () => {
            const response = await request(app)
            .get('/v1/launches')
            .expect(200)
            .expect('Content-Type', /json/);
            //expect(response.statusCode).toBe(200);
        });
    });
    
    describe('Test POST launch', () => {
        const completeData = {
            mission: 'Uss Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b',
            launchDate: 'January 4, 2028'
        };
        const dataWithouDate = {
            mission: 'Uss Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b',
        };
        const dataWithoInvalidDate = {
            mission: 'Uss Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-442 b',
            launchDate: 'no date'
        };
    
        test('it should respond with 201', async () => {
        const response = await request(app)
        .post('/v1/launches')
        .send(completeData)
        .expect(201)
        .expect('Content-Type', /json/);
    
        const requestDate = new Date(completeData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
        expect(responseDate).toBe(requestDate);
    
        expect(response.body).toMatchObject(dataWithouDate);
        });
    
        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(dataWithouDate)
                .expect(400)
                .expect('Content-Type', /json/);
    
                expect(response.body).toStrictEqual({
                    error: "Some required mission property are missing"
                })
        });
    
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(dataWithoInvalidDate)
                .expect(400)
                .expect('Content-Type', /json/);
    
                expect(response.body).toStrictEqual({
                    error: "Invalid launch date",
                })
        });
    });
})
