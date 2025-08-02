#pragma once

#include <array>
#include <string>
#include <vector>
#include <unordered_map>

struct Station {
    std::string station_name;
    std::pair<double, double> coordinates;

    bool operator==(const Station& other) const {
        return station_name == other.station_name && coordinates == other.coordinates;
    }
};

struct Edge {
    Station start_station;
    Station end_station;
    double travel_time{};

    bool operator==(const Edge& other) const {
        return start_station == other.start_station &&
               end_station == other.end_station &&
               travel_time == other.travel_time;
    }
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

struct StationHash {
    std::size_t operator()(const Station& station) const {
        const auto station_name = std::hash<std::string>{}(station.station_name);
        const auto latitude = std::hash<double>{}(station.coordinates.first);
        const auto longitude = std::hash<double>{}(station.coordinates.second);
        // Bitwise X-OR Hash
        // https://www.geeksforgeeks.org/cpp/implement-custom-hash-functions-for-user-defined-types-in-std-unordered_map
        return station_name ^ (latitude << 1) ^ (longitude << 2);
    }
};

class AdjacencyList {
    private:

        // Bidirectionally map station IDs to stations
        std::unordered_map<int, Station> id_to_station_;
        std::unordered_map<Station, int, StationHash> station_to_id_;

        // Convert between station name and station for frontend
        std::unordered_map<std::string, Station> name_to_station_;

        // Store multiple different adjacency lists mapped by a composite key containing month, day, and time of day
        std::unordered_map<std::array<std::string, 3>, std::unordered_map<int, std::vector<Edge>>, ArrayHash> adj_list_;

        int station_count_;

        // Helper function for AddEdge
        // Adds station to bidirectional maps. Returns the new ID for the added station
        int AddStation(const Station &station);
        // Helper function for LoadFromCSV
        // Creates provided stations and adds an edge between the two into the adjacency list matching the composite key
        void AddEdge(const std::array<std::string, 3>& composite_key,
            const Station& start_station, const Station& end_station, double travel_time);

    public:



        explicit AdjacencyList() : station_count_(0) {};

        // Populates adjacency_list using the given file path
        void LoadFromCSV(const std::string& file_path);

        const Station* GetStation(int station_id) const;
        const Station* GetStation(const std::string &name) const;
        const int GetStationId(const Station& station) const;
        const int GetStationCount() const { return station_count_; }

        // Accessor function to allow AStar and Dijkstra access to the adjacency list.
        std::unordered_map<int, std::vector<Edge>>* GetAdjacencyList(const std::array<std::string, 3>& composite_key);

};
