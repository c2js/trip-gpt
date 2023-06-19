import os
import openai
import json
import re
import requests
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
from langchain.memory import ChatMessageHistory
from langchain.schema import HumanMessage, AIMessage,SystemMessage
from langchain.memory import ConversationBufferMemory

load_dotenv()

openai.api_type = "azure"
openai.api_base = os.getenv("OPENAI_API_BASE") # "https://<aoai_servicename>.openai.azure.com/"
openai.api_version = os.getenv("OPENAI_API_VERSION")
openai.api_key = os.getenv("OPENAI_API_KEY") 



app = Flask(__name__)

from flask_cors import CORS, cross_origin
cors = CORS(app, resources={r"/*": {"origins": "*"}})

beginJSON = '@@JSONSTART@@'
endJSON = '@@JSONEND@@'

# Use Azure Maps subscription key authentication
subscription_key = os.getenv("AZMAP_SUBSCRIPTION_KEY")
maps_client = MapsSearchClient(
   credential=AzureKeyCredential(subscription_key)
)



############################################################
@app.route('/chat', methods=['POST'])
def chatv2():
    data = request.get_json()
    print(request)

    chat = AzureChatOpenAI(deployment_name="gpt-35-turbo", openai_api_version="2023-05-15", temperature=0.0)


    conversation_meta_prompt="""You are a travel assistant helps to to complete the following task:
1. Ask questions to get answer
2. Use CONFIRM_TEMPLATE to confirm gathered answer and end the conversation
Complete task 1 first, then complete task 2.


TASK 1:
Ask questions to gather the following answers:
1a. Destination city
1b. Month to travel
1c. How many days of travel
1d. Preferences (optional)

Assist the user if the user has doubt or question related to travel. Response short and concise. 
Do not suggest or generate any itinerary. Make sure the destination is a city, not a country.


TASK 2:
When you gather all answers in task 1, use the CONFIRM_TEMPLATE with bullet point to craft the confirmation.
Specify the country name in CONFIRM_TEMPLATE base on the city and conversation context.
Must emit "[SUMMARY]" when asking confirmation


CONFIRM_TEMPLATE:
###
[SUMMARY]
* City - {{city}}
* Country - {{country}}
* Travel Month - {{month}}
* Number of Day - {{number of day}}
* Preferences - {{preferences}}

Is the above information correct?
###

Lastly, reply with "FuuuNTASTIC" after user confirmed the travel plan is correct and stop asking question.


Example:
---
Human: I want to travel to London in December for 3 days
AI: Alright, do you have any preferences eg: hotel, places to visit?
Human: No
AI: Great!
[SUMMARY]
* City - London
* Country - United Kingdom
* Travel Month - December
* Number of Day - 3
* Preferences - None

Is the above information correct?
Human: Yes
AI: FuuuNTASTIC ! Please wait while I am generating your travel plan :)
---

"""

    travel_summary = None # use to detect if has travel summary
    messages = [ SystemMessage(content=conversation_meta_prompt) ]
    for msg in data:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
            if '[SUMMARY]' in msg["content"]:
                travel_summary = msg["content"]
        else:
            print('error')

    answer = chat.predict_messages(messages)
    print (answer)

    response = { "choices": [ { 'message': {"content": answer.content}} ]  }
    if 'FuuuNTASTIC' in answer.content:
        msg = answer.content.replace('FuuuNTASTIC', 'Fantastic')
        response = { "choices": [ 
                           { 'message': {"content": msg}}
                     ],
                     "is_chat_end": True,
                     "travel_summary": travel_summary
                    }
    print (response)
    return jsonify(response)

