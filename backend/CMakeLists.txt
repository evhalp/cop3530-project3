cmake_minimum_required(VERSION 3.10)
project(SubwayRouteFinder)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# No external packages needed - using single-header libraries

# Include directories
include_directories(include)

# Add source files
set(SOURCES
    src/AdjacencyList.cpp
    src/Dijkstra.cpp
    src/AStar.cpp
    src/http_server.cpp
)

# Create executable
add_executable(subway_server ${SOURCES})

# You'll need to install these dependencies:
# 1. cpp-httplib: https://github.com/yhirose/cpp-httplib
# 2. nlohmann/json: https://github.com/nlohmann/json

# For now, we'll assume they're installed system-wide
# If you need to install them manually, you can download the single-header versions:
# - httplib.h: https://github.com/yhirose/cpp-httplib/blob/master/httplib.h
# - json.hpp: https://github.com/nlohmann/json/blob/develop/single_include/nlohmann/json.hpp

# Place these files in the include directory or specify their paths here
# target_include_directories(subway_server PRIVATE /path/to/httplib /path/to/json)

# Compiler flags (MSVC compatible)
if(MSVC)
    target_compile_options(subway_server PRIVATE /W3)
else()
    target_compile_options(subway_server PRIVATE -Wall -Wextra)
endif()

# Link libraries (if needed)
# target_link_libraries(subway_server PRIVATE pthread) 