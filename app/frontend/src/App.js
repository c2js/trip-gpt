import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import Chatbot from './Components/Chatbot';
import TripAzureMap from './Components/TripAzureMap';
import DataContext from './DataContext';
import { AzureMapsProvider } from 'react-azure-maps';


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


// AZUREMAP HTML MARKER ###############################


// import React, { memo, useMemo, useState } from 'react';
// import {
//   AzureMap,
//   AzureMapDataSourceProvider,
//   AzureMapFeature,
//   AzureMapHtmlMarker,
//   AzureMapLayerProvider,
//   AzureMapsProvider
// } from 'react-azure-maps';
// import { AuthenticationType, data, HtmlMarkerOptions, SymbolLayerOptions } from 'azure-maps-control';
// import { Button, Chip } from '@mui/material';


// const point1 = new data.Position(-100.01, 45.01);
// const point2 = new data.Position(-120.2, 45.1);
// const point3 = new data.Position(-120.2, 50.1);
// const point4 = new data.Position(-126.2, 55.1);

// function clusterClicked(e) {
//   console.log('clusterClicked', e);
// }

// const onClick = (e) => {
//   console.log('You click on: ', e);
// };

// function azureHtmlMapMarkerOptions(coordinates) {
//   return {
//     position: coordinates,
//     text: 'My text',
//     title: 'Title',
//   };
// }

// const memoizedOptions = {
//   textOptions: {
//     textField: ['get', 'title'], //Specify the property name that contains the text you want to appear with the symbol.
//     offset: [0, 1.2],
//   },
// };

// const eventToMarker = [{ eventName: 'click', callback: onClick }];
// const renderPoint = (coordinates)=> {
//   const rendId = Math.random();

//   return (
//     <AzureMapFeature
//       key={rendId}
//       id={rendId.toString()}
//       type="Point"
//       coordinate={coordinates}
//       properties={{
//         title: 'Pin',
//         icon: 'pin-round-blue',
//       }}
//     />
//   );
// };

// function renderHTMLPoint(coordinates) { 
//   const rendId = Math.random();
//   return (
//     <AzureMapHtmlMarker
//       key={rendId}
//       markerContent={<div className="pulseIcon"></div>}
//       options={{ ...azureHtmlMapMarkerOptions(coordinates) }}
//       events={eventToMarker}
//     />
//   );
// }

// const colorValue = () =>
//   '#000000'.replace(/0/g, function () {
//     return (~~(Math.random() * 16)).toString(16);
//   });
// const markersStandardImages = [
//   `marker-black`,
//   `marker-blue`,
//   `marker-darkblue`,
//   `marker-red`,
//   `marker-yellow`,
//   `pin-blue`,
//   `pin-darkblue`,
//   `pin-red`,
//   `pin-round-blue`,
//   `pin-round-darkblue`,
//   `pin-round-red`,
// ];

// const rand = () => markersStandardImages[Math.floor(Math.random() * markersStandardImages.length)];


// function App() {
//   const [markers, setMarkers] = useState([point1, point2, point3]);
//   const [htmlMarkers, setHtmlMarkers] = useState([point4]);
//   const [markersLayer] = useState('SymbolLayer');
//   const [layerOptions, setLayerOptions] = useState(memoizedOptions);

//   const option = useMemo(() => {
//     return {
//       authOptions: {
//         authType: AuthenticationType.subscriptionKey,
//         subscriptionKey: process.env.REACT_APP_AZMAP_SUBSCRIPTION_KEY,
//       },
//       center: [-100.01, 45.01],
//       zoom: 2,
//       view: 'Auto',
//     };
//   }, []);

//   const addRandomMarker = () => {
//     const randomLongitude = Math.floor(Math.random() * (-80 - -120) + -120);
//     const randomLatitude = Math.floor(Math.random() * (30 - 65) + 65);
//     const newPoint = new data.Position(randomLongitude, randomLatitude);
//     setMarkers([...markers, newPoint]);
//   };

