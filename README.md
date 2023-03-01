# Full Stack Web App 
It combines React front-end and NodeJS back-end. 

It is a REST API that allows a user to schedule, retrieve & abort launches. It connects to a DB to store and retrieve data. Navigating through the page, all scheduled launches and historical launches can be found.

The app also consumes an external API to get information about historical launches. 

## Available Scripts

## `npm install`

After cloning the repository, run this command to install node modules and all necessary dependencies. To proceed with installation separately for client and server run `npm run install-client` or `npm run install-server` respectively. 

Please, make sure you are in the main root of the project for running following commands.

## `npm run watch`

This command will run both client and server with nodemon on the port 3000. After any changes, it will automatically recompile. Navigate to the localhost:3000 to view the app.

## `npm run deploy`

This command will create a new client build and start the server on the port 8000.

## `npm run test`

To run all tests for client and server.