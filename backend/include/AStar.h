#pragma once

#include "AdjacencyList.h"
#include <queue>
#include <unordered_map>
#include <vector>
#include <cmath>

using namespace std;

class AStar {
private:
    struct Node {
        int station_id;
        double g_cost;
        double f_cost;

        bool operator>(const Node& other) const {
            return f_cost > other.f_cost;
        }
    };

    array<string, 3> composite_key_; //composite with month, time, week
    AdjacencyList* adj_lists_;


    
    unordered_map<int, vector<Edge>>* adj_list_; 

    unordered_map<int, vector<Edge>>* GetAdjacencyList() const;
    double Heuristic(const Station& a, const Station& b) const; //calculation from the longitude and latitude

    //same as get path from dijkstra class
    vector<Station> ReconstructPath(unordered_map<int, int>& predecessors, int start_id, int end_id) const;

public:
    explicit AStar(AdjacencyList* adj_lists)
        : composite_key_({}), adj_lists_(adj_lists), adj_list_(nullptr) {}
//gets the adj list of composite key
    void SetCompositeKey(const array<string, 3>& key);


    pair<double, vector<Station>> GetQuickestPath(const Station& start_station, const Station& end_station);
};


