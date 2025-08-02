// Added Windows compatibility defines to prevent symbol conflicts
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <iostream>
#include <string>
#include "json.hpp"
#include "../include/AdjacencyList.h"
#include "../include/Dijkstra.h"
#include "../include/AStar.h"

// Include the HTTP library (you'll need to install cpp-httplib)
#include "httplib.h"

using json = nlohmann::json;
using namespace std;

// Global variables for the graph and algorithms
AdjacencyList* global_adj_list = nullptr;
Dijkstra* global_dijkstra = nullptr;

// Helper function to convert time string to time_of_day category
string timeToCategory(const string& time) {
    int hour = stoi(time.substr(0, 2));
    if (hour >= 5 && hour < 9) return "morning_rush";
    if (hour >= 9 && hour < 16) return "midday";
    if (hour >= 16 && hour < 20) return "evening_rush";
    return "late_night";
}

// Helper function to convert day number to day name
string dayNumberToName(int day) {
    switch(day) {
        case 1: return "Monday";
        case 2: return "Tuesday";
        case 3: return "Wednesday";
        case 4: return "Thursday";
        case 5: return "Friday";
        case 6: return "Saturday";
        case 7: return "Sunday";
        default: return "Monday";
    }
}

int main() {
    // Initialize the graph and load data
    cout << "Loading subway data..." << endl;
    global_adj_list = new AdjacencyList();
    // Fixed: Correct path from backend/build/Debug/ to data/subway_travel_times.csv
    global_adj_list->LoadFromCSV("../../../data/subway_travel_times.csv");
    
    // Initialize Dijkstra algorithm
    global_dijkstra = new Dijkstra(global_adj_list);
    
    cout << "Data loaded successfully!" << endl;
    
    // Debug: Print some loaded stations
    cout << "Debug: Checking loaded stations..." << endl;
    // Use actual coordinates from CSV: 1 Av (40.730953,-73.981628), 3 Av (40.732849,-73.986122)
    Station test_station1{"1 Av", {40.730953, -73.981628}};
    Station test_station2{"3 Av", {40.732849, -73.986122}};
    int id1 = global_adj_list->GetStationId(test_station1);
    int id2 = global_adj_list->GetStationId(test_station2);
    cout << "Debug: '1 Av' ID: " << id1 << ", '3 Av' ID: " << id2 << endl;
    cout << "Starting HTTP server on port 8080..." << endl;

    // Create HTTP server
    httplib::Server svr;

    // Add CORS headers to all responses
    svr.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Methods", "GET, POST, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type"}
    });

    // Handle preflight OPTIONS requests
    svr.Options("/(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 200;
    });

    // Health check endpoint
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        json response = {
            {"status", "ok"},
            {"timestamp", "2024-01-15T10:30:00Z"}
        };
        res.set_content(response.dump(), "application/json");
    });

    // Route finding endpoint
    svr.Post("/api/find-route", [](const httplib::Request& req, httplib::Response& res) {
        try {
            // Parse JSON request
            json request = json::parse(req.body);
            
            // Extract parameters
            string start_station = request["start_station"];
            string end_station = request["end_station"];
            int month = request["month"];
            int day = request["day"];
            string time = request["time"];
            
            // Convert parameters to the format expected by the algorithms
            string time_category = timeToCategory(time);
            string day_name = dayNumberToName(day);
            string month_name = to_string(month);
            
            // Create composite key for time-based routing
            array<string, 3> composite_key = {month_name, time_category, day_name};
            global_dijkstra->SetCompositeKey(composite_key);
            
            // Get stations by name (more robust for web app)
            const Station* start_station_ptr = global_adj_list->GetStationByName(start_station);
            const Station* end_station_ptr = global_adj_list->GetStationByName(end_station);
            
            if (!start_station_ptr || !end_station_ptr) {
                json error_response = {
                    {"error", "Station not found"},
                    {"message", "One or both stations do not exist in the system"}
                };
                res.status = 400;
                res.set_content(error_response.dump(), "application/json");
                return;
            }
            
            // Get station IDs (should always succeed since we found the stations)
            int start_id = global_adj_list->GetStationId(*start_station_ptr);
            int end_id = global_adj_list->GetStationId(*end_station_ptr);
            
            // Fixed: Use const pointers to match GetStation's const return type
            const Station* start_station_ptr = global_adj_list->GetStation(start_id);
            const Station* end_station_ptr = global_adj_list->GetStation(end_id);
            
            // Find route using both Dijkstra and A* algorithms
            auto dijkstra_result = global_dijkstra->GetQuickestPath(*start_station_ptr, *end_station_ptr);
            double dijkstra_time = dijkstra_result.first;
            vector<Edge> dijkstra_path = dijkstra_result.second;
            
            // Create A* instance and find path
            AStarSearch astar;
            auto astar_result = astar.FindPath(*global_adj_list, *global_adj_list->GetAdjacencyList(composite_key), start_id, end_id);
            double astar_time = astar_result.second;
            vector<int> astar_path_ids = astar_result.first;
            
            // Choose the faster algorithm
            bool use_dijkstra = (dijkstra_time <= astar_time || astar_time < 0);
            double total_time = use_dijkstra ? dijkstra_time : astar_time;
            
            // Debug: Log which algorithm was faster
            cout << "Debug: Dijkstra time: " << dijkstra_time << " min, A* time: " << astar_time << " min" << endl;
            cout << "Debug: Using " << (use_dijkstra ? "Dijkstra" : "A*") << " algorithm" << endl;
            vector<Edge> path_edges = use_dijkstra ? dijkstra_path : vector<Edge>(); // A* returns IDs, not edges
            
            // Convert A* path IDs to station names if using A*
            vector<string> route_stations;
            if (use_dijkstra) {
                // Use Dijkstra result (already has edges)
                if (!path_edges.empty()) {
                    route_stations.push_back(path_edges[0].start_station.station_name);
                    for (const auto& edge : path_edges) {
                        route_stations.push_back(edge.end_station.station_name);
                    }
                }
            } else {
                // Use A* result (convert IDs to station names)
                for (int id : astar_path_ids) {
                    const Station* station = global_adj_list->GetStation(id);
                    if (station) {
                        route_stations.push_back(station->station_name);
                    }
                }
            }
            
            // Convert edges to station names for the response (Dijkstra case)
            if (use_dijkstra && !path_edges.empty()) {
                route_stations.push_back(path_edges[0].start_station.station_name);
                for (const auto& edge : path_edges) {
                    route_stations.push_back(edge.end_station.station_name);
                }
            }
            
            // Create response
            json response = {
                {"route", route_stations},
                {"estimated_time_minutes", total_time}
            };
            
            res.set_content(response.dump(), "application/json");
            
        } catch (const json::exception&) {
            json error_response = {
                {"error", "Invalid JSON"},
                {"message", "Request body must be valid JSON"}
            };
            res.status = 400;
            res.set_content(error_response.dump(), "application/json");
        } catch (const exception&) {
            json error_response = {
                {"error", "Internal server error"},
                {"message", "An unexpected error occurred"}
            };
            res.status = 500;
            res.set_content(error_response.dump(), "application/json");
        }
    });

    // Start the server
    if (!svr.listen("localhost", 8080)) {
        cerr << "Failed to start server!" << endl;
        return 1;
    }

    return 0;
} 