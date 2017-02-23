import json
import requests

from time import sleep

GOOGLE_DISTANCE_BASE_ULR = 'https://maps.googleapis.com/maps/api/distancematrix/json'  # noqa
KEY = 'AIzaSyDyQizcnPaf8r5IwaSgKAUsX-a4E4Xx_18'
INVALID_REQUEST = -1

travel_time = {}


def get_info_from_json(json_response):
    time = json_response['rows'][0]['elements'][0]
    time = time['duration_in_traffic']['value']
    return time


def get_travel_time(origin, destination):

    params = dict(
        key=KEY,
        origins=origin,
        destinations=destination,
        traffic_model='pessimistic',
        departure_time='1492700400',
    )

    resp = requests.get(url=GOOGLE_DISTANCE_BASE_ULR, params=params)
    json_response = resp.json()

    if json_response['status'] != 'OK':
        return INVALID_REQUEST

    return get_info_from_json(json_response)


def get_all_travel_times(origin, destinations):
    for destination in destinations:
        destination = str(destination['lat']) + ',' + str(destination['long'])
        print("Getting time for destination {}...".format(destination))
        if destination not in travel_time:
            time = get_travel_time(origin, destination)
            sleep(2)
        else:
            continue

        if time != -1:
            travel_time[destination] = time


def main():
    print('Getting distances times from field')
    origin = '-23.557296000000001,-46.669210999999997'

    with open('destinations_hospital_clinicas', 'ra') as destinations_file:
        destinations = json.load(destinations_file)

    get_all_travel_times(origin, destinations)

    with open('travel_time.json', 'w') as travel_file:
        json.dump(travel_time, travel_file)


if __name__ == '__main__':
    main()