//   const addRandomHTMLMarker = () => {
//     const randomLongitude = Math.floor(Math.random() * (-80 - -120) + -120);
//     const randomLatitude = Math.floor(Math.random() * (30 - 65) + 65);
//     const newPoint = new data.Position(randomLongitude, randomLatitude);
//     setHtmlMarkers([...htmlMarkers, newPoint]);
//   };

//   const removeAllMarkers = () => {
//     setMarkers([]);
//     setHtmlMarkers([]);
//   };

//   const memoizedMarkerRender = useMemo(
//     () => markers.map((marker) => renderPoint(marker)),
//     [markers],
//   );

//   const memoizedHtmlMarkerRender = useMemo(
//     () => htmlMarkers.map((marker) => renderHTMLPoint(marker)),
//     [htmlMarkers],
//   );

//   console.log('MarkerExample RENDER');
//   return (
//     <>
//       <div style={styles.buttonContainer}>
//         <Button size="small" variant="contained" color="primary" onClick={addRandomMarker}>
//           {' '}
//           MARKER POINT
//         </Button>
//         <Button size="small" variant="contained" color="primary" onClick={addRandomHTMLMarker}>
//           {' '}
//           HTML MARKER
//         </Button>
//         <Button
//           size="small"
//           variant="contained"
//           color="primary"
//           onClick={() =>
//             setLayerOptions({
//               textOptions: {
//                 color: colorValue(),
//                 size: 16,
//               },
//             })
//           }
//         >
//           {' '}
//           Text Options
//         </Button>
//         <Button
//           size="small"
//           variant="contained"
//           color="primary"
//           onClick={() =>
//             setLayerOptions({
//               iconOptions: {
//                 image: rand(),
//               },
//             })
//           }
//         >
//           {' '}
//           ICON OPTIONS
//         </Button>
//         <Button size="small" variant="contained" color="primary" onClick={removeAllMarkers}>
//           {' '}
//           REMOVE ALL
//         </Button>
//         <Chip label={`Markers Point on map: ${markers.length}`} />
//         <Chip label={`Markers HTML on map: ${htmlMarkers.length}`} />
//       </div>
//       <AzureMapsProvider>
//         <div style={styles.map}>
//           <AzureMap options={option}>
//             <AzureMapDataSourceProvider
//               events={{
//                 dataadded: (e) => {
//                   console.log('Data on source added', e);
//                 },
//               }}
//               id={'markersExample AzureMapDataSourceProvider'}
//               options={{ cluster: true, clusterRadius: 2 }}
//             >
//               <AzureMapLayerProvider
//                 id={'markersExample AzureMapLayerProvider'}
//                 options={layerOptions}
//                 events={{
//                   click: clusterClicked,
//                   dbclick: clusterClicked,
//                 }}
//                 lifecycleEvents={{
//                   layeradded: () => {
//                     console.log('LAYER ADDED TO MAP');
//                   },
//                 }}
//                 type={markersLayer}
//               />
//               {memoizedMarkerRender}
//               {memoizedHtmlMarkerRender}
//             </AzureMapDataSourceProvider>
//           </AzureMap>
//         </div>
//       </AzureMapsProvider>
//     </>
//   );
  


// }



// const styles = {
//   map: {
//     height: 500,
//   },
//   buttonContainer: {
//     display: 'grid',
//     gridAutoFlow: 'column',
//     gridGap: '10px',
//     gridAutoColumns: 'max-content',
//     padding: '10px 0',
//     alignItems: 'center',
//   },
//   button: {
//     height: 35,
//     width: 80,
//     backgroundColor: '#68aba3',
//     'text-align': 'center',
//   },
// };

// export default App;

// END HTML MARKER ##########################################







