#include <catch2/catch_test_macros.hpp>
#include <iostream>

// change if you choose to use a different header name
#include "../include/AdjacencyList.h"
#include "../include/Dijkstra.h"

AdjacencyList adj_list;
Dijkstra dijkstra(&adj_list);

TEST_CASE("Single-Edge Search", "[dijkstra]") {
  adj_list.LoadFromCSV("../../data/subway_travel_times.csv");
  dijkstra.SetCompositeKey({"August", "early_morning", "Saturday"});
  Station start_station{"Greenpoint Av", {40.731352, -73.954449}};
  Station end_station{"Nassau Av", {40.724635, -73.951277}};

  auto quickest_path = dijkstra.GetQuickestPath(start_station, end_station);
  std::pair<double, std::vector<Edge>> expected_output{1.37, std::vector<Edge>{{start_station, end_station, 1.37}}};
  REQUIRE(quickest_path == expected_output);
}