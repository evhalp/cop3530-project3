#include <iostream>
#include <utility>
#include <vector>

#include "../include/AdjacencyList.h"
//#include "../include/Dijkstra.h"
#include "../include/AStar.h"

int main() {
    AdjacencyList adj_list;
    Dijkstra dijkstra;
    AStar a_star;
    adj_list.LoadFromCSV("../../data/subway_travel_times.csv");

    // Get stations from front end
    Station station1, station2;

    auto dijkstra_output = dijkstra.GetOutput(adj_list, station1, station2);
    auto a_star_output = a_star.GetOutput(adj_list, station1, station2);

    // Send time & edges to front end
}
