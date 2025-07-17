#catch2 local install source: https://github.com/catchorg/Catch2/issues/1383#issuecomment-421548807
cd
git clone https://github.com/catchorg/Catch2.git
cd Catch2

#note that catch needs to be compiled against C++17, see here: https://stackoverflow.com/questions/66227246/catch2-undefined-reference-to-catchstringmaker
cmake -Bbuild -H. -DBUILD_TESTING=OFF -DCMAKE_CXX_STANDARD=17
sudo cmake --build build/ --target install 