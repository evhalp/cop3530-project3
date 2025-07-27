#include <iostream>
#include "../include/AdjacencyList.h"

int AdjacencyList::AddStation(const Station& station) {
  // Check if station already exists
  auto it = station_to_id_.find(station);
  if (it != station_to_id_.end()) {
    return it->second;  // Return existing ID
  }

  // Add station to bidirectional maps with next available ID
  const int new_id = station_count_++;
  station_to_id_[station] = new_id;

  return new_id;
}

void AdjacencyList::AddEdge(const std::array<std::string, 3>& composite_key,
            const Station& start_station, const Station& end_station, double travel_time) {

  // Auto-add stations if they don't exist and get start ID
  const int start_id = AddStation(start_station);
  AddStation(end_station);

  // Create Edge
  const Edge edge{start_station, end_station, travel_time};

  // Add Edge to adjacency list
  adj_list_[composite_key][start_id].push_back(edge);
}

void AdjacencyList::LoadFromCSV(const std::string& file_path) {
  // Open file_path using ifstream
  // For each line in the CSV (skipping the first)
    // Used getline and stringstream to get the text before a comma for each value in the line
    // Store those values into variables
    // Create Stations using "Station start_station{station_name, {start_lat, start_long}};" etc.
    // Create Composite Key using "std::array<std::string, 3> composite_key{month, time_of_day, day_of_week};"
    // Create Edge using "AddEdge(composite_key, start_station, end_station, travel_time);"
}

Station* AdjacencyList::GetStation(int station_id) {
  // Temporary return statement
  return new Station;
}

int AdjacencyList::GetStationId(const Station& station) {
  // Temporary return statement
  return 0;
}

std::unordered_map<int, std::vector<Edge>>*
  AdjacencyList::GetAdjacencyList(const std::array<std::string, 3>& composite_key) {
  // Temporary return statement
  return new std::unordered_map<int, std::vector<Edge>>;
}
