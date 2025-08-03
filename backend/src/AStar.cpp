#include "../include/AStar.h"
#include <algorithm>

using namespace std;

unordered_map<int, vector<Edge>>* AStar::GetAdjacencyList() const {
    return adj_lists_->GetAdjacencyList(composite_key_);
}

void AStar::SetCompositeKey(const array<string, 3>& key) {
    composite_key_ = key;
    adj_list_ = adj_lists_->GetAdjacencyList(key);
}

//euclidian distance 
double AStar::Heuristic(const Station& a, const Station& b) const {
    double dx = a.coordinates.first - b.coordinates.first;
    double dy = a.coordinates.second - b.coordinates.second;
    double distance = sqrt(dx * dx + dy * dy); // in degrees
    return distance * 111.0 / 28.0 * 60.0; // estimate in minutes
}

//uses the map to get path from start id to finish id
vector<Station> AStar::ReconstructPath(unordered_map<int, int>& predecessors, int start_id, int end_id) const {
    vector<int> path_ids;

    if (predecessors.find(end_id) == predecessors.end() && start_id != end_id) {
        return {};
    }

    int node = end_id;
    while (predecessors.find(node) != predecessors.end()) {
        path_ids.push_back(node);
        node = predecessors[node];
    }
    path_ids.push_back(start_id);
    reverse(path_ids.begin(), path_ids.end());

    //id to station object
    vector<Station> path;
     int prev_id = -1;
    for (int id : path_ids) {
        if (id != prev_id) {
            const Station* s = adj_lists_->GetStation(id);
            if (s) path.push_back(*s);
            prev_id = id;
        }
    }
    return path;
}

//same as the original findpath, gets hitorical data and heuristic
pair<double, vector<Station>> AStar::GetQuickestPath(const Station& start_station, const Station& end_station) {
    if (!adj_list_) return {-1.0, {}};

    //initialization of id, and search structures
    int start_id = adj_lists_->GetStationId(start_station);
    int end_id = adj_lists_->GetStationId(end_station);

    if (start_id == -1 || end_id == -1) {
        return {-1.0, {}};
    }

    priority_queue<Node, vector<Node>, greater<Node>> open_set;
    unordered_map<int, double> g_cost;
    unordered_map<int, int> came_from;

    g_cost[start_id] = 0.0;

    const Station* goal_ptr = adj_lists_->GetStation(end_id);
    double h_start = Heuristic(start_station, *goal_ptr);
    open_set.push({start_id, 0.0, h_start});

    //A* logic
    while (!open_set.empty()) {
        Node current = open_set.top();
        open_set.pop();
        //final loop
        if (current.station_id == end_id) {
            return {g_cost[end_id], ReconstructPath(came_from, start_id, end_id)};
        }
            //checks the neighboring nodes
        for (const Edge& edge : (*adj_list_)[current.station_id]) {
            int neighbor_id = adj_lists_->GetStationId(edge.end_station);
            double tentative_g = g_cost[current.station_id] + edge.travel_time;

            //compares the neighbor node time to best
            if (!g_cost.count(neighbor_id) || tentative_g < g_cost[neighbor_id]) {
                g_cost[neighbor_id] = tentative_g;
                
                const Station* neighbor_station = adj_lists_->GetStation(neighbor_id);
                double h = Heuristic(*neighbor_station, *goal_ptr);
                double f = tentative_g + h; //combines the historical and heuristic 

                open_set.push({neighbor_id, tentative_g, f});
                came_from[neighbor_id] = current.station_id;
            }
        }
    }

    return {-1.0, {}};
}
