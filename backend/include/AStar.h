#pragma once

#include "AdjacencyList.h"
#include <queue>
#include <unordered_map>
#include <vector>
#include <cmath>
#include <limits>

using namespace std;

class AStarSearch {
public:
    // Result: pair of <path as station IDs, total travel time>
    static pair<vector<int>, double> FindPath(const AdjacencyList& graph, const unordered_map<int, vector<Edge>>& adj_list,
        int start_id,int goal_id);

private:
    struct Node {
        int station_id;
        double g_cost; // Cost from start to current node
        double f_cost; // g + heuristic

        bool operator>(const Node& other) const {
            return f_cost > other.f_cost;
        }
    };

    

    pair<vector<int>, double> AStarSearch::FindPath(const AdjacencyList& graph, const unordered_map<int, vector<Edge>>& adj_list,
        int start_id, int goal_id) {

        priority_queue<Node, vector<Node>, greater<Node>> open_set;
        unordered_map<int, double> g_cost;
        unordered_map<int, int> came_from;

        g_cost[start_id] = 0.0;

        // h(start): heuristic estimate from start to goal
        double h_start = Heuristic(*graph.GetStation(start_id), *graph.GetStation(goal_id));
        open_set.push({start_id, 0.0, h_start}); // f(start) = g(start) + h(start) = 0 + h

        while (!open_set.empty()) {
            Node current = open_set.top();
            open_set.pop();

            if (current.station_id == goal_id) {
                // Reconstruct path
                vector<int> path;
                int node = goal_id;
                while (came_from.find(node) != came_from.end()) {
                    path.push_back(node);
                    node = came_from[node];
                }
                path.push_back(start_id);
                reverse(path.begin(), path.end());
                return {path, g_cost[goal_id]};
            }

            for (const Edge& edge : adj_list.at(current.station_id)) {
                int neighbor_id = graph.GetStationId(edge.end_station);

                // g(n): current path cost from start to neighbor
                double tentative_g = g_cost[current.station_id] + edge.travel_time;

                if (!g_cost.count(neighbor_id) || tentative_g < g_cost[neighbor_id]) {
                    g_cost[neighbor_id] = tentative_g;

                    // h(n): heuristic estimate from neighbor to goal
                    double h = Heuristic(*graph.GetStation(neighbor_id), *graph.GetStation(goal_id));

                    // f(n) = g(n) + h(n)
                    double f = tentative_g + h;

                    open_set.push({neighbor_id, tentative_g, f});
                    came_from[neighbor_id] = current.station_id;
                }
            }
        }

        return {{}, -1.0}; // No path found
    }

    static double Heuristic(const Station& a, const Station& b) {//just the pythag of the coordinates of each station passed
        double dx = a.coordinates.first - b.coordinates.first;
        double dy = a.coordinates.second - b.coordinates.second;
        return sqrt(dx * dx + dy * dy);
    }

};



