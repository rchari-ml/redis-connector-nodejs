# redis-connector-nodejs
Redis connector to perform outbound integration from your Camunda 8 platform. Supports JSON data format and standard operations. See below.

## Operations supported
Standard CRUD operations - GET, PUT and DELETE.
> 
Note: Put operation supports both creating a new record as well as updating existing record.


## Redis version
Connector operations are tested against below Redis instance running on Google Cloud.
> 
> redis_version:7.2.0
>
> redis_mode:standalone
> 
> os:Linux 5.4.0-1064-gcp x86_64
> 
> gcc_version:7.5.0


## Code Quality
Quality gate checks successfully executed leveraging Sonar Cloud. 
> 
Click on <code>link</code> below to see detailed report.
> 
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=rchari-ml_redis-connector-nodejs)](https://sonarcloud.io/summary/new_code?id=rchari-ml_redis-connector-nodejs)

## How to run unit / integration test cases?
Open VS Code. 
Clone the repository.
Make sure you have access to Redis database.

Open terminal and run below two commands.
> 
> npm run build
> yarn jest --coverage (or npm test)
>
> Note a: Make sure to export env variables to connect with your Redis instance.
>
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
> 
> Note b: The dummy secret <code>REDIS_SECRET_DUMMY</code> is used for running negative test case (connection error simulation).
> 

## I want to practice somethig simple first. How can I do that?
If you are new to Connector SDK, then I recommend you to try the weather-api sample so you are familiar with NodeJS connector wrapper, configuration points and how the nuts & bolts essentially work.
> 
The steps are outlined here: 
> ```
> https://github.com/camunda-community-hub/camunda-8-connector-openweather-api
> ```


## How to run redis connector using Docker?
If you haven't done yet, I recommend running Unit Test cases as outlined in the above section.
The unit testing allows you to catch any configuration errors quickly and fix them before you try your hand with end to end flow.

Now that you are ready to run the end to end flow, lets get to it.

#### Pre-requisites:
```
a. Make sure you have Docker running.
b. Have a running Redis database instance with details such as hostname, port, username and password.
c. Camunda 8 environment.
d. Create a set of Client ID and Client Secret for Zeebe. These entries will then be added to the connector .env file. Step #5.1
e. Upload the redis-connector template json file to your Camunda 8 environment. The template file is here: element-templates/redis-connector.json
f. Build a simple BPMN process. Or, you can reference the file under element-templates.
g. You are all set. Lets keep going!
```

#### Steps:

1. Clone the repository mentioned in the References section below.
   > https://github.com/camunda-community-hub/connector-sdk-nodejs
> 
2. I am assuming ```$base``` is the folder where you have cloned the repository.
> 
<b>3. Lets prepare the connector.</b>
>
3.1. I have published redis-connector-nodejs as npm package. So we are going to make a reference to that.
> 
3.2. Go to the folder (```__connectors__```) under runtime worker. This is where we are going to include or link the redis connector.
>```
>$base/connector-sdk-nodejs/connector-runtime-worker/__connectors__
> ```
> 
3.3. Open the file: ```package.json``` and make sure you have below item under dependencies. Save the changes.
>"dependencies": { "redis-connector-nodejs": "^1.0.15" }
> 
3.4. Run the command: 
>```
>npm install redis-connector-nodejs
>```
>Note: If you encounter any error at this step, make sure you are able to reach the url: https://www.npmjs.com/package/redis-connector-nodejs
>
> Note: Just to make sure, you should see the redis connector folder under <code>node_modules</code>. It is a common error when the package is not installed correctly.
>


<b>4. Lets prepare the <code>runtime wrapper</code>.</b>
> 
4.1. Go to the folder. 
>```
>$base/connector-sdk-nodejs/connector-runtime-worker
>```
>
4.2. Make sure to add below environment var names to <code>docker-compose.yml</code>. (Only the var names here. The values go into the <code>.env</code> file. See #5.1)

```
Note: I am taking db password as a secret parameter.

> ```
>    environment:
>      - LOG_LEVEL=INFO
>      - ZEEBE_ADDRESS
>      - ZEEBE_CLIENT_ID
>      - ZEEBE_CLIENT_SECRET
>      - ZEEBE_AUTHORIZATION_SERVER_URL
>      - REDIS_SECRET
> ```
> 
```

> 4.3. Let's build the Docker image.
> ```
> Run below two commands one after other.
> $ npm run build
> $ docker build --tag sitapati/c8-connector-worker-runtime-nodejs:latest .
> ```

> 
> 4.4. Yay! At this stage, you should see the Docker image for the connector wrapper. The wrapper points to the redis connector implementation.
>

<b>5. Time to put all things together.</b>
> 

> 5.1. Create a file <code>.env</code> in the folder: $base/connector-sdk-nodejs/connector-runtime-worker.

> ```
> REDIS_SECRET=put-db-password-here
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
>[connector-runtime-worker]$ docker compose --env-file .env up
> ```
> 

> 5.4. Keep an eye on the logs. The runtime container logs show you messages to indicate connector has been found or loaded.

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
The redis-connector-nodejs code base has been built on the SDK defined here.
> 
https://github.com/camunda-community-hub/connector-sdk-nodejs


# Contact for Support
If you need any assistance, we are just an email away - contact@makelabs.in
