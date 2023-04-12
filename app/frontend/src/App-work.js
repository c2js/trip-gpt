import React from 'react'
import {AzureMap, AzureMapsProvider} from 'react-azure-maps'
import {AuthenticationType} from 'azure-maps-control'

const option = {
    authOptions: {
        authType: AuthenticationType.subscriptionKey,
        subscriptionKey: "rlUDinMPdyGzH0xo8pT9kQhcsrzWnur9DeP3CJM25Rc"
    },
}

const DefaultMap= () => (
    <div style={{height: '300px'}}>
        <AzureMapsProvider>
            <AzureMap options={option}>
            </AzureMap>
        </AzureMapsProvider>
    </div>
)
export default DefaultMap