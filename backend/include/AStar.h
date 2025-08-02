#pragma once

#include "AdjacencyList.h"
#include <queue>
#include <unordered_map>
#include <vector>
#include <cmath>
#include <limits>

using namespace std;

class AStar {
public:
    // Result: pair of <path as station IDs, total travel time>
    static pair<double, vector<int>> FindPath(const AdjacencyList& graph, const unordered_map<int, vector<Edge>>& adj_list,
        int start_id, int goal_id);

private:
    struct Node {
        int station_id;
        double g_cost; // Cost from start to current node
        double f_cost; // g + heuristic

        bool operator>(const Node& other) const {
            return f_cost > other.f_cost;
        }
    };

    static double Heuristic(const Station& a, const Station& b);
};



