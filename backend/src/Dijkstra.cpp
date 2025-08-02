#include "../include/Dijkstra.h"  // Assuming the header file is named Dijkstra.h
#include <limits>
#include <algorithm>
#include <functional>

// Private helper function implementations

std::unordered_map<int, std::vector<Edge>>* Dijkstra::GetAdjacencyList() const {
    return adj_lists_->GetAdjacencyList(composite_key_);
}

void Dijkstra::relaxEdge(int from_id, int to_id, double edge_weight,
                        std::unordered_map<int, double>& times,
                        std::unordered_map<int, int>& predecessors,
                        std::priority_queue<Node, std::vector<Node>, std::greater<>>& pq) {
  // Code from Graphs 2 Study Guide
  // Calculate the new time to go from from_id to to_id
  double new_time = times[from_id] + edge_weight;

  // If the new_time is quicker than the quickest found time, update the time
  if (new_time < times[to_id]) {
    times[to_id] = new_time;
    predecessors[to_id] = from_id;

    // Add the updated node to priority queue
    pq.emplace(to_id, new_time);
  }

}

std::vector<Edge> Dijkstra::GetPath(std::unordered_map<int, int> predecessors,
                                    int start_id, int end_id) const {

  std::vector<Edge> path;

  // If there's no path to the destination, return an empty path
  if (predecessors.find(end_id) == predecessors.end() && start_id != end_id) {
    return path;
  }

  // Reconstruct path from end to start using predecessors
  std::vector<int> station_path;
  int curr_id = end_id;
  while (curr_id != start_id) {
    station_path.push_back(curr_id);
    curr_id = predecessors[curr_id];
  }
  station_path.push_back(start_id);

  // Reverse to get path from start to end
  std::reverse(station_path.begin(), station_path.end());

  // Convert station IDs to Edge objects
  auto* adj_list = GetAdjacencyList();

  for (int i = 0; i < static_cast<int>(station_path.size()) - 1; ++i) {
    int from_station_id = station_path[i];
    int to_station_id = station_path[i + 1];

    // Find the edge between these stations
    if (adj_list->find(from_station_id) != adj_list->end()) {
      for (const auto& edge : (*adj_list)[from_station_id]) {
        // Check if this edge goes to the target station
        int edge_end_id = adj_lists_->GetStationId(edge.end_station);
        if (edge_end_id == to_station_id) {
          path.push_back(edge);
          break;
        }
      }
    }
  }

  return path;
}

std::pair<double, std::vector<Edge>> Dijkstra::GetQuickestPath(const Station& start_station,
                                                              const Station& end_station) {
  // Get the adjacency list for current composite key
  auto* adj_list = GetAdjacencyList();

  // Get station IDs
  int start_id = adj_lists_->GetStationId(start_station);
  int end_id = adj_lists_->GetStationId(end_station);

  // If the stations do not exist, return sentinel value
  if (start_id == -1 || end_id == -1) {
    return {std::numeric_limits<double>::infinity(), std::vector<Edge>()};
  }

  // Initialize data structures for Dijkstra's algorithm
  std::unordered_map<int, double> times;
  std::unordered_map<int, int> predecessors;
  std::priority_queue<Node, std::vector<Node>, std::greater<>> pq;

  // Initialize all times to infinity
  for (const auto& pair : *adj_list) {
    times[pair.first] = std::numeric_limits<double>::infinity();
  }
  // Set start station time to 0
  times[start_id] = 0.0;
  pq.emplace(start_id, 0.0);

  // Run Dijkstra search to find the quickest path
  // Algorithm from Dijkstra slides
  while (!pq.empty()) {
    Node curr = pq.top();
    pq.pop();

    int curr_id = curr.station_id;
    double curr_time = curr.travel_time;

    // Skip this loop if there's already a quicker path to this station
    if (curr_time > times[curr_id]) {
      continue;
    }

    // Stop searching if found the end station
    if (curr_id == end_id) {
      break;
    }

    // Check all neighbors of current station
    if (adj_list->find(curr_id) != adj_list->end()) {
      for (const auto& edge : (*adj_list)[curr_id]) {
        int to_id = adj_lists_->GetStationId(edge.end_station);
        double edge_weight = edge.travel_time;

        relaxEdge(curr_id, to_id, edge_weight, times, predecessors, pq);
      }
    }
  }

  // Return the quickest time and the path to get to the end
  return {times[end_id], GetPath(predecessors, start_id, end_id)};
}
