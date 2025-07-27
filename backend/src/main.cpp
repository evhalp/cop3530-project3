#include <iostream>
#include <utility>
#include <vector>

#include "../include/AdjacencyList.h"
#include "../include/Dijkstra.h"
#include "../include/AStar.h"

int main() {
    AdjacencyList adj_list;
    Dijkstra dijkstra(&adj_list);
    //AStar a_star;
    adj_list.LoadFromCSV("../../data/subway_travel_times.csv");

    // The above code runs at the initialization of the program
    // The below code runs every time the user requests a route

    // Get stations and composite key from front end
    Station start_station, end_station;
    std::array<std::string, 3> composite_key;

    dijkstra.SetCompositeKey(composite_key);
    //a_star.SetCompositeKey(composite_key);

    std::pair<double, std::vector<Edge>> dijkstra_output = dijkstra.GetQuickestPath(start_station, end_station);
    //auto a_star_output = a_star.GetOutput(adj_list, station1, station2);

    // Send time & edges to front end
}
