"use client";

import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

type Language = "javascript" | "csharp" | "html" | "css";
type ThemeMode = "light" | "dark" | "system";
type Lesson = {
  title: string;
  eyebrow: string;
  explanation: string;
  note: string;
  prompt: string;
  starter?: string;
  answer: string;
  output: string[];
  referenceOnly?: boolean;
  referenceKind?: "text" | "fonts" | "pages" | "css";
};

const lessons: Record<Language, Lesson[]> = {
  javascript: [
    {
      eyebrow: "01 · Functions",
      title: "Make something happen",
      explanation: "A function is a named block of code. Curly braces { } group the instructions that belong to it. The code waits until you call the function.",
      note: "// Create a function named correct that prints correct",
      prompt: "Type the function, then call it on the last line.",
      answer: 'function correct() {\n  console.log("correct");\n}\n\ncorrect();',
      output: ["correct"],
    },
    {
      eyebrow: "02 · While loops",
      title: "Repeat code until you stop it",
      explanation: "while repeats the code inside its braces while its condition is true. while (true) would continue forever, so this example uses break to stop safely after count reaches three.",
      note: "// Repeat the block, then break when count reaches 3",
      prompt: "Create a while (true) loop that prints 1, 2, and 3 before stopping.",
      answer: 'let count = 1;\n\nwhile (true) {\n  console.log(count);\n\n  if (count === 3) {\n    break;\n  }\n\n  count++;\n}',
      output: ["1", "2", "3"],
    },
    {
      eyebrow: "03 · Variables",
      title: "Remember a value",
      explanation: "let creates a variable—a labelled place to keep a value. prompt asks the user a question and saves their answer.",
      note: "// Ask for a name and greet the user",
      prompt: "Create a name variable, then print Hello with a template string.",
      answer: 'let name = prompt("What is your name?");\nconsole.log(`Hello ${name}`);',
      output: ["What is your name?  →  Alex", "Hello Alex"],
    },
    {
      eyebrow: "04 · Console",
      title: "Clear the screen",
      explanation: "The console is where your text program shows its output. console.clear() removes everything currently shown there.",
      note: "// Clear all previous console output",
      prompt: "Write the single line that clears the console.",
      answer: "console.clear();",
      output: ["Console cleared."],
    },
    {
      eyebrow: "05 · Decisions",
      title: "Check an answer",
      explanation: "if checks whether a condition is true. Its braces contain the code to run when it is true; else handles everything else.",
      note: "// Check whether 1 + 1 equals 2",
      prompt: "Complete the if / else check and print the right message.",
      answer: 'let answer = prompt("What is 1 + 1?");\n\nif (answer == "2") {\n  console.log("Correct!");\n} else {\n  console.log("Incorrect! The answer is 2.");\n}',
      output: ["What is 1 + 1?  →  2", "Correct!"],
    },
    {
      eyebrow: "06 · Null values",
      title: "Mark a value as not ready yet",
      explanation: "null deliberately means that a variable has no value yet. It is different from zero or an empty string, and the variable may receive a real value later. === null checks specifically for that missing value.",
      note: "// null means there is deliberately no result yet",
      prompt: "Set result to null, then print the message for its current state.",
      answer: 'let result = null; // There is no result yet\n\nif (result === null) {\n  console.log("No result yet");\n} else {\n  console.log("Result is ready");\n}',
      output: ["No result yet"],
    },
    {
      eyebrow: "07 · Combined conditions",
      title: "Check whether a value is in a range",
      explanation: "A range needs two comparisons. >= checks the lower limit, <= checks the upper limit, and && means both conditions must be true at the same time.",
      note: "// && means AND. Both conditions must be true.",
      prompt: "Use && to check both ends of the age range.",
      starter: "let age = 16;\n\n",
      answer: 'let age = 16;\n\n// && means AND. Both conditions must be true.\nif (age >= 0 && age <= 18) {\n  console.log("Your age is between 0 and 18.");\n} else {\n  console.log("Your age is above 18.");\n}',
      output: ["Your age is between 0 and 18."],
    },
    {
      eyebrow: "08 · Arrays",
      title: "Keep a list",
      explanation: "A JavaScript list is called an array. Square brackets hold its items, and a for...of loop visits each item one at a time.",
      note: "// Store three fruits, then print each one",
      prompt: "Create the fruits array and loop through it.",
      answer: 'let fruits = ["Apple", "Banana", "Orange"];\n\nfor (let fruit of fruits) {\n  console.log(fruit);\n}',
      output: ["Apple", "Banana", "Orange"],
    },
    {
      eyebrow: "09 · Constant array",
      title: "Start an empty car list",
      explanation: "const is short for constant. Like let, it creates a named variable, but const prevents that variable from being reassigned to a different value later. Here cars must keep pointing to the same array, although .push() can still add items inside that array.",
      note: "// Create an empty list that will hold cars",
      prompt: "Create the constant cars array with no items inside it.",
      answer: "const cars = [];",
      output: ["cars  →  []", "The list currently has 0 items."],
    },
    {
      eyebrow: "10 · Add to an array",
      title: "Put a car into the list",
      explanation: "prompt collects a car name from the user. cars.push(newCar) takes that saved answer and adds it to the end of the cars array.",
      note: "// Ask for a car, then add the answer to cars",
      prompt: "Use push to add newCar to the empty cars array.",
      starter: 'const cars = [];\nconst newCar = prompt("What car do you want to add?");\n\n',
      answer: 'const cars = [];\nconst newCar = prompt("What car do you want to add?");\n\ncars.push(newCar);',
      output: ["Before: []", "What car do you want to add?  →  Ford", 'After push: ["Ford"]'],
    },
    {
      eyebrow: "11 · Print an array",
      title: "Show the finished car list",
      explanation: "console.log(cars) sends the whole array to the console. Because Ford was pushed into cars first, the printed list now contains that item.",
      note: "// Print the list after adding the new car",
      prompt: "Print the cars array so its stored item appears.",
      starter: 'const cars = [];\nconst newCar = prompt("What car do you want to add?");\ncars.push(newCar);\n\n',
      answer: 'const cars = [];\nconst newCar = prompt("What car do you want to add?");\ncars.push(newCar);\n\nconsole.log(cars);',
      output: ["What car do you want to add?  →  Ford", '["Ford"]'],
    },
    {
      eyebrow: "12 · Sets",
      title: "Remove duplicate names",
      explanation: "A Set stores only unique values. Passing names into new Set(names) removes repeated names, and [...uniqueNames] spreads the remaining values back into an array for printing.",
      note: "// Ask for three names, then remove any duplicates",
      prompt: "Collect three names, create a Set, and print its unique values.",
      answer: 'const names = [];\n\nnames.push(prompt("Enter the first name:"));\nnames.push(prompt("Enter the second name:"));\nnames.push(prompt("Enter the third name:"));\n\nconst uniqueNames = new Set(names);\n\nconsole.log([...uniqueNames]);',
      output: ["Enter the first name:  →  Alex", "Enter the second name:  →  Sam", "Enter the third name:  →  Alex", '["Alex", "Sam"]'],
    },
    {
      eyebrow: "13 · Array positions",
      title: "Look up the car you added",
      explanation: "Array positions start at zero. cars[0] retrieves the first item, which is Ford because it was the first value pushed into the array.",
      note: "// Look up and print the first car in the array",
      prompt: "Use position 0 to retrieve the car you just added.",
      starter: 'const cars = [];\nconst newCar = prompt("What car do you want to add?");\ncars.push(newCar);\nconsole.log(cars);\n\n',
      answer: 'const cars = [];\nconst newCar = prompt("What car do you want to add?");\ncars.push(newCar);\nconsole.log(cars);\n\nconsole.log(cars[0]);',
      output: ["What car do you want to add?  →  Ford", '["Ford"]', "Item at position 0  →  Ford"],
    },
    {
      eyebrow: "14 · Objects",
      title: "Give values names",
      explanation: "Objects keep related values under named keys. Here, BMW and Ford are keys, and each car has a colour property.",
      note: "// Look up a car brand and print its colour",
      prompt: "Create the cars object and safely show the chosen car.",
      answer: 'let cars = {\n  BMW: { colour: "Blue" },\n  Ford: { colour: "Red" }\n};\n\nlet brand = prompt("Enter BMW or Ford:");\n\nif (cars[brand]) {\n  console.log("Brand: " + brand);\n  console.log("Colour: " + cars[brand].colour);\n} else {\n  console.log("Car not found");\n}',
      output: ["Enter BMW or Ford:  →  BMW", "Brand: BMW", "Colour: Blue"],
    },
    {
      eyebrow: "15 · Timers",
      title: "Run code later",
      explanation: "setTimeout schedules a function to run after a delay. The delay is measured in milliseconds, so 1000 means one second.",
      note: "// Print One, Two, and Three one second apart",
      prompt: "Schedule each message with the correct delay.",
      answer: 'setTimeout(() => console.log("One"), 1000);\nsetTimeout(() => console.log("Two"), 2000);\nsetTimeout(() => console.log("Three"), 3000);',
      output: ["One", "Two", "Three"],
    },
    {
      eyebrow: "16 · Date and time",
      title: "Get the current moment",
      explanation: "new Date() creates a Date object containing the current date and time from the device running the code. console.log then displays that value.",
      note: "// Create the current date and time, then print it",
      prompt: "Store a new Date in currentDateTime and show it in the console.",
      answer: "const currentDateTime = new Date();\nconsole.log(currentDateTime);",
      output: ["Thu Aug 06 2026 19:05:00 GMT+0100 (British Summer Time)"],
    },
    {
      eyebrow: "17 · Classes",
      title: "Create cars from a blueprint",
      explanation: "A class is a reusable blueprint for objects. Its constructor receives values when new Car(...) runs, and this stores those values as properties on each separate car object.",
      note: "// Define a Car class, then create and print two car objects",
      prompt: "Create the Car class and the Ford and Audi objects.",
      answer: 'class Car {\n  constructor(name, year) {\n    // this.name is the property stored in the car object.\n    // name is the value passed into the constructor.\n    this.name = name;\n\n    // this.year is the property stored in the car object.\n    // year is the value passed into the constructor.\n    this.year = year;\n  }\n}\n\nconst myCar1 = new Car("Ford", 2014);\nconst myCar2 = new Car("Audi", 2019);\n\nconsole.log(myCar1);\nconsole.log(myCar2);',
      output: ['Car { name: "Ford", year: 2014 }', 'Car { name: "Audi", year: 2019 }'],
    },
  ],
  csharp: [
    {
      eyebrow: "01 · Methods",
      title: "Make something happen",
      explanation: "A C# method is a named block of code. void means it does not return a value, and curly braces { } group the instructions that run when you call it.",
      note: "// Create a method named Correct that prints correct",
      prompt: "Type the method, then call it on the last line.",
      answer: 'void Correct() {\n  Console.WriteLine("correct");\n}\n\nCorrect();',
      output: ["correct"],
    },
    {
      eyebrow: "02 · While loops",
      title: "Repeat code until you stop it",
      explanation: "while repeats the code inside its braces while its condition is true. while (true) would continue forever, so this example uses break to stop safely after count reaches three.",
      note: "// Repeat the block, then break when count reaches 3",
      prompt: "Create a while (true) loop that prints 1, 2, and 3 before stopping.",
      answer: 'int count = 1;\n\nwhile (true)\n{\n  Console.WriteLine(count);\n\n  if (count == 3)\n  {\n    break;\n  }\n\n  count++;\n}',
      output: ["1", "2", "3"],
    },
    {
      eyebrow: "03 · Variables",
      title: "Remember a value",
      explanation: "string tells C# that a variable holds text. Console.ReadLine asks for input, and the answer can be stored in that variable for later.",
      note: "// Ask for a name and greet the user",
      prompt: "Create a name variable, then print Hello with an interpolated string.",
      answer: 'Console.WriteLine("What is your name?");\nstring name = Console.ReadLine();\nConsole.WriteLine($"Hello {name}");',
      output: ["What is your name?  →  Ada", "Hello Ada"],
    },
    {
      eyebrow: "04 · Console",
      title: "Clear the screen",
      explanation: "The console is where a C# text program shows its output. Console.Clear() removes everything currently shown there.",
      note: "// Clear all previous console output",
      prompt: "Write the single line that clears the console.",
      answer: "Console.Clear();",
      output: ["Console cleared."],
    },
    {
      eyebrow: "05 · Decisions",
      title: "Check an answer",
      explanation: "if checks whether a condition is true. Its braces contain the code to run when it is true; else handles everything else.",
      note: "// Check whether 1 + 1 equals 2",
      prompt: "Complete the if / else check and print the right message.",
      answer: 'Console.WriteLine("What is 1 + 1?");\nstring answer = Console.ReadLine();\n\nif (answer == "2") {\n  Console.WriteLine("Correct!");\n} else {\n  Console.WriteLine("Incorrect! The answer is 2.");\n}',
      output: ["What is 1 + 1?  →  2", "Correct!"],
    },
    {
      eyebrow: "06 · Null values",
      title: "Mark a value as not ready yet",
      explanation: "null deliberately means that a variable has no value yet. string? allows this text variable to hold either text or null, and == null checks whether the value is still missing.",
      note: "// null means there is deliberately no result yet",
      prompt: "Set the nullable result to null, then print the message for its current state.",
      answer: 'string? result = null; // There is no result yet\n\nif (result == null)\n{\n  Console.WriteLine("No result yet");\n}\nelse\n{\n  Console.WriteLine("Result is ready");\n}',
      output: ["No result yet"],
    },
    {
      eyebrow: "07 · Combined conditions",
      title: "Check whether a value is in a range",
      explanation: "A range needs two comparisons. >= checks the lower limit, <= checks the upper limit, and && means both conditions must be true at the same time.",
      note: "// && means AND. Both conditions must be true.",
      prompt: "Use && to check both ends of the age range.",
      starter: "int age = 16;\n\n",
      answer: 'int age = 16;\n\n// && means AND. Both conditions must be true.\nif (age >= 0 && age <= 18) {\n  Console.WriteLine("Your age is between 0 and 18.");\n} else {\n  Console.WriteLine("Your age is above 18.");\n}',
      output: ["Your age is between 0 and 18."],
    },
    {
      eyebrow: "08 · Arrays",
      title: "Keep a list",
      explanation: "A C# array keeps several values of the same type. Square brackets mark the array, and a foreach loop visits each item one at a time.",
      note: "// Store three fruits, then print each one",
      prompt: "Create the fruits array and loop through it.",
      answer: 'string[] fruits = { "Apple", "Banana", "Orange" };\n\nforeach (string fruit in fruits) {\n  Console.WriteLine(fruit);\n}',
      output: ["Apple", "Banana", "Orange"],
    },
    {
      eyebrow: "09 · Empty list",
      title: "Start an empty car list",
      explanation: "List<string> creates a flexible list that stores text, and new List<string>() starts it with zero items. C# has a const keyword too, but const is only for values fixed at compile time; a growing List cannot be const. This is why the C# version begins with List<string> rather than copying JavaScript's const.",
      note: "// Create an empty list that will hold car names",
      prompt: "Create the empty cars list for text values.",
      answer: "List<string> cars = new List<string>();",
      output: ["cars  →  []", "The list currently has 0 items."],
    },
    {
      eyebrow: "10 · Add to a list",
      title: "Put a car into the list",
      explanation: "Console.ReadLine() collects the user's answer. cars.Add(newCar) takes that saved text and adds it to the end of the cars list.",
      note: "// Ask for a car, then add the answer to cars",
      prompt: "Use Add to put newCar into the empty cars list.",
      starter: 'List<string> cars = new List<string>();\nConsole.WriteLine("What car do you want to add?");\nstring newCar = Console.ReadLine();\n\n',
      answer: 'List<string> cars = new List<string>();\nConsole.WriteLine("What car do you want to add?");\nstring newCar = Console.ReadLine();\n\ncars.Add(newCar);',
      output: ["Before: []", "What car do you want to add?  →  Ford", 'After Add: ["Ford"]'],
    },
    {
      eyebrow: "11 · Print a list",
      title: "Show the finished car list",
      explanation: "string.Join joins every list item into readable text. Console.WriteLine then prints that text, showing the car that was added in the previous step.",
      note: "// Join and print the items stored in cars",
      prompt: "Print the complete cars list in square brackets.",
      starter: 'List<string> cars = new List<string>();\nConsole.WriteLine("What car do you want to add?");\nstring newCar = Console.ReadLine();\ncars.Add(newCar);\n\n',
      answer: 'List<string> cars = new List<string>();\nConsole.WriteLine("What car do you want to add?");\nstring newCar = Console.ReadLine();\ncars.Add(newCar);\n\nConsole.WriteLine($"[{string.Join(", ", cars)}]");',
      output: ["What car do you want to add?  →  Ford", "[Ford]"],
    },
    {
      eyebrow: "12 · Sets",
      title: "Remove duplicate names",
      explanation: "A HashSet stores only unique values. Passing names into new HashSet<string>(names) removes repeated names, and string.Join makes the remaining values readable for printing.",
      note: "// Ask for three names, then remove any duplicates",
      prompt: "Collect three names, create a HashSet, and print its unique values.",
      answer: 'List<string> names = new List<string>();\n\nConsole.WriteLine("Enter the first name:");\nnames.Add(Console.ReadLine());\nConsole.WriteLine("Enter the second name:");\nnames.Add(Console.ReadLine());\nConsole.WriteLine("Enter the third name:");\nnames.Add(Console.ReadLine());\n\nHashSet<string> uniqueNames = new HashSet<string>(names);\n\nConsole.WriteLine($"[{string.Join(", ", uniqueNames)}]");',
      output: ["Enter the first name:  →  Alex", "Enter the second name:  →  Sam", "Enter the third name:  →  Alex", "[Alex, Sam]"],
    },
    {
      eyebrow: "13 · Array positions",
      title: "Look up the car you added",
      explanation: "C# list positions start at zero. cars[0] retrieves the first item, which is Ford because it was the first value added to the list.",
      note: "// Look up and print the first car in the list",
      prompt: "Use position 0 to retrieve the car you just added.",
      starter: 'List<string> cars = new List<string>();\nConsole.WriteLine("What car do you want to add?");\nstring newCar = Console.ReadLine();\ncars.Add(newCar);\nConsole.WriteLine($"[{string.Join(", ", cars)}]");\n\n',
      answer: 'List<string> cars = new List<string>();\nConsole.WriteLine("What car do you want to add?");\nstring newCar = Console.ReadLine();\ncars.Add(newCar);\nConsole.WriteLine($"[{string.Join(", ", cars)}]");\n\nConsole.WriteLine(cars[0]);',
      output: ["What car do you want to add?  →  Ford", "[Ford]", "Item at position 0  →  Ford"],
    },
    {
      eyebrow: "14 · Objects",
      title: "Give values names",
      explanation: "C# objects keep related values in named properties. Here, an anonymous object groups a car's Brand and Colour together.",
      note: "// Create a car object and print its properties",
      prompt: "Create the car object, then print its brand and colour.",
      answer: 'var car = new { Brand = "BMW", Colour = "Blue" };\n\nConsole.WriteLine($"Brand: {car.Brand}");\nConsole.WriteLine($"Colour: {car.Colour}");',
      output: ["Brand: BMW", "Colour: Blue"],
    },
    {
      eyebrow: "15 · Timers",
      title: "Run code later",
      explanation: "Task.Delay pauses asynchronous C# code for a number of milliseconds. Using await lets each message appear after another one-second delay.",
      note: "// Print One, Two, and Three one second apart",
      prompt: "Wait one second before printing each message.",
      answer: 'await Task.Delay(1000);\nConsole.WriteLine("One");\n\nawait Task.Delay(1000);\nConsole.WriteLine("Two");\n\nawait Task.Delay(1000);\nConsole.WriteLine("Three");',
      output: ["One", "Two", "Three"],
    },
    {
      eyebrow: "16 · Date and time",
      title: "Get the current moment",
      explanation: "DateTime.Now gets the computer's current local date and time. Storing it in currentDateTime lets the program use or display that moment later.",
      note: "// Get the current date and time, then print it",
      prompt: "Store DateTime.Now in currentDateTime and show it in the console.",
      answer: "DateTime currentDateTime = DateTime.Now;\nConsole.WriteLine(currentDateTime);",
      output: ["06/08/2026 19:05:00"],
    },
    {
      eyebrow: "17 · Classes",
      title: "Create cars from a blueprint",
      explanation: "A C# class is a reusable blueprint for objects. Properties store each car's data, the constructor receives starting values, and this refers to the particular object being created.",
      note: "// Define a Car class, then create and print two car objects",
      prompt: "Create the Car class and make the Ford and Audi objects inside Main.",
      answer: 'class Car\n{\n  public string Name { get; set; }\n  public int Year { get; set; }\n\n  public Car(string name, int year)\n  {\n    // this.Name is the property stored in the car object.\n    // name is the value passed into the constructor.\n    this.Name = name;\n\n    // this.Year is the property stored in the car object.\n    // year is the value passed into the constructor.\n    this.Year = year;\n  }\n}\n\nclass Program\n{\n  static void Main()\n  {\n    Car myCar1 = new Car("Ford", 2014);\n    Car myCar2 = new Car("Audi", 2019);\n\n    Console.WriteLine($"{myCar1.Name}, {myCar1.Year}");\n    Console.WriteLine($"{myCar2.Name}, {myCar2.Year}");\n  }\n}',
      output: ["Ford, 2014", "Audi, 2019"],
    },
  ],
  html: [
    {
      eyebrow: "01 · Doctype",
      title: "Tell the browser it is HTML",
      explanation: "The doctype declaration belongs at the very top of the file. It tells the browser to use modern HTML rules when it reads the page.",
      note: "<!-- Declare this as a modern HTML document -->",
      prompt: "Type the HTML doctype declaration.",
      answer: "<!DOCTYPE html>",
      output: ["HTML document type recognised."],
    },
    {
      eyebrow: "02 · Page structure",
      title: "Start the HTML page",
      explanation: "The html element wraps the whole page. The lang attribute identifies the page language for browsers, search engines, and assistive technology. The forward slash marks the closing tag.",
      note: "<!-- Wrap the English-language page in html tags -->",
      prompt: "Create the outer html element and mark its language as English.",
      answer: '<html lang="en">\n</html>',
      output: ["Page wrapper created."],
    },
    {
      eyebrow: "03 · Head and title",
      title: "Name the browser tab",
      explanation: "The head holds information about the page. meta charset UTF-8 lets it display a wide range of characters correctly, while title supplies the text shown on the browser tab.",
      note: "<!-- Set the character encoding and browser-tab title -->",
      prompt: "Create the head, set UTF-8, and give the page a title.",
      answer: '<head>\n  <meta charset="UTF-8">\n  <title>My page</title>\n</head>',
      output: ["Browser-tab title: My page"],
    },
    {
      eyebrow: "04 · Body",
      title: "Add visible page content",
      explanation: "The body contains everything visitors see in the browser window, such as headings, paragraphs, links, images, and buttons.",
      note: "<!-- Create the visible body of the page -->",
      prompt: "Create an empty body element.",
      answer: "<body>\n</body>",
      output: ["Visible page area created."],
    },
    {
      eyebrow: "05 · Headings",
      title: "Create a heading hierarchy",
      explanation: "Headings organise the page. h1 is the main heading; h2 introduces a major section; h3 and h4 create smaller subsections below it.",
      note: "<!-- Add a main heading and a section heading -->",
      prompt: "Create an h1 followed by an h2.",
      answer: "<h1>Main heading</h1>\n<h2>Main section</h2>",
      output: ["Main heading", "Main section"],
    },
    {
      eyebrow: "06 · Links",
      title: "Open another page",
      explanation: "The a element creates a link. Its href attribute stores the destination, while the text between the tags is what the visitor clicks.",
      note: "<!-- Link to a second HTML page -->",
      prompt: "Create a link to page.html.",
      answer: '<a href="page.html">Open page</a>',
      output: ["Open page  →  page.html"],
    },
    {
      eyebrow: "07 · Text elements",
      title: "Explore HTML text elements",
      explanation: "This is a reference page rather than a quiz. Compare heading levels and HTML text-formatting elements such as strong, em, mark, del, sub, and sup.",
      note: "<!-- A visual guide to HTML text elements -->",
      prompt: "Explore the examples and what each element means.",
      answer: '<section>\n  <h1>Heading 1</h1>\n  <h2>Heading 2</h2>\n  <h3>Heading 3</h3>\n  <h4>Heading 4</h4>\n  <h5>Heading 5</h5>\n  <h6>Heading 6</h6>\n  <b>Bold text</b>\n  <strong>Important text</strong>\n  <i>Italic text</i>\n  <em>Emphasized text</em>\n  <mark>Highlighted text</mark>\n  <small>Smaller text</small>\n  <del>Deleted text</del>\n  <ins>Inserted text</ins>\n  <span>H<sub>2</sub>O and 2<sup>3</sup></span>\n</section>',
      output: ["Reference explored."],
      referenceOnly: true,
      referenceKind: "text",
    },
    {
      eyebrow: "08 · JavaScript in HTML",
      title: "Show the current date and time",
      explanation: "The script element lets an HTML page run JavaScript. new Date() creates the current date and time, and console.log displays it in the browser's developer console.",
      note: "<!-- Run JavaScript from inside the HTML page -->",
      prompt: "Put the date-and-time code inside a script element.",
      answer: "<script>\n  const currentDateTime = new Date();\n  console.log(currentDateTime);\n</script>",
      output: ["Current date and time printed in the browser console."],
    },
    {
      eyebrow: "09 · Multiple pages",
      title: "Link two HTML pages",
      explanation: "This is a two-file reference rather than a quiz. When both files are in the same folder, each href can use the other file's name as a relative path.",
      note: "<!-- Link index.html and page2.html in both directions -->",
      prompt: "Compare the two files and follow the links between them.",
      answer: '<a href="page2.html">Go to Page 2</a>',
      output: ["index.html ↔ page2.html"],
      referenceOnly: true,
      referenceKind: "pages",
    },
    {
      eyebrow: "10 · Images",
      title: "Place an image on the page",
      explanation: "The img element displays an image. src tells the browser which file to load, while alt describes the image if it cannot be seen or loaded. If car.png is beside index.html, its filename is enough for src.",
      note: "<!-- Display car.png from the same folder as this HTML file -->",
      prompt: "Add the car image with useful alternative text.",
      answer: '<img src="car.png" alt="A car">',
      output: ["Image loaded: car.png", "Alternative text: A car"],
    },
    {
      eyebrow: "11 · IDs for CSS",
      title: "Give one element a unique name",
      explanation: "The id attribute gives one HTML element a unique name. CSS can then select that exact element with a hash followed by the same name, such as #p1.",
      note: "<!-- Give this particular paragraph the ID p1 -->",
      prompt: "Add the p1 ID to the paragraph so CSS can target it.",
      answer: '<p id="p1">This paragraph has its own ID.</p>',
      output: ["Paragraph identified as p1.", "CSS can select it with #p1."],
    },
  ],
  css: [
    {
      eyebrow: "01 · Background colour",
      title: "Colour the page background",
      explanation: "CSS rules use a property and a value. background-color chooses the colour behind an element, while the colon separates the property from its value and the semicolon ends the instruction.",
      note: "/* Give the page a light-blue background */",
      prompt: "Write a body rule with a light-blue background.",
      answer: "body {\n  background-color: lightblue;\n}",
      output: ["The page background is light blue."],
    },
    {
      eyebrow: "02 · Text styling",
      title: "Colour and centre text",
      explanation: "color changes the text colour. text-align controls horizontal alignment inside the selected element; center places its inline content in the middle.",
      note: "/* Make every paragraph red and centred */",
      prompt: "Style paragraphs with red, centred text.",
      answer: "p {\n  color: red;\n  text-align: center;\n}",
      output: ["Red paragraph text centred."],
    },
    {
      eyebrow: "03 · ID selectors",
      title: "Style one unique element",
      explanation: "An ID selector begins with #. The selector #p1 matches the HTML element carrying id=\"p1\", so this rule changes only that particular element.",
      note: "/* Select the HTML element whose ID is p1 */",
      prompt: "Use its ID to make only p1 tomato coloured.",
      answer: "#p1 {\n  color: tomato;\n}",
      output: ["Only the element with id=\"p1\" turns tomato."],
    },
    {
      eyebrow: "04 · Font families",
      title: "Compare website fonts",
      explanation: "This is a visual reference rather than a quiz. A browser uses the first available font in a font-family list, then tries each fallback. Named fonts are not guaranteed on every device, so finish every stack with a generic family.",
      note: "/* Compare common fonts and safe fallbacks */",
      prompt: "Compare the font samples and their fallback families.",
      answer: "p { font-family: Arial, sans-serif; }",
      output: ["Font reference explored."],
      referenceOnly: true,
      referenceKind: "fonts",
    },
    {
      eyebrow: "05 · Borders and colours",
      title: "Explore borders and colour formats",
      explanation: "This visual reference shows how CSS selectors target elements and how border, RGB, RGBA, and hexadecimal colour values change their appearance.",
      note: "/* Compare borders, rounded corners, RGB, RGBA, and hex colours */",
      prompt: "Explore the rendered CSS examples and their explanations.",
      answer: "p.one { border: 5px solid red; }",
      output: ["CSS reference explored."],
      referenceOnly: true,
      referenceKind: "css",
    },
    {
      eyebrow: "06 · Border practice",
      title: "Create a rounded dotted border",
      explanation: "A class selector targets elements carrying that class. The border shorthand sets width, style, and colour, while border-radius rounds the corners.",
      note: "/* Give notice paragraphs a dotted blue rounded border */",
      prompt: "Create the notice class with a dotted blue rounded border.",
      answer: "p.notice {\n  border: 5px dotted blue;\n  border-radius: 5px;\n}",
      output: ["Notice paragraphs have a dotted blue border with rounded corners."],
    },
  ],
};

