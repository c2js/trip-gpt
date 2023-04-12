import os
import openai
import json
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from azure.maps.search import MapsSearchClient
from azure.core.credentials import AzureKeyCredential

load_dotenv()

openai.api_type = "azure"
openai.api_base = os.getenv("OPENAI_API_BASE") # "https://<aoai_servicename>.openai.azure.com/"
openai.api_version = os.getenv("OPENAI_API_VERSION")
openai.api_key = os.getenv("OPENAI_API_KEY") 



app = Flask(__name__)

from flask_cors import CORS, cross_origin
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

beginJSON = '@@JSONSTART@@'
endJSON = '@@JSONEND@@'
headerJSON = '# JSON'

# Use Azure Maps subscription key authentication
subscription_key = os.getenv("AZMAP_SUBSCRIPTION_KEY")
maps_client = MapsSearchClient(
   credential=AzureKeyCredential(subscription_key)
)


@app.route('/')
def index():
    return 'Hello World!'

@app.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    data = request.get_json()
    print (request)
    print(data) # expecting [ {role:user, context:sdfsdf}, {role:assistant, context:xfgedf} ] 

    messages = [{"role":"system","content":"Welcome to the travel itinerary planner!\n\nPlease provide the following information to generate your itinerary:\n\n1. What is your destination city?\n2. In which month are you planning to travel?\n3. How many days will you be staying there?\n\nDestination city: \nMonth of travel: \nNumber of days:\nPreferences eg: hotels type, area of interests (optional)\n\nAsk the user if the above information is not given.\n\nStay at the same hotel if possible unless travel to other city. May suggest more than 1 attraction to fill up a day. Use 1 sentence or 2 to elaborate on [attractions, hotel and restaurant]. Use markdown to bold (attractions name, hotels name and restaurants name) \nThank you! Here's your itinerary:\n\n# Weather\n\nThe weather in {{month}} in {{city}} is typically {{weather}} {{temperature range}}.\n\n# Note\n\nHere are a few things to keep in mind about {{city}}'s culture:\n\n1. {{note1}}\n2. {{note2}}\n3. {{note3}}\n\n# Itinerary\n\n## Day n\n\n- Attraction: {{attraction(s)}}\n- Hotel: {{hotel}}\n- Restaurant: {{restaurant1forlunch}} , {{restaurant2fordinner}}\n\n## Day n+1\n\n- Attraction: {{attraction(s)}}\n- Hotel: {{hotel}}\n- Restaurant: {{restaurant1forlunch}} , {{restaurant2fordinner}}\n\n## Day n+2\n\n- Attraction: {{attraction(s)}}\n- Hotel: {{hotel}}\n- Restaurant: {{restaurant1forlunch}} , {{restaurant2fordinner}}\n\n\n# JSON\n@@JSONSTART@@\n{\n  \"city\": \"{{city}}\",\n  \"month\": \"{{month}}\",\n  \"days\": {{days}},\n  \"pref\": {{preferences}},\n  \"all_poi\": [  \"{{attraction_n_day_n}}\", {{attraction_n+1_day_n}} \"{{hotel_n_day_n}}\", \"{{restaurant_n_day_n}}\" , \"{{restaurant_n+1_day_n}}\", \"{{attraction_n+1_day_n+1}}\", \"{{hotel_n+1_day_n+1}}\", \"{{restaurant_n+1_day_n+1}}\" ]\n}\n@@JSONEND@@\n\n   \n"}
               ] + data
    print (messages)
    response = openai.ChatCompletion.create(
            engine="gpt-35-turbo",
            messages = messages,
            temperature=0.13,
            max_tokens=1787,
            top_p=0.5,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None)
        
    # response = {
    #     "choices": [
    #     {
    #         "finish_reason": "stop",
    #         "index": 0,
    #         "message": {
    #         "content": "Alright, here's your itinerary for your 3-day trip to New York in March:\n\n# Weather\n\nThe weather in March in New York is typically chilly with temperatures ranging from 0\u00b0C to 10\u00b0C.\n\n# Note\n\nHere are a few things to keep in mind about New York's culture:\n\n1. Tipping is customary in restaurants and for other services.\n2. New Yorkers are generally fast-paced and direct in their communication.\n3. It is common to use public transportation such as the subway or buses to get around the city.\n\n# Itinerary\n\n## Day 1\n\n- Attraction: Visit the iconic **Statue of Liberty** and take a ferry ride to Ellis Island to learn about the history of immigration in the United States.\n- Hotel: Stay at the **New York Marriott Marquis** in Times Square for a central location and great views of the city.\n- Restaurant: Grab lunch at **Shake Shack** for some delicious burgers and fries, and enjoy dinner at **Carbone** for classic Italian-American cuisine.\n\n## Day 2\n\n- Attraction: Explore the **Metropolitan Museum of Art** to see an extensive collection of art and artifacts from around the world.\n- Hotel: Stay at the **The Plaza** for a luxurious experience and a prime location near Central Park.\n- Restaurant: Have lunch at **Le Pain Quotidien** for some fresh and healthy options, and enjoy dinner at **Gramercy Tavern** for contemporary American cuisine.\n\n## Day 3\n\n- Attraction: Walk around **Central Park** and enjoy the beautiful scenery and landmarks such as the Bethesda Fountain and the Central Park Zoo.\n- Hotel: Stay at the **The Greenwich Hotel** for a cozy and intimate atmosphere in the heart of the trendy Tribeca neighborhood.\n- Restaurant: Grab lunch at **Eataly** for some delicious Italian food and drinks, and enjoy dinner at **Eleven Madison Park** for a fine dining experience with seasonal and locally sourced ingredients.\n\n# JSON\n@@JSONSTART@@\n{\n  \"city\": \"New York\",\n  \"month\": \"March\",\n  \"days\": 3,\n  \"pref\": null,\n  \"all_poi\": [ \"Statue of Liberty\", \"Ellis Island\", \"New York Marriott Marquis\", \"Shake Shack\", \"Carbone\", \"Metropolitan Museum of Art\", \"The Plaza\", \"Le Pain Quotidien\", \"Gramercy Tavern\", \"Central Park\", \"The Greenwich Hotel\", \"Eataly\", \"Eleven Madison Park\" ]\n}\n@@JSONEND@@\n\nI hope you find this itinerary helpful! Let me know if you have any other questions or preferences.",
    #         "role": "assistant"
    #         }
    #     }
    #     ],
    #     "created": 1681093611,
    #     "id": "chatcmpl-73bX12ZZfmKa8ZHsZSTZ5IdXQPbRb",
    #     "model": "gpt-35-turbo",
    #     "object": "chat.completion",
    #     "usage": {
    #     "completion_tokens": 546,
    #     "prompt_tokens": 565,
    #     "total_tokens": 1111
    #     }
    # }

    if (response and 
        'choices' in response and 
        len(response['choices']) > 0 and 
        'message' in response['choices'][0] and 
        'content' in response['choices'][0]['message'] 
        ):
        assist_content = response['choices'][0]['message']["content"]

        if (headerJSON in assist_content or beginJSON in assist_content or endJSON in assist_content):
            start_index = assist_content.find(beginJSON) + len(beginJSON)
            end_index = assist_content.find(endJSON, start_index)

            json_str = assist_content[start_index:end_index]
            assistJson = json.loads(json_str)

            # do another call to open ai. 
            print (f'assistJson : {assistJson}')


            # sample output of assistJson : {'city': 'New York', 'month': 'March', 'days': 3, 'pref': None, 'all_poi': ['Statue of Liberty', 'Ellis Island', 'New York Marriott Marquis', 'Shake Shack', 'Carbone', 'Metropolitan Museum of Art', 'The Plaza', 'Le Pain Quotidien', 'Gramercy Tavern', 'Central Park', 'The Greenwich Hotel', 'Eataly', 'Eleven Madison Park']}
            ## loop thru all_poi, append each poi with city (Statue of Liberty, New York) and call Azure Map API to search the point of interest in order to get the lat and long.
            city = assistJson['city']
            all_poi = assistJson['all_poi']
            poiinfo = []
            for poi in all_poi:
                querypoi = poi + ', ' + city
                print (querypoi)
                result = maps_client.search_point_of_interest(querypoi, top=1)
                r = result.results[0]
                poiinfo.append({'poi': querypoi, 'lat': r.position.lat, 'lon': r.position.lon, 'addr_street_number': r.address.street_number , 'addr_street_name': r.address.street_name, 
                                'city': r.address.municipality, 'country': r.address.country_code, 'zip': r.address.postal_code, 
                                'url': r.point_of_interest.url,
                                'phone:' : r.point_of_interest.phone,
                                'name': r.point_of_interest.name,
                                })
            
            response['pois'] = poiinfo
            response['is_end'] = True
            assist_content = assist_content[:start_index - len(beginJSON)] + assist_content[end_index + len(endJSON):]
            assist_content= assist_content.replace('# JSON', '')
            response['choices'][0]['message']['content'] = assist_content


    print(response)
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)