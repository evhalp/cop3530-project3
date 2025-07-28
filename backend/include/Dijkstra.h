#pragma once

#include <queue>
#include "AdjacencyList.h"

class Dijkstra {

  private:

    struct Node {
      int station_id;
      double travel_time;

      Node(int id, double time) : station_id(id), travel_time(time) {}

      bool operator>(const Node& other) const {
        return travel_time > other.travel_time;
      }

    };

    std::array<std::string, 3> composite_key_;
    AdjacencyList* adj_lists_;

    // Returns the adjacency list keyed to the composite_key_
    std::unordered_map<int, std::vector<Edge>>* GetAdjacencyList() const;
    // Helper function for GetQuickestPath
    // Relaxes the edge between two stations
    void relaxEdge(int from_id, int to_id, double edge_weight,
                    std::unordered_map<int, double>& times,
                    std::unordered_map<int, int>& predecessors,
                    std::priority_queue<Node, std::vector<Node>, std::greater<>>& pq);
    // Helper function for GetQuickestPath
    // Uses predecessors list to get the quickest path found by Dijkstra algorithm
    std::vector<Edge> GetPath(std::unordered_map<int, int> predecessors, int start_id, int end_id) const;

  public:

    explicit Dijkstra(AdjacencyList* adj_lists)
      : composite_key_({}), adj_lists_(adj_lists) {}

    // Runs the Dijkstra Search algorithm using the stored adjacency list keyed to the composite_key_
    std::pair<double, std::vector<Edge>> GetQuickestPath(const Station& start_station, const Station& end_station);

    void SetCompositeKey(const std::array<std::string, 3>& composite_key) {composite_key_ = composite_key;}
    std::array<std::string, 3> GetCompositeKey() const { return composite_key_; }

};
