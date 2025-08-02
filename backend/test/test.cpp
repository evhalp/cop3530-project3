#include <catch2/catch_test_macros.hpp>
#include <iostream>
#include <filesystem>

#include "../include/AdjacencyList.h"
#include "../include/Dijkstra.h"
#include "../include/AStar.h"

AdjacencyList adj_list;
Dijkstra dijkstra(&adj_list);
AStar astar(&adj_list);

TEST_CASE("Single-Edge Search Dijkstra", "[dijkstra]") {
  adj_list.LoadFromCSV("../data/subway_travel_times.csv");
  dijkstra.SetCompositeKey({"August", "early_morning", "Saturday"});
  Station start_station{"Greenpoint Av", {40.731352, -73.954449}};
  Station end_station{"Nassau Av", {40.724635, -73.951277}};

  auto quickest_path = dijkstra.GetQuickestPath(start_station, end_station);
  std::pair<double, std::vector<Station>> expected_output{1.37, std::vector<Station>{start_station, end_station}};
  REQUIRE(quickest_path.first == expected_output.first);
  REQUIRE(quickest_path.second == expected_output.second);
}

TEST_CASE("Single-Edge Search A*", "[astar]") {
  adj_list.LoadFromCSV("../data/subway_travel_times.csv");
  astar.SetCompositeKey({"August", "early_morning", "Saturday"});
  Station start_station{"Greenpoint Av", {40.731352, -73.954449}};
  Station end_station{"Nassau Av", {40.724635, -73.951277}};

  auto quickest_path = astar.GetQuickestPath(start_station, end_station);
  std::pair<double, std::vector<Station>> expected_output{1.37, std::vector<Station>{start_station, end_station}};
  REQUIRE(quickest_path.first == expected_output.first);
  REQUIRE(quickest_path.second == expected_output.second);
}