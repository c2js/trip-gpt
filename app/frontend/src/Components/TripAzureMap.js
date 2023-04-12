import React, {useContext} from 'react'
import './TripAzureMap.css';
import {AzureMap, AzureMapsProvider, AzureMapHtmlMarker, AzureMapPopup, AzureMapsContext } from 'react-azure-maps'
import {AuthenticationType} from 'azure-maps-control'
import DataContext from '../DataContext';

const option = {
    authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey: process.env.REACT_APP_AZMAP_SUBSCRIPTION_KEY
      },
      center: [-122.33, 47.6],
      zoom: 10
}

const JhAzureMap = () => {
    
    const { mapRef, isMapReady } = useContext(AzureMapsContext);
    const { poi, setPOI } = useContext(DataContext);
    
    console.log(`jhazuremap`);
    console.log ({...poi} );
    console.log(`poi.is_end :${poi.is_end}`);
    

    let markers = []
    if (poi && 'pois' in poi) {
        markers = poi.pois.map((item, index) => ({
            options: { 
                color: 'blue', 
                text: item.name, 
                position: [ item.lon, item.lat ],
            },
            key: index
       }));
   
    }

    let memoizedMapPopup = null
    if (poi && 'pois' in poi) {
    memoizedMapPopup = poi.pois.map((item, index) => (
            <AzureMapPopup
                isVisible={true}
                options={ { position: [ item.lon, item.lat ] , pixelOffset: [0,-30]} } 
                popupContent={<div style={{padding:"10px"}}>{item.name}</div>}
            />
        ));
    }


    const onMarkerClick = (marker) => {
        console.log('Marker clicked:', marker);
    }

    return (
        <div id="map">

            <AzureMapsProvider>
                <AzureMap options={option}>
                   
                {memoizedMapPopup}
                {markers.map((marker) => (
                        <AzureMapHtmlMarker
                            key={marker.key}
                            options={marker.options}
                            onClick={() => onMarkerClick(marker)}
                            
                        />
                    ))}

                </AzureMap>
            </AzureMapsProvider>
        </div>
    );
}
export default JhAzureMap