type CodePart = { code: string; name: string; meaning: string };

const breakdowns: Record<Language, Partial<Record<number, CodePart[]>>> = {
  javascript: {
    0: [{ code: "function", name: "Create", meaning: "Starts a reusable block of code." }, { code: "correct()", name: "Name", meaning: "Names the function so you can call it later." }, { code: "{ ... }", name: "Instructions", meaning: "Holds the code the function will run." }, { code: "correct();", name: "Call it", meaning: "Runs the function you created." }, { code: ";", name: "End instruction", meaning: "Marks where an instruction ends. JavaScript can sometimes work without it, but using it consistently makes the ending clear." }],
    1: [{ code: "while (true)", name: "Repeat", meaning: "Keeps running the block while its condition is true." }, { code: "true", name: "Always true", meaning: "Makes the loop continue until something inside stops it." }, { code: "break", name: "Stop", meaning: "Leaves the loop immediately when count reaches three." }, { code: "count++", name: "Increase", meaning: "Adds one to count after each repetition." }],
    2: [{ code: "let", name: "Create", meaning: "Makes a variable that can remember something." }, { code: "name", name: "Label", meaning: "The name used to find the saved value later." }, { code: "prompt( ... )", name: "Ask", meaning: "Shows a question and returns the user's answer." }, { code: "=", name: "Save", meaning: "Puts the answer from prompt into name." }],
    4: [{ code: "if ( ... )", name: "Check", meaning: "Runs a block only when its condition is true." }, { code: 'answer == "2"', name: "Condition", meaning: "Compares the saved answer with 2." }, { code: "else", name: "Otherwise", meaning: "Runs when the condition is false." }],
    5: [{ code: ">= 0", name: "Lower limit", meaning: "Checks that age is zero or greater." }, { code: "&&", name: "Two ampersands", meaning: "Read this as AND: the condition on each side must be true." }, { code: "<= 18", name: "Upper limit", meaning: "Checks that age is eighteen or less." }, { code: "else", name: "Otherwise", meaning: "Runs when the complete range condition is false." }],
    6: [{ code: "[ ... ]", name: "Array", meaning: "Keeps several values together in one list." }, { code: "for ... of", name: "Loop", meaning: "Visits every item in the array." }, { code: "fruit", name: "Current item", meaning: "Temporarily holds the item being visited." }],
    7: [{ code: "const", name: "Short for constant", meaning: "Creates a variable that cannot be reassigned. Use let instead when the variable itself must receive a different value later." }, { code: "cars", name: "Variable name", meaning: "The label used to find this array later." }, { code: "[]", name: "Empty array", meaning: "Creates a list containing zero items. The list can still grow even though cars was declared with const." }, { code: ";", name: "End instruction", meaning: "Marks the end of the variable declaration." }],
    8: [{ code: "newCar", name: "Saved answer", meaning: "Holds the car name returned by prompt." }, { code: "cars.push", name: "Add an item", meaning: "Push adds a new value to the end of the cars array." }, { code: "(newCar)", name: "Item to add", meaning: "Passes the user's saved answer into push." }, { code: ";", name: "End instruction", meaning: "Marks where the push instruction ends." }],
    9: [{ code: "console.log", name: "Display", meaning: "Sends something to the console." }, { code: "cars", name: "Whole array", meaning: "Passes the complete cars list to console.log." }, { code: '["Ford"]', name: "Printed result", meaning: "Shows that Ford is now stored as the first list item." }],
    10: [{ code: "cars", name: "The array", meaning: "The list containing the car that was pushed." }, { code: "[0]", name: "First position", meaning: "Zero selects the first item because array counting starts at zero." }, { code: "cars[0]", name: "Look it up", meaning: "Retrieves Ford from the first position." }, { code: "console.log", name: "Display it", meaning: "Prints the retrieved car in the console." }],
    11: [{ code: "{ key: value }", name: "Object", meaning: "Groups values under names such as BMW and Ford." }, { code: "cars[brand]", name: "Look up", meaning: "Uses brand to find the matching car." }, { code: ".colour", name: "Property", meaning: "Selects the colour stored on that car." }],
    12: [{ code: "setTimeout", name: "Schedule", meaning: "Asks JavaScript to run some code later." }, { code: "() => ...", name: "Code to run", meaning: "A short function waiting inside the timer." }, { code: "1000", name: "Delay", meaning: "One thousand milliseconds means one second." }],
    13: [{ code: "const", name: "Fixed variable", meaning: "Creates a variable that will not be reassigned." }, { code: "new Date()", name: "Current moment", meaning: "Creates a Date using the device's current date and time." }, { code: "console.log", name: "Display", meaning: "Shows the stored Date in the console." }],
    14: [{ code: "class Car", name: "Blueprint", meaning: "Defines the shape and behaviour shared by every Car object." }, { code: "constructor(name, year)", name: "Starting values", meaning: "Receives the name and year whenever a new car is created." }, { code: "this.name = name", name: "Store a property", meaning: "Saves the received name on this particular car object." }, { code: "new Car(...) ", name: "Create an object", meaning: "Builds a separate Car using the values inside the parentheses." }],
  },
  csharp: {
    0: [{ code: "void", name: "Result type", meaning: "Says this method does not send a value back." }, { code: "Correct()", name: "Name", meaning: "Names the method so you can call it later." }, { code: "{ ... }", name: "Instructions", meaning: "Holds the code the method will run." }, { code: "Correct();", name: "Call it", meaning: "Runs the method you created." }, { code: ";", name: "End statement", meaning: "Marks where a statement ends. C# requires it after statements such as calling a method or printing text." }],
    1: [{ code: "while (true)", name: "Repeat", meaning: "Keeps running the block while its condition is true." }, { code: "true", name: "Always true", meaning: "Makes the loop continue until something inside stops it." }, { code: "break", name: "Stop", meaning: "Leaves the loop immediately when count reaches three." }, { code: "count++", name: "Increase", meaning: "Adds one to count after each repetition." }],
    2: [{ code: "string", name: "Type", meaning: "Says this variable will store text." }, { code: "name", name: "Label", meaning: "The name used to find the saved text later." }, { code: "Console.ReadLine()", name: "Read", meaning: "Waits for the user to type an answer." }, { code: "=", name: "Save", meaning: "Puts that answer into name." }],
    4: [{ code: "if ( ... )", name: "Check", meaning: "Runs a block only when its condition is true." }, { code: 'answer == "2"', name: "Condition", meaning: "Compares the saved answer with 2." }, { code: "else", name: "Otherwise", meaning: "Runs when the condition is false." }],
    5: [{ code: ">= 0", name: "Lower limit", meaning: "Checks that age is zero or greater." }, { code: "&&", name: "Two ampersands", meaning: "Read this as AND: the condition on each side must be true." }, { code: "<= 18", name: "Upper limit", meaning: "Checks that age is eighteen or less." }, { code: "else", name: "Otherwise", meaning: "Runs when the complete range condition is false." }],
    6: [{ code: "string[]", name: "Array type", meaning: "Says fruits is a list of text values." }, { code: "foreach", name: "Loop", meaning: "Visits every item in the array." }, { code: "fruit", name: "Current item", meaning: "Temporarily holds the item being visited." }],
    7: [{ code: "List<string>", name: "Flexible text list", meaning: "Creates a list that can grow and accepts string values." }, { code: "cars", name: "Variable name", meaning: "The label used to find this list later." }, { code: "new List<string>()", name: "Empty list", meaning: "Builds the list with zero items inside it." }, { code: "const", name: "Different in C#", meaning: "C# const is for compile-time fixed values, so it cannot be used for this growing List." }, { code: ";", name: "End statement", meaning: "Marks the end of the declaration." }],
    8: [{ code: "newCar", name: "Saved answer", meaning: "Holds the text returned by Console.ReadLine." }, { code: "cars.Add", name: "Add an item", meaning: "Adds a new value to the end of the cars list." }, { code: "(newCar)", name: "Item to add", meaning: "Passes the user's saved answer into Add." }, { code: ";", name: "End statement", meaning: "Marks where the Add instruction ends." }],
    9: [{ code: "string.Join", name: "Join items", meaning: "Turns all list items into one readable piece of text." }, { code: '", "', name: "Separator", meaning: "Places a comma and space between multiple cars." }, { code: "cars", name: "Whole list", meaning: "Supplies every stored car to string.Join." }, { code: "Console.WriteLine", name: "Display", meaning: "Prints the joined list in the console." }],
    10: [{ code: "cars", name: "The list", meaning: "The C# List containing the car that was added." }, { code: "[0]", name: "First position", meaning: "Zero selects the first item because list counting starts at zero." }, { code: "cars[0]", name: "Look it up", meaning: "Retrieves Ford from the first position." }, { code: "Console.WriteLine", name: "Display it", meaning: "Prints the retrieved car in the console." }],
    11: [{ code: "var car", name: "Variable", meaning: "Creates a place named car for the object." }, { code: "new { ... }", name: "Object", meaning: "Groups related values into one thing." }, { code: "car.Brand", name: "Property", meaning: "Reads the Brand value stored on car." }],
    12: [{ code: "Task.Delay", name: "Timer", meaning: "Creates a pause for a number of milliseconds." }, { code: "1000", name: "Duration", meaning: "One thousand milliseconds means one second." }, { code: "await", name: "Wait", meaning: "Pauses here before moving to the next line." }],
    13: [{ code: "DateTime", name: "Type", meaning: "Represents a date and a time in C#." }, { code: "DateTime.Now", name: "Current moment", meaning: "Reads the computer's current local date and time." }, { code: "Console.WriteLine", name: "Display", meaning: "Shows the stored value in the console." }],
    14: [{ code: "class Car", name: "Blueprint", meaning: "Defines the data and behaviour shared by every Car object." }, { code: "public string Name", name: "Property", meaning: "Stores a text name that other code can read or change." }, { code: "Car(string name, int year)", name: "Constructor", meaning: "Receives the starting values whenever a new Car is created." }, { code: "this.Name = name", name: "Store a value", meaning: "Saves the received name on this particular car object." }, { code: "new Car(...) ", name: "Create an object", meaning: "Builds a separate Car from the supplied values." }],
  },
  html: {
    0: [{ code: "<!DOCTYPE", name: "Declaration", meaning: "Tells the browser what kind of document follows." }, { code: "html", name: "Modern HTML", meaning: "Selects the current HTML standard." }],
    1: [{ code: "<html>", name: "Opening tag", meaning: "Marks where the HTML page begins." }, { code: 'lang="en"', name: "Page language", meaning: "Identifies the document as English." }, { code: "</html>", name: "Closing tag", meaning: "The slash marks where that element ends." }],
    2: [{ code: "<head>", name: "Page information", meaning: "Contains information used by the browser." }, { code: '<meta charset="UTF-8">', name: "Character encoding", meaning: "Supports letters, symbols, and characters from many languages." }, { code: "<title>", name: "Tab title", meaning: "Sets the words shown on the browser tab." }],
    3: [{ code: "<body>", name: "Visible content", meaning: "Starts the part visitors can see." }, { code: "</body>", name: "End content", meaning: "Closes the visible page area." }],
    4: [{ code: "h1", name: "Main heading", meaning: "The page's most important heading." }, { code: "h2", name: "Section heading", meaning: "Introduces a major section beneath the h1." }, { code: "</...>", name: "Closing tag", meaning: "Ends the heading so later text stays separate." }],
    5: [{ code: "<a>", name: "Anchor", meaning: "Creates a clickable link." }, { code: "href", name: "Destination", meaning: "Stores the page or address to open." }, { code: "Open page", name: "Link text", meaning: "The words the visitor clicks." }],
    6: [{ code: "<section>", name: "Content group", meaning: "Keeps a related part of the page together." }, { code: "h1 — h6", name: "Heading levels", meaning: "Create a hierarchy from most to least important." }, { code: "<strong>", name: "Important text", meaning: "Marks text as important and normally displays it in bold." }, { code: "<del>", name: "Deleted text", meaning: "Shows text that has been removed with a line through it." }],
    7: [{ code: "<script>", name: "JavaScript area", meaning: "Tells the browser that the code inside is JavaScript." }, { code: "const", name: "Fixed variable", meaning: "Creates a variable that will not be reassigned." }, { code: "new Date()", name: "Current moment", meaning: "Creates a Date using the device's current date and time." }, { code: "console.log", name: "Developer console", meaning: "Displays the value in the browser's developer tools." }],
    9: [{ code: "<img>", name: "Image element", meaning: "Places an image in the HTML page; it does not need a closing tag." }, { code: 'src="car.png"', name: "Image source", meaning: "Loads car.png from the same folder as the HTML file." }, { code: 'alt="A car"', name: "Alternative text", meaning: "Describes the image for accessibility and when it cannot load." }],
    10: [{ code: "<p>", name: "Paragraph", meaning: "Creates the particular paragraph that will be styled." }, { code: 'id="p1"', name: "Unique ID", meaning: "Gives this element the unique name p1." }, { code: "#p1", name: "Matching CSS", meaning: "CSS uses a hash before the ID name to select this exact element." }],
  },
  css: {
    0: [{ code: "body", name: "Selector", meaning: "Chooses the HTML body element to style." }, { code: "background-color", name: "Property", meaning: "Chooses the colour behind the element." }, { code: ":", name: "Property separator", meaning: "Separates the property name from its value." }, { code: "lightblue", name: "Value", meaning: "The background colour to apply." }, { code: ";", name: "Rule ending", meaning: "Ends this CSS declaration so another can follow." }],
    1: [{ code: "p", name: "Selector", meaning: "Chooses every paragraph on the page." }, { code: "color: red", name: "Text colour", meaning: "Makes the selected text red." }, { code: "text-align: center", name: "Alignment", meaning: "Centres inline content inside each paragraph." }, { code: ";", name: "Rule ending", meaning: "Marks the end of each CSS declaration." }],
    2: [{ code: "#", name: "ID marker", meaning: "The hash tells CSS that this is an ID selector." }, { code: "p1", name: "ID name", meaning: "Must exactly match the id value written in the HTML." }, { code: "color: tomato", name: "Declaration", meaning: "Changes the text colour of only the matched element." }],
    5: [{ code: "p.notice", name: "Class selector", meaning: "Targets paragraphs carrying the notice class." }, { code: "border", name: "Border property", meaning: "Sets the line around the element." }, { code: "5px dotted blue", name: "Border values", meaning: "Uses a five-pixel dotted line coloured blue." }, { code: "border-radius: 5px", name: "Rounded corners", meaning: "Rounds each corner of the border by five pixels." }],
  },
};

