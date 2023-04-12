import React, {useState, useContext} from 'react';
import logo from './logo.svg';
import './App.css';
import Chatbot from './Components/Chatbot';
import TripAzureMap from './Components/TripAzureMap';
import DataContext from './DataContext';

function App() {

  const [ poi, setPOI ] = useState({});

  return (
    <DataContext.Provider value={{poi, setPOI}}>
      <div id="left">
        <TripAzureMap>
        </TripAzureMap>
      </div>

      <div id="right">
        <Chatbot></Chatbot>
      </div>

    </DataContext.Provider>
  );
}

export default App;
