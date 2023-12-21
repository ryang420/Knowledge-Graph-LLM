# Project Knowledge Graph and LLM

Welcome to the  Knowledge Graph + LLM project, where we explore the intersection of large language models and knowledge graphs.
In the project, we explore how to use large language models to augment knowledge graphs and how to use natural language to query knowledge graphs.
   
## Repository Structure

Our repository is designed with an efficient and logical structure for ease of navigation:

- **Backend Code**: The backend code is found in the api folder in the main.py file you can find all endpoints and their corresponding functions. All LLM functionality is split into different components which have thier own purpose.

- **Frontend Code**: The frontend code is organized into two folders - one for each use case these can be found in ui/src. Each folder contains separate React applications that are independent from each other.

## Running the Demos

To simplify the process of running the demos, we have incorporated scripts that generate Docker images. To use these, you'll need to:

1. Navigate into the root directory.
2. Create an env file. You can use the env.example file as a template. (The open API key is optional and can be provided from the UI instead)
3. run `docker-compose up` to build the images.

This will start the backend and frontend servers, and you can access the demos at the following URLs:

- user interface: http://localhost:4173/

- backend: localhost:7860

Please note that you'll need Docker installed on your machine to build and run these images. If you haven't already, you can download Docker from [here](https://www.docker.com/products/docker-desktop).

## Demo database
Please go to https://sandbox.neo4j.com/ and create a new neo4j database.
```
URI: neo4j+s://demo.neo4jlabs.com
username: companies
password: companies
database: companies
```

## Running the backend and frontend separately
```shell
cd $PROJECT_ROOT/api
python main.py

cd $PROJECT_ROOT/ui
npm run dev

access url: http://localhost:8080/
```

