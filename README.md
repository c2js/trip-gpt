# TripGPT

TripGPT is a demostrating how to use LLM, Azure OpenAI Service to generate a city trip itinenary in conversation style. Underneath is using Azure Map & Azure OpenAI Service as the core component.


## Video
[![TripGPT](/assets/tripgpt_demo.mp4)](/assets/tripgpt_demo.mp4)

## Table of Contents

- [TripGPT](#tripgpt)
  - [Video](#video)
  - [Table of Contents](#table-of-contents)
  - [Project Description](#project-description)
  - [Requirement](#requirement)
  - [Run Locally](#run-locally)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Environment Variable](#environment-variable)
    - [Backend](#backend-1)
    - [Frontend](#frontend-1)
  - [Deploy to Azure App Service](#deploy-to-azure-app-service)
    - [Build the React app](#build-the-react-app)
  - [Contributing](#contributing)

## Project Description

This repository contains the frontend and backend components of the project. The frontend is developed using React, while the backend is built with Python Flask.

## Requirement
* Develop with `Python 3.9` , may use lower version of Python.
* `Nodejs 16`
* [Azure Maps](https://learn.microsoft.com/en-us/azure/azure-maps/how-to-manage-account-keys) account & [Azure Maps Key](https://learn.microsoft.com/en-us/azure/azure-maps/how-to-manage-authentication#view-authentication-details)
  > &#x26a0;&#xfe0f; There are several way Azure Map provided for authentication (Shared Key, Azure AD & SAS Token). This repo is using Shared Key which might not be the best practise for production environment. !! KEY IS EXPOSE !! . Refer this [Manage authentication in Azure Maps](https://learn.microsoft.com/en-us/azure/azure-maps/how-to-manage-authentication#choose-an-authentication-and-authorization-scenario) for more details.
* Azure OpenAI Service / OpenAI key. Require gpt-35-turbo or gpt4 model. If doesn't have Azure OpenAI Service access, read [here](https://learn.microsoft.com/en-us/legal/cognitive-services/openai/limited-access)
## Run Locally

To install and run the project locally, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/your-username/repository-name.git
   ```
### Backend
2. Navigate to the project directory -> app -> backend:

   ```shell
   cd repository-name/app/backend
   ```

3. Install the required dependencies for the backend:

   ```shell
   pip install -r requirements.txt
   ```
4. Start the Flask server by running following command. Default listening to port 5000
   ```shell
   python app.py
   ```

### Frontend
5. Open another shell, navigate to frontend
   ```shell
   cd repository-name/app/frontend
   ```
6. Copy `.env.sample` as `.env` . Use this to set the environment variable for Azure Map Key (if using key as authentication), the backend endpoint
   ```shell
   cd repository-name/app/frontend
   ```
7. Run the follow command will start the development server for the React app. By default is listening to port 3000
   ```shell
   npm start
   ```
8. In browser, run `localhost:3000`
 
## Environment Variable
Both backend and frontend have .env files. 
### Backend

```python
AZMAP_SUBSCRIPTION_KEY=<Azure Maps Shared Key>
OPENAI_API_BASE=<openapi_endpoint>
OPENAI_API_KEY=<openai_key>
OPENAI_API_VERSION=<openai_version>
```

### Frontend
```
REACT_APP_AZMAP_SUBSCRIPTION_KEY=<Azure Maps Shared Key>
REACT_APP_BACKEND_ENDPOINT=<backend endpoint>
```
Without changing the Flask port, you can set `REACT_APP_BACKEND_ENDPOINT=http://localhost:5000`

## Deploy to Azure App Service
You can deploy this solution Linux App Service. You may follow [Quickstart: Deploy a Python (Django or Flask) web app to Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-python?tabs=flask%2Cwindows%2Cazure-cli%2Cvscode-deploy%2Cdeploy-instructions-azportal%2Cterminal-bash%2Cdeploy-instructions-zip-azcli)

### Build the React app
Need to build the react app and place it under a folder in backend app. Default folder name: `webapp` . Can overwrite the folder by specifying the path in environment variable `REACT_BUILD_FOLDER`. It should be relative to backend folder. 

In **Windows**, set the `package.json` "build" as follow to specify the destination of the build folder. (default)
```json
"scripts": {
    ...
    "build": "set \"BUILD_PATH=../backend/webapp\" && react-scripts build",
    ...
}
```
In **Linux**, set the `package.json` "build" as follow to specify the destination of the build folder. 
```json
"scripts": {
    ...
    "build": "export \"BUILD_PATH=../backend/webapp\" && react-scripts build",
    ...
}
```

To deploy, you may use [Azure CLI to upload zip](https://learn.microsoft.com/en-us/azure/app-service/deploy-zip?tabs=cli), [Azure DevOps CI/CD](https://learn.microsoft.com/en-us/azure/app-service/deploy-azure-pipelines?tabs=yaml) or using VSCode extension (Azure Tools). I found it is easier to deploy via this method for quick test.

## Contributing

Contributions are welcome! If you find any issues or have suggestions, please feel free to create an issue or submit a pull request.


