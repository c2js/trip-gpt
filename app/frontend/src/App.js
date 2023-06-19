import React, {useState, useEffect} from 'react';
import Chatbot from './Components/Chatbot';
import TripAzureMap from './Components/TripAzureMap';
import DataContext from './DataContext';
import { AzureMapsProvider } from 'react-azure-maps';
import './App.css';


function App() {

  const [ poi, setPOI ] = useState({});

  useEffect(() => {
    document.title = 'City Planner Chatbot';
  }, []);

  
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