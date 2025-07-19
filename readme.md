Are there any external libraries we need to implement?
        Which local dev library are we using?
Input:
        [start_station_name, end_station_name, month, day, time]
Output:
        [Edge1, Edge2, ...]

Current Data Structure Ideas
    struct: Station {station_name, coordinates}
    struct: Edge {start_Station, end_Station, time_map}
    adj_list = {station_name: Edge}
    time_map = {array[month, day, time]: avg_time}

Dijkstra Search (figure this out)
    Min Heap(month, day, time)
    insert station_name, adj_list[station_name].second[[month, day, time]]

A*
    Heuristic = Euclidean distance / average train speed (20 mph?)
