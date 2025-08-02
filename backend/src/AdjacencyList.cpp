#include <fstream>
#include <sstream>
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
  id_to_station_[new_id] = station;

  // Add station to name to station map
  name_to_station_[station.station_name] = station;

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
    std::ifstream file(file_path);
    if (!file.is_open()) {
        std::cerr << "Error opening file: " << file_path << std::endl;
        return;
    }

    std::string line;
    std::getline(file, line); // Skip header

    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string token;

        std::string month, time_of_day, day_of_week;
        std::string start_name, end_name;
        double start_lat, start_lon, end_lat, end_lon, avg_time;

        // Parse each field
        std::getline(ss, month, ',');
        std::getline(ss, time_of_day, ',');
        std::getline(ss, day_of_week, ',');

        std::getline(ss, start_name, ',');

        std::getline(ss, token, ',');
        start_lat = std::stod(token);

        std::getline(ss, token, ',');
        start_lon = std::stod(token);

        std::getline(ss, end_name, ',');

        std::getline(ss, token, ',');
        end_lat = std::stod(token);

        std::getline(ss, token, ',');
        end_lon = std::stod(token);

        std::getline(ss, token, ',');
        avg_time = std::stod(token);

        // Create station structs
        Station start_station{start_name, {start_lat, start_lon}};
        Station end_station{end_name, {end_lat, end_lon}};

        // Build time-based key
        std::array<std::string, 3> composite_key{month, time_of_day, day_of_week};

        // Add edge (auto-adds stations too)
        AddEdge(composite_key, start_station, end_station, avg_time);

    }
}

const Station* AdjacencyList::GetStation(int station_id) const {
    auto it = id_to_station_.find(station_id);
    if (it != id_to_station_.end()) {
        return &(it->second);
    }
    return nullptr;
}

const Station* AdjacencyList::GetStation(const std::string &name) const {
    auto it = name_to_station_.find(name);
    if (it != name_to_station_.end()) {
        return &(it->second);
    }
    return nullptr;
}

const int AdjacencyList::GetStationId(const Station& station) const {
    auto it = station_to_id_.find(station);
    if (it != station_to_id_.end()) {
        return it->second;
    }
    return -1; // Not found
}

std::unordered_map<int, std::vector<Edge>>* AdjacencyList::GetAdjacencyList(const std::array<std::string, 3>& composite_key) {
    auto it = adj_list_.find(composite_key);
    if (it != adj_list_.end()) {
        return &(it->second);
    }
    return nullptr;
}