@app.route('/chat/prepare', methods=['POST'])
def prepare():
    data = request.get_json()
    print ("enter prepare...")
    print(data)


    chat = AzureChatOpenAI(deployment_name="gpt-35-turbo", openai_api_version="2023-05-15", temperature=0.0)

    template="""I am a city itinenary travel planner. I take a SUMMARY_INPUT to perform tasks.
SUMMARY_INPUT should have mentioned [Destination City, Country, Travel Month, Number of Day, Preferences]

TASK:
1. Generate Itinenary using Markdown format in Natural Language (MARKDOWN ITINENARY)
2. Generate JSON Meta Data according to the Itinenary in task 1 (JSON META DATA)
Generate Markdown Itinerary first, follow by JSON Meta Data.


TASK 1 - MARKDOWN ITINENARY
Follow these rules:
a. Generate ITINENARY by following ITINENARY FORMAT.
b. Stay at the same hotel if possible unless travel to other city.
c. Suggest between 1 to 3 attractions to full up a day depend on the time spend on each attraction.
d. Suggest 1 restaurant for lunch and 1 restaurant for dinner, it should close to the attraction of the day.
e. Write up on attractions, hotels and restaurants with maximum 3 sentences each make reader feel fun and excited. eg. 'attraction: The Birtish Musuem' -> 'The British Museum is a must-see! Explore the fascinating history of human culture with its vast collection of artifacts from around the world.'
f. Bold the attraction, hotel and restaurant names.
g. Do not repeat the description of the same attraction, hotel and restaurant.

ITINENARY FORMAT:
---
# Weather

The weather in {{month}} in {{city}} is typically {{weather}} {{temperature range}}.

# Note

Here are a few things to keep in mind about {{city}}'s culture:

1. {{note1}}
2. {{note2}}
3. {{note3}}

# Itinerary

## Day n

- Attraction: {{attraction(s) with descriptions}}
- Hotel: {{hotel}}
- Restaurant: {{restaurant1forlunch}} , {{restaurant2fordinner}}

## Day n+1

- Attraction: {{attraction(s) with descriptions}}
- Hotel: {{hotel}}
- Restaurant: {{restaurant1forlunch}} , {{restaurant2fordinner}}
---


TASK 2 - JSON META DATA
Extract Point Of Interest (POI) including all attractions, hotels, restaurants and other POI mentioned in the MARKDOWN ITINENARY.
Start with the word "@@JSONSTART@@" and end with @@JSONEND@@. 
Must follow JSON ITINERARY FORMAT:
---
@@JSONSTART@@
{{
"city": "{{city}}",
"country": "{{country}}",
"poi":  {{ "{{attractions_name}}": {{"type": "attr"}}, "{{hotels_name}}": {{"type":"lodge"}}, "{{restaurants_name}}": {{"type":"rest"}} }} 
}}
@@JSONEND@@
---

Generate Markdown Itinerary first, follow by JSON Meta Data. Doesn't need to label the task in output, use two new lines to separate the them.

SUMMARY_INPUT:
```{input_text}```
Output:
"""
    system_message_prompt = SystemMessagePromptTemplate.from_template(template)
    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt])

    chain = LLMChain(llm=chat, prompt=chat_prompt, verbose=True)
    answer = chain.run(input_text=data["travel_summary"])
    print (answer)

    ## detect @@JSONSTART@@ & @@JSONEND@@ and extract the json. Prior to @@JSONSTART@@ is Itinerary.
    json_start = answer.find(beginJSON)
    json_end = answer.find(endJSON)
    json_str = answer[json_start+13:json_end-1]
    print(json_str)
    json_obj = json.loads(json_str)
    print(json_obj)
    itinerary = answer[:json_start]
    print(itinerary)

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
            print("type error")
    

    city_result = maps_client.fuzzy_search(city, entity_type="Municipality")
    city_result_dict = city_result.results[0].as_dict()
    print (city_result_dict)

    city_lat = city_result_dict["position"]["lat"]
    city_long = city_result_dict["position"]["lon"]
    
    for poi, poi_type in zip(all_poi, all_poi_type):
        querypoi = poi_type + ' ' + poi + ', ' + city
        print (querypoi)
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
            print (f'error: {e}')                   
            continue

    response = { "choices": [ { 'message': {"content": itinerary}} ],
                 "is_end": True,
                 "pois": poiinfo
                }
    print (response)
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True, port=5000)