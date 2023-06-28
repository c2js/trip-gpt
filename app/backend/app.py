import os
import openai
import json
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from azure.maps.search import MapsSearchClient
from azure.core.credentials import AzureKeyCredential
from langchain import LLMChain
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.chat_models import AzureChatOpenAI
from langchain.schema import HumanMessage, AIMessage,SystemMessage
import logging

from prompt import CONV_META_PROMPT, ITINERARY_TEMPLATE

log = logging.getLogger('travelgpt')
log.setLevel(logging.DEBUG)
#logging.basicConfig(level=logging.DEBUG)
load_dotenv()

openai.api_type = "azure"
openai.api_base = os.getenv("OPENAI_API_BASE") # "https://<aoai_servicename>.openai.azure.com/"
openai.api_version = os.getenv("OPENAI_API_VERSION")
openai.api_key = os.getenv("OPENAI_API_KEY") 

REACT_BUILD_FOLDER = os.getenv("REACT_BUILD_FOLDER", 'webapp')


app = Flask(__name__, static_folder=REACT_BUILD_FOLDER)

from flask_cors import CORS, cross_origin
cors = CORS(app, resources={r"/*": {"origins": "*"}})

beginJSON = '@@JSONSTART@@'
endJSON = '@@JSONEND@@'

# Use Azure Maps subscription key authentication
subscription_key = os.getenv("AZMAP_SUBSCRIPTION_KEY")
maps_client = MapsSearchClient(
   credential=AzureKeyCredential(subscription_key)
)

@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def static_file(path):
    print (path)
    return app.send_static_file(path)


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    log.debug(f'/chat request.get_json(): {data}')

    chat = AzureChatOpenAI(deployment_name="gpt-35-turbo", openai_api_version="2023-05-15", temperature=0.0)

    travel_summary = None # use to detect if has travel summary
    messages = [ SystemMessage(content=CONV_META_PROMPT) ]
    for msg in data:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
            if '[SUMMARY]' in msg["content"]:
                travel_summary = msg["content"]
        else:
            log.warning(f'Unknown role: {msg["role"]}')

    log.debug(f'Messages: {messages}')
    answer = chat.predict_messages(messages)
    log.info(f'ChatGPT reply: {answer}')

    response = { "choices": [ { 'message': {"content": answer.content}} ]  }
    if 'FuuuNTASTIC' in answer.content:
        msg = answer.content.replace('FuuuNTASTIC', 'Fantastic')
        response = { "choices": [ 
                           { 'message': {"content": msg}}
                     ],
                     "is_chat_end": True,
                     "travel_summary": travel_summary
                    }

    log.info(f'/chat HTTP Response: {response}')
    return jsonify(response)

@app.route('/chat/prepare', methods=['POST'])
def prepare():
    data = request.get_json()
    log.debug(f'/chat/prepare request.get_json(): {data}')


    chat = AzureChatOpenAI(deployment_name="gpt-35-turbo", openai_api_version="2023-05-15", temperature=0.0)

    system_message_prompt = SystemMessagePromptTemplate.from_template(ITINERARY_TEMPLATE)
    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt])

    chain = LLMChain(llm=chat, prompt=chat_prompt, verbose=True)
    answer = chain.run(input_text=data["travel_summary"])

    log.info(f'ChatGPT Answer:\n\n{answer}\n\n')

    ## detect @@JSONSTART@@ & @@JSONEND@@ and extract the json. Prior to @@JSONSTART@@ is Itinerary.
    json_start = answer.find(beginJSON)
    json_end = answer.find(endJSON)
    json_str = answer[json_start+13:json_end-1]
    log.info(f'JSON STR:***{json_str}***')
    json_obj = json.loads(json_str)
    itinerary = answer[:json_start]
    log.info(f'Itinerary:\n\n{itinerary}\n\n')


    response = {}
    poiinfo = []
    city = json_obj['city']

    all_poi = list(json_obj['poi'].keys())
    all_poi_type = [] 
    for p in json_obj['poi'].values():
        if p['type'] == "attr":
            all_poi_type.append('attraction')
        elif p['type'] == "lodge":
            all_poi_type.append('lodge')
        elif p['type'] == "rest":
            all_poi_type.append('restaurant')
        else:
            log.info(f'Unknown POI type: {p["type"]}')
    

    city_result = maps_client.fuzzy_search(city, entity_type="Municipality")
    city_result_dict = city_result.results[0].as_dict()
    log.debug(f'City Result:{city_result_dict}')

    city_lat = city_result_dict["position"]["lat"]
    city_long = city_result_dict["position"]["lon"]
    
    for poi, poi_type in zip(all_poi, all_poi_type):
        querypoi = poi_type + ' ' + poi + ', ' + city
        log.info(f'Query POI: ----- {querypoi} ------')
        try:
            result = maps_client.search_point_of_interest(querypoi, coordinates=(city_lat, city_long), radius_in_meters=100000, top=1)
            r = result.results[0]
            poiinfo.append({'poi': poi, 'lat': r.position.lat, 'lon': r.position.lon, 'addr_street_number': r.address.street_number , 'addr_street_name': r.address.street_name, 
                            'city': r.address.municipality, 'country': r.address.country_code, 'zip': r.address.postal_code, 
                            'url': r.point_of_interest.url,
                            'phone' : r.point_of_interest.phone,
                            'name': r.point_of_interest.name,
                            })
            ## if poi url exist, find poi in itinerary and add with poi url
            if r.point_of_interest.url:
                itinerary = itinerary.replace(poi, f'[{poi}](https://{r.point_of_interest.url})')
        except Exception as e:
            log.error(f'Az Map Error: {e}')                
            continue

    response = { "choices": [ { 'message': {"content": itinerary}} ],
                 "is_end": True,
                 "pois": poiinfo
                }
    log.debug(f'/chat/prepare HTTP Response: {response}')
    return jsonify(response)


if __name__ == '__main__':
    app.run()