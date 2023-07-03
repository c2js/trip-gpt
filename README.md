# TripGPT

TripGPT demonstrates using Azure OpenAI Service to generate city trip itineraries in a conversational style. The underlying architecture incorporates Azure Map and Azure OpenAI Service as its fundamental components.

[![TripGPT](/assets/tripgpt_demo.mp4)](/assets/tripgpt_demo.mp4)

## Table of Contents

- [TripGPT](#tripgpt)
  - [Table of Contents](#table-of-contents)
  - [Requirement](#requirement)
  - [Run Locally](#run-locally)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Environment Variable](#environment-variable)
    - [Backend](#backend-1)
    - [Frontend](#frontend-1)
  - [Deploy to Azure App Service](#deploy-to-azure-app-service)
    - [Build the React app](#build-the-react-app)
  - [Note ⚠️](#note-️)
  - [Contributing](#contributing)


## Requirement
* Develop with `Python 3.9` , may use lower version of Python.
* `Nodejs 16`
* [Azure Maps Account](https://learn.microsoft.com/en-us/azure/azure-maps/how-to-manage-account-keys)  & [Azure Maps Key](https://learn.microsoft.com/en-us/azure/azure-maps/how-to-manage-authentication#view-authentication-details)
  > &#x26a0;&#xfe0f; Azure Maps offers several authentication methods, including Shared Key, Azure AD, and SAS Token. This repository uses the Shared Key method, which may not be the best practice for production environments. Please note that the **KEY IS EXPOSED**. For more information, refer to [Manage authentication in Azure Maps](https://learn.microsoft.com/en-us/azure/azure-maps/.
* Azure OpenAI Service / OpenAI key: The gpt-3.5-turbo or gpt-4 model is required. If you do not have access to Azure OpenAI Service, please [read here](https://learn.microsoft.com/en-us/legal/cognitive-services/openai/limited-access).
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
To build the React app and add it to the backend app, create a folder called `webapp` by default. If you want to use a different folder name, you can specify the path in the `REACT_BUILD_FOLDER` environment variable. This path should be relative to the backend folder.

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

To deploy, you may use [Azure CLI to upload zip](https://learn.microsoft.com/en-us/azure/app-service/deploy-zip?tabs=cli), [Azure DevOps CI/CD](https://learn.microsoft.com/en-us/azure/app-service/deploy-azure-pipelines?tabs=yaml) or using VSCode extension (Azure Tools), it is easier to deploy via this method for quick start.


## Note &#x26a0;&#xfe0f;
> * Azure Maps does not encompass all points of interest, including but not limited to attractions, hotels, and restaurants.
> * The generated itinerary is based on information available up to the date the LLM model was trained. Please note that the accuracy and validity of the information may vary, and we strongly advise validating it before relying on it for any practical purposes.
## Contributing

Contributions are welcome! If you find any issues or have suggestions, please feel free to create an issue or submit a pull request.


