#include <algorithm> // for reverse
#include <queue>

#include "../include/AStar.h"
using namespace std;

double AStar::Heuristic(const Station& a, const Station& b) {//just the pythag of the coordinates of each station passed
    double dx = a.coordinates.first - b.coordinates.first;
    double dy = a.coordinates.second - b.coordinates.second;
    double distance = sqrt(dx * dx + dy * dy); // in degrees

    double time_minutes = distance * 111.0/ 30.0* 60.0;           // degrees to km to hours to minutes

    return time_minutes;
}

pair<double, vector<Station>> AStar::FindPath(
    const AdjacencyList& graph,
    const unordered_map<int, vector<Edge>>& adj_list,
    int start_id,
    int goal_id) {

    priority_queue<Node, vector<Node>, greater<Node>> open_set;
    unordered_map<int, double> g_cost;
    unordered_map<int, int> came_from;

    g_cost[start_id] = 0.0;

    const Station* start_station = graph.GetStation(start_id);
    const Station* goal_station = graph.GetStation(goal_id);
    double h_start = Heuristic(*start_station, *goal_station);
    open_set.push({start_id, 0.0, h_start});

    while (!open_set.empty()) {
        Node current = open_set.top();
        open_set.pop();

        if (current.station_id == goal_id) {
            // Reconstruct path
            vector<Station> path;
            int node = goal_id;
            while (came_from.find(node) != came_from.end()) {
                const Station* s = graph.GetStation(node);
                if (s) path.push_back(*s);
                node = came_from[node];
            }
            const Station* s = graph.GetStation(start_id);
            if (s) path.push_back(*s);

            reverse(path.begin(), path.end());
            return {g_cost[goal_id], path};
        }

        for (const Edge& edge : adj_list.at(current.station_id)) {
            int neighbor_id = graph.GetStationId(edge.end_station);
            double tentative_g = g_cost[current.station_id] + edge.travel_time;

            if (!g_cost.count(neighbor_id) || tentative_g < g_cost[neighbor_id]) {
                g_cost[neighbor_id] = tentative_g;

                const Station* neighbor_station = graph.GetStation(neighbor_id);
                double h = Heuristic(*neighbor_station, *goal_station);
                double f = tentative_g + h;

                open_set.push({neighbor_id, tentative_g, f});
                came_from[neighbor_id] = current.station_id;
            }
        }
    }

    return {-1.0, {}};
}