import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import Chatbot from './Components/Chatbot';
import TripAzureMap from './Components/TripAzureMap';
import DataContext from './DataContext';
import { AzureMapsProvider } from 'react-azure-maps';

function App() {

  const [ poi, setPOI ] = useState({});

  return (

    <DataContext.Provider value={{poi, setPOI}}>
      <div id="left">
        <AzureMapsProvider>
          <TripAzureMap>
          </TripAzureMap>
        </AzureMapsProvider>
      </div>

      <div id="right">
        <Chatbot></Chatbot>
      </div>

    </DataContext.Provider>
  );
}

export default App;