const nullBreakdowns: Partial<Record<Language, CodePart[]>> = {
  javascript: [
    { code: "let result", name: "Variable", meaning: "Creates a changeable variable named result." },
    { code: "null", name: "No value yet", meaning: "Deliberately stores no value for now; result can receive one later." },
    { code: "=== null", name: "Exact check", meaning: "Checks whether result is specifically the null value." },
    { code: "else", name: "A value exists", meaning: "Runs the other branch when result is no longer null." },
  ],
  csharp: [
    { code: "string? result", name: "Nullable text", meaning: "The question mark allows result to hold text or null." },
    { code: "null", name: "No value yet", meaning: "Deliberately stores no value for now; result can receive one later." },
    { code: "== null", name: "Null check", meaning: "Checks whether result still contains no value." },
    { code: "else", name: "A value exists", meaning: "Runs the other branch when result is no longer null." },
  ],
};

const setsBreakdowns: Partial<Record<Language, CodePart[]>> = {
  javascript: [
    { code: "names", name: "Source array", meaning: "Holds all three answers, including any repeated names." },
    { code: "new Set(names)", name: "Remove duplicates", meaning: "Creates a Set from names. A Set keeps only one copy of each value." },
    { code: "uniqueNames", name: "Set variable", meaning: "Labels the new collection of unique names so it can be used later." },
    { code: "[...uniqueNames]", name: "Spread into an array", meaning: "The three dots copy every Set value into a new array for familiar array-style output." },
  ],
  csharp: [
    { code: "names", name: "Source list", meaning: "Holds all three answers, including any repeated names." },
    { code: "HashSet<string>", name: "Unique text collection", meaning: "Defines a collection that stores no duplicate text values." },
    { code: "new HashSet<string>(names)", name: "Remove duplicates", meaning: "Creates the HashSet from names and keeps only one copy of each value." },
    { code: "string.Join", name: "Readable output", meaning: "Joins the unique values together so they can be printed on one line." },
  ],
};

