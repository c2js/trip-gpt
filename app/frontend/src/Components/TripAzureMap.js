import React, {useContext, useEffect, useState} from 'react'
import './TripAzureMap.css';
import {AzureMap, AzureMapHtmlMarker, AzureMapPopup, AzureMapsContext } from 'react-azure-maps'
import DataContext from '../DataContext';

const option = {
    authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey: process.env.REACT_APP_AZMAP_SUBSCRIPTION_KEY
      },
      center: [-122.33, 47.6],
      zoom: 10
}

const TripAzureMap = () => {
    
    const { mapRef, isMapReady } = useContext(AzureMapsContext);
    const { poi } = useContext(DataContext);
    const [ isAllPopVisible, setIsAllPopVisible ]  = useState(true);
    
    console.log ({...poi} );
    console.log(`poi.is_end :${poi.is_end}`);
    
    useEffect(() => {
        if (isMapReady && mapRef) {
          mapRef.setCamera({ 
            center: [0,0],
            zoom: 0
        });
    }
    }, [isMapReady, mapRef]);


    useEffect(() => {

        if (isMapReady && mapRef && poi && 'pois' in poi && poi.pois.length > 0) {
            const lon = poi.pois[0].lon
            const lat = poi.pois[0].lat
            mapRef.setCamera({ 
                center: [lon, lat],
                zoom: 11
            });
        }

        if (isMapReady && mapRef && poi && !('pois' in poi)) {

            const cameraOptions = {
                center: [0, 0],
                zoom: 0,
                bearing: 0,
                duration: 2000
              };
            
            mapRef.setCamera(cameraOptions);
        }

    }, [poi, isMapReady, mapRef]);


    let markers = []
    if (poi && 'pois' in poi) {
        markers = poi.pois.map((item, index) => ({
            options: { 
                color: 'blue', 
                text: item.name, 
                position: [ item.lon, item.lat ],
            },
            key: Math.random() //index
       }));
   
    }

    // helper function
    function addHttps(url) {
        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }
        return url;
      }
    
    let renderedPopUp = null
    if (poi && 'pois' in poi) {
        renderedPopUp = poi.pois.map((item, index) => (
            <AzureMapPopup
                isVisible={ isAllPopVisible }
                options={ { position: [ item.lon, item.lat ] , pixelOffset: [0,-30]} } 
                popupContent={
                    <div className="poi-popup">
                        <h4>{item.name}</h4>
                        {item.addr_street_number && item.addr_street_name && <p><strong>Address:</strong> {item.addr_street_number} {item.addr_street_name} {item.city}</p> }
                        {item.lat && item.lon && <p><strong>Geo (lat,long):</strong> {item.lat}, {item.lon}</p> }
                        {item.phone && <p><strong>Phone:</strong> {item.phone}</p>}
                        {item.url && <p><strong>Website:</strong> <a href={addHttps(item.url)} target="_blank" rel="noreferrer">{item.url}</a></p>}
                    </div>
                }
                key={index}
                
            />
        ));
    }

    

    const onToggleClick = () => {
       setIsAllPopVisible(!isAllPopVisible)
        
    };
   

    return (
        
        <div id="map">
            <button onClick={onToggleClick} className="toggle-button" type="button" >Toggle Popups</button>
            
            <AzureMap options={option}>
                
            {renderedPopUp}
            {markers.map((marker) => (
                    <AzureMapHtmlMarker
                        key={marker.key}
                        options={marker.options}
                    />
            )
            )}    
            </AzureMap>
        </div>
    );
}
export default TripAzureMap



