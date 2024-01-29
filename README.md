# redis-connector-nodejs
Redis connector to perform outbound integration from your Camunda 8 platform. Supports JSON data format and standard operations. See below.

## Operations supported
Standard CRUD operations - GET, PUT and DELETE.
> 
Note: Put operation supports both creating a new record as well as updating existing record.


## Redis version
Tested against below Redis instance on Google Cloud.
> 
> redis_version:7.2.0
> redis_mode:standalone
> 
> os:Linux 5.4.0-1064-gcp x86_64
> 
> gcc_version:7.5.0


## Code Quality
Quality gate checks successfully executed against Sonar Cloud. Click on link below for details.
> 
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=rchari-ml_redis-connector-nodejs)](https://sonarcloud.io/summary/new_code?id=rchari-ml_redis-connector-nodejs)

### How to run unit / integration test cases?
Open VS Code. 
Clone the repository.
Make sure you have access to Redis database.

Open terminal and run below two commands.

> npm run build
> yarn jest --coverage (or npm test)
>
> Note a: Make sure to export env variables to connect with your Redis instance.
> Note b: The dummy secret is used for negative test case (connection error simulation).
> 
> export REDIS_HOSTNAME=your-db-name-here.redislabs.com
> 
> export REDIS_PORT=11485
> 
> export REDIS_USER=user-name
> 
> export REDIS_SECRET=a-valid-pwd-for-your-env
> 
> export REDIS_SECRET_DUMMY=ask-me-for-this


# I want to practice somethig simple first. How can i do that?
If you are new to Connector SDK, then I recommend you to try the weather-api sample so you are familiar with NodeJS connector wrapper and how it essentially works.
The steps are outlined here: 
> ```
> https://github.com/camunda-community-hub/camunda-8-connector-openweather-api
> ```


# How to run redis connector using Docker?
If you haven't done yet, I recommend running Unit Test cases as outlined in the above section.
The unit testing allows you to catch any configuration errors quickly and fix them before you try your hand with end to end flow.

Now that you are ready to run the end to end flow, lets get to it.

### Pre-requisites:
```
a. Make sure you have Docker running.
b. Have a running Redis database instance with details such as hostname, port, username and password.
c. Camunda 8 environment.
d. Create a set of Client ID and Client Secret for Zeebe. These entries will then be added to the connector .env file. Step #5.1
e. Upload the redis-connector template json file to your Camunda 8 environment. The template file is here: element-templates/redis-connector.json
f. Build a simple BPMN process. Or, you can reference the file under element-templates.
g. You are all set. Lets keep going!
```


1. Clone the repository mentioned in the References section below.
   > https://github.com/camunda-community-hub/connector-sdk-nodejs
> 
2. I am assuming $base is the folder where you have cloned the repository.
>
> 
3. Lets install the connector and trace our steps to the wrapper.
> 
3.1. I have published redis-connector-nodejs as npm package. So we are going to make a reference to that.
> 
3.2. Go to the folder (_ _connectors_ _). This is where we are going to include or link the redis connector.
>   $base/connector-sdk-nodejs/connector-runtime-worker/__connectors__
> 
3.3. Open the file: package.json and make sure you have below item under dependencies. Save the changes.
>   "dependencies": { "redis-connector-nodejs": "^1.0.14" }
> 
3.4. Run the command: 
> ```
> npm install redis-connector-nodejs
> ```
> Note: If you encounter any error at this step, make sure you are able to reach the url: https://www.npmjs.com/package/redis-connector-nodejs
>
> Note: Just to make sure, you should see the connector folder under node_modules. [connector-runtime-worker]$  ls -al ./_ _connectors_ _/node_modules/
>
> 
4. Lets prepare the runtime wrapper.
> 
4.1. Go to the folder. 
> ```
> $base/connector-sdk-nodejs/connector-runtime-worker
> ```
4.2. Make sure to add below environment var names to docker-compose.yml. (Only the var names here. The values go into the .env file. See #5.1)
> ```
>    environment:
>      - LOG_LEVEL=INFO
>      - ZEEBE_ADDRESS
>      - ZEEBE_CLIENT_ID
>      - ZEEBE_CLIENT_SECRET
>      - ZEEBE_AUTHORIZATION_SERVER_URL
>      - REDIS_USER
>      - REDIS_SECRET
>      - REDIS_HOSTNAME
>      - REDIS_PORT
> ```
> 
> 4.3. Let's build the Docker image.
> ```
> Run below two commands one after other.
> npm run build
> docker build --tag sitapati/c8-connector-worker-runtime-nodejs:latest .
> ```
> 
> 4.4. Yay! At this stage, you should see the Docker image for the connector wrapper. The wrapper points to the redis connector.
>
> 5. Time to put all things together.
> 
> 5.1. Create a file .env in the folder: $base/connector-sdk-nodejs/connector-runtime-worker.
> ```
> REDIS_HOSTNAME=valid-host-name-fqdn
> REDIS_PORT=11485
> REDIS_USER=user-name
> REDIS_SECRET=db-password-here
> ZEEBE_ADDRESS=value-here
> ZEEBE_CLIENT_ID=value-here
> ZEEBE_CLIENT_SECRET=value-here
> ZEEBE_AUTHORIZATION_SERVER_URL=value-here
> ZEEBE_TOKEN_AUDIENCE='zeebe.camunda.io'
> CAMUNDA_CLUSTER_ID=value-here
> CAMUNDA_CLUSTER_REGION=value-here
> CAMUNDA_CREDENTIALS_SCOPES='Zeebe'
> CAMUNDA_OAUTH_URL='https://login.cloud.camunda.io/oauth/token'
> ```
> 
> 5.2. Make sure to not add this file to any code repository.
> 
> 5.3. Run the command to start docker container and seed the .env file.
> 
> ```
> $base/connector-sdk-nodejs/connector-runtime-worker$ docker compose --env-file .env up
> ```
> 
> 5.4. The runtime container logs show you log messages to indicate connector has been found or loaded.
> ```
> zeebe |  INFO: Authenticating client with Camunda Cloud...
> Scanning for: /opt/connectors/package.json
> Found package.json
> Loading redis-connector-nodejs from /opt/connectors/node_modules/redis-connector-nodejs
> Adding Connector:
> {
>   name: 'RedisConnectorNodeJS',
>   type: 'io.camunda:redis-connector-nodejs:1',
>   inputVariables: [ 'hostname', 'port', 'user', 'token', 'operationType', 'key', 'data' ]
> }
>
> 

# Common Issues
Zeebe configuration and Redis configuration are the most common mistakes. Make sure spelling mistakes are avoided.


# References
The redis-connector-nodejs code base is built on the SDK defined here.
> 
https://github.com/camunda-community-hub/connector-sdk-nodejs


# Contact Me
If you need any help, I am just an email away - raghu@makelabs.in
