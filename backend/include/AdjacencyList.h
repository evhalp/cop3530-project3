#pragma once

#include <array>
#include <string>
#include <vector>
#include <unordered_map>

struct Station {
    std::string station_name;
    std::pair<double, double> coordinates;
};

struct Edge {
    std::string start_station;
    std::string end_station;
    double travel_time;
};

struct ArrayHash {
    std::size_t operator()(const std::array<std::string, 3>& arr) const {
        const auto month = std::hash<std::string>{}(arr[0]);
        const auto time_of_day = std::hash<std::string>{}(arr[1]);
        const auto day_of_week = std::hash<std::string>{}(arr[2]);
        // Bitwise X-OR Hash
        // https://www.geeksforgeeks.org/cpp/implement-custom-hash-functions-for-user-defined-types-in-std-unordered_map
        return month ^ (time_of_day << 1) ^ (day_of_week << 2);
    }
};

class AdjacencyList {
    private:

        // Bidirectionally map station IDs to stations
        std::unordered_map<int, Station> id_to_station_;
        std::unordered_map<std::string, int> station_to_id_;

        // Store multiple different adjacency lists mapped by a composite key containing month, day, and time of day
        std::unordered_map<std::array<std::string, 3>, std::unordered_map<int, std::vector<Edge>>, ArrayHash> adj_list_;

        int station_count_;

    public:

        AdjacencyList() : station_count_(0) {};

        void AddStation(const std::string& station_name, double lat, double lon);
        void AddEdge(const std::string& month, const std::string& time_of_day, const std::string& day_of_week,
            const std::string& start_station, const std::string& end_station, double travel_time);
        void LoadFromCSV(const std::string& filename);

        Station* GetStation(int station_id);
        int GetStationId(const std::string& station_name);
        std::unordered_map<int, std::vector<Edge>>* GetAdjacencyList(std::string month,
            std::string time_of_day, std::string day_of_week);
        int GetStationCount() const { return station_count_; }

};
