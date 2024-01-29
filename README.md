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

### How to run integration test cases?
To run against your dev Redis instance, please follow these steps.

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


# References
The redis-connector-nodejs code base is built on the SDK defined here.
> 
https://github.com/camunda-community-hub/connector-sdk-nodejs
