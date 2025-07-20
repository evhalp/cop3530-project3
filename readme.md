# Subway Route Finder

## Dependencies

- **External Libraries:** Are there any external libraries we need to implement?
- **Local Development Library:** Which local dev library are we using?

## Input / Output

- **Input:**  
  `[start_station_name, end_station_name, month, day, time]`

- **Output:**  
  `[Edge1, Edge2, ...]`

## Current Data Structure Ideas

```cpp
struct Station {
    string station_name;
    pair<double, double> coordinates;
};

struct Edge {
    string start_station;
    string end_station;
    map<array<int, 3>, double> time_map;  // [month, day, time] → avg_time
};

// Adjacency list format
unordered_map<string, vector<Edge>> adj_list;

```

## Link to my notes for frontend dev stuff :) :
https://docs.google.com/document/d/1DLw_PSLIfAsIRHR22YOWzyK55wgtM4HXomyMnlujVLc/edit?usp=sharing 
