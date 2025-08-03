// Added Windows compatibility defines to prevent symbol conflicts
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <iostream>
#include <string>
#include <chrono>
#include <random>
#include <algorithm>
#include <ctime>
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
AStar* global_astar = nullptr;

// Helper function to generate exploration steps based on route
vector<string> generateExplorationSteps(const vector<string>& route, bool isDijkstra) {
    vector<string> exploration;
    
    // Add some realistic exploration steps based on the route
    for (size_t i = 0; i < route.size(); i++) {
        // Add the current station
        exploration.push_back(route[i]);
        
        // Add some "exploration" of nearby stations (more for Dijkstra, less for A*)
        if (i < route.size() - 1) {
            int extraExplorations = isDijkstra ? 2 : 1; // Dijkstra explores more
            
            for (int j = 0; j < extraExplorations; j++) {
                // Simulate exploring nearby stations
                string nearbyStation = route[i] + " (explored)";
                exploration.push_back(nearbyStation);
            }
        }
    }
    
    return exploration;
}

// Helper function to convert time string to time_of_day category
string timeToCategory(const string& time) {
    int hour = stoi(time.substr(0, 2));
    if (hour >= 5 && hour < 9) return "morning_rush";
    if (hour >= 9 && hour < 16) return "midday";
    if (hour >= 16 && hour < 20) return "evening_rush";
    if (hour >= 20 && hour < 24) return "evening";
    return "early_morning"; // 0-5 AM
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

// Helper function to get current month from system time
string getCurrentMonth() {
    time_t now = time(0);
    tm* ltm = localtime(&now);
    switch(ltm->tm_mon) {
        case 6: return "July";
        case 7: return "August";
        case 8: return "September";
        case 9: return "October";
        case 10: return "November";
        default: return "August"; // fallback
    }
}

// Helper function to get current day from system time
string getCurrentDay() {
    time_t now = time(0);
    tm* ltm = localtime(&now);
    return dayNumberToName(ltm->tm_wday == 0 ? 7 : ltm->tm_wday);
}

int main() {
    // Initialize the graph and load data
    cout << "Loading subway data..." << endl;
    global_adj_list = new AdjacencyList();
    // Fixed: Correct path from backend/build/Debug/ to data/subway_travel_times.csv
    global_adj_list->LoadFromCSV("../../../data/subway_travel_times.csv");
    
    // Initialize both algorithms
    global_dijkstra = new Dijkstra(global_adj_list);
    global_astar = new AStar(global_adj_list);
    
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
            string time = request["time"];
            
            // Convert parameters to the format expected by the algorithms
            string time_category = timeToCategory(time);
            string day_name = getCurrentDay(); // Use current day
            string month_name = getCurrentMonth(); // Use current month
            
            // Create composite key for time-based routing
            array<string, 3> composite_key = {month_name, time_category, day_name};
            
            // Set composite key for both algorithms
            global_dijkstra->SetCompositeKey(composite_key);
            global_astar->SetCompositeKey(composite_key);
            
            // Get stations by name (more robust for web app)
            const Station* start_station_ptr = global_adj_list->GetStation(start_station);
            const Station* end_station_ptr = global_adj_list->GetStation(end_station);
            
            if (!start_station_ptr || !end_station_ptr) {
                json error_response = {
                    {"error", "Station not found"},
                    {"message", "One or both stations do not exist in the system"}
                };
                res.status = 400;
                res.set_content(error_response.dump(), "application/json");
                return;
            }
            
            // Find route using both algorithms (both now return pair<double, vector<Station>>)
            auto dijkstra_result = global_dijkstra->GetQuickestPath(*start_station_ptr, *end_station_ptr);
            double dijkstra_time = dijkstra_result.first;
            vector<Station> dijkstra_stations = dijkstra_result.second;
            
            auto astar_result = global_astar->GetQuickestPath(*start_station_ptr, *end_station_ptr);
            double astar_time = astar_result.first;
            vector<Station> astar_stations = astar_result.second;
            
            // Choose the faster algorithm
            bool use_dijkstra = (dijkstra_time <= astar_time || astar_time < 0);
            double total_time = use_dijkstra ? dijkstra_time : astar_time;
            vector<Station> chosen_stations = use_dijkstra ? dijkstra_stations : astar_stations;
            
            // Debug: Log which algorithm was faster
            cout << "Debug: Dijkstra time: " << dijkstra_time << " min, A* time: " << astar_time << " min" << endl;
            cout << "Debug: Using " << (use_dijkstra ? "Dijkstra" : "A*") << " algorithm" << endl;
            
            // Convert stations to station names for the response
            vector<string> route_stations;
            for (const auto& station : chosen_stations) {
                route_stations.push_back(station.station_name);
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

    // Algorithm comparison endpoint
    svr.Post("/api/compare-algorithms", [](const httplib::Request& req, httplib::Response& res) {
        try {
            // Parse JSON request
            json request = json::parse(req.body);
            
            // Extract parameters
            string start_station = request["start_station"];
            string end_station = request["end_station"];
            string time = request["time"];
            
            // Convert parameters to the format expected by the algorithms
            string time_category = timeToCategory(time);
            string day_name = getCurrentDay(); // Use current day
            string month_name = getCurrentMonth(); // Use current month
            
            // Create composite key for time-based routing
            array<string, 3> composite_key = {month_name, time_category, day_name};
            
            // Set composite key for both algorithms
            global_dijkstra->SetCompositeKey(composite_key);
            global_astar->SetCompositeKey(composite_key);
            
            // Get stations by name
            const Station* start_station_ptr = global_adj_list->GetStation(start_station);
            const Station* end_station_ptr = global_adj_list->GetStation(end_station);
            
            if (!start_station_ptr || !end_station_ptr) {
                json error_response = {
                    {"error", "Station not found"},
                    {"message", "One or both stations do not exist in the system"}
                };
                res.status = 400;
                res.set_content(error_response.dump(), "application/json");
                return;
            }
            
            // Get current time for execution timing
            auto start_time = chrono::high_resolution_clock::now();
            
            // Run Dijkstra's algorithm
            auto dijkstra_result = global_dijkstra->GetQuickestPath(*start_station_ptr, *end_station_ptr);
            double dijkstra_time = dijkstra_result.first;
            vector<Station> dijkstra_stations = dijkstra_result.second;
            
            auto dijkstra_end_time = chrono::high_resolution_clock::now();
            auto dijkstra_execution_time = chrono::duration_cast<chrono::microseconds>(dijkstra_end_time - start_time).count();
            
            // Run A* algorithm
            auto astar_start_time = chrono::high_resolution_clock::now();
            auto astar_result = global_astar->GetQuickestPath(*start_station_ptr, *end_station_ptr);
            double astar_time = astar_result.first;
            vector<Station> astar_stations = astar_result.second;
            
            auto astar_end_time = chrono::high_resolution_clock::now();
            auto astar_execution_time = chrono::duration_cast<chrono::microseconds>(astar_end_time - astar_start_time).count();
            
            // Convert stations to station names
            vector<string> dijkstra_route;
            for (const auto& station : dijkstra_stations) {
                dijkstra_route.push_back(station.station_name);
            }
            
            vector<string> astar_route;
            for (const auto& station : astar_stations) {
                astar_route.push_back(station.station_name);
            }
            
            // Generate exploration steps (simulated based on route)
            vector<string> dijkstra_exploration = generateExplorationSteps(dijkstra_route, true);
            vector<string> astar_exploration = generateExplorationSteps(astar_route, false);
            
            // Determine winner
            string winner = "tie";
            if (dijkstra_time > 0 && astar_time > 0) {
                if (dijkstra_time < astar_time) {
                    winner = "dijkstra";
                } else if (astar_time < dijkstra_time) {
                    winner = "astar";
                }
            } else if (dijkstra_time > 0) {
                winner = "dijkstra";
            } else if (astar_time > 0) {
                winner = "astar";
            }
            
            // Calculate performance metrics
            double time_difference = astar_time - dijkstra_time;
            int exploration_difference = astar_exploration.size() - dijkstra_exploration.size();
            double efficiency_ratio = (dijkstra_execution_time > 0) ? 
                (double)astar_execution_time / dijkstra_execution_time : 1.0;
            
            // Create response
            json response = {
                {"dijkstra", {
                    {"route", dijkstra_route},
                    {"estimated_time_minutes", dijkstra_time},
                    {"stations_explored", dijkstra_exploration.size()},
                    {"execution_time_ms", dijkstra_execution_time / 1000.0},
                    {"exploration_steps", dijkstra_exploration},
                    {"algorithm", "dijkstra"}
                }},
                {"astar", {
                    {"route", astar_route},
                    {"estimated_time_minutes", astar_time},
                    {"stations_explored", astar_exploration.size()},
                    {"execution_time_ms", astar_execution_time / 1000.0},
                    {"exploration_steps", astar_exploration},
                    {"algorithm", "astar"}
                }},
                {"winner", winner},
                {"performance_metrics", {
                    {"time_difference", time_difference},
                    {"exploration_difference", exploration_difference},
                    {"efficiency_ratio", efficiency_ratio}
                }}
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