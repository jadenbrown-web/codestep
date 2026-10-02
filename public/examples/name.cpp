#include <iostream>
#include <string>

int main() {
  std::cout << "What is your name?";
  std::string name;
  std::getline(std::cin, name);
  std::cout << "Hello " << name << "\n";
}
