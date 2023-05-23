import React, {useContext, useEffect, useRef, useState} from 'react'
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

const TripAzureMap = () => {
    
    const { mapRef, isMapReady } = useContext(AzureMapsContext);
    const { poi, setPOI } = useContext(DataContext);
    const [ isPopVisible, setIsPopVisible ]  = useState({});
    
    console.log(`jhazuremap`);
    console.log ({...poi} );
    console.log(`poi.is_end :${poi.is_end}`);
    
    useEffect(() => {
        if (isMapReady && mapRef) {
          mapRef.setCamera({ 
            center: [0,0],
            zoom: 0
        });
    }
    }, [isMapReady]);


    useEffect(() => {

        if (isMapReady && mapRef && poi && 'pois' in poi) {
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

        if (poi && 'pois' in poi)
        {
            poi.pois.map((item, index) => {
                isPopVisible[item.name] = false;
            });
            console.log(`isPopVisible: ${isPopVisible}`)
        }
        //mapPopup.current = mapPopup.current.slice(0, poi.length);

     
        
    }, [poi]);


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
                isVisible={ isPopVisible[item.name] }
                options={ { position: [ item.lon, item.lat ] , pixelOffset: [0,-30]} } 
                //popupContent={<div style={{padding:"10px"}}>{item.name}</div>}
                popupContent={
                    <div className="poi-popup">
                        <h4>{item.name}</h4>
                        {item.addr_street_number && item.addr_street_name && <p><strong>Address:</strong> {item.addr_street_number} {item.addr_street_name} {item.city}</p> }
                        {item.lat && item.lon && <p><strong>Geo (lat,long):</strong> {item.lat}, {item.lon}</p> }
                        {item.phone && <p><strong>Phone:</strong> {item.phone}</p>}
                        {item.url && <p><strong>Website:</strong> <a href={addHttps(item.url)} target="_blank">{item.url}</a></p>}
                    </div>
                }
                key={index}
                //ref={(el) => (mapPopup.current.push(el))}
                
            />
        ));
    }

    // let renderedPopUp = null;
    // if (poi && 'pois' in poi) {
    //   renderedPopUp = poi.pois.map((item, index) => {
    //     const ref = (el) => (mapPopup.current[index] = el);
    //     const popupContent = (
    //       <div className="poi-popup">
    //         <h4>{item.name}</h4>
    //         {item.addr_street_number && item.addr_street_name && (
    //           <p>
    //             <strong>Address:</strong> {item.addr_street_number} {item.addr_street_name} {item.city}
    //           </p>
    //         )}
    //         {item.lat && item.lon && (
    //           <p>
    //             <strong>Geo (lat,long):</strong> {item.lat}, {item.lon}
    //           </p>
    //         )}
    //         {item.phone && <p><strong>Phone:</strong> {item.phone}</p>}
    //         {item.url && (
    //           <p>
    //             <strong>Website:</strong> <a href={addHttps(item.url)} target="_blank">{item.url}</a>
    //           </p>
    //         )}
    //       </div>
    //     );
    
    //     return (
    //       <AzureMapPopup
    //         isVisible={true}
    //         options={{ position: [item.lon, item.lat], pixelOffset: [0, -30] }}
    //         popupContent={popupContent}
    //         key={index}
    //         ref={ref}
    //       />
    //     );
    //   });
    // }

    //TODO

    const [popVisible, setPopVisible] = useState(false);

    const onClick = (e) => {
        console.log('You click on: ', e);
        console.log('You click on: ', e.target.options.visible);

        isPopVisible[e.target.options.text] = !isPopVisible[e.target.options.text];
        console.log(`isPopVisible: ${isPopVisible}`);
        console.log(`isPopVisible: ${JSON.stringify(isPopVisible)}`);

        // //e.target.options.visible = false;
        // console.log(mapPopup);
        // mapPopup.current.forEach((popup) => {
        //     popup.isVisible = false;
        //     console.log(popup.isVisible);
        //   });
        
        
        // setPopVisible(prevstate => !prevstate);
        // console.log(`this is what: ${singleRef.current.options.visible}`);
        
    };
   
    const eventToMarker = [{ eventName: 'click', callback: onClick }];

    return (
        <div id="map">
            <AzureMap options={option}>
                
            {renderedPopUp}
            {markers.map((marker) => (
                    <AzureMapHtmlMarker
                        key={marker.key}
                        options={marker.options}
                        //events={ [ { eventName: 'click', callback: (e) => { console.log('You click on: ', e); } } ] }
                        events={eventToMarker}
                    />
            )
            )}    

            <AzureMapHtmlMarker
                        key={ 'a3rsdfw4fsdf'}
                        options={ { 
                            color: 'blue', 
                            text: 'testsetset', 
                            position: [ 0,0 ],
                        } }
                        events={eventToMarker}
            />

            <AzureMapPopup
                key={ 'abcsdfeefef'}
                isVisible={popVisible}
                options={ { position: [ 0, 0 ] , pixelOffset: [0,-30]} } 

                popupContent={
                    <div className="dfwsefwef">
                        <h4> Title dfsdf</h4>
                        { <p><strong>Address:</strong> dfsedfsef </p> }
                        { <p><strong>Geo (lat,long):</strong> </p> }
                        { <p><strong>Phone:</strong> </p>}
                        { <p><strong>Website:</strong> </p>}
                    </div>
                }
                
            />

            </AzureMap>
        </div>
    );
}
export default TripAzureMap