const normalize = (value: string) =>
  value
    .replace(/\/\/.*$/gm, "")
    .replace(/[\s\u00a0\u200b-\u200d\ufeff]+/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/'/g, '"')
    .trim();

const languageName = (language: Language) => language === "javascript" ? "JavaScript" : language === "csharp" ? "C Sharp" : language === "html" ? "HTML" : "CSS";
const languageBadge = (language: Language) => language === "javascript" ? "JS" : language === "csharp" ? "C#" : language === "html" ? "HTML" : "CSS";
const challengeFile = (language: Language) => language === "javascript" ? "challenge.js" : language === "csharp" ? "Program.cs" : language === "html" ? "index.html" : "styles.css";

type DiagnosticPart = { text: string; help: string; kind: "type" | "message" | "token" | "location" };

function significantCharacters(value: string) {
  const characters: { character: string; index: number }[] = [];
  let quote = "";
  let lineComment = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const next = value[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (!quote && character === "/" && next === "/") { lineComment = true; index += 1; continue; }
    if ((character === '"' || character === "'" || character === "`") && value[index - 1] !== "\\") quote = quote === character ? "" : quote || character;
    if (!/[\s\u00a0\u200b-\u200d\ufeff]/.test(character)) characters.push({ character, index });
  }
  return characters;
}

function alignedGuide(code: string, expected: string) {
  const actual = significantCharacters(code);
  const target = significantCharacters(expected);
  let matched = 0;
  while (matched < actual.length && matched < target.length && actual[matched].character === target[matched].character) matched += 1;
  const expectedPosition = matched ? target[matched - 1].index + 1 : 0;
  return code.replace(/[^\n]/g, " ") + expected.slice(expectedPosition);
}

function syntaxDiagnostic(code: string, expected: string): DiagnosticPart[] {
  const actual = significantCharacters(code);
  const target = significantCharacters(expected);
  let difference = 0;
  while (difference < actual.length && difference < target.length && actual[difference].character === target[difference].character) difference += 1;
  const rawIndex = actual[difference]?.index ?? code.length;
  const before = code.slice(0, rawIndex);
  const line = before.split("\n").length;
  const column = rawIndex - before.lastIndexOf("\n");
  const actualToken = actual[difference]?.character;
  const expectedToken = target[difference]?.character;
  const expectedIndex = target[difference]?.index ?? expected.length;
  let wordStart = expectedIndex;
  let wordEnd = expectedIndex;
  while (wordStart > 0 && /[A-Za-z0-9_]/.test(expected[wordStart - 1])) wordStart -= 1;
  while (wordEnd < expected.length && /[A-Za-z0-9_]/.test(expected[wordEnd])) wordEnd += 1;
  const expectedWord = expected.slice(wordStart, wordEnd);
  const currentWord = code.match(/[A-Za-z_]\w*$/)?.[0] ?? "";
  const incompleteWord = !actualToken && currentWord.length > 0 && expectedWord.startsWith(currentWord) && expectedWord !== currentWord;
  const message = incompleteWord
    ? `Incomplete keyword '${currentWord}'`
    : actualToken ? `Unexpected token '${actualToken}'` : "Unexpected end of input";
  const tokenHelp = incompleteWord
    ? `You started '${expectedWord}' but stopped after '${currentWord}'. Type the remaining '${expectedWord.slice(currentWord.length)}'.`
    : actualToken
      ? `The compiler found ${actualToken}, but expected ${expectedToken ? `'${expectedToken}'` : "the instruction to end"} here.`
      : `The compiler reached the end while it was still expecting ${expectedToken ? `'${expectedToken}'` : "more code"}.`;
  return [
    { text: "SyntaxError:", help: "The code cannot be read because its grammar or punctuation is incomplete or in the wrong order.", kind: "type" },
    { text: message, help: tokenHelp, kind: "message" },
    ...(actualToken ? [{ text: actualToken, help: `This is the token the compiler could not use at this position.`, kind: "token" as const }] : []),
    { text: `line ${line}`, help: `Line ${line} is the row where the compiler first noticed the problem.`, kind: "location" },
    { text: `column ${column}`, help: `Column ${column} is the character position on that line.`, kind: "location" },
  ];
}

function SyntaxDiagnostic({ parts }: { parts: DiagnosticPart[] }) {
  return <div className="syntax-diagnostic" role="alert">{parts.map((part, index) => <span key={`${part.text}-${index}`} className={`diagnostic-${part.kind}`} tabIndex={0} data-help={part.help} aria-label={`${part.text}: ${part.help}`}>{part.text}</span>)}</div>;
}

function HighlightedCode({ code, language, caretIndex }: { code: string; language: Language; caretIndex?: number }) {
  const pattern = language === "html"
    ? /(<!--[\s\S]*?-->|<\/?|\/?>|"[^"]*"|'[^']*'|\b(?:html|head|meta|title|body|section|script|img|h[1-6]|p|a|span|b|strong|i|em|mark|small|del|ins|sub|sup)\b|\b(?:style|href|src|alt|id|lang|charset)\b|\b(?:const|new)\b|\b(?:Date|console|log)\b|\d+|[{}()[\];=.:#])/g
    : language === "css"
    ? /(\/\*[\s\S]*?\*\/|#[0-9a-fA-F]{3,8}\b|#[A-Za-z_]\w*|\b(?:body|p|background-color|color|text-align|font-family|border|border-radius|solid|dotted|center|lightblue|red|blue|tomato)\b|\d+(?:px)?|[{}();:.,])/g
    : /(\/\/[^\n]*|"[^"\n]*"|'[^'\n]*'|`[^`]*`|\b(?:function|class|constructor|this|let|const|new|null|if|else|for|of|while|true|false|break|setTimeout|public|static|void|string|int|get|set|var|foreach|in|await)\b|\b(?:console|Console|Task|Date|DateTime|List|Set|HashSet)\b|\b[A-Za-z_]\w*(?=\s*\()|\d+|&&|>=|<=|\+\+|--|[{}()[\];=.:<>?])/g;
  const parts: { text: string; kind: string }[] = [];
  let lastIndex = 0;
  for (const match of code.matchAll(pattern)) {
    if (match.index! > lastIndex) parts.push({ text: code.slice(lastIndex, match.index), kind: "plain" });
    const text = match[0];
    let kind = "punctuation";
    if (/^(\/\/|\/\*|<!--)/.test(text)) kind = "comment";
    else if (/^["'`]/.test(text)) kind = "string";
    else if (/^(function|class|constructor|this|let|const|new|null|if|else|for|of|while|true|false|break|setTimeout|public|static|void|string|int|get|set|var|foreach|in|await|<\/?|\/?>|html|head|meta|title|body|section|script|img|h[1-6]|p|a|span|b|strong|i|em|mark|small|del|ins|sub|sup)$/.test(text)) kind = "keyword";
    else if (/^(console|Console|Task|Date|DateTime|List|Set|HashSet|log)$/.test(text)) kind = "api";
    else if (/^(style|href|src|alt|id|lang|charset)$/.test(text)) kind = "attribute";
    else if (/^(background-color|color|text-align|font-family|border|border-radius)$/.test(text)) kind = "api";
    else if (/^(body|p)$/.test(text)) kind = "keyword";
    else if (/^(solid|dotted|center|lightblue|red|blue|tomato|#[0-9a-fA-F]+)$/.test(text)) kind = "string";
    else if (/^#[A-Za-z_]/.test(text)) kind = "function-name";
    else if (/^\d+$/.test(text)) kind = "number";
    else if (/^[A-Za-z_]/.test(text)) kind = "function-name";
    parts.push({ text, kind });
    lastIndex = match.index! + text.length;
  }
  if (lastIndex < code.length) parts.push({ text: code.slice(lastIndex), kind: "plain" });
  let offset = 0;
  let caretPlaced = false;
  return <>{parts.map((part, index) => {
    const start = offset;
    const end = start + part.text.length;
    offset = end;
    if (caretIndex === undefined || caretPlaced || caretIndex < start || caretIndex > end) return <span className={`syntax-${part.kind}`} key={index}>{part.text}</span>;
    const split = Math.max(0, Math.min(part.text.length, caretIndex - start));
    caretPlaced = true;
    return <span className={`syntax-${part.kind}`} key={index}>{part.text.slice(0, split)}<i className="editor-caret" />{part.text.slice(split)}</span>;
  })}{caretIndex !== undefined && !caretPlaced && <i className="editor-caret" />}</>;
}

function SettingsPanel({ open, themeMode, showGuide, colourTyping, onThemeChange, onGuideChange, onColourTypingChange, onClose }: { open: boolean; themeMode: ThemeMode; showGuide: boolean; colourTyping: boolean; onThemeChange: (mode: ThemeMode) => void; onGuideChange: (show: boolean) => void; onColourTypingChange: (show: boolean) => void; onClose: () => void }) {
  if (!open) return null;
  return <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="settings-head"><div><small>CODESTEP</small><h2 id="settings-title">Settings</h2></div><button onClick={onClose} aria-label="Close settings">×</button></div>
      <div className="settings-group"><b>Appearance</b><span>Choose a theme or follow your device setting.</span><div className="theme-options">
        {(["light", "dark", "system"] as ThemeMode[]).map((mode) => <button key={mode} className={themeMode === mode ? "selected" : ""} onClick={() => onThemeChange(mode)}><i>{mode === "light" ? "☀" : mode === "dark" ? "☾" : "◐"}</i><span>{mode[0].toUpperCase() + mode.slice(1)}</span><small>{mode === "system" ? "Use device setting" : `${mode} appearance`}</small></button>)}
      </div></div>
      <div className="settings-group guide-setting"><div><b>Code guide</b><span>Show a faint, colour-coded copy of the expected answer in the editor.</span></div><button className={`switch ${showGuide ? "on" : ""}`} role="switch" aria-checked={showGuide} onClick={() => onGuideChange(!showGuide)}><i /></button></div>
      <div className="settings-group guide-setting"><div><b>Colour typed code</b><span>Give your typed code the same syntax colours as the ghost guide.</span></div><button className={`switch ${colourTyping ? "on" : ""}`} role="switch" aria-checked={colourTyping} onClick={() => onColourTypingChange(!colourTyping)}><i /></button></div>
      <p className="settings-foot">The guide includes comments but stays translucent so your own typing remains clear.</p>
    </section>
  </div>;
}

export default function Home() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState("");
  const [caretIndex, setCaretIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const [typedOutput, setTypedOutput] = useState("");
  const [ghostLength, setGhostLength] = useState(0);
  const [navOpen, setNavOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [showGuide, setShowGuide] = useState(true);
  const [colourTyping, setColourTyping] = useState(true);
  const [completed, setCompleted] = useState<Record<Language, number>>({ javascript: 0, csharp: 0, html: 0, css: 0 });

  const current = language ? lessons[language][index] : null;
  const visibleGhost = current ? current.answer.slice(0, ghostLength) : "";
  const guideCode = alignedGuide(code, visibleGhost);
  const breakdown = language
    ? (index === 5 && nullBreakdowns[language])
      || (index === 11 && setsBreakdowns[language])
      || breakdowns[language][language === "javascript" || language === "csharp" ? (index > 11 ? index - 2 : index > 5 ? index - 1 : index) : index]
    : undefined;
  const progress = language ? Math.round((index / lessons[language].length) * 100) : 0;
  const diagnostic = useMemo(() => current ? syntaxDiagnostic(code, current.answer) : [], [code, current]);

  useEffect(() => {
    if (current) {
      setCode(current.starter || "");
      setCaretIndex((current.starter || "").length);
      setStatus("idle");
      setTypedOutput("");
    }
  }, [current]);

  useEffect(() => {
    setGhostLength(0);
    if (!showGuide || !current) return;
    let position = 0;
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    const typeGhostCharacter = () => {
      position += 1;
      setGhostLength(position);
      if (position >= current.answer.length) return;
      const character = current.answer[position - 1];
      const rhythm = character === "\n" ? 24 : /[.,;{}]/.test(character) ? 11 : 5 + (position % 3) * 2;
      typingTimer = setTimeout(typeGhostCharacter, rhythm);
    };
    const delay = setTimeout(typeGhostCharacter, 180);
    return () => { clearTimeout(delay); if (typingTimer) clearTimeout(typingTimer); };
  }, [current, showGuide]);

  useEffect(() => {
    if (status !== "correct" || !current) { setTypedOutput(""); return; }
    const completeOutput = current.output.join("\n");
    let position = 0;
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    const typeNextCharacter = () => {
      position += 1;
      setTypedOutput(completeOutput.slice(0, position));
      if (position >= completeOutput.length) return;
      const character = completeOutput[position - 1];
      const rhythm = character === "\n" ? 85 : /[.,!?]/.test(character) ? 48 : 20 + (position % 4) * 4;
      typingTimer = setTimeout(typeNextCharacter, rhythm);
    };
    const delay = setTimeout(() => {
      typeNextCharacter();
    }, 350);
    return () => { clearTimeout(delay); if (typingTimer) clearTimeout(typingTimer); };
  }, [status, current]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("codestep-theme") as ThemeMode | null;
    const savedGuide = localStorage.getItem("codestep-code-guide");
    const savedColourTyping = localStorage.getItem("codestep-colour-typing");
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) setThemeMode(savedTheme);
    if (savedGuide !== null) setShowGuide(savedGuide === "true");
    if (savedColourTyping !== null) setColourTyping(savedColourTyping === "true");
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => { document.documentElement.dataset.theme = themeMode === "system" ? (media.matches ? "dark" : "light") : themeMode; };
    applyTheme();
    media.addEventListener("change", applyTheme);
    localStorage.setItem("codestep-theme", themeMode);
    return () => media.removeEventListener("change", applyTheme);
  }, [themeMode]);

  useEffect(() => { localStorage.setItem("codestep-code-guide", String(showGuide)); }, [showGuide]);
  useEffect(() => { localStorage.setItem("codestep-colour-typing", String(colourTyping)); }, [colourTyping]);

  const lineNumbers = useMemo(() => Array.from({ length: Math.max(8, code.split("\n").length) }, (_, i) => i + 1), [code]);

  function openCourse(next: Language) {
    setLanguage(next);
    setIndex(Math.min(completed[next], lessons[next].length - 1));
  }

  function checkCode() {
    if (!current) return;
    if (normalize(code) === normalize(current.answer)) {
      setStatus("correct");
      if (language) setCompleted((old) => ({ ...old, [language]: Math.max(old[language], index + 1) }));
    } else {
      setStatus("wrong");
    }
  }

  function handleEditorKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    const editor = event.currentTarget;
    if (event.key === "Enter" && status === "correct") {
      event.preventDefault();
      nextLesson();
      return;
    }
    if (event.key === "Enter" && current && normalize(code) === normalize(current.answer)) {
      event.preventDefault();
      checkCode();
      return;
    }
    if (event.key !== "Enter" && event.key !== "Tab") return;

    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lineStart = code.lastIndexOf("\n", start - 1) + 1;
    const indentation = code.slice(lineStart, start).match(/^\s*/)?.[0] ?? "";
    const insert = event.key === "Tab" ? "  " : `\n${indentation}${code.slice(0, start).trimEnd().endsWith("{") ? "  " : ""}`;
    const nextCode = code.slice(0, start) + insert + code.slice(end);
    const nextCaret = start + insert.length;
    setCode(nextCode);
    setCaretIndex(nextCaret);
    setStatus("idle");
    requestAnimationFrame(() => editor.setSelectionRange(nextCaret, nextCaret));
  }

  function nextLesson() {
    if (!language) return;
    if (index === lessons[language].length - 1) {
      setLanguage(null);
      setIndex(0);
    } else {
      setIndex((value) => value + 1);
    }
  }

  if (!language) {
    return (
      <>
      <main className="home-shell">
        <header className="home-nav"><div className="brand"><span className="brand-mark">&gt;_</span> Code<span>Step</span></div><div className="home-actions"><div className="nav-note">LEARN BY TYPING</div><button className="settings-button" onClick={() => setSettingsOpen(true)}>⚙ <span>Settings</span></button></div></header>
        <section className="hero">
          <div className="terminal-card" aria-hidden="true">
            <div className="terminal-top"><i/><i/><i/><span>first-steps.js</span></div>
            <div className="terminal-code"><small>1</small><div><b>function</b> <strong>sayHello</strong>() {'{'}<br />&nbsp;&nbsp;<span>console</span>.log(<u>"Hello, coder!"</u>);<br />{'}'}<br /><br /><strong>sayHello</strong>();</div></div>
            <div className="terminal-output"><span>›</span> Hello, coder!<i>▋</i></div>
            <div className="success-pill">✓ Nice work!</div>
          </div>
        </section>
        <section className="courses">
          <div className="section-heading"><div><span>CHOOSE YOUR PATH</span><h2>What do you want to learn?</h2></div><p>Pick a language. You can switch at any time.</p></div>
          <div className="course-grid">
            <button className="course-card js-card" onClick={() => openCourse("javascript")}>
              <div className="course-icon">JS</div><div className="course-count">{lessons.javascript.length} LESSONS</div>
              <h3>JavaScript</h3><p>Build interactive programs for the web, starting with functions and variables.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.javascript / lessons.javascript.length * 100}%`}} /></div></div>
            </button>
            <button className="course-card cs-card" onClick={() => openCourse("csharp")}>
              <div className="course-icon">C#</div><div className="course-count">{lessons.csharp.length} LESSONS</div>
              <h3>C Sharp</h3><p>Create powerful console apps and learn the foundations of strongly typed code.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.csharp / lessons.csharp.length * 100}%`}} /></div></div>
            </button>
            <button className="course-card py-card" onClick={() => openCourse("html")}>
              <div className="course-icon">HTML</div><div className="course-count">{lessons.html.length} LESSONS</div>
              <h3>HTML</h3><p>Build web pages with structure, headings, text, links, images, and scripts.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.html / lessons.html.length * 100}%`}} /></div></div>
            </button>
            <button className="course-card css-card" onClick={() => openCourse("css")}>
              <div className="course-icon">CSS</div><div className="course-count">{lessons.css.length} LESSONS</div>
              <h3>CSS</h3><p>Style web pages with colours, alignment, fonts, borders, and rounded corners.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.css / lessons.css.length * 100}%`}} /></div></div>
            </button>
          </div>
        </section>
      </main>
      <SettingsPanel open={settingsOpen} themeMode={themeMode} showGuide={showGuide} colourTyping={colourTyping} onThemeChange={setThemeMode} onGuideChange={setShowGuide} onColourTypingChange={setColourTyping} onClose={() => setSettingsOpen(false)} />
      </>
    );
  }

  return (
    <>
    <main className="lesson-shell">
      <header className="lesson-nav">
        <div className="lesson-brand-group"><button className="drawer-toggle" onClick={() => setNavOpen((open) => !open)} aria-label={navOpen ? "Close lesson list" : "Open lesson list"} aria-expanded={navOpen}><span>☰</span></button><button className="brand brand-button" onClick={() => setLanguage(null)}><span className="brand-mark">&gt;_</span> Code<span>Step</span></button></div>
        <div className="lesson-progress"><div><span>{languageName(language)} path</span><b>{index + 1} / {lessons[language].length}</b></div><div className="progress-track"><i style={{width: `${Math.max(progress, 4)}%`}} /></div></div>
        <div className="lesson-actions"><button className="settings-button" onClick={() => setSettingsOpen(true)}>⚙ <span>Settings</span></button><button className="exit-button" onClick={() => setLanguage(null)}>Exit lesson ×</button></div>
      </header>
      <div className={`lesson-layout ${navOpen ? "drawer-open" : "drawer-closed"}`}>
        <aside className="lesson-drawer" aria-label="Lesson list">
          <div className="drawer-head"><span>{languageBadge(language)}</span><div><small>LEARNING PATH</small><b>{languageName(language)}</b></div><button onClick={() => setNavOpen(false)} aria-label="Close lesson list">×</button></div>
          <div className="drawer-summary"><div><span>{completed[language]} of {lessons[language].length} completed</span><b>{Math.round(completed[language] / lessons[language].length * 100)}%</b></div><div className="drawer-progress"><i style={{width: `${completed[language] / lessons[language].length * 100}%`}} /></div></div>
          <nav className="drawer-lessons">
            {lessons[language].map((lesson, lessonIndex) => (
              <button key={lesson.title} className={`${lessonIndex === index ? "active" : ""} ${lessonIndex < completed[language] ? "done" : ""}`} onClick={() => { setIndex(lessonIndex); if (window.innerWidth <= 850) setNavOpen(false); }}>
                <span className="lesson-state">{lessonIndex < completed[language] ? "✓" : lessonIndex + 1}</span><span><small>{lesson.eyebrow.split("·")[1]}</small><b>{lesson.title}</b></span><i>›</i>
              </button>
            ))}
          </nav>
          <button className="drawer-home" onClick={() => setLanguage(null)}>← Choose another language</button>
        </aside>
        {navOpen && <button className="drawer-backdrop" aria-label="Close lesson list" onClick={() => setNavOpen(false)} />}
        <aside className="lesson-copy">
          <button className="back-link" onClick={() => index ? setIndex(index - 1) : setLanguage(null)}>← Back</button>
          <div className="lesson-number">{current!.eyebrow}</div>
          <h1>{current!.title}</h1>
          <p>{current!.explanation}</p>
          {breakdown && <section className="code-breakdown" aria-label="Code breakdown">
            <div className="breakdown-label">BREAK IT DOWN</div>
            <div className="breakdown-grid">{breakdown.map((part, partIndex) => <div className="breakdown-part" key={`${part.code}-${partIndex}`}>
              <code><HighlightedCode code={part.code} language={language} /></code><div><b>{part.name}</b><span>{part.meaning}</span></div>
            </div>)}</div>
          </section>}
          {current!.referenceOnly ? current!.referenceKind === "fonts" ? <div className="font-guide-note">
            <b>How the browser chooses</b>
            <p><code>font-family: Georgia, serif;</code> means “use Georgia if available; otherwise use the browser’s serif font.” Names containing spaces, such as <code>"Times New Roman"</code>, should be quoted.</p>
            <span>Commonly installed does not mean guaranteed on every operating system.</span>
          </div> : current!.referenceKind === "pages" ? <div className="pages-guide">
            <div><code>href=&quot;page2.html&quot;</code><p><b>Move forward</b><span>The link in index.html opens page2.html from the same folder.</span></p></div>
            <div><code>href=&quot;index.html&quot;</code><p><b>Go back</b><span>The second page links back to the first file.</span></p></div>
            <div className="page-flow"><b>index.html</b><span>⇄</span><b>page2.html</b></div>
          </div> : current!.referenceKind === "css" ? <div className="css-guide">
            <div><code>p.one</code><p><b>Class selector</b><span>Targets paragraph elements whose class is one.</span></p></div>
            <div><code>5px solid red</code><p><b>Border shorthand</b><span>Sets width, line style, and colour in one instruction.</span></p></div>
            <div><code>border-left</code><p><b>One side only</b><span>Styles only the left edge; border-bottom does the same for the bottom.</span></p></div>
            <div><code>border-radius</code><p><b>Rounded corners</b><span>Rounds the corners of the element's border.</span></p></div>
            <div><code>#222222</code><p><b>Hex colour</b><span>Uses a hash followed by red, green, and blue hexadecimal values.</span></p></div>
            <div><code>rgba(..., 0.4)</code><p><b>Transparent colour</b><span>The fourth number controls opacity from 0 to 1.</span></p></div>
          </div> : <div className="element-guide">
            <div><code>&lt;h1&gt;–&lt;h6&gt;</code><p><b>Heading hierarchy</b><span>Six levels, from the main page heading down to the smallest subheading.</span></p></div>
            <div><code>&lt;strong&gt;</code><p><b>Important bold text</b><span>Adds importance; browsers normally display it in bold.</span></p></div>
            <div><code>&lt;b&gt; / &lt;i&gt;</code><p><b>Visual bold and italic</b><span>Changes appearance without adding importance or emphasis.</span></p></div>
            <div><code>&lt;em&gt;</code><p><b>Emphasized text</b><span>Adds verbal emphasis; browsers normally display it in italics.</span></p></div>
            <div><code>&lt;mark&gt; / &lt;small&gt;</code><p><b>Highlight or reduce</b><span>Marks relevant text or displays a smaller side comment.</span></p></div>
            <div><code>&lt;del&gt; / &lt;ins&gt;</code><p><b>Deleted or inserted</b><span>Shows removed text with a line through it or added text with an underline.</span></p></div>
            <div><code>&lt;sub&gt; / &lt;sup&gt;</code><p><b>Subscript or superscript</b><span>Lowers or raises smaller text, useful for H₂O and 2³.</span></p></div>
          </div> : <>
            <div className="comment-card"><div className="comment-label">READ THE COMMENT</div><code>{current!.note}</code></div>
            <div className="tip"><span>↵</span> Type over the guide in the editor, then press Enter to check it. Spaces and indentation are accepted.</div>
          </>}
        </aside>
        <section className="workspace">
          {current!.referenceOnly ? current!.referenceKind === "fonts" ? <div className="font-reference-preview">
            <div className="preview-bar"><span>◆</span> CSS FONT REFERENCE</div>
            <div className="font-samples">
              <div style={{fontFamily:"Arial, sans-serif"}}><b>Arial</b><span>The quick brown fox jumps over the lazy dog.</span><code>Arial, sans-serif</code></div>
              <div style={{fontFamily:"Verdana, sans-serif"}}><b>Verdana</b><span>The quick brown fox jumps over the lazy dog.</span><code>Verdana, sans-serif</code></div>
              <div style={{fontFamily:"Tahoma, sans-serif"}}><b>Tahoma</b><span>The quick brown fox jumps over the lazy dog.</span><code>Tahoma, sans-serif</code></div>
              <div style={{fontFamily:"'Trebuchet MS', sans-serif"}}><b>Trebuchet MS</b><span>The quick brown fox jumps over the lazy dog.</span><code>&quot;Trebuchet MS&quot;, sans-serif</code></div>
              <div style={{fontFamily:"'Times New Roman', serif"}}><b>Times New Roman</b><span>The quick brown fox jumps over the lazy dog.</span><code>&quot;Times New Roman&quot;, serif</code></div>
              <div style={{fontFamily:"Georgia, serif"}}><b>Georgia</b><span>The quick brown fox jumps over the lazy dog.</span><code>Georgia, serif</code></div>
              <div style={{fontFamily:"Garamond, serif"}}><b>Garamond</b><span>The quick brown fox jumps over the lazy dog.</span><code>Garamond, serif</code></div>
              <div style={{fontFamily:"'Courier New', monospace"}}><b>Courier New</b><span>The quick brown fox jumps over the lazy dog.</span><code>&quot;Courier New&quot;, monospace</code></div>
              <div style={{fontFamily:"'Brush Script MT', cursive"}}><b>Brush Script MT</b><span>The quick brown fox jumps over the lazy dog.</span><code>&quot;Brush Script MT&quot;, cursive</code></div>
            </div>
            <button className="reference-next" onClick={nextLesson}>Continue to borders →</button>
          </div> : current!.referenceKind === "pages" ? <div className="pages-reference-preview">
            <div className="preview-bar"><span>◆</span> TWO HTML FILES</div>
            <div className="file-pair">
              <article><header><span>1</span><b>index.html</b></header><pre><code><HighlightedCode language="html" code={'<!DOCTYPE html>\n<html>\n<body>\n\n  <h1>First Page</h1>\n\n  <a href="page2.html">Go to Page 2</a>\n\n</body>\n</html>'} /></code></pre></article>
              <article><header><span>2</span><b>page2.html</b></header><pre><code><HighlightedCode language="html" code={'<!DOCTYPE html>\n<html>\n<body>\n\n  <h1>Page 2</h1>\n\n  <a href="index.html">Go back</a>\n\n</body>\n</html>'} /></code></pre></article>
            </div>
            <div className="link-journey"><b>First Page</b><span>Go to Page 2 →</span><b>Page 2</b><span>← Go back</span></div>
            <button className="reference-next" onClick={nextLesson}>Continue to images →</button>
          </div> : current!.referenceKind === "css" ? <div className="css-reference-preview">
            <div className="preview-bar"><span>◆</span> CSS BORDERS AND COLOURS</div>
            <div className="colour-samples"><div className="solid-colour">Solid rgb colour</div><div className="transparent-colour">Transparent rgba colour</div></div>
            <div className="border-samples">
              <p className="css-border red-solid">Solid red border <code>5px solid red</code></p>
              <p className="css-border green-solid">Solid green border <code>5px solid green</code></p>
              <p className="css-border blue-dotted">Dotted blue border <code>5px dotted blue</code></p>
              <p className="css-border left-only">Left border <code>border-left</code></p>
              <p className="css-border bottom-only">Bottom border <code>border-bottom</code></p>
              <p className="css-border rounded">Rounded border <code>border-radius: 5px</code></p>
            </div>
            <div className="hex-note"><code>#222222</code><span>Hex colours start with #. Each pair controls red, green, and blue.</span></div>
            <button className="reference-next" onClick={nextLesson}>Try the border quiz →</button>
          </div> : <div className="text-reference-preview">
            <div className="preview-bar"><span>◆</span> HTML TEXT REFERENCE</div>
            <div className="heading-samples"><h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6></div>
            <div className="format-samples">
              <div><small>&lt;strong&gt;</small><strong>Bold important text</strong></div>
              <div><small>&lt;b&gt;</small><b>Visually bold text</b></div>
              <div><small>&lt;i&gt; and &lt;em&gt;</small><span><i>Italic text</i> · <em>Emphasized text</em></span></div>
              <div><small>&lt;mark&gt; and &lt;small&gt;</small><span><mark>Highlighted text</mark> · <small>Smaller text</small></span></div>
              <div><small>&lt;del&gt; and &lt;ins&gt;</small><span><del>Deleted text</del> · <ins>Inserted text</ins></span></div>
              <div><small>&lt;sub&gt; and &lt;sup&gt;</small><span>H<sub>2</sub>O · 2<sup>3</sup></span></div>
            </div>
            <button className="reference-next" onClick={nextLesson}>Continue to the next lesson →</button>
          </div> : <>
          <div className="editor-panel">
            <div className="panel-bar"><div className="file-tab"><span>◆</span> {challengeFile(language)}</div><div className="panel-actions"><span>UTF-8</span><button onClick={() => { setCode(""); setCaretIndex(0); }} title="Reset code">↻ Reset</button></div></div>
            <div className={`editor-body ${colourTyping ? "colour-typing" : ""}`}><div className="line-numbers">{lineNumbers.map(n => <span key={n}>{n}</span>)}</div>{showGuide && <pre className="code-guide" aria-hidden="true"><span>CODE GUIDE</span><code><HighlightedCode code={guideCode} language={language} /></code></pre>}{colourTyping && <pre className="typed-code-layer" aria-hidden="true"><code><HighlightedCode code={code} language={language} caretIndex={caretIndex} /></code></pre>}<textarea aria-label="Code editor" spellCheck={false} value={code} onChange={(event) => {setCode(event.target.value); setCaretIndex(event.target.selectionStart); setStatus("idle")}} onSelect={(event) => setCaretIndex(event.currentTarget.selectionStart)} onKeyDown={handleEditorKeyDown} placeholder={showGuide ? "" : "// Type your code here..."} /></div>
          </div>
          <div className="console-panel">
            <div className="console-bar"><span><i /> CONSOLE</span><button onClick={() => setStatus("idle")}>Clear</button></div>
            <div className="console-body">
              {status === "idle" && <span className="console-muted">Your program output will appear here...</span>}
              {status === "wrong" && <><SyntaxDiagnostic parts={diagnostic} /><div className="console-muted diagnostic-hint">Hover over or focus each underlined part to see what it means.</div></>}
              {status === "correct" && <><div className="run-line"><span>✓</span> Code accepted — running...</div><div className="typed-output">{typedOutput.split("\n").map((line, i, lines) => <div key={i}><span className="prompt-mark">›</span> {line}{i === lines.length - 1 && <i className="output-cursor">▋</i>}</div>)}</div></>}
            </div>
          </div>
          <div className={`feedback ${status}`}>
            <div>{status === "correct" ? <><span className="feedback-icon">✓</span><p><b>That’s correct!</b><small>Press Enter again or choose the next lesson.</small></p></> : status === "wrong" ? <><span className="feedback-icon">!</span><p><b>Keep going</b><small>You’re close. Compare each symbol with the explanation.</small></p></> : <p><b>Ready to run?</b><small>When your code matches the example, press Enter.</small></p>}</div>
            {status === "correct" ? <button onClick={nextLesson}>{index === lessons[language].length - 1 ? "Finish path" : "Next lesson"} →</button> : <button onClick={checkCode} disabled={!code.trim()}>▶ Check code</button>}
          </div>
          </>}
        </section>
      </div>
    </main>
    <SettingsPanel open={settingsOpen} themeMode={themeMode} showGuide={showGuide} colourTyping={colourTyping} onThemeChange={setThemeMode} onGuideChange={setShowGuide} onColourTypingChange={setColourTyping} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