// // POPUP ##########################################
// import React, { useCallback, useMemo, useState } from 'react';
// import { Button } from '@mui/material';
// import {
//   AzureMap,
//   AzureMapsProvider,
//   AzureMapPopup,
//   AzureMapHtmlMarker,
//   useCreatePopup,
// } from 'react-azure-maps';
// import { AuthenticationType, data } from 'azure-maps-control';
// import HtmlMarker from 'azure-maps-control';

// const popupOptions = {
//   position: new data.Position(-100.01, 45.01),
// };

// const App = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isHtmlMarkerPopupVisible, setIsHtmlMarkerPopupVisible] = useState(true);
//   const [someHtmlMarkerPopupState, setSomeHtmlMarkerPopupState] = useState(0);
//   const htmlMarkerOptions = {
//     popup: useCreatePopup({
//       options: {},
//       popupContent: (
//         <div style={wrapperStyles.popupStyles}>
//           Hello World Html marker popup with some random value click Change Number to see actual value <br />{' '}
//           {someHtmlMarkerPopupState}
//         </div>
//       ),
//     }),
//   };
//   const option = useMemo(() => {
//     return {
//       authOptions: {
//         authType: AuthenticationType.subscriptionKey,
//         subscriptionKey: process.env.REACT_APP_AZMAP_SUBSCRIPTION_KEY,
//       },
//       center: [-100.01, 45.01],
//       zoom: 1,
//       view: 'Auto',
//     };
//   }, []);

//   const memoizedMapPopup = useMemo(
//     () => (
//       <AzureMapPopup
//         isVisible={isVisible}
//         options={popupOptions}
//         popupContent={<div style={wrapperStyles.popupStyles}>Hello World</div>}
//       />
//     ),
//     [isVisible],
//   );

//   const memoizedHtmlMarker = useMemo(
//     () => (
//       <AzureMapHtmlMarker
//         isPopupVisible={isHtmlMarkerPopupVisible}
//         markerContent={<div className="pulseIcon">TTT</div>}
//         options={htmlMarkerOptions}
//       />
//     ),
//     [isHtmlMarkerPopupVisible],
//   );

//   const toggleHtmlMarkerPopup = useCallback(() => {
//     setIsHtmlMarkerPopupVisible((prevState) => !prevState);
//   }, [isHtmlMarkerPopupVisible]);

//   return (
//     <div style={wrapperStyles.map}>
//       <div style={wrapperStyles.buttonContainer}>
//         <Button
//           size="small"
//           variant="contained"
//           color="secondary"
//           onClick={() => {
//             toggleHtmlMarkerPopup();
//           }}
//         >
//           Toggle Popup HtmlMarker
//         </Button>
//         <Button
//           size="small"
//           variant="contained"
//           color="secondary"
//           onClick={() => {
//             setIsVisible(true);
//           }}
//         >
//           Open Popup
//         </Button>
//         <Button size="small" variant="contained" color="secondary" onClick={() => setIsVisible(false)}>
//           Close Popup
//         </Button>
//         <Button
//           size="small"
//           variant="contained"
//           color="secondary"
//           onClick={() => setSomeHtmlMarkerPopupState(Math.random() * 100)}
//         >
//           Change Popup HtmlMarker NUmber
//         </Button>
//       </div>
//       <AzureMapsProvider>
//         <div style={wrapperStyles.map}>
//           <AzureMap options={option}>
//             {memoizedMapPopup}
//             {memoizedHtmlMarker}
//           </AzureMap>
//         </div>
//       </AzureMapsProvider>
//     </div>
//   );
// };

// export const wrapperStyles = {
//   map: {
//     height: '500px',
//   },
//   wrapper: {
//     padding: '15px',
//     marginTop: '15px',
//   },
//   buttonContainer: {
//     display: 'grid',
//     gridAutoFlow: 'column',
//     gridGap: '10px',
//     gridAutoColumns: 'max-content',
//     padding: '10px 0',
//   },
//   buttons: {
//     padding: '15px',
//     flex: 1,
//   },
//   popupStyles: {
//     padding: '20px',
//     color: 'black',
//   },
// };

// export default App;

// END POPUP ##########################################