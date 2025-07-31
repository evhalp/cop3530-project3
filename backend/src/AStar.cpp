#include "astar.h"
#include <algorithm> // for reverse

using namespace std;

pair<vector<int>, double> AStarSearch::FindPath(const AdjacencyList& graph, const unordered_map<int, vector<Edge>>& adj_list,
        int start_id, int goal_id) {

        priority_queue<Node, vector<Node>, greater<Node>> open_set;
        unordered_map<int, double> g_cost;
        unordered_map<int, int> came_from;

        g_cost[start_id] = 0.0;

        // h(start): heuristic estimate from start to goal
        double h_start = Heuristic(*graph.GetStation(start_id), *graph.GetStation(goal_id));//check open_set
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

    static double AStarSearch::Heuristic(const Station& a, const Station& b) {//just the pythag of the coordinates of each station passed
        double dx = a.coordinates.first - b.coordinates.first;
        double dy = a.coordinates.second - b.coordinates.second;
        double distance = sqrt(dx * dx + dy * dy); // in degrees

        double time_minutes = distance * 111.0/ 30.0* 60.0;           // degrees to km to hours to minutes

        return time_minutes;
    }