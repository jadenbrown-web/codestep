"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import CodeBlocks from "./CodeBlocks";
import CodeLineNumbers from "./CodeLineNumbers";
import useQuickCodeReveal from "./useQuickCodeReveal";
import { CODE_TYPING_START_DELAY, codeTypingDelay } from "./typing-rhythm";
import { filterTopicLessons, pinnedLessonIndex, lessonTopic, restoreLessonPins, toggleTopicPin } from "./topic-pins";
import { checkLesson, checkPreparedLesson, prepareChecker } from "./lesson-checker";

type Language = "javascript" | "csharp" | "cpp" | "python" | "html" | "css";
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
  parts?: CodePart[];
  explanationTerms?: string[];
  outputColors?: string[];
  outputNote?: string;
  outputAnnotations?: string[];
  fileName?: string;
  runHint?: string;
  compareNode?: boolean;
  referenceOnly?: boolean;
  referenceKind?: "text" | "fonts" | "pages" | "css" | "comparisons";
};

const lessons: Record<Language, Lesson[]> = {
  "javascript": [
    {
      "eyebrow": "01 · Console output",
      "title": "Print several lines at once",
      "explanation": "console.log displays text in the console. Write \\n inside a quoted string to start a new line. The first \\n puts Welcome on the next line, and the second puts Goodbye on another line.",
      "note": "// Print Hello, Welcome, and Goodbye on separate lines.",
      "prompt": "Print Hello, Welcome, and Goodbye on separate lines.",
      "answer": "console.log(\" Hello \\n Welcome \\n Goodbye\");",
      "output": [
        " Hello ",
        " Welcome ",
        " Goodbye"
      ],
      "parts": [
        {
          "code": "console.log",
          "name": "Print",
          "meaning": "Displays the text in the console."
        },
        {
          "code": "\\n",
          "name": "New line",
          "meaning": "Write this inside the quoted string to start a new line."
        }
      ]
    },
    {
      "eyebrow": "02 · Functions",
      "title": "Make something happen",
      "explanation": "A function is a named block of code. Curly braces { } group the instructions that belong to it. The code waits until you call the function.",
      "note": "// Define correct: save the instructions under a name.\n// Call correct() after the definition to run those instructions.\n// Defining it alone prints nothing; removing the call means it never runs.",
      "prompt": "Create correct, then call it to print correct.",
      "answer": "// Define the function.\nfunction correct() {\n  console.log(\"correct\");\n}\n\n// Call the function to run its body.\ncorrect();",
      "output": [
        "correct"
      ],
      "parts": [
        {
          "code": "function",
          "name": "Create",
          "meaning": "Starts a reusable block of code."
        },
        {
          "code": "correct()",
          "name": "Name",
          "meaning": "Names the function so you can call it later."
        },
        {
          "code": "{ ... }",
          "name": "Instructions",
          "meaning": "Holds the code the function will run."
        },
        {
          "code": "correct();",
          "name": "Call it",
          "meaning": "Runs the function you created."
        },
        {
          "code": ";",
          "name": "End instruction",
          "meaning": "Marks where an instruction ends. JavaScript can sometimes work without it, but using it consistently makes the ending clear."
        }
      ],
      "explanationTerms": [
        "function",
        "named block of code",
        "{ }"
      ]
    },
    {
      "eyebrow": "03 · ANSI colours",
      "title": "Choose a text colour",
      "explanation": "ANSI escape codes choose terminal text colours: 31 is red, 32 green, 33 yellow, 34 blue, 35 magenta, and 36 cyan. Code 0 resets the colour so later output returns to normal. These codes work in terminals that support ANSI colours. The lesson console previews the colours.",
      "note": "// Print Red text and Green text, then reset the colour.",
      "prompt": "Print Red text and Green text, then reset the colour.",
      "answer": "const red = \"\\x1b[31m\";\nconst green = \"\\x1b[32m\";\nconst reset = \"\\x1b[0m\";\n\nconsole.log(`${red}Red text${reset}`);\nconsole.log(`${green}Green text${reset}`);",
      "output": [
        "Red text",
        "Green text"
      ],
      "parts": [
        {
          "code": "\\x1b",
          "name": "Escape character",
          "meaning": "Starts an ANSI instruction in a supporting terminal."
        },
        {
          "code": "[31m / [32m",
          "name": "Red or green",
          "meaning": "After the escape character, [31m selects red text and [32m selects green text."
        },
        {
          "code": "const red / green / reset",
          "name": "Save the colour codes",
          "meaning": "Keeps each colour code under a name so it can be used when printing."
        },
        {
          "code": "${red}",
          "name": "Apply a colour",
          "meaning": "Backticks and ${red} insert the saved red code before the text. ${reset} restores normal colour after it."
        },
        {
          "code": "\\x1b[0m",
          "name": "Reset",
          "meaning": "Returns terminal text to its normal colour so later output is not left red or green."
        }
      ],
      "outputColors": [
        "#ef4444",
        "#4ade80"
      ]
    },
    {
      "eyebrow": "04 · Time",
      "title": "Run code after a delay",
      "explanation": "setTimeout schedules the code inside its arrow function to run after 2000 milliseconds, or 2 seconds. () => creates the function; {} holds its instructions. The rest of the program can continue while the timer waits.",
      "note": "// Wait 2 seconds, then print Time reached!",
      "prompt": "Wait 2 seconds, then print Time reached!",
      "answer": "setTimeout(() => {\n  console.log(\"Time reached!\");\n}, 2000);",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "setTimeout",
          "name": "Run once later",
          "meaning": "Schedules a function to run once after the delay. The following instructions outside it can continue immediately."
        },
        {
          "code": "()",
          "name": "No function inputs",
          "meaning": "The empty parentheses before the arrow mean this function has no named inputs."
        },
        {
          "code": "=>",
          "name": "Arrow function",
          "meaning": "Connects those inputs to the function body on its right."
        },
        {
          "code": "{ ... }",
          "name": "Function body",
          "meaning": "Contains the instructions that run when the timer fires."
        },
        {
          "code": ",",
          "name": "Separate the arguments",
          "meaning": "Separates the function to run from the delay value passed to setTimeout."
        },
        {
          "code": "2000",
          "name": "Two seconds",
          "meaning": "The delay is in milliseconds. 2000 milliseconds means 2 seconds."
        }
      ],
      "outputNote": "Example output after the 2-second delay."
    },
    {
      "eyebrow": "05 · Time",
      "title": "Repeat code every second",
      "explanation": "setInterval repeats the code inside its arrow function. 1000 milliseconds means one second. The first Hello World message appears after approximately one second, then another appears approximately every second. Unlike setTimeout, which runs the code once after a delay, setInterval keeps repeating until stopped.",
      "note": "// Print Hello World approximately every second.",
      "prompt": "Use setInterval to print Hello World every second.",
      "answer": "setInterval(() => {\n    console.log(\"Hello World\");\n}, 1000);",
      "output": [
        "Hello World",
        "Hello World",
        "Hello World"
      ],
      "outputAnnotations": [
        "after 1 second",
        "after 2 seconds",
        "after 3 seconds"
      ],
      "parts": [
        {
          "code": "setInterval",
          "name": "Repeat",
          "meaning": "Schedules the function to run repeatedly until the interval is stopped."
        },
        {
          "code": "() => { ... }",
          "name": "Code to repeat",
          "meaning": "Creates the function whose instructions run each time the interval fires."
        },
        {
          "code": "console.log(\"Hello World\");",
          "name": "Print the message",
          "meaning": "Prints only Hello World each time the function runs."
        },
        {
          "code": "1000",
          "name": "One second",
          "meaning": "The interval is in milliseconds. 1000 milliseconds means one second."
        }
      ],
      "outputNote": "Example output from the first three repetitions. Time labels are annotations, not printed text. Actual timing can vary; the interval keeps repeating until stopped."
    },
    {
      "eyebrow": "06 · Date and time",
      "title": "Check for a particular time",
      "explanation": "This checks the local time once. getHours() and getMinutes() read parts of time. === compares values and types; && requires both comparisons to be true. The message prints only if this code runs during 17:20. An if statement alone does not keep watching the clock.",
      "note": "// Print Time reached! if the local hour is 17 and the minute is 20.",
      "prompt": "Print Time reached! if the local hour is 17 and the minute is 20.",
      "answer": "let time = new Date();\n\nlet hour = time.getHours();\nlet minute = time.getMinutes();\n\nif (hour === 17 && minute === 20) {\n  console.log(\"Time reached!\");\n}",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "new Date()",
          "name": "Capture the clock",
          "meaning": "Captures the current local date and time. This saved Date object does not keep updating itself."
        },
        {
          "code": "let time =",
          "name": "Save a value",
          "meaning": "let gives a value a name that can be reassigned later. = saves the value on the right under the name on the left."
        },
        {
          "code": "if (...) { ... }",
          "name": "Run a matching check",
          "meaning": "Runs the instructions inside the braces only when the condition is true."
        },
        {
          "code": "time.getHours()",
          "name": "Hour",
          "meaning": "Reads the hour from 0 to 23."
        },
        {
          "code": "time.getMinutes()",
          "name": "Minute",
          "meaning": "Reads the minute from 0 to 59."
        },
        {
          "code": "&&",
          "name": "Both",
          "meaning": "The hour and minute must both match."
        }
      ],
      "outputNote": "Example output when the clock is 17:20. At other times, this snippet prints nothing."
    },
    {
      "eyebrow": "07 · Date and time",
      "title": "Keep checking until the time is reached",
      "explanation": "This checks the clock every second while the program stays open. Each check creates a fresh Date. At 17:20 it prints once and clearInterval stops future checks. If 17:20 has passed, it waits for the next day. Browser timers may run late, especially in background tabs, so this is a learning example rather than an exact alarm.",
      "note": "// Keep checking the local clock and print Time reached! once at 17:20.",
      "prompt": "Keep checking the local clock and print Time reached! once at 17:20.",
      "answer": "const timer = setInterval(() => {\n  let time = new Date();\n  let hour = time.getHours();\n  let minute = time.getMinutes();\n\n  if (hour === 17 && minute === 20) {\n    console.log(\"Time reached!\");\n    clearInterval(timer);\n  }\n}, 1000);",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "setInterval",
          "name": "Repeat checks",
          "meaning": "Runs the callback repeatedly with a delay between checks."
        },
        {
          "code": "clearInterval(timer)",
          "name": "Stop",
          "meaning": "Cancels the repeating timer after the matching time."
        },
        {
          "code": "const timer = setInterval(...)",
          "name": "Keep the timer identifier",
          "meaning": "Saves this interval's identifier so clearInterval(timer) can stop that particular interval."
        }
      ],
      "outputNote": "Example output at 17:20. The lesson preview does not wait for the clock."
    },
    {
      "eyebrow": "08 · Functions",
      "title": "Use one function inside another",
      "explanation": "getMessage() returns Hello. In console.log(getMessage()), the inner function runs first, then console.log prints its returned value. Each call has its own pair of parentheses. In console.log((getMessage())), the extra parentheses only group the result; (( is not a special sign for multiple functions.",
      "note": "// Return Hello from getMessage, then print it by calling the function inside the print call.",
      "prompt": "Return Hello from getMessage, then print it by calling the function inside the print call.",
      "answer": "function getMessage() {\n  return \"Hello\";\n}\n\nconsole.log(getMessage());",
      "output": [
        "Hello"
      ],
      "parts": [
        {
          "code": "return",
          "name": "Send back",
          "meaning": "Ends the function and sends its value back to the caller."
        },
        {
          "code": "console.log(getMessage())",
          "name": "Nested calls",
          "meaning": "getMessage runs first; console.log receives Hello."
        }
      ]
    },
    {
      "eyebrow": "09 · Classes",
      "title": "Create and use a class",
      "explanation": "A function is called with its name, such as correct(). A class is used in a similar way, but you put new before its name: new Car(\"Ford\", 2014). People sometimes call this ‘calling the class’, but its proper name is creating an object, or an instance, from the class. The class is defined before the code that creates objects from it.",
      "note": "// Define the class first, then use new Car(...) to create objects",
      "prompt": "Create the Car class, then call its constructor with new to make Ford and Audi objects.",
      "answer": "class Car {\n  constructor(name, year) {\n    // this.name is the property stored in the car object.\n    // name is the value passed into the constructor.\n    this.name = name;\n\n    // this.year is the property stored in the car object.\n    // year is the value passed into the constructor.\n    this.year = year;\n  }\n}\n\nconst myCar1 = new Car(\"Ford\", 2014);\nconst myCar2 = new Car(\"Audi\", 2019);\n\nconsole.log(`${myCar1.name}, ${myCar1.year}`);\nconsole.log(`${myCar2.name}, ${myCar2.year}`);",
      "output": [
        "Ford, 2014",
        "Audi, 2019"
      ],
      "parts": [
        {
          "code": "class Car",
          "name": "Create the class",
          "meaning": "Defines the blueprint before any Car objects are created."
        },
        {
          "code": "constructor(name, year)",
          "name": "Receive values",
          "meaning": "Runs when new Car(...) creates an object. name and year receive Ford and 2014 from new Car(\"Ford\", 2014)."
        },
        {
          "code": "this.name = name",
          "name": "Store a property",
          "meaning": "this means this particular car object. This assignment saves the received name on that object's name property."
        },
        {
          "code": "new Car(\"Ford\", 2014)",
          "name": "Create an instance",
          "meaning": "Calls the constructor and creates one Car object."
        }
      ]
    },
    {
      "eyebrow": "10 · Variables",
      "title": "Choose let or const",
      "explanation": "A variable stores a value under a name. let allows you to assign a different value to that name later. const prevents assigning a different value to the same name. Both can store the answer returned by prompt(). These are separate examples: run one at a time, because you cannot declare name twice in the same scope.",
      "note": "// let: this variable can be reassigned.\n// const: this variable cannot be reassigned.",
      "prompt": "Use let to ask for a name, then print hello followed by the name.",
      "answer": "let name = prompt (\"Enter your name: \");\nconsole.log(`hello ${name}`);\n// this variable is changeable",
      "output": [
        "hello Alex"
      ],
      "parts": [
        {
          "code": "let",
          "name": "Changeable",
          "meaning": "Creates a variable that can receive a different value later: name = \"Sam\"; is allowed."
        },
        {
          "code": "const",
          "name": "Cannot be reassigned",
          "meaning": "Creates a variable that cannot receive a different value later. After declaring it with const, name = \"Sam\"; causes an error."
        },
        {
          "code": "=",
          "name": "Assign a value",
          "meaning": "Stores the value on the right in the variable on the left. Declare a variable once; use its name without let to change it."
        },
        {
          "code": "${name}",
          "name": "Use the saved name",
          "meaning": "Inserts the value of name into the text between backticks."
        }
      ],
      "outputNote": "Example output when the user enters Alex in the prompt dialog.",
      "runHint": "Run this example in a browser developer console or inside an HTML script. prompt() opens a browser dialog; it is not available in the Node terminal. CodeStep checks the code and shows a sample result."
    },
    {
      "eyebrow": "11 · Terminal input",
      "title": "Ask for a name in VS Code",
      "explanation": "Browser prompt() opens a dialog. Node runs JavaScript in the terminal and does not provide browser prompt(), so it needs a little setup. createInterface connects process.stdin (what you type) and process.stdout (what you see). await input.question waits for your answer, then returns the text to name. input.close() tells Node “I’m done taking input.” It closes this interface so it no longer keeps waiting for terminal input.",
      "note": "// Ask in the terminal, greet the user, then close input",
      "prompt": "Set up terminal input, ask for a name, print Hello, then close input.",
      "answer": "import { createInterface } from \"node:readline/promises\";\n\nconst input = createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nlet name = await input.question(\"What is your name?\");\nconsole.log(`Hello ${name}`);\n\ninput.close();",
      "output": [
        "What is your name? ",
        "Hello Alex"
      ],
      "fileName": "name.mjs",
      "runHint": "Save as name.mjs. With Node installed, open Terminal → New Terminal in VS Code and enter node name.mjs. Type your name and press Enter. The .mjs extension allows import and await at the top level without adding a package configuration.",
      "compareNode": true,
      "parts": [
        {
          "code": "import { createInterface }",
          "name": "Load the input tool",
          "meaning": "Imports the named createInterface function from Node’s built-in promise-based readline module; no npm install is needed."
        },
        {
          "code": "process.stdin / process.stdout",
          "name": "Terminal streams",
          "meaning": "stdin receives what you type; stdout writes what you see."
        },
        {
          "code": "await input.question(...)",
          "name": "Wait for an answer",
          "meaning": "The question returns a Promise; await waits for the typed line before the following code continues."
        },
        {
          "code": "input.close()",
          "name": "Finish taking input",
          "meaning": "Closes the readline interface when the questions are finished."
        }
      ],
      "outputAnnotations": [
        "you enter Alex",
        "the entered name is used"
      ],
      "outputNote": "Example input: Alex. The input label is an annotation."
    },
    {
      "eyebrow": "12 · If statements and symbols",
      "title": "Check an answer with if and else",
      "explanation": "Ask “What is 1 + 1?” and save the entered text in answer. == checks whether it equals \"2\". if runs its body when the check is true and prints Correct!; else runs its body when the check is false and prints Try again. Only one body runs. This example asks once. In the next lesson, a loop asks the same question again after a wrong answer.",
      "note": "// Ask once; print Correct! for 2, otherwise print Try again.",
      "prompt": "Ask What is 1 + 1? and use if and else to print Correct! or Try again.",
      "answer": "let answer = prompt(\"What is 1 + 1?\");\n\nif (answer == \"2\") {\n    console.log(\"Correct!\");\n} else {\n    console.log(\"Try again.\");\n}",
      "output": [
        "Correct!"
      ],
      "parts": [
        {
          "code": "if",
          "name": "Check the answer",
          "meaning": "Runs the first body only when answer equals \"2\"."
        },
        {
          "code": "==",
          "name": "Equal to",
          "meaning": "Compares the entered text with \"2\". Both values are text in this example; = saves a value instead."
        },
        {
          "code": "else",
          "name": "Otherwise",
          "meaning": "Runs the other body and prints Try again. when the if condition is false. It does not ask another question by itself."
        },
        {
          "code": "()",
          "name": "Hold the condition",
          "meaning": "The parentheses after if contain the check: answer == \"2\"."
        },
        {
          "code": "{}",
          "name": "Group the instructions",
          "meaning": "The braces after if and else surround each body. Put each action for that body on its own line inside them."
        }
      ],
      "outputNote": "Example input: 2. Entering a different answer prints Try again. The input labels are annotations, not text printed by the program.",
      "runHint": "Run this example in a browser developer console or inside an HTML script. prompt() opens a browser dialog; it is not available in the Node terminal. CodeStep checks the code and shows a sample result. Answer once; run the example again to try a different answer.",
      "outputAnnotations": [
        "answer is 2"
      ]
    },
    {
      "eyebrow": "13 · Loops",
      "title": "Repeat input until the answer is correct",
      "explanation": "The loop asks the question, saves the entered text, and prints that answer. If it is \"2\", it prints Correct! and break immediately leaves the nearest loop, skipping Try again. A wrong answer prints the retry message, then the next repetition asks again. The braces show which instructions belong to while and if.",
      "note": "// Create the loop with input, output, and break inside if.",
      "prompt": "Create the loop with input, output, and break inside if.",
      "answer": "while (true) {\n  let answer = prompt(\"What is 1 + 1?\");\n  console.log(answer);\n\n  if (answer == \"2\") {\n    console.log(\"Correct!\");\n    break;\n  }\n\n  console.log(\"Try again.\");\n}",
      "output": [
        "2",
        "Correct!"
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Keep repeating",
          "meaning": "The condition stays true, so this loop keeps repeating until break is reached. The instructions inside its braces form its body."
        },
        {
          "code": "prompt(...)",
          "name": "Read an answer",
          "meaning": "Waits for text in a browser dialog and saves it in answer."
        },
        {
          "code": "answer == \"2\"",
          "name": "Check the answer",
          "meaning": "Compares the entered text with \"2\". if runs its body only when this comparison is true."
        },
        {
          "code": "break;",
          "name": "Leave the loop",
          "meaning": "Immediately leaves the nearest loop and skips the rest of that repetition. Execution continues after the loop; break does not end the whole program. Here it skips the Try again. message below."
        },
        {
          "code": "console.log(\"Try again.\");",
          "name": "Repeat after a wrong answer",
          "meaning": "A wrong answer reaches this message. The next repetition then asks the question again."
        }
      ],
      "outputAnnotations": [
        "entered answer echoed",
        "break leaves the loop"
      ],
      "outputNote": "Example run: the first answer is 2. The labels beside the lines explain the run; the program does not print them.",
      "runHint": "Run this example in a browser developer console or inside an HTML script. prompt() opens a browser dialog; it is not available in the Node terminal. CodeStep checks the code and shows a sample result."
    },
    {
      "eyebrow": "14 · Dictionary",
      "title": "Search a word dictionary",
      "explanation": "A dictionary connects keys to values. JavaScript can use an object for this: {} contains bonjour and hola, with hello stored under each key. words[search] looks up the value for the key entered by the user. Object.values(words) lists the stored values; joining them makes readable console text. An unknown key produces undefined.",
      "note": "// Create the word dictionary, show its values, then search for a word.",
      "prompt": "Create the word dictionary, show its values, then search for a word.",
      "answer": "const words = {\n  bonjour: \"hello\",\n  hola: \"hello\"\n};\n\nconsole.log(Object.values(words).join(\", \"));\nlet search = prompt(\"Search:\");\nconsole.log(words[search]);",
      "output": [
        "hello, hello",
        "hello"
      ],
      "parts": [
        {
          "code": "{ bonjour: \"hello\" }",
          "name": "Key and value",
          "meaning": "bonjour is the key; hello is its value."
        },
        {
          "code": "words[search]",
          "name": "Look up",
          "meaning": "Square brackets retrieve the value for the saved key."
        },
        {
          "code": "Object.values(words)",
          "name": "Get the values",
          "meaning": "Returns an array containing the stored translations."
        },
        {
          "code": ".join(\", \")",
          "name": "Join the text",
          "meaning": "Turns the array into one text string, placing a comma and space between values."
        }
      ],
      "outputAnnotations": [
        "stored translations",
        "value for bonjour"
      ],
      "outputNote": "Example input: bonjour. Input labels are annotations, not text printed by the program.",
      "runHint": "Run this example in a browser developer console or inside an HTML script. prompt() opens a browser dialog; it is not available in the Node terminal. CodeStep checks the code and shows a sample result."
    },
    {
      "eyebrow": "15 · Expressions",
      "title": "Calculate a value",
      "explanation": "An expression produces a value. 80 + 20 produces 100. speed > 100 produces false when speed is 100. A statement performs an instruction, such as saving that result or printing it. + adds, - subtracts, * multiplies, / divides, and % gives the remainder. JavaScript division can produce a decimal result.",
      "note": "// Calculate speed with 80 + 20, then print Speed: 100.",
      "prompt": "Calculate speed with 80 + 20, then print Speed: 100.",
      "answer": "let speed = 80 + 20;\nconsole.log(`Speed: ${speed}`);",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "80 + 20",
          "name": "Expression",
          "meaning": "Produces the value 100."
        },
        {
          "code": "speed > 100",
          "name": "Boolean expression",
          "meaning": "Produces true or false."
        }
      ]
    },
    {
      "eyebrow": "16 · Random",
      "title": "Choose a random word",
      "explanation": "Object.keys(words) makes an array containing the object's keys: bonjour and hola. Math.random() creates a random decimal from 0 up to, but not including, 1. Multiplying by 2 gives a number from 0 up to, but not including, 2, and Math.floor rounds down to the nearest whole number to produce position 0 or 1. The square brackets then select the key at that position.",
      "note": "// Create the word dictionary and randomly select one of its keys.",
      "prompt": "Create the word dictionary and randomly select one of its keys.",
      "answer": "const words = {\n  bonjour: \"hello\",\n  hola: \"hello\"\n};\n\nlet random = Object.keys(words)[Math.floor(Math.random() * 2)];\n\nconsole.log(random);",
      "output": [
        "bonjour"
      ],
      "parts": [
        {
          "code": "const words = { ... };",
          "name": "Word dictionary",
          "meaning": "Creates an object of word-and-translation pairs. bonjour and hola are keys; hello is the value stored under each key."
        },
        {
          "code": "Object.keys(words)",
          "name": "List the keys",
          "meaning": "Object is a built-in JavaScript tool. Its keys() method returns [\"bonjour\", \"hola\"], an array of the dictionary keys."
        },
        {
          "code": "Math.random()",
          "name": "Random decimal",
          "meaning": "Math contains built-in maths tools. random() returns a number from 0 up to, but not including, 1."
        },
        {
          "code": "* 2",
          "name": "Two possible positions",
          "meaning": "The star means multiply. There are two keys, so multiplying by 2 gives a number from 0 up to, but not including, 2."
        },
        {
          "code": "Math.floor(...)",
          "name": "Round down",
          "meaning": "floor() rounds down to the nearest whole number: 0.8 becomes 0 and 1.8 becomes 1. Here it gives position 0 or 1, not position 2."
        },
        {
          "code": "[...]",
          "name": "Choose the key",
          "meaning": "Square brackets retrieve the key at the chosen array position. Array positions start at 0."
        }
      ],
      "outputNote": "Example output; either bonjour or hola can be chosen."
    },
    {
      "eyebrow": "17 · Arrays and lists",
      "title": "Make and search a names array",
      "explanation": "The square brackets [] create an empty array: a list that can hold several values. prompt asks the user for a name, and push() adds that answer to names. A second prompt saves what to look for in search. includes() checks whether that value is in the array and returns true or false; it does not add anything. if/else prints name found or name not found. Matching is case-sensitive: Jordan and jordan are different.",
      "note": "// Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "prompt": "Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "answer": "const names = [];\n\nnames.push(prompt(\"add a name\"));\n\nconst search = prompt(\"search for a name\");\n\nif (names.includes(search)) {\n  console.log(\"name found\");\n} else {\n  console.log(\"name not found\");\n}",
      "output": [
        "name found"
      ],
      "parts": [
        {
          "code": "[]",
          "name": "Empty array",
          "meaning": "Creates a list of values."
        },
        {
          "code": "names.push(prompt(\"add a name\"))",
          "name": "Nested calls",
          "meaning": "prompt runs first; push receives and adds its answer."
        },
        {
          "code": "names.includes(search)",
          "name": "Search",
          "meaning": "Checks for the exact value without changing the array."
        }
      ],
      "outputAnnotations": [
        "Jordan matches Jordan"
      ],
      "outputNote": "Example input: add Jordan, then search for Jordan. Input labels are annotations, not printed text.",
      "runHint": "Run this example in a browser developer console or inside an HTML script. prompt() opens a browser dialog; it is not available in the Node terminal. CodeStep checks the code and shows a sample result."
    },
    {
      "eyebrow": "18 · Sets",
      "title": "Remove duplicate names",
      "explanation": "A Set stores only unique values. Passing names into new Set(names) removes repeated names, and [...uniqueNames] spreads the remaining values back into an array for printing.",
      "note": "// Ask for three names, then remove any duplicates",
      "prompt": "Collect three names, create a Set, and print its unique values.",
      "answer": "const names = [];\n\nnames.push(prompt(\"Enter the first name:\"));\nnames.push(prompt(\"Enter the second name:\"));\nnames.push(prompt(\"Enter the third name:\"));\n\nconst uniqueNames = new Set(names);\n\nconsole.log(`[${[...uniqueNames].join(\", \")}]`);",
      "output": [
        "[Alex, Sam]"
      ],
      "parts": [
        {
          "code": "new Set(names)",
          "name": "Remove duplicates",
          "meaning": "Creates a Set from names. A Set keeps only one copy of each value."
        },
        {
          "code": "[...uniqueNames]",
          "name": "Spread into an array",
          "meaning": "The three dots copy every Set value into a new array for familiar array-style output."
        }
      ],
      "outputAnnotations": [
        "Alex appears once"
      ],
      "outputNote": "Example input: Alex, Sam, Alex. The repeated name is kept once. The labels are annotations, not printed text.",
      "runHint": "Run this example in a browser developer console or inside an HTML script. prompt() opens a browser dialog; it is not available in the Node terminal. CodeStep checks the code and shows a sample result."
    },
    {
      "eyebrow": "19 · Null",
      "title": "Mark a value as not ready yet",
      "explanation": "null deliberately means that a variable has no value yet. It is different from zero or an empty string, and the variable may receive a real value later. === null checks specifically for that missing value.",
      "note": "// null means there is deliberately no result yet",
      "prompt": "Set result to null, then print the message for its current state.",
      "answer": "let result = null; // There is no result yet\n\nif (result === null) {\n  console.log(\"No result yet\");\n} else {\n  console.log(\"Result is ready\");\n}",
      "output": [
        "No result yet"
      ],
      "parts": [
        {
          "code": "null",
          "name": "No value yet",
          "meaning": "Deliberately stores no value for now; result can receive one later."
        },
        {
          "code": "=== null",
          "name": "Exact check",
          "meaning": "Checks whether result is specifically the null value."
        }
      ]
    },
    {
      "eyebrow": "20 · Regular expressions",
      "title": "Let names beginning with J enter",
      "explanation": "A regular expression checks text against a pattern. /^J/i means: the slashes hold the pattern, ^ anchors the check to the beginning, J is the required first letter, and i ignores uppercase or lowercase. It accepts any word beginning with J—not only names—and rejects J when it appears later in the text.",
      "note": "// Let people into the club when their name begins with J",
      "prompt": "Check the five names and print who may enter the club.",
      "answer": "const names = [\"Jordan\", \"James\", \"Jessica\", \"Sarah\", \"Ben\"];\n\nfor (const name of names) {\n  if (/^J/i.test(name)) {\n    console.log(name + \" can enter the club.\");\n  } else {\n    console.log(name + \" cannot enter the club.\");\n  }\n}",
      "output": [
        "Jordan can enter the club.",
        "James can enter the club.",
        "Jessica can enter the club.",
        "Sarah cannot enter the club.",
        "Ben cannot enter the club."
      ],
      "parts": [
        {
          "code": "for (const name of names)",
          "name": "Visit each name",
          "meaning": "Takes each name from the array in order, runs the body once per name, and stops when the array ends."
        },
        {
          "code": "name + \"...\"",
          "name": "Join text",
          "meaning": "When used with text, + joins the name and message into one string."
        },
        {
          "code": "/ ... /",
          "name": "Pattern",
          "meaning": "The forward slashes mark the beginning and end of a regular expression."
        },
        {
          "code": "^",
          "name": "Beginning",
          "meaning": "The caret says the match must start at the very beginning of the text."
        },
        {
          "code": "J",
          "name": "Required letter",
          "meaning": "This is the letter that must appear first."
        },
        {
          "code": "i",
          "name": "Ignore case",
          "meaning": "Accepts either uppercase J or lowercase j."
        },
        {
          "code": ".test(name)",
          "name": "Check a name",
          "meaning": "Returns true when name begins with J and false when it does not."
        }
      ]
    },
    {
      "title": "Get a filename from a path",
      "eyebrow": "21 · Files and paths",
      "explanation": "Build the first piece of a sheet-music finder. A path is a location: sheet-music is the folder and chopin-nocturne.png is the filename. Extracting the name only handles the path; it does not check whether the file exists or read its contents. The .png extension identifies the intended file format, not the words or notes in the picture.",
      "note": "// Extract the filename without opening the image.",
      "prompt": "Print the filename from the score path.",
      "answer": "import { basename } from \"node:path\";\n\nconst file = \"sheet-music/chopin-nocturne.png\";\nconsole.log(basename(file));",
      "output": [
        "chopin-nocturne.png"
      ],
      "parts": [
        {
          "code": "import { basename } from \"node:path\"",
          "name": "Import a path tool",
          "meaning": "Uses the built-in Node.js library; no npm package is needed."
        },
        {
          "code": "basename(file)",
          "name": "Get the filename",
          "meaning": "Returns the last part of the path, including .png."
        }
      ],
      "runHint": "Use Node.js, not a browser console. Save as file-finder.mjs and run node file-finder.mjs.",
      "outputNote": "Example preview. Extracting a filename does not access your computer or prove that the file exists.",
      "fileName": "file-finder.mjs"
    },
    {
      "title": "List files in a folder",
      "eyebrow": "22 · Files and paths",
      "explanation": "Now let the program discover files rather than typing every filename into a list. Scan the sheet-music folder, skip folders, and print each filename. This reads the folder listing, not the image contents. Only this folder is searched; files inside subfolders are not included. The folder must exist and be readable, or listing it can raise an error.",
      "note": "// List each file in your sheet-music folder.",
      "prompt": "Print filenames from the sheet-music folder, skipping folders.",
      "answer": "import { readdirSync } from \"node:fs\";\n\nconst files = readdirSync(\"sheet-music\", { withFileTypes: true });\n\nfor (const file of files) {\n  if (file.isFile()) {\n    console.log(file.name);\n  }\n}",
      "output": [
        "chopin-nocturne.png",
        "practice-notes.txt"
      ],
      "parts": [
        {
          "code": "readdirSync",
          "name": "List the folder",
          "meaning": "Reads directory entries synchronously. Simple for this small terminal example; it blocks until finished."
        },
        {
          "code": "withFileTypes: true",
          "name": "Include entry types",
          "meaning": "Returns entries with names and methods for checking whether they are files."
        },
        {
          "code": "file.isFile()",
          "name": "Keep files",
          "meaning": "Skips folders; file.name gives the filename."
        }
      ],
      "runHint": "Use Node.js, not a browser console. Save as file-finder.mjs and run node file-finder.mjs. Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview for a folder containing these two files. Order may vary. CodeStep checks your code and shows sample output; run it locally to list your own files.",
      "fileName": "file-finder.mjs"
    },
    {
      "title": "Find a sheet-music file",
      "eyebrow": "23 · Files and paths",
      "explanation": "Finish this small file-finding program by checking for the score at its expected location and showing a useful result. When you already know the folder and filename, checking that path is simpler than looping through the entire folder. This checks for a file; it does not open the image or recognise its printed title. Use the exact spelling and capitalisation so the example works across systems.",
      "note": "// Check whether the score exists before using it.",
      "prompt": "Print Found: and the filename, or File not found.",
      "answer": "import { existsSync, statSync } from \"node:fs\";\nimport { basename } from \"node:path\";\n\nconst file = \"sheet-music/chopin-nocturne.png\";\n\nif (existsSync(file) && statSync(file).isFile()) {\n  console.log(\"Found: \" + basename(file));\n} else {\n  console.log(\"File not found\");\n}",
      "output": [
        "Found: chopin-nocturne.png"
      ],
      "parts": [
        {
          "code": "existsSync(file)",
          "name": "Check existence",
          "meaning": "Checks whether this path exists."
        },
        {
          "code": "&&",
          "name": "Check both conditions",
          "meaning": "Only calls statSync when the first check is true, avoiding an error for an already missing file."
        },
        {
          "code": "statSync(file).isFile()",
          "name": "Check the type",
          "meaning": "Checks that the entry is a regular file, not a folder. A file removed between checks can still cause an error."
        }
      ],
      "runHint": "Use Node.js, not a browser console. Save as file-finder.mjs and run node file-finder.mjs. Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview with the score present. Remove or rename it locally to try the File not found branch. CodeStep does not inspect your device.",
      "fileName": "file-finder.mjs"
    },
    {
      "eyebrow": "24 · Application practice",
      "title": "Build a random word quiz",
      "explanation": "Create a word dictionary, choose one of its keys, ask for the translation, then check the answer. Math.random() gives a decimal from 0 up to, but not including, 1. Multiplying by 2 covers the two key positions. Math.floor() rounds down to position 0 or 1. Object.keys(words)[...] retrieves that key; words[random] retrieves its translation. The dot selects a tool such as floor from Math, and () calls it. This example has exactly two dictionary entries; if you add entries, update the position limit too.",
      "note": "// Combine the word dictionary and random key code to make a translation quiz.",
      "prompt": "Combine the word dictionary and random key code to make a translation quiz.",
      "answer": "const words = {\n  bonjour: \"hello\",\n  hola: \"hello\"\n};\n\nlet random = Object.keys(words)[Math.floor(Math.random() * 2)];\n\nlet answer = prompt(random);\n\nif (answer == words[random]) {\n  console.log(\"Correct\");\n} else {\n  console.log(\"Wrong\");\n}",
      "output": [
        "Correct"
      ],
      "parts": [
        {
          "code": "const words = { ... };",
          "name": "Word dictionary",
          "meaning": "Creates an object of word-and-translation pairs. bonjour and hola are keys; hello is the value stored under each key."
        },
        {
          "code": "Object.keys(words)",
          "name": "List the keys",
          "meaning": "Object is a built-in JavaScript tool. Its keys() method returns [\"bonjour\", \"hola\"], an array of the dictionary keys."
        },
        {
          "code": "Math.random()",
          "name": "Random decimal",
          "meaning": "Math contains built-in maths tools. random() returns a number from 0 up to, but not including, 1."
        },
        {
          "code": "* 2",
          "name": "Two possible positions",
          "meaning": "The star means multiply. There are two keys, so multiplying by 2 gives a number from 0 up to, but not including, 2."
        },
        {
          "code": "Math.floor(...)",
          "name": "Round down",
          "meaning": "floor() rounds down to the nearest whole number: 0.8 becomes 0 and 1.8 becomes 1. Here it gives position 0 or 1, not position 2."
        },
        {
          "code": "[...]",
          "name": "Choose the key",
          "meaning": "Square brackets retrieve the key at the chosen array position. Array positions start at 0."
        },
        {
          "code": "prompt(random)",
          "name": "Ask for a translation",
          "meaning": "Shows the selected key in a browser dialog and saves the typed text in answer."
        },
        {
          "code": "words[random]",
          "name": "Expected translation",
          "meaning": "Uses the chosen key to retrieve hello from the dictionary."
        },
        {
          "code": "answer == words[random]",
          "name": "Check the answer",
          "meaning": "Compares the typed answer with the expected translation. Both are text here. Matching is case-sensitive."
        },
        {
          "code": "if / else",
          "name": "One result",
          "meaning": "Prints Correct when the answer matches; otherwise prints Wrong. console.log prints the message."
        }
      ],
      "outputNote": "Example run: bonjour is chosen and the user enters hello. The entered answer is input; the labels are annotations.",
      "runHint": "Run this example in a browser developer console or inside an HTML script. prompt() opens a browser dialog; it is not available in the Node terminal. CodeStep checks the code and shows a sample result.",
      "outputAnnotations": [
        "hello matches the translation"
      ]
    }
  ],
  "csharp": [
    {
      "eyebrow": "01 · Console output",
      "title": "Print several lines at once",
      "explanation": "Console.WriteLine displays text in the console. Write \\n inside a quoted string to start a new line. The first \\n puts Welcome on the next line, and the second puts Goodbye on another line.",
      "note": "// Print Hello, Welcome, and Goodbye on separate lines.",
      "prompt": "Print Hello, Welcome, and Goodbye on separate lines.",
      "answer": "Console.WriteLine(\" Hello \\n Welcome \\n Goodbye\");",
      "output": [
        " Hello ",
        " Welcome ",
        " Goodbye"
      ],
      "parts": [
        {
          "code": "Console.WriteLine",
          "name": "Print",
          "meaning": "Displays the text in the console."
        },
        {
          "code": "\\n",
          "name": "New line",
          "meaning": "Write this inside the quoted string to start a new line."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "02 · Functions",
      "title": "Make something happen",
      "explanation": "A function saves instructions under a name so you can run them again. Here void correct() is a local function in a C# console program. void means it returns no value; () holds its inputs (none here); { } encloses its body. correct(); calls it after the definition. Defining it alone does not run it. A function inside a class is called a method. Modern console projects allow top-level code, so you do not need a Program class or Main method for this example.",
      "note": "// Define correct: save the instructions under a name.\n// Call correct() after the definition to run those instructions.\n// Defining it alone prints nothing; removing the call means it never runs.",
      "prompt": "Create correct, then call it to print correct.",
      "answer": "// Define the function.\nvoid correct() {\n  Console.WriteLine(\"correct\");\n}\n\n// Call the function to run its body.\ncorrect();",
      "output": [
        "correct"
      ],
      "parts": [
        {
          "code": "void",
          "name": "Result type",
          "meaning": "Says this function does not send a value back."
        },
        {
          "code": "correct()",
          "name": "Name",
          "meaning": "Names the function so you can call it later."
        },
        {
          "code": "{ ... }",
          "name": "Instructions",
          "meaning": "Holds the code the function will run."
        },
        {
          "code": "correct();",
          "name": "Call it",
          "meaning": "Runs the function you created."
        },
        {
          "code": ";",
          "name": "End statement",
          "meaning": "Marks where a statement ends. C# requires it after statements such as calling a function or printing text."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first.",
      "explanationTerms": [
        "function",
        "void correct()",
        "void",
        "()",
        "{ }",
        "correct();",
        "method"
      ]
    },
    {
      "eyebrow": "03 · ANSI colours",
      "title": "Choose a text colour",
      "explanation": "ANSI escape codes choose terminal text colours: 31 is red, 32 green, 33 yellow, 34 blue, 35 magenta, and 36 cyan. Code 0 resets the colour so later output returns to normal. These codes work in terminals that support ANSI colours. The lesson console previews the colours.",
      "note": "// Print Red text and Green text, then reset the colour.",
      "prompt": "Print Red text and Green text, then reset the colour.",
      "answer": "const string red = \"\\u001b[31m\";\nconst string green = \"\\u001b[32m\";\nconst string reset = \"\\u001b[0m\";\n\nConsole.WriteLine($\"{red}Red text{reset}\");\nConsole.WriteLine($\"{green}Green text{reset}\");",
      "output": [
        "Red text",
        "Green text"
      ],
      "parts": [
        {
          "code": "\\u001b",
          "name": "Escape character",
          "meaning": "Starts an ANSI instruction in a supporting terminal."
        },
        {
          "code": "[31m / [32m",
          "name": "Red or green",
          "meaning": "After the escape character, [31m selects red text and [32m selects green text."
        },
        {
          "code": "const string red / green / reset",
          "name": "Save the colour codes",
          "meaning": "Keeps each colour code under a name so it can be used when printing."
        },
        {
          "code": "$\"{red}\"",
          "name": "Apply a colour",
          "meaning": "The $ enables interpolation: {red} inserts the saved red code before the text, and {reset} restores normal colour after it."
        },
        {
          "code": "\\u001b[0m",
          "name": "Reset",
          "meaning": "Returns terminal text to its normal colour so later output is not left red or green."
        }
      ],
      "outputColors": [
        "#ef4444",
        "#4ade80"
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "04 · Time",
      "title": "Run code after a delay",
      "explanation": "Task.Delay creates a wait of 2000 milliseconds, or 2 seconds. await waits for it to finish before running the next instruction in this flow. This does not block the thread. The following Console.WriteLine prints the message after the delay.",
      "note": "// Wait 2 seconds, then print Time reached!",
      "prompt": "Wait 2 seconds, then print Time reached!",
      "answer": "await System.Threading.Tasks.Task.Delay(2000);\nConsole.WriteLine(\"Time reached!\");",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "await",
          "name": "Wait here",
          "meaning": "Continues this flow after the asynchronous wait finishes."
        },
        {
          "code": "2000",
          "name": "Milliseconds",
          "meaning": "1000 milliseconds = 1 second."
        }
      ],
      "outputNote": "Example output after the 2-second delay.",
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "05 · Date and time",
      "title": "Check for a particular time",
      "explanation": "This checks the local time once. Hour and Minute read parts of time. == compares values; && requires both comparisons to be true. The message prints only if this code runs during 17:20. An if statement alone does not keep watching the clock.",
      "note": "// Print Time reached! if the local hour is 17 and the minute is 20.",
      "prompt": "Print Time reached! if the local hour is 17 and the minute is 20.",
      "answer": "DateTime time = DateTime.Now;\n\nint hour = time.Hour;\nint minute = time.Minute;\n\nif (hour == 17 && minute == 20) {\n  Console.WriteLine(\"Time reached!\");\n}",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "DateTime.Now",
          "name": "Capture the clock",
          "meaning": "Reads a snapshot of the computer's current local date and time. This saved value does not keep updating itself."
        },
        {
          "code": "time.Hour",
          "name": "Hour",
          "meaning": "Reads the hour from 0 to 23."
        },
        {
          "code": "time.Minute",
          "name": "Minute",
          "meaning": "Reads the minute from 0 to 59."
        },
        {
          "code": "&&",
          "name": "Both",
          "meaning": "The hour and minute must both match."
        },
        {
          "code": "if (hour == 17 && minute == 20)",
          "name": "Check both values",
          "meaning": "if runs its body only when both comparisons are true. && (two ampersands) means both the hour and minute must match."
        }
      ],
      "outputNote": "Example output when the clock is 17:20. At other times, this snippet prints nothing.",
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "06 · Date and time",
      "title": "Keep checking until the time is reached",
      "explanation": "This loop checks a fresh DateTime.Now every second while the program stays open. At 17:20 it prints once and break stops the loop. Task.Delay gives the loop a 1-second wait between checks. If 17:20 has passed, it waits for the next day. Checks can run late, so this is a learning example rather than an exact alarm.",
      "note": "// Keep checking the local clock and print Time reached! once at 17:20.",
      "prompt": "Keep checking the local clock and print Time reached! once at 17:20.",
      "answer": "while (true) {\n  DateTime time = DateTime.Now;\n  int hour = time.Hour;\n  int minute = time.Minute;\n\n  if (hour == 17 && minute == 20) {\n    Console.WriteLine(\"Time reached!\");\n    break;\n  }\n\n  await System.Threading.Tasks.Task.Delay(1000);\n}",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Repeat checks",
          "meaning": "The condition stays true, so the loop repeats its body inside the braces until break is reached."
        },
        {
          "code": "break",
          "name": "Leave the loop",
          "meaning": "Immediately leaves the nearest loop and skips the rest of that repetition. Execution continues after the loop; break does not end the whole program."
        }
      ],
      "outputNote": "Example output at 17:20. The lesson preview does not wait for the clock.",
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "07 · Functions",
      "title": "Use one function inside another",
      "explanation": "getMessage() returns Hello. In Console.WriteLine(getMessage()), the inner function runs first, then Console.WriteLine prints its returned value. Each call has its own pair of parentheses. In Console.WriteLine((getMessage())), the extra parentheses only group the result; (( is not a special sign for multiple functions.",
      "note": "// Return Hello from getMessage, then print it by calling the function inside the print call.",
      "prompt": "Return Hello from getMessage, then print it by calling the function inside the print call.",
      "answer": "string getMessage() {\n  return \"Hello\";\n}\n\nConsole.WriteLine(getMessage());",
      "output": [
        "Hello"
      ],
      "parts": [
        {
          "code": "return",
          "name": "Send back",
          "meaning": "Ends the function and sends its value back to the caller."
        },
        {
          "code": "Console.WriteLine(getMessage())",
          "name": "Nested calls",
          "meaning": "getMessage runs first; Console.WriteLine receives Hello."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "08 · Classes",
      "title": "Create and use a class",
      "explanation": "A method is called with its name, such as correct(). A class is used in a similar way, but you put new before its name: new Car(\"Ford\", 2014). The Car class is defined before Program, and Main then creates objects, or instances, from that class.",
      "note": "// Define Car, create car objects, then print their properties.",
      "prompt": "Create the Car class, then call its constructor with new to make Ford and Audi objects.",
      "answer": "class Car\n{\n  public string Name { get; set; }\n  public int Year { get; set; }\n\n  public Car(string name, int year)\n  {\n    // this.Name is the property stored in the car object.\n    // name is the value passed into the constructor.\n    this.Name = name;\n\n    // this.Year is the property stored in the car object.\n    // year is the value passed into the constructor.\n    this.Year = year;\n  }\n}\n\nclass Program\n{\n  static void Main()\n  {\n    Car myCar1 = new Car(\"Ford\", 2014);\n    Car myCar2 = new Car(\"Audi\", 2019);\n\n    Console.WriteLine($\"{myCar1.Name}, {myCar1.Year}\");\n    Console.WriteLine($\"{myCar2.Name}, {myCar2.Year}\");\n  }\n}",
      "output": [
        "Ford, 2014",
        "Audi, 2019"
      ],
      "parts": [
        {
          "code": "class Car",
          "name": "Define the class",
          "meaning": "Defines a blueprint for Car objects. Each object keeps its own property values."
        },
        {
          "code": "public string Name",
          "name": "Property",
          "meaning": "Stores a text name that other code can read or change."
        },
        {
          "code": "Car(string name, int year)",
          "name": "Constructor",
          "meaning": "Receives the starting values when new Car(...) creates an object."
        },
        {
          "code": "new Car(\"Ford\", 2014)",
          "name": "Create an instance",
          "meaning": "Creates one Car object inside Main."
        },
        {
          "code": "public",
          "name": "Allow outside access",
          "meaning": "Lets code outside Car use this constructor or property."
        },
        {
          "code": "{ get; set; }",
          "name": "Read or change a property",
          "meaning": "get allows reading the property; set allows assigning a new value."
        },
        {
          "code": "this.Name = name",
          "name": "Store the starting value",
          "meaning": "this.Name is this car object's property; name is the input received by its constructor."
        },
        {
          "code": "static void Main()",
          "name": "Start the program",
          "meaning": "Main is the program's entry method here. static means no Program object is needed to call it; void means it sends no value back."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "09 · Variables",
      "title": "Use changeable and fixed values",
      "explanation": "speed starts at 80 and can be reassigned. speed = 100 replaces its earlier value. const keeps maxSpeed fixed at 100, so assigning a different value to maxSpeed is not allowed. The last instruction prints the updated speed.",
      "note": "// Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
      "prompt": "Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
      "answer": "int speed = 80;\nconst int maxSpeed = 100;\n\nspeed = 100;\nConsole.WriteLine($\"Speed: {speed}\");",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "int speed = 80;",
          "name": "Changeable value",
          "meaning": "Creates speed with the starting value 80. It can receive a different value later."
        },
        {
          "code": "const int maxSpeed = 100;",
          "name": "Fixed value",
          "meaning": "Creates maxSpeed as a constant. It cannot be reassigned."
        },
        {
          "code": "speed = 100;",
          "name": "Reassign",
          "meaning": "Replaces the earlier value 80 with 100; it does not create a second speed variable."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "10 · Terminal input",
      "title": "Ask for a name in VS Code",
      "explanation": "Console.WriteLine displays the question. Console.ReadLine() reads a line of terminal text, and name stores it. The last Console.WriteLine prints the greeting using that saved answer.",
      "note": "// Ask for a name and greet the user",
      "prompt": "Create a name variable, then print Hello with a template string.",
      "answer": "Console.WriteLine(\"What is your name?\");\nstring name = Console.ReadLine();\nConsole.WriteLine($\"Hello {name}\");",
      "output": [
        "What is your name?",
        "Hello Alex"
      ],
      "parts": [
        {
          "code": "string",
          "name": "Type",
          "meaning": "Says this variable will store text."
        },
        {
          "code": "name",
          "name": "Label",
          "meaning": "Shows that you choose a useful name for the saved value."
        },
        {
          "code": "=",
          "name": "Save",
          "meaning": "Puts the value on the right into the variable on the left."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first.",
      "outputAnnotations": [
        "you enter Alex",
        "the entered name is used"
      ],
      "outputNote": "Example input: Alex. The input label is an annotation."
    },
    {
      "eyebrow": "11 · If statements and symbols",
      "title": "Check an answer with if and else",
      "explanation": "Ask “What is 1 + 1?” and save the entered text in answer. == checks whether it equals \"2\". if runs its body when the check is true and prints Correct!; else runs its body when the check is false and prints Try again. Only one body runs. This example asks once. In the next lesson, a loop asks the same question again after a wrong answer.",
      "note": "// Ask once; print Correct! for 2, otherwise print Try again.",
      "prompt": "Ask What is 1 + 1? and use if and else to print Correct! or Try again.",
      "answer": "Console.WriteLine(\"What is 1 + 1?\");\nstring? answer = Console.ReadLine();\n\nif (answer == \"2\") {\n    Console.WriteLine(\"Correct!\");\n} else {\n    Console.WriteLine(\"Try again.\");\n}",
      "output": [
        "What is 1 + 1?",
        "Correct!"
      ],
      "parts": [
        {
          "code": "if",
          "name": "Check the answer",
          "meaning": "Runs the first body only when answer equals \"2\"."
        },
        {
          "code": "==",
          "name": "Equal to",
          "meaning": "Compares the entered text with \"2\". Both values are text in this example; = saves a value instead."
        },
        {
          "code": "else",
          "name": "Otherwise",
          "meaning": "Runs the other body and prints Try again. when the if condition is false. It does not ask another question by itself."
        },
        {
          "code": "()",
          "name": "Hold the condition",
          "meaning": "The parentheses after if contain the check: answer == \"2\"."
        },
        {
          "code": "{}",
          "name": "Group the instructions",
          "meaning": "The braces after if and else surround each body. Put each action for that body on its own line inside them."
        },
        {
          "code": "string? answer",
          "name": "Allow missing input",
          "meaning": "The question mark allows answer to hold text or null when no line of input is available."
        }
      ],
      "outputNote": "Example input: 2. Entering a different answer prints Try again. The input labels are annotations, not text printed by the program.",
      "runHint": "Put this top-level code in Program.cs in a .NET console project and run dotnet run. Type your answer and press Enter. Run the program again to try another answer.",
      "outputAnnotations": [
        "you enter 2",
        "answer is correct"
      ]
    },
    {
      "eyebrow": "12 · Loops",
      "title": "Repeat input until the answer is correct",
      "explanation": "The loop asks the question, saves the entered text, and prints that answer. If it is \"2\", it prints Correct! and break immediately leaves the nearest loop, skipping Try again. A wrong answer prints the retry message, then the next repetition asks again. The braces show which instructions belong to while and if.",
      "note": "// Create the loop with input, output, and break inside if.",
      "prompt": "Create the loop with input, output, and break inside if.",
      "answer": "while (true)\n{\n  Console.WriteLine(\"What is 1 + 1?\");\n  string answer = Console.ReadLine();\n  Console.WriteLine(answer);\n\n  if (answer == \"2\")\n  {\n    Console.WriteLine(\"Correct!\");\n    break;\n  }\n\n  Console.WriteLine(\"Try again.\");\n}",
      "output": [
        "What is 1 + 1?",
        "2",
        "Correct!"
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Keep repeating",
          "meaning": "The condition stays true, so this loop keeps repeating until break is reached. The instructions inside its braces form its body."
        },
        {
          "code": "Console.ReadLine()",
          "name": "Read an answer",
          "meaning": "Waits for a line of terminal text and saves it in answer."
        },
        {
          "code": "answer == \"2\"",
          "name": "Check the answer",
          "meaning": "Compares the entered text with \"2\". if runs its body only when this comparison is true."
        },
        {
          "code": "break;",
          "name": "Leave the loop",
          "meaning": "Immediately leaves the nearest loop and skips the rest of that repetition. Execution continues after the loop; break does not end the whole program. Here it skips the Try again. message below."
        },
        {
          "code": "Console.WriteLine(\"Try again.\");",
          "name": "Repeat after a wrong answer",
          "meaning": "A wrong answer reaches this message. The next repetition then asks the question again."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first.",
      "outputAnnotations": [
        "you enter 2",
        "entered answer echoed",
        "break leaves the loop"
      ],
      "outputNote": "Example run: the first answer is 2. The labels beside the lines explain the run; the program does not print them."
    },
    {
      "eyebrow": "13 · Dictionary",
      "title": "Search a word dictionary",
      "explanation": "A Dictionary connects keys to values. Dictionary<string, string> means text keys and text values. Its initializer uses {} to add bonjour and hola, with hello under each key. string.Join combines its values into one text string; Console.WriteLine prints that text. TryGetValue checks whether the entered key exists and safely returns the value; words[search] is a direct lookup but throws if the key is missing.",
      "note": "// Create the word dictionary, show its values, then search for a word.",
      "prompt": "Create the word dictionary, show its values, then search for a word.",
      "answer": "var words = new System.Collections.Generic.Dictionary<string, string> {\n  { \"bonjour\", \"hello\" },\n  { \"hola\", \"hello\" }\n};\n\nConsole.WriteLine(string.Join(\", \", words.Values));\nConsole.WriteLine(\"Search:\");\nstring search = Console.ReadLine() ?? \"\";\nif (words.TryGetValue(search, out string? translation)) {\n  Console.WriteLine(translation);\n} else {\n  Console.WriteLine(\"word not found\");\n}",
      "output": [
        "hello, hello",
        "Search:",
        "hello"
      ],
      "parts": [
        {
          "code": "Dictionary<string, string>",
          "name": "Key and value",
          "meaning": "The two types describe the keys and values."
        },
        {
          "code": "TryGetValue",
          "name": "Safe lookup",
          "meaning": "Returns true and sets translation when the key is found."
        },
        {
          "code": "?? \"\"",
          "name": "Fallback for missing input",
          "meaning": "Uses an empty string if Console.ReadLine() returns null."
        },
        {
          "code": "out string? translation",
          "name": "Receive the found value",
          "meaning": "Lets TryGetValue place the found translation in this variable. Its true/false result tells if the key was found."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first.",
      "outputAnnotations": [
        "stored translations",
        "you enter bonjour",
        "value for bonjour"
      ],
      "outputNote": "Example input: bonjour. Input labels are annotations, not text printed by the program."
    },
    {
      "eyebrow": "14 · Expressions",
      "title": "Calculate a value",
      "explanation": "An expression produces a value. 80 + 20 produces 100. speed > 100 produces false when speed is 100. A statement performs an instruction, such as saving that result or printing it. + adds, - subtracts, * multiplies, / divides, and % gives the remainder. C# integer division discards the fractional part; use a double such as 5.0 when you need a decimal result.",
      "note": "// Calculate speed with 80 + 20, then print Speed: 100.",
      "prompt": "Calculate speed with 80 + 20, then print Speed: 100.",
      "answer": "int speed = 80 + 20;\nConsole.WriteLine($\"Speed: {speed}\");",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "80 + 20",
          "name": "Expression",
          "meaning": "Produces the value 100."
        },
        {
          "code": "speed > 100",
          "name": "Boolean expression",
          "meaning": "Produces true or false."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "15 · Random",
      "title": "Choose a random word",
      "explanation": "words.Keys contains bonjour and hola. CopyTo puts those keys into an array. Random.Shared.Next(keys.Length) chooses a position from zero up to, but not including, keys.Length. keys[position] retrieves the randomly chosen key.",
      "note": "// Create the word dictionary and randomly select one of its keys.",
      "prompt": "Create the word dictionary and randomly select one of its keys.",
      "answer": "var words = new System.Collections.Generic.Dictionary<string, string> {\n  { \"bonjour\", \"hello\" },\n  { \"hola\", \"hello\" }\n};\n\nstring[] keys = new string[words.Count];\nwords.Keys.CopyTo(keys, 0);\nint position = Random.Shared.Next(keys.Length);\nstring random = keys[position];\n\nConsole.WriteLine(random);",
      "output": [
        "bonjour"
      ],
      "parts": [
        {
          "code": "Dictionary<string, string>",
          "name": "Word dictionary",
          "meaning": "Stores text keys and text translations. bonjour and hola each map to hello."
        },
        {
          "code": "new string[words.Count]",
          "name": "Space for the keys",
          "meaning": "Creates an array with one slot per dictionary entry. Count is the number of entries."
        },
        {
          "code": "words.Keys.CopyTo(keys, 0)",
          "name": "Copy the keys",
          "meaning": "Copies the dictionary keys into the array, starting at position 0."
        },
        {
          "code": "Random.Shared.Next(keys.Length)",
          "name": "Random position",
          "meaning": "Random.Shared is a built-in generator. Next chooses a whole number from 0 up to, but not including, the array length. Two keys give position 0 or 1."
        },
        {
          "code": "keys[...]",
          "name": "Choose a word",
          "meaning": "Square brackets retrieve the key at the randomly selected position."
        },
        {
          "code": "keys.Length",
          "name": "Collection sizes",
          "meaning": "The number of positions in the array. Random.Shared.Next uses it as the upper limit, which is not included."
        }
      ],
      "outputNote": "Example output; either bonjour or hola can be chosen.",
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "16 · Arrays and lists",
      "title": "Make and search a names array",
      "explanation": "An array has a fixed length; a List can grow when you add values. This example uses List<string> so it matches JavaScript’s growing array. Add saves the entered name, Contains searches for an exact match, and if/else prints name found or name not found. Matching is case-sensitive. names[0] retrieves the first item after it has been added.",
      "note": "// Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "prompt": "Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "answer": "var names = new System.Collections.Generic.List<string>();\n\nConsole.WriteLine(\"add a name\");\nnames.Add(Console.ReadLine() ?? \"\");\n\nConsole.WriteLine(\"search for a name\");\nstring search = Console.ReadLine() ?? \"\";\n\nif (names.Contains(search)) {\n  Console.WriteLine(\"name found\");\n} else {\n  Console.WriteLine(\"name not found\");\n}",
      "output": [
        "add a name",
        "search for a name",
        "name found"
      ],
      "parts": [
        {
          "code": "List<string>",
          "name": "Growing list",
          "meaning": "Stores text values and allows more items to be added."
        },
        {
          "code": "names.Add",
          "name": "Add",
          "meaning": "Appends the entered name."
        },
        {
          "code": "names.Contains(search)",
          "name": "Search",
          "meaning": "Checks for the exact value without changing the list."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first.",
      "outputAnnotations": [
        "you enter Jordan",
        "you enter Jordan",
        "a matching name was found"
      ],
      "outputNote": "Example input: add Jordan, then search for Jordan. Input labels are annotations, not printed text."
    },
    {
      "eyebrow": "17 · Sets",
      "title": "Remove duplicate names",
      "explanation": "A HashSet stores only unique values. Passing names into new HashSet<string>(names) removes repeated names, and string.Join makes the remaining values readable for printing.",
      "note": "// Ask for three names, then remove any duplicates",
      "prompt": "Collect three names, create a Set, and print its unique values.",
      "answer": "List<string> names = new List<string>();\n\nConsole.WriteLine(\"Enter the first name:\");\nnames.Add(Console.ReadLine());\nConsole.WriteLine(\"Enter the second name:\");\nnames.Add(Console.ReadLine());\nConsole.WriteLine(\"Enter the third name:\");\nnames.Add(Console.ReadLine());\n\nHashSet<string> uniqueNames = new HashSet<string>(names);\n\nConsole.WriteLine($\"[{string.Join(\", \", uniqueNames)}]\");",
      "output": [
        "Enter the first name:",
        "Enter the second name:",
        "Enter the third name:",
        "[Alex, Sam]"
      ],
      "parts": [
        {
          "code": "HashSet<string>",
          "name": "Unique text collection",
          "meaning": "Defines a collection that stores no duplicate text values."
        },
        {
          "code": "new HashSet<string>(names)",
          "name": "Remove duplicates",
          "meaning": "Creates the HashSet from names and keeps only one copy of each value."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first.",
      "outputAnnotations": [
        "you enter Alex",
        "you enter Sam",
        "you enter Alex",
        "Alex appears once"
      ],
      "outputNote": "Example input: Alex, Sam, Alex. The repeated name is kept once. A HashSet does not promise a display order."
    },
    {
      "eyebrow": "18 · Null",
      "title": "Mark a value as not ready yet",
      "explanation": "null deliberately means that a variable has no value yet. string? allows this text variable to hold either text or null, and == null checks whether the value is still missing.",
      "note": "// null means there is deliberately no result yet",
      "prompt": "Set result to null, then print the message for its current state.",
      "answer": "string? result = null; // There is no result yet\n\nif (result == null)\n{\n  Console.WriteLine(\"No result yet\");\n}\nelse\n{\n  Console.WriteLine(\"Result is ready\");\n}",
      "output": [
        "No result yet"
      ],
      "parts": [
        {
          "code": "string?",
          "name": "Nullable text",
          "meaning": "The question mark allows a string variable to hold text or null."
        },
        {
          "code": "null",
          "name": "No value yet",
          "meaning": "Deliberately stores no value for now; result can receive one later."
        },
        {
          "code": "== null",
          "name": "Null check",
          "meaning": "Checks whether result still contains no value."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "19 · Regular expressions",
      "title": "Let names beginning with J enter",
      "explanation": "A regular expression checks text against a pattern. Regex comes from System.Text.RegularExpressions. ^J means the text must begin with J, while RegexOptions.IgnoreCase accepts uppercase or lowercase. It accepts any word beginning with J—not only names—and rejects J when it appears later in the text.",
      "note": "// Let people into the club when their name begins with J",
      "prompt": "Check the five names and print who may enter the club.",
      "answer": "using System.Text.RegularExpressions;\n\nstring[] names = { \"Jordan\", \"James\", \"Jessica\", \"Sarah\", \"Ben\" };\n\nforeach (string name in names) {\n  if (Regex.IsMatch(name, \"^J\", RegexOptions.IgnoreCase)) {\n    Console.WriteLine($\"{name} can enter the club.\");\n  } else {\n    Console.WriteLine($\"{name} cannot enter the club.\");\n  }\n}",
      "output": [
        "Jordan can enter the club.",
        "James can enter the club.",
        "Jessica can enter the club.",
        "Sarah cannot enter the club.",
        "Ben cannot enter the club."
      ],
      "parts": [
        {
          "code": "\"^J\"",
          "name": "Pattern",
          "meaning": "The caret requires J to be at the beginning of the text."
        },
        {
          "code": "Regex.IsMatch",
          "name": "Check a name",
          "meaning": "Returns true when the supplied name matches the pattern."
        },
        {
          "code": "RegexOptions.IgnoreCase",
          "name": "Ignore case",
          "meaning": "Accepts either uppercase J or lowercase j."
        }
      ],
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "title": "Get a filename from a path",
      "eyebrow": "20 · Files and paths",
      "explanation": "Build the first piece of a sheet-music finder. A path is a location: sheet-music is the folder and chopin-nocturne.png is the filename. Extracting the name only handles the path; it does not check whether the file exists or read its contents. The .png extension identifies the intended file format, not the words or notes in the picture.",
      "note": "// Extract the filename without opening the image.",
      "prompt": "Print the filename from the score path.",
      "answer": "using System;\nusing System.IO;\n\nstring file = \"sheet-music/chopin-nocturne.png\";\nConsole.WriteLine(Path.GetFileName(file));",
      "output": [
        "chopin-nocturne.png"
      ],
      "parts": [
        {
          "code": "using System.IO;",
          "name": "Use filesystem tools",
          "meaning": "Makes Path, File and Directory available by their short names."
        },
        {
          "code": "Path.GetFileName(file)",
          "name": "Get the filename",
          "meaning": "Extracts the final component of the path, including .png."
        }
      ],
      "runHint": "Use a .NET console project. Put this top-level code in Program.cs and run dotnet run.",
      "outputNote": "Example preview. Extracting a filename does not access your computer or prove that the file exists."
    },
    {
      "title": "List files in a folder",
      "eyebrow": "21 · Files and paths",
      "explanation": "Now let the program discover files rather than typing every filename into a list. Scan the sheet-music folder, skip folders, and print each filename. This reads the folder listing, not the image contents. Only this folder is searched; files inside subfolders are not included. The folder must exist and be readable, or listing it can raise an error.",
      "note": "// List each file in your sheet-music folder.",
      "prompt": "Print filenames from the sheet-music folder, skipping folders.",
      "answer": "using System;\nusing System.IO;\n\nstring[] files = Directory.GetFiles(\"sheet-music\");\n\nforeach (string file in files) {\n  Console.WriteLine(Path.GetFileName(file));\n}",
      "output": [
        "chopin-nocturne.png",
        "practice-notes.txt"
      ],
      "parts": [
        {
          "code": "Directory.GetFiles",
          "name": "List the folder",
          "meaning": "Returns paths to files directly inside the folder; it does not include subfolders."
        },
        {
          "code": "string[]",
          "name": "Store file paths",
          "meaning": "An array of text values."
        },
        {
          "code": "foreach",
          "name": "Repeat",
          "meaning": "Visits every returned path; GetFileName removes the folder part."
        }
      ],
      "runHint": "Use a .NET console project. Put this top-level code in Program.cs and run dotnet run. Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview for a folder containing these two files. Order may vary. CodeStep checks your code and shows sample output; run it locally to list your own files."
    },
    {
      "title": "Find a sheet-music file",
      "eyebrow": "22 · Files and paths",
      "explanation": "Finish this small file-finding program by checking for the score at its expected location and showing a useful result. When you already know the folder and filename, checking that path is simpler than looping through the entire folder. This checks for a file; it does not open the image or recognise its printed title. Use the exact spelling and capitalisation so the example works across systems.",
      "note": "// Check whether the score exists before using it.",
      "prompt": "Print Found: and the filename, or File not found.",
      "answer": "using System;\nusing System.IO;\n\nstring file = \"sheet-music/chopin-nocturne.png\";\n\nif (File.Exists(file)) {\n  Console.WriteLine(\"Found: \" + Path.GetFileName(file));\n} else {\n  Console.WriteLine(\"File not found\");\n}",
      "output": [
        "Found: chopin-nocturne.png"
      ],
      "parts": [
        {
          "code": "File.Exists(file)",
          "name": "Look up the file",
          "meaning": "Returns true for an existing file. False can also mean access is unavailable; it is not always proof the file is missing."
        },
        {
          "code": "if / else",
          "name": "Report the result",
          "meaning": "Shows the filename if found, or File not found otherwise."
        }
      ],
      "runHint": "Use a .NET console project. Put this top-level code in Program.cs and run dotnet run. Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview with the score present. Remove or rename it locally to try the File not found branch. CodeStep does not inspect your device."
    },
    {
      "eyebrow": "23 · Concurrent work",
      "title": "Start two threads and wait for them",
      "explanation": "Thread starts another path of execution in a .NET console program. The short () => expression is an inline action telling each thread what to print; writing a separate named method is unnecessary here. Start both threads before Join waits for each to finish. The two lines can appear in either order, and quick printing alone does not prove they ran at precisely the same instant. Use threads when work needs its own execution path; a delay does not create a thread.",
      "note": "// Start both print jobs, then wait for both to finish.",
      "prompt": "Set up two threads, start them, and wait for both messages.",
      "answer": "using System;\nusing System.Threading;\n\nThread thread1 = new Thread(() => Console.WriteLine(\"Thread 1 is running!\"));\nThread thread2 = new Thread(() => Console.WriteLine(\"Thread 2 is running at the same time!\"));\n\nthread1.Start();\nthread2.Start();\n\nthread1.Join();\nthread2.Join();",
      "output": [
        "Thread 1 is running!",
        "Thread 2 is running at the same time!"
      ],
      "outputNote": "Sample output only: the messages can appear in either order. CodeStep checks the code and previews one possible run; it does not start threads in the lesson console.",
      "runHint": "Put this top-level code in Program.cs inside a .NET console project and run dotnet run. Either message can appear first.",
      "parts": [
        {
          "code": "using System.Threading;",
          "name": "Use thread tools",
          "meaning": "Makes Thread available by its short name."
        },
        {
          "code": "() => Console.WriteLine(...)",
          "name": "Give the thread work",
          "meaning": "An inline action (lambda) tells the thread what to print; it does not print at construction time."
        },
        {
          "code": "Start()",
          "name": "Start running",
          "meaning": "Starts both threads before the main program waits."
        },
        {
          "code": "Join()",
          "name": "Wait for completion",
          "meaning": "The main thread waits for each worker to finish."
        }
      ]
    },
    {
      "eyebrow": "24 · Application practice",
      "title": "Build a random word quiz",
      "explanation": "Combine the dictionary, random choice, input, and if/else. Choose a word, ask for its translation, then compare the answer with the stored value.",
      "note": "// Combine the word dictionary and random key code to make a translation quiz.",
      "prompt": "Combine the word dictionary and random key code to make a translation quiz.",
      "answer": "var words = new System.Collections.Generic.Dictionary<string, string> {\n  { \"bonjour\", \"hello\" },\n  { \"hola\", \"hello\" }\n};\n\nstring[] keys = new string[words.Count];\nwords.Keys.CopyTo(keys, 0);\nstring random = keys[Random.Shared.Next(keys.Length)];\n\nConsole.WriteLine(random);\nstring answer = Console.ReadLine() ?? \"\";\n\nif (answer == words[random]) {\n  Console.WriteLine(\"Correct\");\n} else {\n  Console.WriteLine(\"Wrong\");\n}",
      "output": [
        "bonjour",
        "Correct"
      ],
      "parts": [
        {
          "code": "Dictionary<string, string>",
          "name": "Word dictionary",
          "meaning": "Stores text keys and text translations. bonjour and hola each map to hello."
        },
        {
          "code": "new string[words.Count]",
          "name": "Space for the keys",
          "meaning": "Creates an array with one slot per dictionary entry. Count is the number of entries."
        },
        {
          "code": "words.Keys.CopyTo(keys, 0)",
          "name": "Copy the keys",
          "meaning": "Copies the dictionary keys into the array, starting at position 0."
        },
        {
          "code": "Random.Shared.Next(keys.Length)",
          "name": "Random position",
          "meaning": "Random.Shared is a built-in generator. Next chooses a whole number from 0 up to, but not including, the array length. Two keys give position 0 or 1."
        },
        {
          "code": "keys[...]",
          "name": "Choose a word",
          "meaning": "Square brackets retrieve the key at the randomly selected position."
        },
        {
          "code": "Console.ReadLine() ?? \"\"",
          "name": "Read the answer",
          "meaning": "Reads terminal text. ?? uses an empty string if input returns null."
        },
        {
          "code": "words[random]",
          "name": "Expected translation",
          "meaning": "Retrieves the translation stored under the selected key."
        },
        {
          "code": "answer == words[random]",
          "name": "Check the answer",
          "meaning": "Compares the text. if prints Correct when it matches; else prints Wrong. Matching is case-sensitive."
        }
      ],
      "outputNote": "Example run: bonjour is chosen and the user enters hello. The entered answer is input; the labels are annotations.",
      "runHint": "Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first.",
      "outputAnnotations": [
        "you enter hello",
        "the translation matches"
      ]
    }
  ],
  "html": [
    {
      "eyebrow": "01 · Doctype",
      "title": "Tell the browser it is HTML",
      "explanation": "The doctype declaration belongs at the very top of the file. It tells the browser to use modern HTML rules when it reads the page.",
      "note": "<!-- Declare this as a modern HTML document -->",
      "prompt": "Type the HTML doctype declaration.",
      "answer": "<!DOCTYPE html>",
      "output": [
        "HTML document type recognised."
      ],
      "parts": [
        {
          "code": "<!DOCTYPE",
          "name": "Declaration",
          "meaning": "Tells the browser what kind of document follows."
        },
        {
          "code": "html",
          "name": "Modern HTML",
          "meaning": "Selects the current HTML standard."
        }
      ]
    },
    {
      "eyebrow": "02 · Page structure",
      "title": "Start the HTML page",
      "explanation": "The html element wraps the whole page. The lang attribute identifies the page language for browsers, search engines, and assistive technology. The forward slash marks the closing tag.",
      "note": "<!-- Wrap the English-language page in html tags -->",
      "prompt": "Create the outer html element and mark its language as English.",
      "answer": "<html lang=\"en\">\n</html>",
      "output": [
        "Page wrapper created."
      ],
      "parts": [
        {
          "code": "<html>",
          "name": "Opening tag",
          "meaning": "Marks where the HTML page begins."
        },
        {
          "code": "lang=\"en\"",
          "name": "Page language",
          "meaning": "Identifies the document as English."
        },
        {
          "code": "</html>",
          "name": "Closing tag",
          "meaning": "The slash marks where that element ends."
        }
      ]
    },
    {
      "eyebrow": "03 · Head and title",
      "title": "Name the browser tab",
      "explanation": "The head holds information about the page. meta charset UTF-8 lets it display a wide range of characters correctly, while title supplies the text shown on the browser tab.",
      "note": "<!-- Set the character encoding and browser-tab title -->",
      "prompt": "Create the head, set UTF-8, and give the page a title.",
      "answer": "<head>\n  <meta charset=\"UTF-8\">\n  <title>My page</title>\n</head>",
      "output": [
        "Browser-tab title: My page"
      ],
      "parts": [
        {
          "code": "<head>",
          "name": "Page information",
          "meaning": "Contains information used by the browser."
        },
        {
          "code": "<meta charset=\"UTF-8\">",
          "name": "Character encoding",
          "meaning": "Supports letters, symbols, and characters from many languages."
        },
        {
          "code": "<title>",
          "name": "Tab title",
          "meaning": "Sets the words shown on the browser tab."
        }
      ]
    },
    {
      "eyebrow": "04 · Body",
      "title": "Add visible page content",
      "explanation": "The body contains everything visitors see in the browser window, such as headings, paragraphs, links, images, and buttons.",
      "note": "<!-- Create the visible body of the page -->",
      "prompt": "Create an empty body element.",
      "answer": "<body>\n</body>",
      "output": [
        "Visible page area created."
      ],
      "parts": [
        {
          "code": "<body>",
          "name": "Visible content",
          "meaning": "Starts the part visitors can see."
        }
      ]
    },
    {
      "eyebrow": "05 · Div sections",
      "title": "Separate content into boxes",
      "explanation": "A div is a box or section used to group content inside the body. Each div starts a separate block. Here, the style attribute gives the first box a red background and the second box a blue background.",
      "note": "<!-- Put two separate coloured div boxes inside the body -->",
      "prompt": "Create the red and blue div sections inside the body.",
      "answer": "<!DOCTYPE html>\n<html>\n<body>\n\n  <div style=\"background-color: red;\">\n    This text is inside the first div.\n  </div>\n\n  <div style=\"background-color: blue;\">\n    This text is inside the second div.\n  </div>\n\n</body>\n</html>",
      "output": [
        "Red section: This text is inside the first div.",
        "Blue section: This text is inside the second div."
      ],
      "parts": [
        {
          "code": "<div>",
          "name": "Section box",
          "meaning": "Starts a separate block used to group content inside the body."
        },
        {
          "code": "style",
          "name": "Inline styling",
          "meaning": "Adds a visual rule directly to this particular div."
        },
        {
          "code": "background-color",
          "name": "Box colour",
          "meaning": "Changes the colour behind the content inside the div."
        }
      ]
    },
    {
      "eyebrow": "06 · Headings",
      "title": "Create a heading hierarchy",
      "explanation": "Headings organise the page. h1 is the main heading; h2 introduces a major section; h3 and h4 create smaller subsections below it.",
      "note": "<!-- Add a main heading and a section heading -->",
      "prompt": "Create an h1 followed by an h2.",
      "answer": "<h1>Main heading</h1>\n<h2>Main section</h2>",
      "output": [
        "Main heading",
        "Main section"
      ],
      "parts": [
        {
          "code": "h1",
          "name": "Main heading",
          "meaning": "The page's most important heading."
        },
        {
          "code": "h2",
          "name": "Section heading",
          "meaning": "Introduces a major section beneath the h1."
        }
      ]
    },
    {
      "eyebrow": "07 · Links",
      "title": "Open another page",
      "explanation": "The a element creates a link. Its href attribute stores the destination, while the text between the tags is what the visitor clicks.",
      "note": "<!-- Link to a second HTML page -->",
      "prompt": "Create a link to page.html.",
      "answer": "<a href=\"page.html\">Open page</a>",
      "output": [
        "Open page  →  page.html"
      ],
      "parts": [
        {
          "code": "<a>",
          "name": "Anchor",
          "meaning": "Creates a clickable link."
        },
        {
          "code": "href",
          "name": "Destination",
          "meaning": "Stores the page or address to open."
        }
      ]
    },
    {
      "eyebrow": "08 · Text elements",
      "title": "Explore HTML text elements",
      "explanation": "This is a reference page rather than a quiz. Compare headings, paragraphs, text-formatting elements, inline colour and alignment styles, and a link to another page.",
      "note": "<!-- A visual guide to HTML text elements -->",
      "prompt": "Explore the examples and what each element means.",
      "answer": "<p>This page shows some useful HTML elements.</p>\n\n<h2>Headings</h2>\n<h1>Main Title</h1>\n<h2>Section Heading</h2>\n<h3>Subsection</h3>\n<h4>Smaller Heading</h4>\n<h5>Even Smaller Heading</h5>\n<h6>Smallest Heading</h6>\n\n<h2>Paragraph</h2>\n<p>This is a paragraph.</p>\n\n<h2>Text Formatting</h2>\n<p><b>Bold text</b></p>\n<p><strong>Important text</strong></p>\n<p><i>Italic text</i></p>\n<p><em>Emphasized text</em></p>\n<p><mark>Marked text</mark></p>\n<p><small>Smaller text</small></p>\n<p><del>Deleted text</del></p>\n<p><ins>Inserted text</ins></p>\n<p>Subscript text: H<sub>2</sub>O</p>\n<p>Superscript text: 2<sup>3</sup> = 8</p>\n\n<h2>Colour and Alignment</h2>\n<h3 style=\"color: green;\">This heading is green.</h3>\n<p style=\"text-align: center;\">This paragraph is centred.</p>\n<p><a href=\"notes/html-basics-notes.html\">Read the HTML basics notes</a></p>",
      "output": [
        "Reference explored."
      ],
      "referenceOnly": true,
      "referenceKind": "text"
    },
    {
      "eyebrow": "09 · JavaScript in HTML",
      "title": "Show the current date and time",
      "explanation": "The script element lets an HTML page run JavaScript. new Date() creates the current date and time, and console.log displays it in the browser's developer console.",
      "note": "<!-- Run JavaScript from inside the HTML page -->",
      "prompt": "Put the date-and-time code inside a script element.",
      "answer": "<script>\n  const currentDateTime = new Date();\n  console.log(currentDateTime);\n</script>",
      "output": [
        "Current date and time printed in the browser console."
      ],
      "parts": [
        {
          "code": "<script>",
          "name": "JavaScript area",
          "meaning": "Tells the browser that the code inside is JavaScript."
        },
        {
          "code": "const",
          "name": "Fixed variable",
          "meaning": "Creates a variable that will not be reassigned."
        },
        {
          "code": "new Date()",
          "name": "Current moment",
          "meaning": "Creates a Date using the device's current date and time."
        },
        {
          "code": "console.log",
          "name": "Developer console",
          "meaning": "Displays the value in the browser's developer tools."
        }
      ]
    },
    {
      "eyebrow": "10 · Multiple pages",
      "title": "Link two HTML pages",
      "explanation": "This is a two-file reference rather than a quiz. When both files are in the same folder, each href can use the other file's name as a relative path.",
      "note": "<!-- Link index.html and page2.html in both directions -->",
      "prompt": "Compare the two files and follow the links between them.",
      "answer": "<a href=\"page2.html\">Go to Page 2</a>",
      "output": [
        "index.html ↔ page2.html"
      ],
      "referenceOnly": true,
      "referenceKind": "pages"
    },
    {
      "eyebrow": "11 · Images",
      "title": "Place an image on the page",
      "explanation": "The img element displays an image. src tells the browser which file to load, while alt describes the image if it cannot be seen or loaded. If car.png is beside index.html, its filename is enough for src.",
      "note": "<!-- Display car.png from the same folder as this HTML file -->",
      "prompt": "Add the car image with useful alternative text.",
      "answer": "<img src=\"car.png\" alt=\"A car\">",
      "output": [
        "Image loaded: car.png",
        "Alternative text: A car"
      ],
      "parts": [
        {
          "code": "<img>",
          "name": "Image element",
          "meaning": "Places an image in the HTML page; it does not need a closing tag."
        },
        {
          "code": "src=\"car.png\"",
          "name": "Image source",
          "meaning": "Loads car.png from the same folder as the HTML file."
        },
        {
          "code": "alt=\"A car\"",
          "name": "Alternative text",
          "meaning": "Describes the image for accessibility and when it cannot load."
        }
      ]
    },
    {
      "eyebrow": "12 · Videos",
      "title": "Place a video on the page",
      "explanation": "The video element places a video on the page, much like img places a picture. src tells the browser to load my-video.mp4, and controls adds the built-in play, pause, volume, and timeline controls. Keep the MP4 file beside the HTML file when using only its filename.",
      "note": "<!-- Display my-video.mp4 with playback controls -->",
      "prompt": "Add the video and let the visitor control its playback.",
      "answer": "<video src=\"my-video.mp4\" controls></video>",
      "output": [
        "Video loaded: my-video.mp4",
        "Playback controls enabled."
      ],
      "parts": [
        {
          "code": "<video>",
          "name": "Video element",
          "meaning": "Creates a video player inside the webpage."
        },
        {
          "code": "controls",
          "name": "Playback controls",
          "meaning": "Shows the browser's play, pause, volume, and timeline controls."
        }
      ]
    },
    {
      "eyebrow": "13 · Audio",
      "title": "Place audio on the page",
      "explanation": "The audio element works much like video, but it plays sound without a picture area. src tells the browser to load my-audio.mp3, and controls adds play, pause, volume, and timeline controls. Keep the MP3 file beside the HTML file when using only its filename.",
      "note": "<!-- Play my-audio.mp3 with playback controls -->",
      "prompt": "Add the audio file and let the visitor control its playback.",
      "answer": "<audio src=\"my-audio.mp3\" controls></audio>",
      "output": [
        "Audio loaded: my-audio.mp3",
        "Playback controls enabled."
      ],
      "parts": [
        {
          "code": "<audio>",
          "name": "Audio element",
          "meaning": "Creates an audio player without a video picture area."
        }
      ]
    },
    {
      "eyebrow": "14 · IDs for CSS",
      "title": "Give one element a unique name",
      "explanation": "The id attribute gives one HTML element a unique name. CSS can then select that exact element with a hash followed by the same name, such as #p1.",
      "note": "<!-- Give this particular paragraph the ID p1 -->",
      "prompt": "Add the p1 ID to the paragraph so CSS can target it.",
      "answer": "<p id=\"p1\">This paragraph has its own ID.</p>",
      "output": [
        "Paragraph identified as p1.",
        "CSS can select it with #p1."
      ],
      "parts": [
        {
          "code": "id=\"p1\"",
          "name": "Unique ID",
          "meaning": "Gives this element the unique name p1."
        },
        {
          "code": "#p1",
          "name": "Matching CSS",
          "meaning": "CSS uses a hash before the ID name to select this exact element."
        }
      ]
    },
    {
      "eyebrow": "15 · Browser-safe repetition",
      "title": "Use a button instead of while (true)",
      "explanation": "while (true) is JavaScript, not HTML. Even inside a script element, an endless loop can freeze the page. A button is safer for an HTML page: each click runs checkAnswer once, then the page waits for another click.",
      "note": "<!-- A click safely runs one answer check at a time -->",
      "prompt": "Create the button and function that check one answer per click.",
      "answer": "<button onclick=\"checkAnswer()\">Check answer</button>\n<p id=\"result\"></p>\n\n<script>\n  function checkAnswer() {\n    let answer = prompt(\"What is 1 + 1?\");\n\n    if (answer == \"2\") {\n      document.getElementById(\"result\").textContent = \"Correct!\";\n    } else {\n      document.getElementById(\"result\").textContent = \"Incorrect! The answer is 2.\";\n    }\n  }\n</script>",
      "output": [
        "Correct!"
      ],
      "parts": [
        {
          "code": "function checkAnswer()",
          "name": "Define the instructions",
          "meaning": "Names instructions that wait until the button calls them."
        },
        {
          "code": "prompt(...)",
          "name": "Ask for text",
          "meaning": "Opens a browser dialog and returns the entered text."
        },
        {
          "code": "let answer =",
          "name": "Store the reply",
          "meaning": "Stores the dialog reply in a variable named answer. let allows the variable to be reassigned."
        },
        {
          "code": "answer == \"2\"",
          "name": "Check the answer",
          "meaning": "Compares the entered text with \"2\". Both values are text here."
        },
        {
          "code": "if / else",
          "name": "Choose one result",
          "meaning": "Runs one body for a matching answer and the other body otherwise."
        },
        {
          "code": "document.getElementById(\"result\")",
          "name": "Find the paragraph",
          "meaning": "Finds the element whose id is result."
        },
        {
          "code": ".textContent =",
          "name": "Assign the result text",
          "meaning": "Places the new message in that element. = assigns a value."
        },
        {
          "code": "onclick",
          "name": "Wait for a click",
          "meaning": "Runs checkAnswer once when the visitor presses the button."
        }
      ],
      "outputAnnotations": [
        "shown in the result paragraph"
      ],
      "outputNote": "Example page result after clicking the button and entering 2. The dialog input and click are actions, not printed output. The page then waits for another click."
    },
    {
      "eyebrow": "16 · Return values",
      "title": "Send a value back with return",
      "explanation": "return sends a value back to the place where a function was called, and the function ends immediately. Here, getMessage() returns the text Hello. That returned text is then placed in the paragraph.",
      "note": "<!-- Return a value from a function and show it on the page -->",
      "prompt": "Create the function that returns Hello, then show its returned value.",
      "answer": "<p id=\"message\"></p>\n\n<script>\n  function getMessage() {\n    return \"Hello\";\n  }\n\n  document.getElementById(\"message\").textContent = getMessage();\n</script>",
      "output": [
        "Hello"
      ],
      "parts": [
        {
          "code": "return \"Hello\"",
          "name": "Send a value back",
          "meaning": "Ends getMessage and sends Hello back to the code that called it."
        },
        {
          "code": "getMessage()",
          "name": "Use the returned value",
          "meaning": "Calls the function and receives the text that return sent back."
        }
      ],
      "outputAnnotations": [
        "returned by getMessage(), then placed in the paragraph"
      ],
      "outputNote": "Example visible paragraph text. return itself does not print anything."
    }
  ],
  "css": [
    {
      "eyebrow": "01 · Background colour",
      "title": "Colour the page background",
      "explanation": "CSS rules use a property and a value. background-color chooses the colour behind an element, while the colon separates the property from its value and the semicolon ends the instruction.",
      "note": "/* Give the page a light-blue background */",
      "prompt": "Write a body rule with a light-blue background.",
      "answer": "body {\n  background-color: lightblue;\n}",
      "output": [
        "The page background is light blue."
      ],
      "parts": [
        {
          "code": "body",
          "name": "Selector",
          "meaning": "Chooses the HTML body element to style."
        },
        {
          "code": "background-color",
          "name": "Property",
          "meaning": "Chooses the colour behind the element."
        },
        {
          "code": ":",
          "name": "Property separator",
          "meaning": "Separates the property name from its value."
        },
        {
          "code": "lightblue",
          "name": "Value",
          "meaning": "The background colour to apply."
        },
        {
          "code": ";",
          "name": "Rule ending",
          "meaning": "Ends this CSS declaration so another can follow."
        },
        {
          "code": "{ ... }",
          "name": "Group the declarations",
          "meaning": "Groups the declarations applied to this selector."
        }
      ]
    },
    {
      "eyebrow": "02 · Text styling",
      "title": "Colour and centre text",
      "explanation": "color changes the text colour. text-align controls horizontal alignment inside the selected element; center places its inline content in the middle.",
      "note": "/* Make every paragraph red and centred */",
      "prompt": "Style paragraphs with red, centred text.",
      "answer": "p {\n  color: red;\n  text-align: center;\n}",
      "output": [
        "Red paragraph text centred."
      ],
      "parts": [
        {
          "code": "p",
          "name": "Selector",
          "meaning": "Chooses every paragraph on the page."
        },
        {
          "code": "color: red",
          "name": "Text colour",
          "meaning": "Makes the selected text red."
        },
        {
          "code": "text-align: center",
          "name": "Alignment",
          "meaning": "Centres inline content inside each paragraph."
        }
      ]
    },
    {
      "eyebrow": "03 · ID selectors",
      "title": "Style one unique element",
      "explanation": "An ID selector begins with #. The selector #p1 matches the HTML element carrying id=\"p1\", so this rule changes only that particular element.",
      "note": "/* Select the HTML element whose ID is p1 */",
      "prompt": "Use its ID to make only p1 tomato coloured.",
      "answer": "#p1 {\n  color: tomato;\n}",
      "output": [
        "Only the element with id=\"p1\" turns tomato."
      ],
      "parts": [
        {
          "code": "#p1",
          "name": "ID selector",
          "meaning": "The hash selects the element whose ID is p1."
        }
      ]
    },
    {
      "eyebrow": "04 · Font families",
      "title": "Compare website fonts",
      "explanation": "This is a visual reference rather than a quiz. A browser uses the first available font in a font-family list, then tries each fallback. Named fonts are not guaranteed on every device, so finish every stack with a generic family.",
      "note": "/* Compare common fonts and safe fallbacks */",
      "prompt": "Compare the font samples and their fallback families.",
      "answer": "p { font-family: Arial, sans-serif; }",
      "output": [
        "Font reference explored."
      ],
      "referenceOnly": true,
      "referenceKind": "fonts"
    },
    {
      "eyebrow": "05 · Borders and colours",
      "title": "Explore borders and colour formats",
      "explanation": "This visual reference shows how CSS selectors target elements and how border, RGB, RGBA, and hexadecimal colour values change their appearance.",
      "note": "/* Compare borders, rounded corners, RGB, RGBA, and hex colours */",
      "prompt": "Explore the rendered CSS examples and their explanations.",
      "answer": "p.one { border: 5px solid red; }",
      "output": [
        "CSS reference explored."
      ],
      "referenceOnly": true,
      "referenceKind": "css"
    },
    {
      "eyebrow": "06 · Border practice",
      "title": "Create a rounded dotted border",
      "explanation": "A class selector targets elements carrying that class. The border shorthand sets width, style, and colour, while border-radius rounds the corners.",
      "note": "/* Give notice paragraphs a dotted blue rounded border */",
      "prompt": "Create the notice class with a dotted blue rounded border.",
      "answer": "p.notice {\n  border: 5px dotted blue;\n  border-radius: 5px;\n}",
      "output": [
        "Notice paragraphs have a dotted blue border with rounded corners."
      ],
      "parts": [
        {
          "code": "p.notice",
          "name": "Choose notice paragraphs",
          "meaning": "Selects paragraphs with class=\"notice\" in the HTML. The dot introduces a class name."
        },
        {
          "code": "border: 5px dotted blue",
          "name": "Set the border",
          "meaning": "Sets its width, dotted line style, and colour in one declaration."
        },
        {
          "code": "px",
          "name": "CSS pixels",
          "meaning": "A CSS pixel is the unit used for this border's width and corner radius."
        },
        {
          "code": "border-radius: 5px",
          "name": "Round the corners",
          "meaning": "Rounds the corners of the element's border."
        }
      ]
    }
  ],
  "python": [
    {
      "eyebrow": "01 · Console output",
      "title": "Print several lines at once",
      "explanation": "print displays text in the console. Write \\n inside a quoted string to start a new line. The first \\n puts Welcome on the next line, and the second puts Goodbye on another line.",
      "note": "# Print Hello, Welcome, and Goodbye on separate lines.",
      "prompt": "Print Hello, Welcome, and Goodbye on separate lines.",
      "answer": "print(\" Hello \\n Welcome \\n Goodbye\")",
      "output": [
        " Hello ",
        " Welcome ",
        " Goodbye"
      ],
      "parts": [
        {
          "code": "print",
          "name": "Print",
          "meaning": "Displays the text in the console."
        },
        {
          "code": "\\n",
          "name": "New line",
          "meaning": "Write this inside the quoted string to start a new line."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "02 · Functions",
      "title": "Make something happen",
      "explanation": "def defines a function named correct. Empty () means it has no parameters. The colon and indented body group its instructions. The body waits until correct() calls the function.",
      "note": "# Define correct: save the instructions under a name.\n# Call correct() after the definition to run those instructions.\n# Defining it alone prints nothing; removing the call means it never runs.",
      "prompt": "Create correct, then call it to print correct.",
      "answer": "# Define the function.\ndef correct():\n    print(\"correct\")\n\n# Call the function to run its body.\ncorrect()",
      "output": [
        "correct"
      ],
      "parts": [
        {
          "code": "def correct():",
          "name": "Define a function",
          "meaning": "Names a function with no parameters."
        },
        {
          "code": "correct()",
          "name": "Call it",
          "meaning": "Runs the function body."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal.",
      "explanationTerms": [
        "def",
        "correct",
        "()",
        "colon",
        "indented body",
        "correct()"
      ]
    },
    {
      "eyebrow": "03 · ANSI colours",
      "title": "Choose a text colour",
      "explanation": "ANSI escape codes choose terminal text colours: 31 is red, 32 green, 33 yellow, 34 blue, 35 magenta, and 36 cyan. Code 0 resets the colour so later output returns to normal. These codes work in terminals that support ANSI colours. The lesson console previews the colours.",
      "note": "# Print Red text and Green text, then reset the colour.",
      "prompt": "Print Red text in red and Green text in green, in either order, then reset the colour. You can rename variables and use f-strings or + concatenation.",
      "answer": "red = \"\\033[31m\"\ngreen = \"\\033[32m\"\nreset = \"\\033[0m\"\n\nprint(f\"{red}Red text{reset}\")\nprint(f\"{green}Green text{reset}\")",
      "output": [
        "Red text",
        "Green text"
      ],
      "parts": [
        {
          "code": "\\033",
          "name": "Escape character",
          "meaning": "Starts an ANSI instruction in a supporting terminal."
        },
        {
          "code": "[31m / [32m",
          "name": "Red or green",
          "meaning": "After the escape character, [31m selects red text and [32m selects green text."
        },
        {
          "code": "red / green / reset",
          "name": "Save the colour codes",
          "meaning": "Keeps each colour code under a name so it can be used when printing."
        },
        {
          "code": "f\"{red}\"",
          "name": "Apply a colour",
          "meaning": "The f enables insertion: {red} puts the saved red code before the text, and {reset} restores normal colour after it."
        },
        {
          "code": "\\033[0m",
          "name": "Reset",
          "meaning": "Returns terminal text to its normal colour so later output is not left red or green."
        }
      ],
      "outputColors": [
        "#ef4444",
        "#4ade80"
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "04 · Time",
      "title": "Run code after a delay",
      "explanation": "import time makes the time module available. time.sleep(2) pauses this program for 2 seconds, then print displays the message. Unlike JavaScript setTimeout, this sleep blocks the current flow.",
      "note": "# Wait 2 seconds, then print Time reached!",
      "prompt": "Wait 2 seconds, then print Time reached!",
      "answer": "import time\n\ntime.sleep(2)\nprint(\"Time reached!\")",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "import time",
          "name": "Load a module",
          "meaning": "Makes the time module available."
        },
        {
          "code": "time.sleep(2)",
          "name": "Wait",
          "meaning": "Pauses this flow for 2 seconds."
        }
      ],
      "outputNote": "Example output after the 2-second delay.",
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "05 · Date and time",
      "title": "Check for a particular time",
      "explanation": "This checks the local clock once. == compares values and and requires both checks to be true. A colon starts the if body, and indentation identifies the code inside it. This prints only if run during 17:20; it does not keep watching the clock.",
      "note": "# Print Time reached! if the local hour is 17 and the minute is 20.",
      "prompt": "Print Time reached! if the local hour is 17 and the minute is 20.",
      "answer": "from datetime import datetime\n\ntime = datetime.now()\n\nhour = time.hour\nminute = time.minute\n\nif hour == 17 and minute == 20:\n    print(\"Time reached!\")",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "from datetime import datetime",
          "name": "Load the clock tool",
          "meaning": "Loads the datetime class from Python's datetime module."
        },
        {
          "code": "datetime.now()",
          "name": "Capture the clock",
          "meaning": "Captures the current local date and time for this one check."
        },
        {
          "code": "time.hour / time.minute",
          "name": "Clock parts",
          "meaning": "Read the hour and minute from the saved time."
        },
        {
          "code": "and",
          "name": "Both",
          "meaning": "Both conditions must be true."
        },
        {
          "code": "if hour == 17 and minute == 20",
          "name": "Check both values",
          "meaning": "if runs its body only when both comparisons are true. and means both the hour and minute must match."
        }
      ],
      "outputNote": "Example output when the clock is 17:20. At other times, this snippet prints nothing.",
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "06 · Date and time",
      "title": "Keep checking until the time is reached",
      "explanation": "The loop creates a fresh local time each second. At 17:20 it prints once and break leaves the loop. time.sleep(1) pauses between checks. Keep the program open; if 17:20 has passed, it waits until the next day. Checks can run late.",
      "note": "# Keep checking the local clock and print Time reached! once at 17:20.",
      "prompt": "Keep checking the local clock and print Time reached! once at 17:20.",
      "answer": "from datetime import datetime\nimport time\n\nwhile True:\n    now = datetime.now()\n    hour = now.hour\n    minute = now.minute\n\n    if hour == 17 and minute == 20:\n        print(\"Time reached!\")\n        break\n\n    time.sleep(1)",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "while True:",
          "name": "Repeat",
          "meaning": "The condition stays true, so the loop repeats its indented body until break is reached."
        },
        {
          "code": "break",
          "name": "Leave the loop",
          "meaning": "Immediately leaves the nearest loop and skips the rest of that repetition. Execution continues after the loop; break does not end the whole program."
        }
      ],
      "outputNote": "Example output at 17:20. The lesson preview does not wait for the clock.",
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "07 · Functions",
      "title": "Use one function inside another",
      "explanation": "getMessage() returns Hello. In print(getMessage()), the inner function runs first and print receives the returned text. Each call has its own pair of parentheses. Extra parentheses group an expression; (( is not a special sign for multiple functions.",
      "note": "# Return Hello from getMessage, then print it by calling the function inside the print call.",
      "prompt": "Return Hello from getMessage, then print it by calling the function inside the print call.",
      "answer": "def getMessage():\n    return \"Hello\"\n\nprint(getMessage())",
      "output": [
        "Hello"
      ],
      "parts": [
        {
          "code": "return",
          "name": "Send back",
          "meaning": "Immediately ends this function and sends its value back to the caller. It does not print the value or merely leave a loop."
        },
        {
          "code": "print(getMessage())",
          "name": "Nested calls",
          "meaning": "The inner call runs first."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "08 · Classes",
      "title": "Create and use a class",
      "explanation": "class defines a type. Calling Car(\"Ford\", 2014) creates an object and __init__ sets it up. self refers to that object; self.name stores the supplied name. A colon and indentation group each body. The f-string prints its properties.",
      "note": "# Define the class first, then call Car(...) to create objects.",
      "prompt": "Create the Car class, then create Ford and Audi objects.",
      "answer": "class Car:\n    def __init__(self, name, year):\n        self.name = name\n        self.year = year\n\nmyCar1 = Car(\"Ford\", 2014)\nmyCar2 = Car(\"Audi\", 2019)\n\nprint(f\"{myCar1.name}, {myCar1.year}\")\nprint(f\"{myCar2.name}, {myCar2.year}\")",
      "output": [
        "Ford, 2014",
        "Audi, 2019"
      ],
      "parts": [
        {
          "code": "__init__",
          "name": "Initialise",
          "meaning": "Sets up a newly created object."
        },
        {
          "code": "self.name",
          "name": "Instance value",
          "meaning": "Stores the name on this object."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "09 · Variables",
      "title": "Use changeable and fixed values",
      "explanation": "Assignment creates a name such as speed and can change its value later. Python has no let or const keyword. MAX_SPEED uses capital letters to signal a constant by convention, but Python still allows reassignment. The f-string inserts speed in the text.",
      "note": "# Create speed and MAX_SPEED, change speed to 100, then print Speed: 100.",
      "prompt": "Create speed and MAX_SPEED, change speed to 100, then print Speed: 100.",
      "answer": "speed = 80\nMAX_SPEED = 100\n\nspeed = 100\nprint(f\"Speed: {speed}\")",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "speed = 100",
          "name": "Assignment",
          "meaning": "Creates or changes a variable."
        },
        {
          "code": "MAX_SPEED",
          "name": "Constant convention",
          "meaning": "Capital letters suggest a fixed value but do not enforce it."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "10 · Terminal input",
      "title": "Ask for a name in VS Code",
      "explanation": "input displays the question, waits for a line of terminal text, and returns it. name stores that text. The f before the string lets {name} insert the answer. Python needs no readline interface for this example.",
      "note": "# Ask for a name and greet the user",
      "prompt": "Create a name variable, then print Hello with a f-string.",
      "answer": "name = input(\"What is your name?\")\nprint(f\"Hello {name}\")",
      "output": [
        "What is your name?",
        "Hello Alex"
      ],
      "parts": [
        {
          "code": "input(...)",
          "name": "Ask",
          "meaning": "Displays the question and returns the typed line."
        },
        {
          "code": "f\"Hello {name}\"",
          "name": "Insert a value",
          "meaning": "Places the saved name inside the greeting."
        }
      ],
      "fileName": "name.py",
      "runHint": "Save as name.py and run python3 name.py in the VS Code terminal.",
      "outputAnnotations": [
        "you enter Alex",
        "the entered name is used"
      ],
      "outputNote": "Example input: Alex. The input label is an annotation."
    },
    {
      "eyebrow": "11 · If statements and symbols",
      "title": "Check an answer with if and else",
      "explanation": "Ask “What is 1 + 1?” and save the entered text in answer. == checks whether it equals \"2\". if runs its body when the check is true and prints Correct!; else runs its body when the check is false and prints Try again. Only one body runs. This example asks once. In the next lesson, a loop asks the same question again after a wrong answer.",
      "note": "# Ask once; print Correct! for 2, otherwise print Try again.",
      "prompt": "Ask What is 1 + 1? and use if and else to print Correct! or Try again.",
      "answer": "answer = input(\"What is 1 + 1?\")\n\nif answer == \"2\":\n    print(\"Correct!\")\nelse:\n    print(\"Try again.\")",
      "output": [
        "What is 1 + 1?",
        "Correct!"
      ],
      "parts": [
        {
          "code": "if",
          "name": "Check the answer",
          "meaning": "Runs the first body only when answer equals \"2\"."
        },
        {
          "code": "==",
          "name": "Equal to",
          "meaning": "Compares the entered text with \"2\". Both values are text in this example; = saves a value instead."
        },
        {
          "code": "else",
          "name": "Otherwise",
          "meaning": "Runs the other body and prints Try again. when the if condition is false. It does not ask another question by itself."
        },
        {
          "code": ": / indentation",
          "name": "Start and group a body",
          "meaning": "A colon ends the if or else line. The indented print belongs to that body; keep its four spaces."
        }
      ],
      "outputNote": "Example input: 2. Entering a different answer prints Try again. The input labels are annotations, not text printed by the program.",
      "runHint": "Save as main.py and run python main.py (or python3 main.py). Type your answer and press Enter. Run the program again to try another answer.",
      "outputAnnotations": [
        "you enter 2",
        "answer is correct"
      ]
    },
    {
      "eyebrow": "12 · Loops",
      "title": "Repeat input until the answer is correct",
      "explanation": "The loop asks the question, saves the entered text, and prints that answer. If it is \"2\", it prints Correct! and break immediately leaves the nearest loop, skipping Try again. A wrong answer prints the retry message, then the next repetition asks again. Python uses a colon and indentation to show which instructions belong to while and if.",
      "note": "# Create the loop with input, output, and break inside if.",
      "prompt": "Create the loop with input, output, and break inside if.",
      "answer": "while True:\n    answer = input(\"What is 1 + 1?\")\n    print(answer)\n\n    if answer == \"2\":\n        print(\"Correct!\")\n        break\n\n    print(\"Try again.\")",
      "output": [
        "What is 1 + 1?",
        "2",
        "Correct!"
      ],
      "parts": [
        {
          "code": "while True:",
          "name": "Keep repeating",
          "meaning": "The condition stays true, so this loop keeps repeating until break is reached. The indented instructions form its body."
        },
        {
          "code": "input(...)",
          "name": "Read an answer",
          "meaning": "Waits for a line of terminal text and saves it in answer."
        },
        {
          "code": "answer == \"2\"",
          "name": "Check the answer",
          "meaning": "Compares the entered text with \"2\". if runs its body only when this comparison is true."
        },
        {
          "code": "break",
          "name": "Leave the loop",
          "meaning": "Immediately leaves the nearest loop and skips the rest of that repetition. Execution continues after the loop; break does not end the whole program. Here it skips the Try again. message below."
        },
        {
          "code": "print(\"Try again.\")",
          "name": "Repeat after a wrong answer",
          "meaning": "A wrong answer reaches this message. The next repetition then asks the question again."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal.",
      "outputAnnotations": [
        "you enter 2",
        "entered answer echoed",
        "break leaves the loop"
      ],
      "outputNote": "Example run: the first answer is 2. The labels beside the lines explain the run; the program does not print them."
    },
    {
      "eyebrow": "13 · Dictionary",
      "title": "Search a word dictionary",
      "explanation": "{} creates a dictionary of keys and values. \"bonjour\" is a key and \"hello\" its value. values() gets the stored values; join combines them into readable text, which print displays. get searches safely and returns word not found if the key is absent. words[search] is direct lookup but raises KeyError for a missing key.",
      "note": "# Create the word dictionary, show its values, then search for a word.",
      "prompt": "Create the word dictionary, show its values, then search for a word.",
      "answer": "words = {\n    \"bonjour\": \"hello\",\n    \"hola\": \"hello\"\n}\n\nprint(\", \".join(words.values()))\nsearch = input(\"Search:\")\nprint(words.get(search, \"word not found\"))",
      "output": [
        "hello, hello",
        "Search:",
        "hello"
      ],
      "parts": [
        {
          "code": "{ \"bonjour\": \"hello\" }",
          "name": "Dictionary",
          "meaning": "Connects a text key with a value."
        },
        {
          "code": "words.get(...)",
          "name": "Safe lookup",
          "meaning": "Returns a fallback when no key is found."
        },
        {
          "code": "words.values()",
          "name": "Get the values",
          "meaning": "Gets the stored translations from the dictionary."
        },
        {
          "code": "\", \".join(...)",
          "name": "Join the text",
          "meaning": "Combines those text values, placing a comma and space between them."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal.",
      "outputAnnotations": [
        "stored translations",
        "you enter bonjour",
        "value for bonjour"
      ],
      "outputNote": "Example input: bonjour. Input labels are annotations, not text printed by the program."
    },
    {
      "eyebrow": "14 · Expressions",
      "title": "Calculate a value",
      "explanation": "An expression produces a value: 80 + 20 produces 100. speed > 100 produces False when speed is 100. + adds, - subtracts, * multiplies, / divides, // divides and rounds down, and % gives a remainder.",
      "note": "# Calculate speed with 80 + 20, then print Speed: 100.",
      "prompt": "Calculate speed with 80 + 20, then print Speed: 100.",
      "answer": "speed = 80 + 20\nprint(f\"Speed: {speed}\")",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "80 + 20",
          "name": "Expression",
          "meaning": "Produces the value 100."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "15 · Random",
      "title": "Choose a random word",
      "explanation": "list(words) makes a list of dictionary keys. random.choice selects one key from that list. The answer changes between runs; either bonjour or hola may be printed.",
      "note": "# Create the word dictionary and randomly select one of its keys.",
      "prompt": "Create the word dictionary and randomly select one of its keys.",
      "answer": "import random\n\nwords = {\n    \"bonjour\": \"hello\",\n    \"hola\": \"hello\"\n}\n\nword = random.choice(list(words))\nprint(word)",
      "output": [
        "bonjour"
      ],
      "parts": [
        {
          "code": "import random",
          "name": "Load random tools",
          "meaning": "Loads Python's built-in random module."
        },
        {
          "code": "random.choice(...)",
          "name": "Choose",
          "meaning": "Selects an item from a non-empty sequence."
        },
        {
          "code": "list(words)",
          "name": "Keys as a list",
          "meaning": "Copies the dictionary keys into a list."
        }
      ],
      "outputNote": "Example output; either bonjour or hola can be chosen.",
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "16 · Arrays and lists",
      "title": "Make and search a names array",
      "explanation": "[] creates an empty list. input runs first inside append and append adds its answer. in checks membership without changing the list. Matching is case-sensitive. names[0] retrieves the first item after it is added.",
      "note": "# Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "prompt": "Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "answer": "names = []\n\nnames.append(input(\"add a name\"))\n\nsearch = input(\"search for a name\")\n\nif search in names:\n    print(\"name found\")\nelse:\n    print(\"name not found\")",
      "output": [
        "add a name",
        "search for a name",
        "name found"
      ],
      "parts": [
        {
          "code": "[]",
          "name": "Empty list",
          "meaning": "Creates a growing collection."
        },
        {
          "code": "append",
          "name": "Add",
          "meaning": "Adds a value to the end."
        },
        {
          "code": "in",
          "name": "Search",
          "meaning": "Tests membership without changing the list."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal.",
      "outputAnnotations": [
        "you enter Jordan",
        "you enter Jordan",
        "a matching name was found"
      ],
      "outputNote": "Example input: add Jordan, then search for Jordan. Input labels are annotations, not printed text."
    },
    {
      "eyebrow": "17 · Sets",
      "title": "Remove duplicate names",
      "explanation": "set(names) removes duplicates. Python sets do not promise a display order, so sorted makes an alphabetical list before join combines its names into text and print displays it. A set literal uses {\"Alex\", \"Sam\"}; empty {} creates a dictionary, so use set() for an empty set.",
      "note": "# Ask for three names, then remove any duplicates",
      "prompt": "Collect three names, create a set, and print its unique values.",
      "answer": "names = []\n\nnames.append(input(\"Enter the first name:\"))\nnames.append(input(\"Enter the second name:\"))\nnames.append(input(\"Enter the third name:\"))\n\nuniqueNames = set(names)\n\nprint(\"[\" + \", \".join(sorted(uniqueNames)) + \"]\")",
      "output": [
        "Enter the first name:",
        "Enter the second name:",
        "Enter the third name:",
        "[Alex, Sam]"
      ],
      "parts": [
        {
          "code": "set(names)",
          "name": "Unique values",
          "meaning": "Removes repeated values."
        },
        {
          "code": "sorted",
          "name": "Stable display",
          "meaning": "Sorts the unique values before printing."
        },
        {
          "code": "\"[\" + ... + \"]\"",
          "name": "Add display brackets",
          "meaning": "+ joins the printed brackets with the combined names. These brackets are text for display, not a new list."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal.",
      "outputAnnotations": [
        "you enter Alex",
        "you enter Sam",
        "you enter Alex",
        "Alex appears once"
      ],
      "outputNote": "Example input: Alex, Sam, Alex. The repeated name is kept once. The labels are annotations, not printed text."
    },
    {
      "eyebrow": "18 · Null",
      "title": "Mark a value as not ready yet",
      "explanation": "None means there is deliberately no value yet. is None checks for that specific singleton. It is different from zero or an empty string. Assign a real value to result later.",
      "note": "# None means there is deliberately no result yet",
      "prompt": "Set result to None, then print the message for its current state.",
      "answer": "result = None\n\nif result is None:\n    print(\"No result yet\")\nelse:\n    print(\"Result is ready\")",
      "output": [
        "No result yet"
      ],
      "parts": [
        {
          "code": "None",
          "name": "No value yet",
          "meaning": "Deliberately represents no result."
        },
        {
          "code": "is None",
          "name": "Check",
          "meaning": "Checks for the None singleton."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "eyebrow": "19 · Regular expressions",
      "title": "Let names beginning with J enter",
      "explanation": "re searches text with a pattern. ^ means the start, J is the required letter, and re.IGNORECASE accepts J or j. re.search returns a match object when found, which if treats as true.",
      "note": "# Let people into the club when their name begins with J",
      "prompt": "Check the five names and print who may enter the club.",
      "answer": "import re\n\nnames = [\"Jordan\", \"James\", \"Jessica\", \"Sarah\", \"Ben\"]\n\nfor name in names:\n    if re.search(\"^J\", name, re.IGNORECASE):\n        print(name + \" can enter the club.\")\n    else:\n        print(name + \" cannot enter the club.\")",
      "output": [
        "Jordan can enter the club.",
        "James can enter the club.",
        "Jessica can enter the club.",
        "Sarah cannot enter the club.",
        "Ben cannot enter the club."
      ],
      "parts": [
        {
          "code": "for name in names:",
          "name": "Visit each name",
          "meaning": "Visits each name once. name holds the current item, and the indented body runs for that item."
        },
        {
          "code": "\"^J\"",
          "name": "Starts with J",
          "meaning": "The caret anchors the pattern at the start."
        },
        {
          "code": "re.IGNORECASE",
          "name": "Ignore case",
          "meaning": "Matches J or j."
        }
      ],
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal."
    },
    {
      "title": "Get a filename from a path",
      "eyebrow": "20 · Files and paths",
      "explanation": "Build the first piece of a sheet-music finder. A path is a location: sheet-music is the folder and chopin-nocturne.png is the filename. Extracting the name only handles the path; it does not check whether the file exists or read its contents. The .png extension identifies the intended file format, not the words or notes in the picture.",
      "note": "# Extract the filename without opening the image.",
      "prompt": "Print the filename from the score path.",
      "answer": "from pathlib import Path\n\nfile = Path(\"sheet-music/chopin-nocturne.png\")\nprint(file.name)",
      "output": [
        "chopin-nocturne.png"
      ],
      "parts": [
        {
          "code": "from pathlib import Path",
          "name": "Import a path tool",
          "meaning": "Path comes with Python; no package installation is needed."
        },
        {
          "code": "Path(...)",
          "name": "Describe a location",
          "meaning": "Creates a path object, without opening the file."
        },
        {
          "code": "file.name",
          "name": "Get the filename",
          "meaning": "Returns chopin-nocturne.png, including its extension."
        }
      ],
      "fileName": "file-finder.py",
      "runHint": "Save as file-finder.py and run python file-finder.py (or python3 file-finder.py).",
      "outputNote": "Example preview. Extracting a filename does not access your computer or prove that the file exists."
    },
    {
      "title": "List files in a folder",
      "eyebrow": "21 · Files and paths",
      "explanation": "Now let the program discover files rather than typing every filename into a list. Scan the sheet-music folder, skip folders, and print each filename. This reads the folder listing, not the image contents. Only this folder is searched; files inside subfolders are not included. The folder must exist and be readable, or listing it can raise an error.",
      "note": "# List each file in your sheet-music folder.",
      "prompt": "Print filenames from the sheet-music folder, skipping folders.",
      "answer": "from pathlib import Path\n\nfolder = Path(\"sheet-music\")\n\nfor file in folder.iterdir():\n    if file.is_file():\n        print(file.name)",
      "output": [
        "chopin-nocturne.png",
        "practice-notes.txt"
      ],
      "parts": [
        {
          "code": "folder.iterdir()",
          "name": "List the folder",
          "meaning": "Visits entries directly inside sheet-music, without searching subfolders."
        },
        {
          "code": "file.is_file()",
          "name": "Keep files",
          "meaning": "Skips folders."
        },
        {
          "code": "for file in ...",
          "name": "Repeat",
          "meaning": "Checks each entry, rather than printing only the first."
        }
      ],
      "fileName": "file-finder.py",
      "runHint": "Save as file-finder.py and run python file-finder.py (or python3 file-finder.py). Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview for a folder containing these two files. Order may vary. CodeStep checks your code and shows sample output; run it locally to list your own files."
    },
    {
      "title": "Find a sheet-music file",
      "eyebrow": "22 · Files and paths",
      "explanation": "Finish this small file-finding program by checking for the score at its expected location and showing a useful result. When you already know the folder and filename, checking that path is simpler than looping through the entire folder. This checks for a file; it does not open the image or recognise its printed title. Use the exact spelling and capitalisation so the example works across systems.",
      "note": "# Check whether the score exists before using it.",
      "prompt": "Print Found: and the filename, or File not found.",
      "answer": "from pathlib import Path\n\nfile = Path(\"sheet-music/chopin-nocturne.png\")\n\nif file.is_file():\n    print(\"Found: \" + file.name)\nelse:\n    print(\"File not found\")",
      "output": [
        "Found: chopin-nocturne.png"
      ],
      "parts": [
        {
          "code": "file.is_file()",
          "name": "Look up the file",
          "meaning": "Checks the actual filesystem; a missing file or a directory returns false."
        },
        {
          "code": "if / else",
          "name": "Report the result",
          "meaning": "Prints the filename when found, or File not found otherwise."
        }
      ],
      "fileName": "file-finder.py",
      "runHint": "Save as file-finder.py and run python file-finder.py (or python3 file-finder.py). Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview with the score present. Remove or rename it locally to try the File not found branch. CodeStep does not inspect your device."
    },
    {
      "eyebrow": "23 · Concurrent work",
      "title": "Start two threads and wait for them",
      "explanation": "This uses your two-print example. A thread is another path of execution in the same program. Thread(...) sets up work; target=print hands it the print function without calling it now. args=(\"...\",) supplies one argument, so the comma matters: it makes a one-item tuple. start() starts each thread. Both starts happen before join() waits, so the work can overlap. join() waits for a thread to finish; it does not start the thread or control which message prints first. Printing is so quick that the output alone cannot show how much overlap occurred. Standard Python builds have a GIL, so threads are especially useful for waiting on I/O rather than speeding up pure Python calculations.",
      "note": "# Start both print jobs, then wait for both to finish.",
      "prompt": "Set up two threads, start them, and wait for both messages.",
      "answer": "import threading\n\nthread1 = threading.Thread(\n    target=print,\n    args=(\"Thread 1 is running!\",)\n)\n\nthread2 = threading.Thread(\n    target=print,\n    args=(\"Thread 2 is running at the same time!\",)\n)\n\nthread1.start()\nthread2.start()\n\nthread1.join()\nthread2.join()",
      "output": [
        "Thread 1 is running!",
        "Thread 2 is running at the same time!"
      ],
      "outputNote": "Sample output only: the messages can appear in either order. CodeStep checks the code and previews one possible run; it does not start threads in the lesson console.",
      "runHint": "Save as main.py and run python main.py (or python3 main.py). Run it several times; either message can appear first.",
      "parts": [
        {
          "code": "import threading",
          "name": "Load the module",
          "meaning": "Makes Python’s built-in Thread class available."
        },
        {
          "code": "target=print",
          "name": "Choose the work",
          "meaning": "Passes print itself to the thread. Writing print(...) here would run it immediately on the main thread."
        },
        {
          "code": "args=(\"Thread 1 is running!\",)",
          "name": "Pass the text",
          "meaning": "A one-item tuple needs the trailing comma. Thread calls print with this text when it starts."
        },
        {
          "code": "thread1.start()",
          "name": "Start the first thread",
          "meaning": "Schedules its target to run, then returns; start thread2 before waiting."
        },
        {
          "code": "thread1.join()",
          "name": "Wait for completion",
          "meaning": "The main thread waits until thread1 finishes. Then it waits for thread2 too."
        }
      ]
    },
    {
      "eyebrow": "24 · Application practice",
      "title": "Build a random word quiz",
      "explanation": "Combine the dictionary, random choice, input, and if/else. input displays the chosen word. words[word] retrieves its expected translation. == checks the entered answer and prints Correct or Wrong.",
      "note": "# Combine the word dictionary and random key code to make a translation quiz.",
      "prompt": "Combine the word dictionary and random key code to make a translation quiz.",
      "answer": "import random\n\nwords = {\n    \"bonjour\": \"hello\",\n    \"hola\": \"hello\"\n}\n\nword = random.choice(list(words))\nanswer = input(word)\n\nif answer == words[word]:\n    print(\"Correct\")\nelse:\n    print(\"Wrong\")",
      "output": [
        "bonjour",
        "Correct"
      ],
      "parts": [
        {
          "code": "import random",
          "name": "Random tools",
          "meaning": "Loads Python’s built-in random module; no extra installation is needed."
        },
        {
          "code": "words = { ... }",
          "name": "Word dictionary",
          "meaning": "Stores key-and-value pairs. bonjour and hola are keys; hello is their translation."
        },
        {
          "code": "list(words)",
          "name": "List the keys",
          "meaning": "Makes a list of dictionary keys, such as [\"bonjour\", \"hola\"]."
        },
        {
          "code": "random.choice(...)",
          "name": "Choose one key",
          "meaning": "The dot selects choice from the random module. choice() selects one item from the supplied non-empty list."
        },
        {
          "code": "input(word)",
          "name": "Ask for a translation",
          "meaning": "Displays the chosen word and returns the typed answer as text."
        },
        {
          "code": "words[word]",
          "name": "Expected translation",
          "meaning": "Square brackets look up the translation stored under the chosen key."
        },
        {
          "code": "answer == words[word]",
          "name": "Check the answer",
          "meaning": "Compares the text. if prints Correct when it matches; else prints Wrong. Matching is case-sensitive."
        }
      ],
      "outputNote": "Example run: bonjour is chosen and the user enters hello. The entered answer is input; the labels are annotations.",
      "runHint": "Save as main.py and run python3 main.py in the VS Code terminal.",
      "outputAnnotations": [
        "you enter hello",
        "the translation matches"
      ]
    }
  ],
  "cpp": [
    {
      "eyebrow": "01 · Console output",
      "title": "Print several lines at once",
      "explanation": "std::cout displays text in the console. Write \\n inside a quoted string to start a new line. The first \\n puts Welcome on the next line, and the second puts Goodbye on another line. << sends the text to std::cout. main is where the program begins; #include <iostream> makes console output available.",
      "note": "// Print Hello, Welcome, and Goodbye on separate lines.",
      "prompt": "Print Hello, Welcome, and Goodbye on separate lines.",
      "answer": "#include <iostream>\n\nint main() {\n  std::cout << \" Hello \\n Welcome \\n Goodbye\\n\";\n}",
      "output": [
        " Hello ",
        " Welcome ",
        " Goodbye"
      ],
      "parts": [
        {
          "code": "std::cout <<",
          "name": "Print",
          "meaning": "Displays the text in the console."
        },
        {
          "code": "\\n",
          "name": "New line",
          "meaning": "Write this inside the quoted string to start a new line."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "02 · Functions",
      "title": "Make something happen",
      "explanation": "void declares a function that returns no value. Empty () means it has no parameters. {} groups its instructions. Defining correct before main makes it available when main calls correct().",
      "note": "// Define correct: save the instructions under a name.\n// Call correct() after the definition to run those instructions.\n// Defining it alone prints nothing; removing the call means it never runs.",
      "prompt": "Create correct, then call it to print correct.",
      "answer": "// Define the function.\n#include <iostream>\n#include <string>\n\nvoid correct() {\n  std::cout << \"correct\\n\";\n}\n\nint main() {\n  // Call the function to run its body.\n  correct();\n}",
      "output": [
        "correct"
      ],
      "parts": [
        {
          "code": "void correct()",
          "name": "Function",
          "meaning": "A function that returns no value."
        },
        {
          "code": "correct();",
          "name": "Call",
          "meaning": "Runs its body."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed.",
      "explanationTerms": [
        "void",
        "()",
        "{}",
        "correct",
        "main",
        "correct()"
      ]
    },
    {
      "eyebrow": "03 · ANSI colours",
      "title": "Choose a text colour",
      "explanation": "ANSI escape codes choose terminal text colours: 31 is red, 32 green, 33 yellow, 34 blue, 35 magenta, and 36 cyan. Code 0 resets the colour so later output returns to normal. These codes work in terminals that support ANSI colours. The lesson console previews the colours.",
      "note": "// Print Red text and Green text, then reset the colour.",
      "prompt": "Print Red text and Green text, then reset the colour.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  const std::string red = \"\\033[31m\";\n  const std::string green = \"\\033[32m\";\n  const std::string reset = \"\\033[0m\";\n\n  std::cout << red << \"Red text\" << reset << \"\\n\";\n  std::cout << green << \"Green text\" << reset << \"\\n\";\n}",
      "output": [
        "Red text",
        "Green text"
      ],
      "parts": [
        {
          "code": "\\033",
          "name": "Escape character",
          "meaning": "Starts an ANSI instruction in a supporting terminal."
        },
        {
          "code": "[31m / [32m",
          "name": "Red or green",
          "meaning": "After the escape character, [31m selects red text and [32m selects green text."
        },
        {
          "code": "const std::string red / green / reset",
          "name": "Save the colour codes",
          "meaning": "Keeps each colour code under a name so it can be used when printing."
        },
        {
          "code": "std::cout << red",
          "name": "Apply a colour",
          "meaning": "Sends the saved red code before the text. Sending reset afterwards restores normal colour."
        },
        {
          "code": "\\033[0m",
          "name": "Reset",
          "meaning": "Returns terminal text to its normal colour so later output is not left red or green."
        }
      ],
      "outputColors": [
        "#ef4444",
        "#4ade80"
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "04 · Time",
      "title": "Run code after a delay",
      "explanation": "<thread> and <chrono> provide sleep_for and a duration. std::this_thread::sleep_for(std::chrono::seconds(2)) blocks this thread for 2 seconds, then the next statement prints the message.",
      "note": "// Wait 2 seconds, then print Time reached!",
      "prompt": "Wait 2 seconds, then print Time reached!",
      "answer": "#include <iostream>\n#include <string>\n#include <thread>\n#include <chrono>\n\nint main() {\n  std::this_thread::sleep_for(std::chrono::seconds(2));\n  std::cout << \"Time reached!\\n\";\n}",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "sleep_for",
          "name": "Wait",
          "meaning": "Pauses this thread for the supplied duration."
        },
        {
          "code": "std::chrono::seconds(2)",
          "name": "Duration",
          "meaning": "Creates a duration of 2 seconds."
        }
      ],
      "outputNote": "Example output after the 2-second delay.",
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "05 · Date and time",
      "title": "Check for a particular time",
      "explanation": "This checks the local clock once. tm_hour is the hour from 0 to 23; tm_min is the minute from 0 to 59. == compares values and && requires both checks to be true. This prints only if run during 17:20; it does not keep watching the clock.",
      "note": "// Print Time reached! if the local hour is 17 and the minute is 20.",
      "prompt": "Print Time reached! if the local hour is 17 and the minute is 20.",
      "answer": "#include <iostream>\n#include <string>\n#include <ctime>\n\nint main() {\n  std::time_t now = std::time(nullptr);\n  std::tm time = *std::localtime(&now);\n\n  int hour = time.tm_hour;\n  int minute = time.tm_min;\n\n  if (hour == 17 && minute == 20) {\n    std::cout << \"Time reached!\\n\";\n  }\n}",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "std::time(nullptr)",
          "name": "Read the timestamp",
          "meaning": "Gets the current timestamp. nullptr means no extra pointer is supplied for storing another copy."
        },
        {
          "code": "std::localtime(&now)",
          "name": "Read local calendar fields",
          "meaning": "Converts the timestamp into local date and time fields. &now passes the address of now."
        },
        {
          "code": "*std::localtime(&now)",
          "name": "Copy the fields",
          "meaning": "The leading * reads the time structure through the returned pointer so its fields can be saved in time."
        },
        {
          "code": "tm_hour / tm_min",
          "name": "Clock parts",
          "meaning": "Read the local hour and minute."
        },
        {
          "code": "&&",
          "name": "Both",
          "meaning": "Requires both comparisons to be true."
        },
        {
          "code": "if (hour == 17 && minute == 20)",
          "name": "Check both values",
          "meaning": "if runs its body only when both comparisons are true. && (two ampersands) means both the hour and minute must match."
        }
      ],
      "outputNote": "Example output when the clock is 17:20. At other times, this snippet prints nothing.",
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "06 · Date and time",
      "title": "Keep checking until the time is reached",
      "explanation": "The loop gets a fresh local time each second. At 17:20 it prints once and break leaves the loop. sleep_for waits between checks. Keep the program open; if 17:20 has passed, it waits until the next day. Checks can run late.",
      "note": "// Keep checking the local clock and print Time reached! once at 17:20.",
      "prompt": "Keep checking the local clock and print Time reached! once at 17:20.",
      "answer": "#include <iostream>\n#include <string>\n#include <ctime>\n#include <thread>\n#include <chrono>\n\nint main() {\n  while (true) {\n    std::time_t now = std::time(nullptr);\n    std::tm time = *std::localtime(&now);\n    int hour = time.tm_hour;\n    int minute = time.tm_min;\n\n    if (hour == 17 && minute == 20) {\n      std::cout << \"Time reached!\\n\";\n      break;\n    }\n\n    std::this_thread::sleep_for(std::chrono::seconds(1));\n  }\n}",
      "output": [
        "Time reached!"
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Repeat",
          "meaning": "The condition stays true, so the loop repeats its body inside the braces until break is reached."
        },
        {
          "code": "break",
          "name": "Leave the loop",
          "meaning": "Immediately leaves the nearest loop and skips the rest of that repetition. Execution continues after the loop; break does not end the whole program."
        }
      ],
      "outputNote": "Example output at 17:20. The lesson preview does not wait for the clock.",
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "07 · Functions",
      "title": "Use a function's returned value",
      "explanation": "getMessage() returns Hello as a std::string. return immediately ends that function and sends its value back to the caller. std::cout << getMessage() then prints the returned text. Here << sends a value to the output stream; it is not another function call.",
      "note": "// Return Hello from getMessage, then print its returned value.",
      "prompt": "Return Hello from getMessage, then print its returned value.",
      "answer": "#include <iostream>\n#include <string>\n\nstd::string getMessage() {\n  return \"Hello\";\n}\n\nint main() {\n  std::cout << getMessage() << \"\\n\";\n}",
      "output": [
        "Hello"
      ],
      "parts": [
        {
          "code": "std::string",
          "name": "Text",
          "meaning": "The type of text returned by this function."
        },
        {
          "code": "return",
          "name": "Send back",
          "meaning": "Immediately ends this function and sends its value back to the caller. It does not print the value or merely leave a loop."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "08 · Classes",
      "title": "Create and use a class",
      "explanation": "class defines a type. public makes these members accessible from main. Car(...) is its constructor. this->name is the current object’s member; name is the constructor parameter. Car myCar1(\"Ford\", 2014) creates the object without new. A class declaration ends with };.",
      "note": "// Define Car, create car objects, then print their properties.",
      "prompt": "Create the Car class, then create Ford and Audi objects.",
      "answer": "#include <iostream>\n#include <string>\n\nclass Car {\npublic:\n  std::string name;\n  int year;\n\n  Car(std::string name, int year) {\n    this->name = name;\n    this->year = year;\n  }\n};\n\nint main() {\n  Car myCar1(\"Ford\", 2014);\n  Car myCar2(\"Audi\", 2019);\n\n  std::cout << myCar1.name << \", \" << myCar1.year << \"\\n\";\n  std::cout << myCar2.name << \", \" << myCar2.year << \"\\n\";\n}",
      "output": [
        "Ford, 2014",
        "Audi, 2019"
      ],
      "parts": [
        {
          "code": "public:",
          "name": "Access",
          "meaning": "Allows code outside the class to use these members."
        },
        {
          "code": "this->name",
          "name": "Member",
          "meaning": "Refers to the name stored in the current object."
        },
        {
          "code": "class Car",
          "name": "Define the class",
          "meaning": "Defines a blueprint whose objects each keep their own name and year."
        },
        {
          "code": "Car(std::string name, int year)",
          "name": "Constructor",
          "meaning": "Runs when a Car object is created and receives its starting values."
        },
        {
          "code": "Car myCar1(\"Ford\", 2014)",
          "name": "Create an object",
          "meaning": "Creates myCar1 by calling the Car constructor with Ford and 2014. This form does not need new."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "09 · Variables",
      "title": "Use changeable and fixed values",
      "explanation": "speed starts at 80 and can be reassigned. speed = 100 replaces its earlier value. const keeps maxSpeed fixed at 100, so assigning a different value to maxSpeed is not allowed. The last instruction prints the updated speed.",
      "note": "// Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
      "prompt": "Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  int speed = 80;\n  const int maxSpeed = 100;\n\n  speed = 100;\n  std::cout << \"Speed: \" << speed << \"\\n\";\n}",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "int speed = 80;",
          "name": "Changeable value",
          "meaning": "Creates speed with the starting value 80. It can receive a different value later."
        },
        {
          "code": "const int maxSpeed = 100;",
          "name": "Fixed value",
          "meaning": "Creates maxSpeed as a constant. It cannot be reassigned."
        },
        {
          "code": "speed = 100;",
          "name": "Reassign",
          "meaning": "Replaces the earlier value 80 with 100; it does not create a second speed variable."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "10 · Terminal input",
      "title": "Ask for a name in VS Code",
      "explanation": "std::cout displays the question. std::string name declares a text variable. std::getline(std::cin, name) waits for a whole line and saves it in name. std::cout then prints Hello followed by that answer.",
      "note": "// Ask for a name and greet the user",
      "prompt": "Create a name variable, then print Hello with a template string.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  std::cout << \"What is your name?\";\n  std::string name;\n  std::getline(std::cin, name);\n  std::cout << \"Hello \" << name << \"\\n\";\n}",
      "output": [
        "What is your name?",
        "Hello Alex"
      ],
      "parts": [
        {
          "code": "std::string name",
          "name": "Text variable",
          "meaning": "Declares where the entered text is stored."
        },
        {
          "code": "std::getline(std::cin, name)",
          "name": "Read a line",
          "meaning": "Receives a whole line from the terminal."
        }
      ],
      "fileName": "name.cpp",
      "runHint": "Save as name.cpp. In the VS Code terminal compile with g++ -std=c++17 name.cpp -o main, then run ./main. A C++ compiler must be installed.",
      "outputAnnotations": [
        "you enter Alex",
        "the entered name is used"
      ],
      "outputNote": "Example input: Alex. The input label is an annotation."
    },
    {
      "eyebrow": "11 · If statements and symbols",
      "title": "Check an answer with if and else",
      "explanation": "Ask “What is 1 + 1?” and save the entered text in answer. == checks whether it equals \"2\". if runs its body when the check is true and prints Correct!; else runs its body when the check is false and prints Try again. Only one body runs. This example asks once. In the next lesson, a loop asks the same question again after a wrong answer.",
      "note": "// Ask once; print Correct! for 2, otherwise print Try again.",
      "prompt": "Ask What is 1 + 1? and use if and else to print Correct! or Try again.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n    std::cout << \"What is 1 + 1?\";\n    std::string answer;\n    std::getline(std::cin, answer);\n\n    if (answer == \"2\") {\n        std::cout << \"Correct!\\n\";\n    } else {\n        std::cout << \"Try again.\\n\";\n    }\n}",
      "output": [
        "What is 1 + 1?",
        "Correct!"
      ],
      "parts": [
        {
          "code": "if",
          "name": "Check the answer",
          "meaning": "Runs the first body only when answer equals \"2\"."
        },
        {
          "code": "==",
          "name": "Equal to",
          "meaning": "Compares the entered text with \"2\". Both values are text in this example; = saves a value instead."
        },
        {
          "code": "else",
          "name": "Otherwise",
          "meaning": "Runs the other body and prints Try again. when the if condition is false. It does not ask another question by itself."
        },
        {
          "code": "()",
          "name": "Hold the condition",
          "meaning": "The parentheses after if contain the check: answer == \"2\"."
        },
        {
          "code": "{}",
          "name": "Group the instructions",
          "meaning": "The braces after if and else surround each body. Put each action for that body on its own line inside them."
        }
      ],
      "outputNote": "Example input: 2. Entering a different answer prints Try again. The input labels are annotations, not text printed by the program.",
      "runHint": "Save as main.cpp; compile with g++ -std=c++17 main.cpp -o main, then run ./main (Windows: .\\main.exe). Type your answer and press Enter. Run the program again to try another answer.",
      "outputAnnotations": [
        "you enter 2",
        "answer is correct"
      ]
    },
    {
      "eyebrow": "12 · Loops",
      "title": "Repeat input until the answer is correct",
      "explanation": "The loop asks the question, saves the entered text, and prints that answer. If it is \"2\", it prints Correct! and break immediately leaves the nearest loop, skipping Try again. A wrong answer prints the retry message, then the next repetition asks again. The braces show which instructions belong to while and if.",
      "note": "// Create the loop with input, output, and break inside if.",
      "prompt": "Create the loop with input, output, and break inside if.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  while (true) {\n    std::cout << \"What is 1 + 1?\";\n    std::string answer;\n    std::getline(std::cin, answer);\n    std::cout << answer << \"\\n\";\n\n    if (answer == \"2\") {\n      std::cout << \"Correct!\\n\";\n      break;\n    }\n\n    std::cout << \"Try again.\\n\";\n  }\n}",
      "output": [
        "What is 1 + 1?",
        "2",
        "Correct!"
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Keep repeating",
          "meaning": "The condition stays true, so this loop keeps repeating until break is reached. The instructions inside its braces form its body."
        },
        {
          "code": "std::getline(std::cin, answer)",
          "name": "Read an answer",
          "meaning": "Waits for a line of terminal text and saves it in answer."
        },
        {
          "code": "answer == \"2\"",
          "name": "Check the answer",
          "meaning": "Compares the entered text with \"2\". if runs its body only when this comparison is true."
        },
        {
          "code": "break;",
          "name": "Leave the loop",
          "meaning": "Immediately leaves the nearest loop and skips the rest of that repetition. Execution continues after the loop; break does not end the whole program. Here it skips the Try again. message below."
        },
        {
          "code": "std::cout << \"Try again.\\n\";",
          "name": "Repeat after a wrong answer",
          "meaning": "A wrong answer reaches this message. The next repetition then asks the question again."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed.",
      "outputAnnotations": [
        "you enter 2",
        "entered answer echoed",
        "break leaves the loop"
      ],
      "outputNote": "Example run: the first answer is 2. The labels beside the lines explain the run; the program does not print them."
    },
    {
      "eyebrow": "13 · Dictionary",
      "title": "Search a word dictionary",
      "explanation": "std::map stores key/value pairs. The two std::string types mean text keys and text values. find searches safely; end means no match. found->second is the matching value. [] retrieves a value, but a missing key would insert a default value, so use find when only searching.",
      "note": "// Create the word dictionary, show its values, then search for a word.",
      "prompt": "Create the word dictionary, show its values, then search for a word.",
      "answer": "#include <iostream>\n#include <string>\n#include <map>\n\nint main() {\n  std::map<std::string, std::string> words = {\n    {\"bonjour\", \"hello\"},\n    {\"hola\", \"hello\"}\n  };\n\n  std::cout << words[\"bonjour\"] << \", \" << words[\"hola\"] << \"\\n\";\n  std::cout << \"Search:\";\n  std::string search;\n  std::getline(std::cin, search);\n  auto found = words.find(search);\n  if (found != words.end()) {\n    std::cout << found->second << \"\\n\";\n  } else {\n    std::cout << \"word not found\\n\";\n  }\n}",
      "output": [
        "hello, hello",
        "Search:",
        "hello"
      ],
      "parts": [
        {
          "code": "std::map",
          "name": "Dictionary",
          "meaning": "Stores key/value pairs."
        },
        {
          "code": "find",
          "name": "Safe lookup",
          "meaning": "Searches without inserting a missing key."
        },
        {
          "code": "found->second",
          "name": "Stored value",
          "meaning": "Reads the matching entry’s value."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed.",
      "outputAnnotations": [
        "stored translations",
        "you enter bonjour",
        "value for bonjour"
      ],
      "outputNote": "Example input: bonjour. Input labels are annotations, not text printed by the program."
    },
    {
      "eyebrow": "14 · Expressions",
      "title": "Calculate a value",
      "explanation": "An expression produces a value: 80 + 20 produces 100. speed > 100 produces false when speed is 100. + adds, - subtracts, * multiplies, / divides, and % gives an integer remainder. Integer division truncates the fraction; use 5.0 for a floating-point result.",
      "note": "// Calculate speed with 80 + 20, then print Speed: 100.",
      "prompt": "Calculate speed with 80 + 20, then print Speed: 100.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  int speed = 80 + 20;\n  std::cout << \"Speed: \" << speed << \"\\n\";\n}",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "80 + 20",
          "name": "Expression",
          "meaning": "Produces the value 100."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "15 · Random",
      "title": "Choose a random word",
      "explanation": "The loop copies map keys into a vector. mt19937 is a random-number generator seeded by random_device. uniform_int_distribution chooses an index from 0 through size - 1, inclusive. keys[choose(generator)] retrieves the chosen key. Either word may be printed.",
      "note": "// Create the word dictionary and randomly select one of its keys.",
      "prompt": "Create the word dictionary and randomly select one of its keys.",
      "answer": "#include <iostream>\n#include <string>\n#include <map>\n#include <vector>\n#include <random>\n\nint main() {\n  std::map<std::string, std::string> words = {\n    {\"bonjour\", \"hello\"},\n    {\"hola\", \"hello\"}\n  };\n\n  std::vector<std::string> keys;\n  for (const auto& entry : words) {\n    keys.push_back(entry.first);\n  }\n  std::mt19937 generator(std::random_device{}());\n  std::uniform_int_distribution<int> choose(0, static_cast<int>(keys.size()) - 1);\n  std::string random = keys[choose(generator)];\n\n  std::cout << random << \"\\n\";\n}",
      "output": [
        "bonjour"
      ],
      "parts": [
        {
          "code": "std::map<std::string, std::string>",
          "name": "Word dictionary",
          "meaning": "Stores text keys and translations. bonjour and hola each map to hello."
        },
        {
          "code": "std::vector<std::string> keys",
          "name": "List of keys",
          "meaning": "Creates a list that can grow as keys are added."
        },
        {
          "code": "for (const auto& entry : words)",
          "name": "Read each pair",
          "meaning": "Visits every dictionary entry. const auto& refers to the existing pair without copying or changing it."
        },
        {
          "code": "keys.push_back(entry.first)",
          "name": "Add a key",
          "meaning": "first is the key in the pair. push_back adds it to the end of the list."
        },
        {
          "code": "std::random_device{}()",
          "name": "Seed the generator",
          "meaning": "Creates a seed source and asks it for a value used to initialise the generator."
        },
        {
          "code": "std::mt19937 generator(...)",
          "name": "Random generator",
          "meaning": "Creates a pseudo-random number generator from that seed."
        },
        {
          "code": "std::uniform_int_distribution<int> choose(...)",
          "name": "Choose an index",
          "meaning": "Sets the inclusive range used when choose(generator) selects a whole number."
        },
        {
          "code": "static_cast<int>(keys.size()) - 1",
          "name": "Last position",
          "meaning": "Converts the number of keys to int and subtracts 1. Two keys have positions 0 and 1."
        },
        {
          "code": "keys[choose(generator)]",
          "name": "Choose a word",
          "meaning": "Uses the generator to choose a position, then retrieves the key at that position."
        }
      ],
      "outputNote": "Example output; either bonjour or hola can be chosen.",
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "16 · Arrays and lists",
      "title": "Make and search a names array",
      "explanation": "A built-in array has a fixed size. std::vector is a growing collection that matches JavaScript’s array here. push_back adds the entered name. std::find searches between begin and end; returning end means no match. Matching is case-sensitive.",
      "note": "// Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "prompt": "Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "answer": "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\n\nint main() {\n  std::vector<std::string> names;\n\n  std::cout << \"add a name\";\n  std::string name;\n  std::getline(std::cin, name);\n  names.push_back(name);\n\n  std::cout << \"search for a name\";\n  std::string search;\n  std::getline(std::cin, search);\n\n  if (std::find(names.begin(), names.end(), search) != names.end()) {\n    std::cout << \"name found\\n\";\n  } else {\n    std::cout << \"name not found\\n\";\n  }\n}",
      "output": [
        "add a name",
        "search for a name",
        "name found"
      ],
      "parts": [
        {
          "code": "std::vector",
          "name": "Growing collection",
          "meaning": "Stores a list of values that can grow."
        },
        {
          "code": "push_back",
          "name": "Add",
          "meaning": "Adds a value to the end."
        },
        {
          "code": "std::find",
          "name": "Search",
          "meaning": "Returns the found position or end when absent."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed.",
      "outputAnnotations": [
        "you enter Jordan",
        "you enter Jordan",
        "a matching name was found"
      ],
      "outputNote": "Example input: add Jordan, then search for Jordan. Input labels are annotations, not printed text."
    },
    {
      "eyebrow": "17 · Sets",
      "title": "Remove duplicate names",
      "explanation": "std::set stores unique values in sorted order. The loop prints a comma between items and square brackets around them. firstItem prevents a comma before the first item. Alex, Sam, Alex becomes [Alex, Sam].",
      "note": "// Ask for three names, then remove any duplicates",
      "prompt": "Collect three names, create a std::set, and print its unique values.",
      "answer": "#include <iostream>\n#include <string>\n#include <set>\n\nint main() {\n  std::cout << \"Enter the first name:\";\n  std::string first;\n  std::getline(std::cin, first);\n  std::cout << \"Enter the second name:\";\n  std::string second;\n  std::getline(std::cin, second);\n  std::cout << \"Enter the third name:\";\n  std::string third;\n  std::getline(std::cin, third);\n\n  std::set<std::string> uniqueNames = {first, second, third};\n\n  std::cout << \"[\";\n  bool firstItem = true;\n  for (const auto& name : uniqueNames) {\n    if (!firstItem) std::cout << \", \";\n    std::cout << name;\n    firstItem = false;\n  }\n  std::cout << \"]\\n\";\n}",
      "output": [
        "Enter the first name:",
        "Enter the second name:",
        "Enter the third name:",
        "[Alex, Sam]"
      ],
      "parts": [
        {
          "code": "std::set",
          "name": "Unique values",
          "meaning": "Keeps one copy of each value in sorted order."
        },
        {
          "code": "for (const auto& name : uniqueNames)",
          "name": "Visit each unique name",
          "meaning": "Runs once for each set value. auto infers its type; & reads the existing value without copying it; const prevents changing it through name."
        },
        {
          "code": "if (!firstItem)",
          "name": "Add separators after the first item",
          "meaning": "! reverses true and false. This prints a comma only after the first item has already been printed."
        },
        {
          "code": "firstItem = false",
          "name": "Remember the first item is done",
          "meaning": "Makes the next repetition include a comma before its name."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed.",
      "outputAnnotations": [
        "you enter Alex",
        "you enter Sam",
        "you enter Alex",
        "Alex appears once"
      ],
      "outputNote": "Example input: Alex, Sam, Alex. The repeated name is kept once. The labels are annotations, not printed text."
    },
    {
      "eyebrow": "18 · Null",
      "title": "Mark a value as not ready yet",
      "explanation": "C++ does not use null for an ordinary string. std::optional<std::string> may hold a string or no value. std::nullopt makes it empty, has_value checks whether a value exists, and ! reverses that result. nullptr is for pointers.",
      "note": "// null means there is deliberately no result yet",
      "prompt": "Set result to null, then print the message for its current state.",
      "answer": "#include <iostream>\n#include <string>\n#include <optional>\n\nint main() {\n  std::optional<std::string> result = std::nullopt;\n\n  if (!result.has_value()) {\n    std::cout << \"No result yet\\n\";\n  } else {\n    std::cout << \"Result is ready\\n\";\n  }\n}",
      "output": [
        "No result yet"
      ],
      "parts": [
        {
          "code": "std::optional<std::string>",
          "name": "Optional value",
          "meaning": "Can hold text or have no value."
        },
        {
          "code": "std::nullopt",
          "name": "Empty",
          "meaning": "Creates an optional with no value."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "eyebrow": "19 · Regular expressions",
      "title": "Let names beginning with J enter",
      "explanation": "std::regex holds the pattern. ^ requires J at the beginning; std::regex::icase ignores case. regex_search returns true for a matching name. This accepts any text starting with J or j, not only names.",
      "note": "// Let people into the club when their name begins with J",
      "prompt": "Check the five names and print who may enter the club.",
      "answer": "#include <iostream>\n#include <string>\n#include <vector>\n#include <regex>\n\nint main() {\n  std::vector<std::string> names = {\"Jordan\", \"James\", \"Jessica\", \"Sarah\", \"Ben\"};\n  std::regex pattern(\"^J\", std::regex::icase);\n\n  for (const auto& name : names) {\n    if (std::regex_search(name, pattern)) {\n      std::cout << name << \" can enter the club.\\n\";\n    } else {\n      std::cout << name << \" cannot enter the club.\\n\";\n    }\n  }\n}",
      "output": [
        "Jordan can enter the club.",
        "James can enter the club.",
        "Jessica can enter the club.",
        "Sarah cannot enter the club.",
        "Ben cannot enter the club."
      ],
      "parts": [
        {
          "code": "std::regex",
          "name": "Pattern",
          "meaning": "Stores the text pattern."
        },
        {
          "code": "std::regex::icase",
          "name": "Ignore case",
          "meaning": "Matches J or j."
        }
      ],
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed."
    },
    {
      "title": "Get a filename from a path",
      "eyebrow": "20 · Files and paths",
      "explanation": "Build the first piece of a sheet-music finder. A path is a location: sheet-music is the folder and chopin-nocturne.png is the filename. Extracting the name only handles the path; it does not check whether the file exists or read its contents. The .png extension identifies the intended file format, not the words or notes in the picture.",
      "note": "// Extract the filename without opening the image.",
      "prompt": "Print the filename from the score path.",
      "answer": "#include <iostream>\n#include <filesystem>\n\nint main() {\n  std::filesystem::path file = \"sheet-music/chopin-nocturne.png\";\n  std::cout << file.filename().string() << \"\\n\";\n}",
      "output": [
        "chopin-nocturne.png"
      ],
      "parts": [
        {
          "code": "#include <filesystem>",
          "name": "Use filesystem tools",
          "meaning": "Makes C++17 filesystem declarations available."
        },
        {
          "code": "std::filesystem::path",
          "name": "Describe a location",
          "meaning": "Stores a filesystem path without opening the file."
        },
        {
          "code": "file.filename().string()",
          "name": "Get printable filename text",
          "meaning": "filename extracts the last component; string converts the path to text for cout."
        }
      ],
      "fileName": "file-finder.cpp",
      "runHint": "Save as file-finder.cpp, compile with g++ -std=c++17 file-finder.cpp -o file-finder, then run ./file-finder (Windows: .\\file-finder.exe). A C++17 compiler is required.",
      "outputNote": "Example preview. Extracting a filename does not access your computer or prove that the file exists."
    },
    {
      "title": "List files in a folder",
      "eyebrow": "21 · Files and paths",
      "explanation": "Now let the program discover files rather than typing every filename into a list. Scan the sheet-music folder, skip folders, and print each filename. This reads the folder listing, not the image contents. Only this folder is searched; files inside subfolders are not included. The folder must exist and be readable, or listing it can raise an error.",
      "note": "// List each file in your sheet-music folder.",
      "prompt": "Print filenames from the sheet-music folder, skipping folders.",
      "answer": "#include <iostream>\n#include <filesystem>\n\nint main() {\n  for (const auto& file : std::filesystem::directory_iterator(\"sheet-music\")) {\n    if (file.is_regular_file()) {\n      std::cout << file.path().filename().string() << \"\\n\";\n    }\n  }\n}",
      "output": [
        "chopin-nocturne.png",
        "practice-notes.txt"
      ],
      "parts": [
        {
          "code": "std::filesystem::directory_iterator",
          "name": "List the folder",
          "meaning": "Visits entries directly inside the folder, without searching subfolders."
        },
        {
          "code": "const auto& file",
          "name": "Use each entry",
          "meaning": "auto lets the compiler infer the entry type; & avoids copying it and const prevents changing it here."
        },
        {
          "code": "file.is_regular_file()",
          "name": "Keep files",
          "meaning": "Skips folders; path().filename().string() gets printable filename text."
        }
      ],
      "fileName": "file-finder.cpp",
      "runHint": "Save as file-finder.cpp, compile with g++ -std=c++17 file-finder.cpp -o file-finder, then run ./file-finder (Windows: .\\file-finder.exe). A C++17 compiler is required. Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview for a folder containing these two files. Order may vary. CodeStep checks your code and shows sample output; run it locally to list your own files."
    },
    {
      "title": "Find a sheet-music file",
      "eyebrow": "22 · Files and paths",
      "explanation": "Finish this small file-finding program by checking for the score at its expected location and showing a useful result. When you already know the folder and filename, checking that path is simpler than looping through the entire folder. This checks for a file; it does not open the image or recognise its printed title. Use the exact spelling and capitalisation so the example works across systems.",
      "note": "// Check whether the score exists before using it.",
      "prompt": "Print Found: and the filename, or File not found.",
      "answer": "#include <iostream>\n#include <filesystem>\n\nint main() {\n  std::filesystem::path file = \"sheet-music/chopin-nocturne.png\";\n\n  if (std::filesystem::is_regular_file(file)) {\n    std::cout << \"Found: \" << file.filename().string() << \"\\n\";\n  } else {\n    std::cout << \"File not found\\n\";\n  }\n}",
      "output": [
        "Found: chopin-nocturne.png"
      ],
      "parts": [
        {
          "code": "std::filesystem::is_regular_file(file)",
          "name": "Look up the file",
          "meaning": "Checks the filesystem for a regular file at this location."
        },
        {
          "code": "if / else",
          "name": "Report the result",
          "meaning": "Prints the filename if found, or File not found otherwise."
        }
      ],
      "fileName": "file-finder.cpp",
      "runHint": "Save as file-finder.cpp, compile with g++ -std=c++17 file-finder.cpp -o file-finder, then run ./file-finder (Windows: .\\file-finder.exe). A C++17 compiler is required. Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview with the score present. Remove or rename it locally to try the File not found branch. CodeStep does not inspect your device."
    },
    {
      "eyebrow": "23 · Concurrent work",
      "title": "Start two threads and wait for them",
      "explanation": "std::thread starts a separate path of execution when constructed with work. The [] { ... } expression is an inline lambda containing the print instruction, so this example needs no named function. Construct both threads, then join each one before main ends. Their print order can change; console output may even mix if two threads write at once. Include <thread> for std::thread. A delay or an ordinary sequential pair of print statements would not create extra threads.",
      "note": "// Start both print jobs, then wait for both to finish.",
      "prompt": "Set up two threads, start them, and wait for both messages.",
      "answer": "#include <iostream>\n#include <thread>\n\nint main() {\n  std::thread thread1([] { std::cout << \"Thread 1 is running!\\n\"; });\n  std::thread thread2([] { std::cout << \"Thread 2 is running at the same time!\\n\"; });\n\n  thread1.join();\n  thread2.join();\n}",
      "output": [
        "Thread 1 is running!",
        "Thread 2 is running at the same time!"
      ],
      "outputNote": "Sample output only: the messages can appear in either order. CodeStep checks the code and previews one possible run; it does not start threads in the lesson console.",
      "runHint": "Save as main.cpp. Compile with g++ -std=c++17 -pthread main.cpp -o main and run ./main (Windows with an appropriate C++ compiler: main.exe). Either line can appear first.",
      "parts": [
        {
          "code": "#include <thread>",
          "name": "Use threads",
          "meaning": "Declares std::thread and its join method."
        },
        {
          "code": "[] { ... }",
          "name": "Give the thread work",
          "meaning": "This inline lambda is the code the new thread runs; no separately named function is needed."
        },
        {
          "code": "std::thread thread1(...)",
          "name": "Create and start",
          "meaning": "Creating a std::thread with work starts it immediately."
        },
        {
          "code": "join()",
          "name": "Wait for completion",
          "meaning": "The main thread waits for both workers before ending main."
        }
      ]
    },
    {
      "eyebrow": "24 · Application practice",
      "title": "Build a random word quiz",
      "explanation": "Combine the map, random choice, terminal input, and if/else. std::getline reads the answer. words[random] retrieves the chosen key’s translation. == checks the answer and prints Correct or Wrong.",
      "note": "// Combine the word dictionary and random key code to make a translation quiz.",
      "prompt": "Combine the word dictionary and random key code to make a translation quiz.",
      "answer": "#include <iostream>\n#include <string>\n#include <map>\n#include <vector>\n#include <random>\n\nint main() {\n  std::map<std::string, std::string> words = {\n    {\"bonjour\", \"hello\"},\n    {\"hola\", \"hello\"}\n  };\n\n  std::vector<std::string> keys;\n  for (const auto& entry : words) {\n    keys.push_back(entry.first);\n  }\n  std::mt19937 generator(std::random_device{}());\n  std::uniform_int_distribution<int> choose(0, static_cast<int>(keys.size()) - 1);\n  std::string random = keys[choose(generator)];\n\n  std::cout << random;\n  std::string answer;\n  std::getline(std::cin, answer);\n\n  if (answer == words[random]) {\n    std::cout << \"Correct\\n\";\n  } else {\n    std::cout << \"Wrong\\n\";\n  }\n}",
      "output": [
        "bonjour",
        "Correct"
      ],
      "parts": [
        {
          "code": "std::map<std::string, std::string>",
          "name": "Word dictionary",
          "meaning": "Stores text keys and translations. bonjour and hola each map to hello."
        },
        {
          "code": "std::vector<std::string> keys",
          "name": "List of keys",
          "meaning": "Creates a list that can grow as keys are added."
        },
        {
          "code": "for (const auto& entry : words)",
          "name": "Read each pair",
          "meaning": "Visits every dictionary entry. const auto& refers to the existing pair without copying or changing it."
        },
        {
          "code": "keys.push_back(entry.first)",
          "name": "Add a key",
          "meaning": "first is the key in the pair. push_back adds it to the end of the list."
        },
        {
          "code": "std::random_device{}()",
          "name": "Seed the generator",
          "meaning": "Creates a seed source and asks it for a value used to initialise the generator."
        },
        {
          "code": "std::mt19937 generator(...)",
          "name": "Random generator",
          "meaning": "Creates a pseudo-random number generator from that seed."
        },
        {
          "code": "std::uniform_int_distribution<int> choose(...)",
          "name": "Choose an index",
          "meaning": "Sets the inclusive range used when choose(generator) selects a whole number."
        },
        {
          "code": "static_cast<int>(keys.size()) - 1",
          "name": "Last position",
          "meaning": "Converts the number of keys to int and subtracts 1. Two keys have positions 0 and 1."
        },
        {
          "code": "keys[choose(generator)]",
          "name": "Choose a word",
          "meaning": "Uses the generator to choose a position, then retrieves the key at that position."
        },
        {
          "code": "std::getline(std::cin, answer)",
          "name": "Read the answer",
          "meaning": "Reads a full line of terminal input into answer."
        },
        {
          "code": "words[random]",
          "name": "Expected translation",
          "meaning": "Looks up the translation stored under the selected key."
        },
        {
          "code": "answer == words[random]",
          "name": "Check the answer",
          "meaning": "Compares the text. if prints Correct when it matches; else prints Wrong. Matching is case-sensitive."
        }
      ],
      "outputNote": "Example run: bonjour is chosen and the user enters hello. The entered answer is input; the labels are annotations.",
      "runHint": "Save as main.cpp. In the VS Code terminal compile with g++ -std=c++17 main.cpp -o main, then run ./main. A C++ compiler must be installed.",
      "outputAnnotations": [
        "you enter hello",
        "the translation matches"
      ]
    }
  ]
};

type CodePart = { code: string; name: string; meaning: string };

const lessonTone = (lesson: Lesson) => {
  const label = `${lesson.eyebrow} ${lesson.title}`.toLowerCase();
  if (/application practice|random/.test(label)) return "violet";
  if (/files and paths|terminal input/.test(label)) return "cyan";
  if (/dictionary/.test(label)) return "blue";
  if (/expressions/.test(label)) return "orange";
  if (/function|method|class|heading|text element/.test(label)) return "rose";
  if (/loop|timer|page structure|doctype|body|div|multiple pages/.test(label)) return "blue";
  if (/variable|null|date|time|font/.test(label)) return "gold";
  if (/console|print/.test(label)) return "cyan";
  if (/decision|condition|comparison|regular expression|javascript in html/.test(label)) return "violet";
  if (/array|list|set|object|position/.test(label)) return "green";
  if (/image|video|audio|style|border|colour|css|selector/.test(label)) return "orange";
  return "green";
};

const withoutGuideComments = (value: string, language: Language) => {
  const uncommented = language === "html"
    ? value.replace(/<!--[\s\S]*?-->/g, "")
    : language === "css"
      ? value.replace(/\/\*[\s\S]*?\*\//g, "")
      : language === "python" ? value.split("\n").filter(line => !line.trimStart().startsWith("#")).join("\n")
      : value.split("\n").map((line) => {
        const commentIndex = line.indexOf("//");
        return commentIndex < 0 ? line : line.slice(0, commentIndex);
      }).join("\n");

  return uncommented.split("\n").map(line => line.trimEnd()).join("\n").replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n").trim();
};

function lessonComment(lesson: Lesson, language: Language) {
  const text = lesson.note.trim().replace(/^(?:\/\/|#|<!--|\/\*)\s*/, "").replace(/\s*(?:-->|\*\/)$/, "");
  if (!text) return "";
  const lines = text.split("\n").map(line => line.replace(/^\s*(?:\/\/|#|\*)\s?/, ""));
  const comment = language === "html" ? `<!-- ${lines.join(" ").replace(/--/g, "—")} -->` : language === "css" ? `/* ${lines.join(" ").replace(/\*\//g, "* / ")} */` : lines.map(line => `${language === "python" ? "#" : "//"} ${line}`).join("\n");
  return `${comment}\n\n`;
}

function annotatedLessonCode(lesson: Lesson, language: Language) {
  const source = withoutGuideComments(lesson.answer, language);
  const used = new Set<string>();
  const compact = (text: string) => text.replace(/\s+/g, "");
  const headerHelp: Record<string, string> = { iostream: "Allows printing and keyboard input.", string: "Allows us to store text.", vector: "Provides a list that can grow.", map: "Provides a dictionary of keys and values.", set: "Provides a collection of unique values.", chrono: "Provides clocks and time durations.", thread: "Provides threads and waiting.", filesystem: "Provides tools for files, folders, and paths.", random: "Provides random-number generators.", regex: "Provides tools for matching text patterns." };
  const output: string[] = [];
  let script = false, style = false;
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    const indent = line.match(/^[ \t]*/)?.[0] ?? "";
    const syntax: Language = language === "html" && script && !/^<\/script/i.test(trimmed) ? "javascript" : language === "html" && style && !/^<\/style/i.test(trimmed) ? "css" : language;
    const header = language === "cpp" ? trimmed.match(/^#include <([^>]+)>$/) : null;
    if (header) { output.push(`${line} // ${headerHelp[header[1]] ?? "Makes this library's tools available to the program."}`); continue; }
    const matching = (lesson.parts ?? []).filter(part => !used.has(part.code) && compact(part.code).length > 2 && compact(line).includes(compact(part.code)));
    let help = matching.map(part => { used.add(part.code); return part.meaning; }).join(" ");
    if (!help && syntax === "cpp" && /^int main\(/.test(trimmed)) help = "Start the program here.";
    if (!help && /^(?:std::cout|Console\.WriteLine|console\.log|print\()/.test(trimmed)) help = /[?]|Enter your|Search:/.test(trimmed) ? "Display the question for the user." : "Print the result.";
    if (!help && syntax === "cpp" && /^std::string\s+\w+;$/.test(trimmed)) help = "Create a text variable to store the user's input.";
    if (/std::getline\(std::cin/.test(trimmed)) help = "Read the whole line the user types, including spaces, until they press Enter.";
    if (lesson.title === "Ask for a name in VS Code" && syntax === "cpp" && /^std::cout/.test(trimmed) && trimmed.includes("Hello")) help = "Print a greeting using the name the user entered.";
    if (!help && /^return 0;/.test(trimmed)) help = "End the program successfully.";
    if (language === "html" && (script || style) && !/^<\/(?:script|style)/i.test(trimmed)) help = "";
    if (language === "html" && /^<script\b/i.test(trimmed)) help = "Run the JavaScript instructions in this script block.";
    if (language === "html" && /^<style\b/i.test(trimmed)) help = "Apply the CSS rules in this style block.";
    if (help && trimmed) {
      if (output.length && output[output.length - 1].trim() && !/[{:>]$/.test(output[output.length - 1].trim())) output.push("");
      const words = help.replace(/-->/g, "—>").replace(/\*\//g, "* / ").split(/\s+/);
      const wrapped: string[] = []; let row = "";
      for (const word of words) { if (row && row.length + word.length > 72) { wrapped.push(row); row = ""; } row += (row ? " " : "") + word; }
      if (row) wrapped.push(row);
      for (const text of wrapped) output.push(indent + (syntax === "html" ? `<!-- ${text} -->` : syntax === "css" ? `/* ${text} */` : `${syntax === "python" ? "#" : "//"} ${text}`));
    }
    output.push(line);
    if (language === "html") { if (/<script\b/i.test(line)) script = true; if (/<\/script/i.test(line)) script = false; if (/<style\b/i.test(line)) style = true; if (/<\/style/i.test(line)) style = false; }
  }
  return output.join("\n");
}

function lessonExample(lesson: Lesson, language: Language, comments: boolean) {
  return comments ? lessonComment(lesson, language) + annotatedLessonCode(lesson, language) : withoutGuideComments(lesson.answer, language);
}

const languageName = (language: Language) => language === "cpp" ? "C++" : language === "python" ? "Python" : language === "javascript" ? "JavaScript" : language === "csharp" ? "C#" : language === "html" ? "HTML" : "CSS";
const languageBadge = (language: Language) => language === "cpp" ? "C++" : language === "python" ? "PY" : language === "javascript" ? "JS" : language === "csharp" ? "C#" : language === "html" ? "HTML" : "CSS";
const challengeFile = (language: Language) => language === "cpp" ? "main.cpp" : language === "python" ? "main.py" : language === "javascript" ? "main.js" : language === "csharp" ? "Program.cs" : language === "html" ? "index.html" : "styles.css";

type DiagnosticPart = { text: string; help: string; kind: "type" | "message" | "token" | "location" };

function significantCharacters(value: string, language: Language) {
  const characters: { character: string; index: number }[] = [];
  let quote = "", comment = "";
  let script = false, style = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index], next = value[index + 1];
    if (comment === "line") { if (character === "\n") comment = ""; continue; }
    if (comment === "block") { if (character === "*" && next === "/") { comment = ""; index++; } continue; }
    if (comment === "html") { if (value.startsWith("-->", index)) { comment = ""; index += 2; } continue; }
    if (!quote) {
      if (language === "html") { if (/^<script\b/i.test(value.slice(index))) script = true; if (/^<\/script/i.test(value.slice(index))) script = false; if (/^<style\b/i.test(value.slice(index))) style = true; if (/^<\/style/i.test(value.slice(index))) style = false; }
      if (language === "html" && value.startsWith("<!--", index)) { comment = "html"; index += 3; continue; }
      if ((language === "css" || language === "javascript" || language === "csharp" || language === "cpp" || script || style) && character === "/" && next === "*") { comment = "block"; index++; continue; }
      if (((language !== "python" && language !== "html" && language !== "css") || script) && character === "/" && next === "/") { comment = "line"; index++; continue; }
      if (language === "python" && character === "#") { comment = "line"; continue; }
    }
    if ((character === '"' || character === "'" || character === "`") && value[index - 1] !== "\\") quote = quote === character ? "" : quote || character;
    if (!/[\s\u00a0\u200b-\u200d\ufeff]/.test(character)) characters.push({ character, index });
  }
  return characters;
}

function alignedGuide(code: string, expected: string, language: Language) {
  const actual = significantCharacters(code, language);
  const target = significantCharacters(expected, language);
  let matched = 0;
  while (matched < actual.length && matched < target.length && actual[matched].character.toLowerCase() === target[matched].character.toLowerCase()) matched += 1;
  // Stop suggesting a suffix when the learner types a different approach.
  if (matched < actual.length) return "";
  const expectedPosition = matched ? target[matched - 1].index + 1 : 0;
  const typedWhitespace = matched ? code.length - actual[matched - 1].index - 1 : code.length;
  const remainingGuide = expected.slice(expectedPosition).replace(/^\s*/, whitespace => whitespace.slice(typedWhitespace));
  return remainingGuide;
}

function SyntaxDiagnostic({ parts }: { parts: DiagnosticPart[] }) {
  return <div className="syntax-diagnostic" role="alert">{parts.map((part, index) => <span key={`${part.text}-${index}`} className={`diagnostic-${part.kind}`} tabIndex={0} data-help={part.help} aria-label={`${part.text}: ${part.help}`}>{part.text}</span>)}</div>;
}

function HighlightedCode({ code, language, caretIndex }: { code: string; language: Language; caretIndex?: number }) {
  if (language === "html") {
    const segments: { code: string; language: Language; start: number }[] = [];
    let start = 0;
    for (const match of code.matchAll(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2\s*>)/gi)) {
      if (match.index > start) segments.push({ code: code.slice(start, match.index), language: "html", start });
      segments.push({ code: match[1], language: "html", start: match.index });
      segments.push({ code: match[3], language: match[2].toLowerCase() === "script" ? "javascript" : "css", start: match.index + match[1].length });
      segments.push({ code: match[4], language: "html", start: match.index + match[1].length + match[3].length });
      start = match.index + match[0].length;
    }
    if (segments.length) {
      if (start < code.length) segments.push({ code: code.slice(start), language: "html", start });
      return <>{segments.map((segment, index) => <HighlightedCode key={index} code={segment.code} language={segment.language} caretIndex={caretIndex !== undefined && caretIndex >= segment.start && (caretIndex < segment.start + segment.code.length || index === segments.length - 1) ? caretIndex - segment.start : undefined} />)}</>;
    }
  }
  const languageApis: Record<Language, RegExp> = {
    javascript: /^(Math|Object|process|fs|path|console|Date|Set)$/,
    csharp: /^(Console|Task|DateTime|List|HashSet|Dictionary|Random|Regex|RegexOptions)$/,
    cpp: /^(std|cout|cin|vector|map|set|optional|mt19937|uniform_int_distribution|random_device)$/,
    python: /^(print|input|datetime|random|re|time|set|list|sorted)$/,
    html: /^(Date|console)$/,
    css: /^(background-color|color|text-align|font-family|border|border-radius)$/,
  };
  let pattern = language === "html"
    ? /(<!--[\s\S]*?-->|<\/?|\/?>|"[^"]*"|'[^']*'|\b(?:html|head|meta|title|body|div|section|script|img|video|audio|h[1-6]|p|a|span|b|strong|i|em|mark|small|del|ins|sub|sup)\b|\b(?:style|href|src|alt|controls|id|lang|charset)\b|\b(?:background-color)\b|\b(?:const|new)\b|\b(?:Date|console|log)\b|\d+|[{}()[\];=.:#])/g
    : language === "css"
    ? /(\/\*[\s\S]*?\*\/|#[0-9a-fA-F]{3,8}\b|#[A-Za-z_]\w*|\b(?:body|p|background-color|color|text-align|font-family|border|border-radius|solid|dotted|center|lightblue|red|blue|tomato)\b|\d+(?:px)?|[{}();:.,])/g
    : language === "python"
    ? /(#.*|f?"[^"\n]*"|f?'[^'\n]*'|\b(?:def|class|self|return|import|from|if|elif|else|for|in|while|True|False|None|break|and|or|not|is)\b|\b(?:print|input|datetime|random|re|time|set|list|sorted|__init__)\b|\b[A-Za-z_]\w*(?=\s*\()|\d+|[{}()[\];=.:<>+*%/-])/g
    : /(\/\/[^\n]*|\/\^[A-Za-z]+\/[gimsuy]*|"[^"\n]*"|'[^'\n]*'|`[^`]*`|\b(?:def|self|import|from|True|False|None|and|or|not|is|using|static_cast|function|class|constructor|this|let|const|double|bool|out|auto|include|new|null|if|else|for|of|while|true|false|break|return|setTimeout|setInterval|clearInterval|public|static|void|string|int|get|set|var|foreach|in|await)\b|\b(?:Math|Object|process|fs|path|console|Console|Task|Date|DateTime|List|Set|HashSet|Dictionary|Random|std|cout|cin|vector|map|optional|print|input|datetime|random|re|time|Regex|RegexOptions|mt19937|uniform_int_distribution|random_device)\b|\b[A-Za-z_]\w*(?=\s*\()|\d+|===|!==|==|!=|&&|\|\||!|>=|<=|\+\+|--|[{}()[\];=.:<>?^/])/g;
  if (language === "csharp" || language === "javascript") pattern = new RegExp(String.raw`\b(?:WriteLine|ReadLine|log)\b|` + pattern.source, "g");
  if (language === "cpp") pattern = new RegExp(String.raw`#[ \t]*include[ \t]+(?:<[^>\n]+>|"[^"\n]+")|` + pattern.source, "g");
  const parts: { text: string; kind: string }[] = [];
  let lastIndex = 0;
  for (const match of code.matchAll(pattern)) {
    if (match.index! > lastIndex) parts.push({ text: code.slice(lastIndex, match.index), kind: "plain" });
    const text = match[0];
    let kind = "punctuation";
    if (language === "cpp" && /^#[ \t]*include/.test(text)) kind = "header";
    else if (/^(\/\/|\/\*|<!--)/.test(text) || (language === "python" && text.startsWith("#"))) kind = "comment";
    else if (/^f?["'`]/.test(text) || /^\/\^/.test(text)) kind = "string";
    else if ((language === "python" || language === "cpp") && languageApis[language].test(text)) kind = "api";
    else if (/^(def|self|True|False|None|elif|and|or|not|is|import|from|using|auto|static_cast|function|class|constructor|this|let|const|double|bool|out|new|null|if|else|for|of|while|true|false|break|return|setTimeout|setInterval|clearInterval|public|static|void|string|int|get|set|var|foreach|in|await|<\/?|\/?>|html|head|meta|title|body|div|section|script|img|video|audio|h[1-6]|p|a|span|b|strong|i|em|mark|small|del|ins|sub|sup)$/.test(text)) kind = "keyword";
    else if (languageApis[language].test(text)) kind = "api";
    else if (/^(style|href|src|alt|controls|id|lang|charset)$/.test(text)) kind = "attribute";
    else if (/^(background-color|color|text-align|font-family|border|border-radius)$/.test(text)) kind = "api";
    else if (/^(body|p)$/.test(text)) kind = "keyword";
    else if (/^(solid|dotted|center|lightblue|red|blue|tomato|#[0-9a-fA-F]+)$/.test(text)) kind = "string";
    else if (/^#[A-Za-z_]/.test(text)) kind = "function-name";
    else if (/^\d+$/.test(text)) kind = "number";
    else if ((language === "python" && text === "__init__") || /^(WriteLine|ReadLine|log)$/.test(text)) kind = "function-name";
    else if (/^[A-Za-z_]/.test(text)) kind = /^\s*\(/.test(code.slice(match.index! + text.length)) ? "function-name" : "plain";
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

function LearningCode({ code, starter, language, caretIndex, focusConditions }: { code: string; starter?: string; language: Language; caretIndex: number; focusConditions?: boolean }) {
  if (focusConditions) {
    const segments: { start: number; end: number; fresh: boolean }[] = [];
    let offset = 0;
    for (const line of code.split(/(?<=\n)/)) {
      const conditionLine = /^\s*(?:}\s*)?(?:if|elif|else)\b/.test(line);
      let last = 0;
      if (conditionLine) for (const match of line.matchAll(/"[^"\n]*"|'[^'\n]*'|\b(?:if|elif|else|and|or|not)\b|===|!==|==|!=|>=|<=|&&|\|\||[<>!]/g)) {
        if (match.index > last) segments.push({start: offset + last, end: offset + match.index, fresh: false});
        segments.push({start: offset + match.index, end: offset + match.index + match[0].length, fresh: !/^["']/.test(match[0])});
        last = match.index + match[0].length;
      }
      if (last < line.length) segments.push({start: offset + last, end: offset + line.length, fresh: false});
      offset += line.length;
    }
    return <>{segments.map((segment, i) => <span key={i} className={segment.fresh ? "new-code" : "learned-code"}><HighlightedCode code={code.slice(segment.start, segment.end)} language={language} caretIndex={caretIndex >= segment.start && (caretIndex < segment.end || i === segments.length - 1) ? caretIndex - segment.start : undefined} /></span>)}{!code && <i className="editor-caret" />}</>;
  }
  const learnedLength = starter && code.startsWith(starter) ? starter.length : 0;
  if (!learnedLength) return <span className="new-code"><HighlightedCode code={code} language={language} caretIndex={caretIndex} /></span>;

  const learnedCode = code.slice(0, learnedLength);
  const newCode = code.slice(learnedLength);
  const caretInLearnedCode = caretIndex <= learnedLength;

  return <>
    <span className="learned-code"><HighlightedCode code={learnedCode} language={language} caretIndex={caretInLearnedCode ? caretIndex : undefined} /></span>
    <span className="new-code"><HighlightedCode code={newCode} language={language} caretIndex={!caretInLearnedCode ? caretIndex - learnedLength : undefined} /></span>
  </>;
}

function TopicPinButton({ topic, pins, onToggle, limit = 2 }: { topic: string | null; pins: string[]; onToggle: (topic: string) => void; limit?: number }) {
  const pinned = !!topic && pins.includes(topic);
  return <button className="topic-pin-button" aria-label={`${pinned ? "Unpin" : "Pin"} ${topic ?? "unavailable topic"}`} title={!topic ? "No matching topic in your language" : pinned ? `Unpin ${topic}` : pins.length >= limit ? "Unpin a topic before adding another" : `Pin ${topic}`} data-pinned={pinned} disabled={!topic || (!pinned && pins.length >= limit)} onClick={() => topic && onToggle(topic)}><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 4 4v2H6v-2l4-4-1-6ZM12 15v6"/></svg></button>;
}

function PinnedTopicShortcuts({ topics, activeTopic, onSelect, language, showTitles = false }: { topics: string[]; activeTopic: string | null; onSelect: (topic: string) => void; language: Language; showTitles?: boolean }) {
  if (!topics.length) return null;
  return <div className="pinned-topic-shortcuts" role="group" aria-label="Pinned topics" style={{ "--pin-count": topics.length } as React.CSSProperties}>{topics.map(id => {
    const lesson = lessons[language].find(item => item.title === id);
    if (!lesson) return null;
    return <button key={id} className={`pinned-topic-chip tone-${lessonTone(lesson)}`} data-active={activeTopic === id} aria-pressed={activeTopic === id} aria-label={`Open ${lesson.title}`} onClick={() => onSelect(id)} title={`Open ${lesson.title}`}><span className="pinned-topic-label">{lessonTopic(lesson)}</span>{showTitles && <small>{lesson.title}</small>}</button>;
  })}</div>;
}

function LessonSymbol() {
  return <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z"/></svg>;
}

function PracticeSymbol() {
  return <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/></svg>;
}

function EditorModeSymbol({ blockMode }: { blockMode: boolean }) {
  return <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{blockMode ? <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 13h1m4 0h1m4 0h1M8 16h8"/></> : <><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="18" height="8" rx="1"/></>}</svg>;
}

function HomeButton({ onClick, active = false }: { onClick: () => void; active?: boolean }) {
  return <button className="drawer-toggle home-button nav-control" onClick={onClick} aria-current={active ? "page" : undefined} aria-label="Go home" title="Go home"><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>;
}

function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return <button className="app-back" onClick={onClick} aria-label={label}><span aria-hidden="true">←</span><span>Back</span></button>;
}

function MenuHeader({ title, titleId, onBack, backLabel, className }: { title: string; titleId: string; onBack: () => void; backLabel: string; className: string }) {
  return <header className={`app-header menu-header ${className}`}><BackButton onClick={onBack} label={backLabel} /><div className="menu-header-heading"><small>CODESTEP</small><h2 id={titleId}>{title}</h2></div></header>;
}

function SettingsPanel({ open, themeMode, showGuide, showComments, onCommentsChange, colourTyping, blockMode, onBlockModeChange, onThemeChange, onGuideChange, onColourTypingChange, onClose }: { open: boolean; themeMode: ThemeMode; showGuide: boolean; showComments: boolean; onCommentsChange: (show: boolean) => void; colourTyping: boolean; blockMode: boolean; onBlockModeChange: (enabled: boolean) => void; onThemeChange: (mode: ThemeMode) => void; onGuideChange: (show: boolean) => void; onColourTypingChange: (show: boolean) => void; onClose: () => void }) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = document.querySelector<HTMLElement>(".settings-panel");
    panel?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key !== "Tab" || !panel) return;
      const controls = [...panel.querySelectorAll<HTMLElement>("button, select, input, [tabindex='0']")];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); previousFocus?.focus(); };
  }, [open]);
  if (!open) return null;
  return <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
    <section id="settings-drawer" className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="drawer-head settings-drawer-head"><div><small>PREFERENCES</small><b id="settings-title">Settings</b></div><button className="drawer-close" aria-label="Close settings" onClick={onClose}>×</button></div>
      <div className="settings-scroll">
      <div className="settings-group"><b>Appearance</b><span>Choose a theme or follow your device setting.</span><div className="theme-options">
        {(["light", "dark", "system"] as ThemeMode[]).map((mode) => <button key={mode} data-active={themeMode === mode} className={themeMode === mode ? "selected" : ""} onClick={() => onThemeChange(mode)}><i aria-hidden="true"><svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{mode === "light" ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></> : mode === "dark" ? <path d="M20.8 13.1A9 9 0 0 1 10.9 3.2a9 9 0 1 0 9.9 9.9Z"/> : <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>}</svg></i><span>{mode[0].toUpperCase() + mode.slice(1)}</span><small>{mode === "system" ? "Use device setting" : `${mode} appearance`}</small></button>)}
      </div></div>
      <div className="settings-group guide-setting"><div><b>Code blocks</b><span>Tap or drag ready-made lines into your code. Turn off to type instead. Your choice is saved on this device.</span></div><button aria-label="Code blocks" className={`switch ${blockMode ? "on" : ""}`} role="switch" aria-checked={blockMode} onClick={() => onBlockModeChange(!blockMode)}><i /></button></div>
      <div className="settings-group guide-setting"><div><b>Code guide</b><span>Show a faint, colour-coded copy of the expected answer in the editor.</span></div><button aria-label="Code guide" className={`switch ${showGuide ? "on" : ""}`} role="switch" aria-checked={showGuide} onClick={() => onGuideChange(!showGuide)}><i /></button></div>
      <div className="settings-group guide-setting"><div><b>Colour typed code</b><span>Give your typed code the same syntax colours as the ghost guide.</span></div><button aria-label="Colour typed code" className={`switch ${colourTyping ? "on" : ""}`} role="switch" aria-checked={colourTyping} onClick={() => onColourTypingChange(!colourTyping)}><i /></button></div>
      <div className="settings-group guide-setting"><div><b>Lesson comments</b><span>Show step-by-step comments in the code guide and copied examples. You can skip typing the comments.</span></div><button aria-label="Lesson comments" className={`switch ${showComments ? "on" : ""}`} role="switch" aria-checked={showComments} onClick={() => onCommentsChange(!showComments)}><i /></button></div>
      <p className="settings-foot">Comments explain the code and do not change the result. Your choice is saved on this device.</p>
      </div>
    </section>
  </div>;
}

const cppHeaderNotes: Record<string, string> = {
  filesystem: "Declares C++17 paths, directory iterators, and checks for files. Compile these examples with C++17 or newer.",
  iostream: "Declares terminal input and output, including std::cout (print), std::cin (read), and std::endl (new line and flush).",
  string: "Declares std::string for storing text and string-based std::getline for reading a whole line.",
  vector: "Declares std::vector, a list that can grow when you add items.",
  map: "Declares std::map, which stores keys with their associated values.",
  set: "Declares std::set, a collection of unique, sorted values.",
  algorithm: "Declares operations on collections, such as std::find for searching.",
  optional: "Declares std::optional and std::nullopt for a value that may be absent.",
  random: "Declares random-number generators and distributions for choosing values.",
  regex: "Declares std::regex and pattern-matching operations.",
  ctime: "Declares time utilities, including std::time, std::tm, and std::localtime.",
  iomanip: "Declares output formatting tools, such as std::put_time for displaying a time.",
  chrono: "Declares clocks and durations, such as std::chrono::seconds(2).",
  thread: "Declares thread utilities, including std::this_thread::sleep_for for pausing the current thread.",
};

function CppSetupGuide({ lesson, initiallyOpen = false }: { lesson: Lesson; initiallyOpen?: boolean }) {
  const headers = [...new Set(Array.from(lesson.answer.matchAll(/#include <([^>]+)>/g), match => match[1]))];
  return <details className="cpp-setup-guide" open={initiallyOpen}>
    <summary>Understand the C++ setup code</summary>
    <pre><code><HighlightedCode language="cpp" code={'#include <iostream> // Make cout available.\n\nint main() {        // The program starts here.\n  std::cout << "Hello\\n";\n  return 0;         // Tell the system it finished successfully.\n}'} /></code></pre>
    <dl>
      <div><dt><InlineCode language={"cpp"} code={"#include <iostream>"} /></dt><dd><InlineCode language={"cpp"} code={"#include"} /> is a preprocessor instruction: it brings a header’s declarations into this file before compilation. A header describes library tools your code can use. The angle brackets <InlineCode language={"cpp"} code={"< >"} /> tell the compiler to search its configured include locations. This does not install a library. Use <InlineCode language={"cpp"} code={"#include \"myfile.h\""} /> for a project header, usually searched relative to the current file first. Include directives do not need a semicolon.</dd></div>
      <div><dt><InlineCode language={"cpp"} code={"int main()"} /></dt><dd><InlineCode language={"cpp"} code={"main"} /> is the starting function for a normal C++ console program. <InlineCode language={"cpp"} code={"int"} /> means it returns a whole number to the operating system; it is not the number your program prints. Empty <InlineCode language={"cpp"} code={"()"} /> means this version takes no parameters. Write ordinary executable statements inside main or another function. Removing main from this standalone example prevents it from linking as a normal executable.</dd></div>
      <div><dt><code>{"{ ... }"}</code></dt><dd>The braces mark the start and end of the function body. Indentation makes it easier to read; the braces determine which instructions belong to it.</dd></div>
      <div><dt><InlineCode language={"cpp"} code={"std::cout << \"Hello\\\\n\";"} /></dt><dd><InlineCode language={"cpp"} code={"std"} /> is the standard-library namespace, a group of names. <InlineCode language={"cpp"} code={"::"} /> selects a name inside it. <InlineCode language={"cpp"} code={"cout"} /> is the standard output stream; <InlineCode language={"cpp"} code={"<<"} /> sends the text into it. <InlineCode language={"cpp"} code={"\\n"} /> starts a new line and <InlineCode language={"cpp"} code={";"} /> ends the statement. Removing <InlineCode language={"cpp"} code={"std::"} /> makes cout unknown unless you have brought that name into scope.</dd></div>
      <div><dt><InlineCode language={"cpp"} code={"return 0;"} /></dt><dd>Ends main and sends a success status to the operating system. A nonzero status usually signals a problem. You can leave this line out at the end of main: C++ automatically returns 0 there. That special rule does not apply to ordinary functions that must return a value.</dd></div>
      <div><dt><InlineCode language={"cpp"} code={"int"} />, <InlineCode language={"cpp"} code={"void"} />, and <InlineCode language={"cpp"} code={"std::string"} /></dt><dd>Types describe values. <InlineCode language={"cpp"} code={"int score = 5;"} /> stores a whole number; <InlineCode language={"cpp"} code={"double speed = 5.5;"} /> stores a decimal; <InlineCode language={"cpp"} code={"bool ready = true;"} /> stores true or false; <InlineCode language={"cpp"} code={"std::string name = \"Jordan\";"} /> stores text. Before a function name, its type describes what it returns: <InlineCode language={"cpp"} code={"void correct()"} /> returns no value. main must return int, so do not replace it with void main.</dd></div>
      <div><dt>Defining and calling a function</dt><dd><code>void correct() {"{ ... }"}</code> defines instructions; <InlineCode language={"cpp"} code={"correct();"} /> runs them. In these examples, define your function before main, then call it inside main. Otherwise, you need a declaration before its first use. Do not call correct from inside its own body just to start it: that repeatedly calls itself.</dd></div>
      <div><dt>Can it be simpler?</dt><dd>For a program that only prints, you need just <InlineCode language={"cpp"} code={"<iostream>"} />, <InlineCode language={"cpp"} code={"int main()"} />, its braces, and the print statement. Add other headers only when you use their tools. <InlineCode language={"cpp"} code={"using std::cout;"} /> lets you write cout without std::, but keeping std:: makes its source clear.</dd></div>
    </dl>
    <p>Code colours are reading aids, not errors. A header such as <InlineCode language={"cpp"} code={"<string>"} /> names a library header; <InlineCode language={"cpp"} code={"std::string"} /> is a text type; <InlineCode language={"cpp"} code={"\"Hello\""} /> is an actual string value.</p>
    <h3>Headers in this lesson</h3>
    {headers.map(header => <p key={header}><code>{`#include <${header}>`}</code> — {cppHeaderNotes[header] ?? "Makes this header’s declarations available to the example."}</p>)}
    <p>If you remove a required header, the compiler may report an unknown name. Another header can sometimes include it indirectly; include what your code uses so it does not depend on that accident.</p>
  </details>;
}

const homeDemos: Record<Language, { code: string; file: string }> = {
  javascript: { file: "main.js", code: 'function sayHello() {\n  console.log("Hello, coder!");\n}\n\nsayHello();' },
  csharp: { file: "Program.cs", code: 'void SayHello() {\n  Console.WriteLine("Hello, coder!");\n}\n\nSayHello();' },
  python: { file: "main.py", code: 'def sayHello():\n    print("Hello, coder!")\n\nsayHello()' },
  cpp: { file: "main.cpp", code: '#include <iostream>\n\nvoid sayHello() {\n  std::cout << "Hello, coder!\\n";\n}\n\nint main() {\n  sayHello();\n}' },
  html: { file: "index.html", code: '<!DOCTYPE html>\n<html lang="en">\n<body>\n  <p>Hello, coder!</p>\n</body>\n</html>' },
  css: { file: "styles.css + HTML", code: '/* HTML: <p class="hello">Hello, coder!</p> */\n.hello {\n  color: green;\n  font-family: monospace;\n}' },
};

function matchingLesson(source: Lesson, target: Language) {
  const aliases: Record<string, string[]> = {
    "Choose let or const": ["Use changeable and fixed values"],
    "Use changeable and fixed values": ["Choose let or const"],
    "Print the current date and time": ["Show the current date and time"],
    "Show the current date and time": ["Print the current date and time"],
    "Use one function inside another": ["Send a value back with return", "Use a function's returned value"],
    "Send a value back with return": ["Use one function inside another", "Use a function's returned value"],
    "Use a function's returned value": ["Use one function inside another", "Send a value back with return"],
    "Repeat input until the answer is correct": ["Use a button instead of while (true)"],
    "Use a button instead of while (true)": ["Repeat input until the answer is correct"],
    "Give one element a unique name": ["Style one unique element"],
    "Style one unique element": ["Give one element a unique name"],
  };
  return lessons[target].find(item => item.title === source.title)
    ?? lessons[target].find(item => aliases[source.title]?.includes(item.title));
}

function InlineCode({ code, language }: { code: string; language: Language }) {
  const special = /^\\[nrt]$/.test(code) ? "attribute" : /^<[^>]+>$|^#include$/.test(code) ? "header" : /^(main|correct|WriteLine|ReadLine)$/.test(code) ? "function-name" : "";
  return <code className="explanation-code">{special ? <span className={`syntax-${special}`}>{code}</span> : <HighlightedCode code={code} language={language} />}</code>;
}

function LessonExplanation({ lesson, language }: { lesson: Lesson; language: Language }) {
  const terms = [...new Set([
    ...(lesson.explanationTerms ?? []),
    ...(lesson.answer.match(/#include(?:[ \t]+<[^>]+>)?|\b(?:std::\w+|Console\.\w+|console\.\w+|self\.\w+|__init__|int|void|double|bool|string|main|class|def|return|const|let|var|if|else|print|input)\b|\\n|<<|==|!=/g) ?? []),
    ...(lesson.parts ?? []).map(part => part.code),
  ])].filter(term => term && lesson.explanation.includes(term)).sort((a, b) => b.length - a.length);
  if (!terms.length) return <>{lesson.explanation}</>;
  const pattern = new RegExp(terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  const result = [];
  let offset = 0;
  for (const match of lesson.explanation.matchAll(pattern)) {
    const start = match.index;
    const end = start + match[0].length;
    if (/^\w/.test(match[0]) && /[\w]/.test(lesson.explanation[start - 1] ?? "")) continue;
    if (/\w$/.test(match[0]) && /[\w]/.test(lesson.explanation[end] ?? "")) continue;
    result.push(lesson.explanation.slice(offset, start));
    const concept = ["named block of code", "colon", "indented body", "method"].includes(match[0]);
    result.push(concept ? <strong key={start}>{match[0]}</strong> : <InlineCode key={start} code={match[0]} language={language} />);
    offset = end;
  }
  result.push(lesson.explanation.slice(offset));
  return <>{result}</>;
}

function ComparisonExamplePicker({ target, selected, onSelect, sourceLanguage, pins, onTogglePin, pinLimit = 2 }: { target: Language; selected?: Lesson; onSelect: (title: string) => void; sourceLanguage: Language; pins: string[]; onTogglePin: (topic: string) => void; pinLimit?: number }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  const choices = lessons[target].filter(item => `${item.title} ${item.eyebrow}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <div className="comparison-example-menu" ref={root} onKeyDown={event => { if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} className="drawer-toggle" aria-label={open ? "Close comparison examples" : "Open comparison examples"} data-active={open} aria-expanded={open} aria-controls="comparison-examples" onClick={() => { setOpen(!open); setQuery(""); }}><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14"/></svg></button>
    {open && <button className="comparison-menu-backdrop" aria-label="Close comparison examples" onClick={() => setOpen(false)} />}
    {open && <div className="example-picker-panel" id="comparison-examples"><div className="drawer-head comparison-topic-head"><span className="drawer-language-logo" aria-hidden="true"><img src={`/language-logos/${target}.svg`} alt="" width="30" height="30" /></span><div><small>COMPARE TOPICS</small><b>{languageName(target)}</b></div><button className="drawer-close" aria-label="Close comparison topics" onClick={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }}>×</button></div>{pins.length > 0 && <section className="drawer-pins" aria-label="Pinned comparison lessons"><b>Pinned</b><PinnedTopicShortcuts topics={pins} activeTopic={selected ? matchingLesson(selected, sourceLanguage)?.title ?? null : null} language={sourceLanguage} showTitles onSelect={title => { const source = lessons[sourceLanguage].find(item => item.title === title); const destination = source ? matchingLesson(source, target) : undefined; if (!destination) return; onSelect(destination.title); setOpen(false); trigger.current?.focus({ preventScroll: true }); }} /></section>}<div className="drawer-pin-hint">All topics · Pin up to {pinLimit} · {pins.length}/{pinLimit}</div><input ref={search} aria-label="Search comparison examples" placeholder="Search examples…" value={query} onChange={event => setQuery(event.target.value)} /><div className="example-picker-list topic-list">{choices.map(item => { const matching = matchingLesson(item, sourceLanguage); return <div className="lesson-list-row" key={item.title}><button className={`tone-${lessonTone(item)}`} data-active={selected === item} aria-pressed={selected === item} onClick={() => { search.current?.blur(); onSelect(item.title); setOpen(false); trigger.current?.focus({ preventScroll: true }); }}><span className="example-label"><small>{item.eyebrow.replace(/^\d+\s*[·.]\s*/, "")}</small><strong>{item.title}</strong></span><span className="example-choice-mark" aria-hidden="true">{selected === item ? <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg> : "›"}</span></button><TopicPinButton limit={pinLimit} topic={matching?.title ?? null} pins={pins} onToggle={onTogglePin} /></div>; })}{!choices.length && <p>No matching examples.</p>}</div></div>}
  </div>;
}

async function copyCodeText(value: string) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return true; }
  } catch { /* Try the browser's selection-based copy below. */ }
  const previous = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
  // A modal dialog makes elements outside it inert.
  (document.querySelector("dialog[open]") ?? document.body).appendChild(field);
  field.select();
  let copied = false;
  try { copied = document.execCommand("copy"); } catch {}
  field.remove();
  previous?.focus();
  return copied;
}

function CopyCodeButton({ code, label, text = "Copy code", iconOnly = false }: { code: string; label: string; text?: string; iconOnly?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => { setStatus("idle"); }, [code]);
  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2400);
    return () => clearTimeout(timer);
  }, [status]);
  return <span className="copy-code-control"><button className="copy-code-button" title={status === "failed" ? "Select the code and copy it manually." : "Copy code with its indentation and line breaks"} aria-label={`Copy ${label} code`} disabled={!code.trim()} onClick={async () => setStatus(await copyCodeText(code) ? "copied" : "failed")}>{iconOnly ? <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{status === "copied" ? <path d="m5 12 4 4L19 6"/> : status === "failed" ? <path d="M12 4v10m0 4v2"/> : <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>}</svg> : status === "copied" ? "Copied" : status === "failed" ? "Copy blocked" : text}</button><span className="copy-code-status" role="status">{status === "copied" ? "Code copied." : status === "failed" ? "Copy was blocked. Select the code and copy it manually." : ""}</span></span>;
}

function LanguageComparison({ language, lesson, editorCode, showComments, onClose, pinnedTopics = [], onTogglePin = () => {}, pinLimit = 2 }: { language: Language; lesson: Lesson; editorCode: string; showComments: boolean; onClose: () => void; pinnedTopics?: string[]; onTogglePin?: (topic: string) => void; pinLimit?: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<Language>(language === "javascript" ? "cpp" : "javascript");
  const [pickedLesson, setPickedLesson] = useState<Lesson | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const sourceLesson = pickedLesson ? matchingLesson(pickedLesson, language) : lesson;
  const prefix = lessonComment(lesson, language);
  const editedBody = editorCode.startsWith(prefix) ? editorCode.slice(prefix.length) : editorCode;
  const hasEditorCode = !pickedLesson && !lesson.referenceOnly && !!editedBody.trim();
  const sourceCode = hasEditorCode ? editorCode : sourceLesson ? lessonExample(sourceLesson, language, showComments) : "No equivalent example in this language.";
  const other = matchingLesson(pickedLesson ?? lesson, target);
  const selectPinnedTopic = (topic: string) => {
    const nextIndex = pinnedLessonIndex(lessons[language], topic);
    if (nextIndex >= 0) setPickedLesson(lessons[language][nextIndex]);
  };
  const activeTopic = sourceLesson?.title ?? null;
  const targetCode = other ? lessonExample(other, target, showComments) : "";
  const replayKey = `${language}-${target}-${pickedLesson?.title ?? lesson.title}`;
  const sourceReveal = useQuickCodeReveal(sourceCode, replayKey);
  const targetReveal = useQuickCodeReveal(targetCode, replayKey);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    dialog.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => { setPickedLesson(null); }, [lesson]);
  return <dialog ref={dialog} tabIndex={-1} className="language-comparison" onCancel={event => { if (notesOpen) { event.preventDefault(); setNotesOpen(false); } else onClose(); }} aria-labelledby="language-comparison-title">
    <header className="lesson-nav app-header comparison-topbar"><div className="lesson-brand-group"><BackButton onClick={onClose} label="Back to lesson" /><ComparisonExamplePicker key={target} target={target} sourceLanguage={language} pins={pinnedTopics} pinLimit={pinLimit} onTogglePin={onTogglePin} selected={other} onSelect={title => setPickedLesson(lessons[target].find(item => item.title === title) ?? null)} /></div>{pinLimit > 2 && pinnedTopics.length > 0 && <div className="desktop-header-pins"><PinnedTopicShortcuts topics={pinnedTopics} activeTopic={activeTopic} onSelect={selectPinnedTopic} language={language} /></div>}<div className="comparison-header-languages"><button className="drawer-toggle comparison-notes-toggle" aria-label="Lesson explanations" title="Lesson explanations" data-active={notesOpen} aria-expanded={notesOpen} aria-controls="comparison-notes-panel" onClick={() => setNotesOpen(!notesOpen)}><LessonSymbol /></button><h2 id="language-comparison-title">Compare code</h2><div className="compare-language-choices"><div role="group" aria-label="Comparison language">{(Object.keys(lessons) as Language[]).filter(item => item !== language && item !== "html" && item !== "css").map(item => <button className={`language-choice language-${item}`} key={item} aria-label={`Compare with ${languageName(item)}`} title={languageName(item)} data-active={target === item} aria-pressed={target === item} onClick={() => setTarget(item)}><img className="comparison-language-logo" src={`/language-logos/${item}.svg`} alt="" width="24" height="24" />{target === item && <span className="comparison-language-name">{languageName(item)}</span>}</button>)}</div></div></div></header>
    <div className="language-comparison-controls">
      <p className="comparison-context">{sourceLesson && other ? (other?.title ?? sourceLesson?.title) : "No matching example is available in one of these languages. Choose another topic or language."}</p>
    </div>
    <div className="language-comparison-columns">
      <section className={`comparison-card ${sourceLesson ? `tone-${lessonTone(sourceLesson)}` : ""}`}><header className="comparison-filebar"><div className={`comparison-file-tab ${pinnedTopics.length && pinLimit <= 2 ? "has-pinned-topics" : ""}`} data-topic-tone={sourceLesson ? lessonTone(sourceLesson) : "green"} title={languageName(language)}><img className="editor-file-logo" src={`/language-logos/${language}.svg`} alt={languageName(language)} width="18" height="18" /><span className="comparison-file-name">{sourceLesson?.fileName || challengeFile(language)}</span>{pinLimit <= 2 && <PinnedTopicShortcuts topics={pinnedTopics} activeTopic={activeTopic} onSelect={selectPinnedTopic} language={language} />}</div><CopyCodeButton iconOnly code={sourceCode} label={languageName(language)} /></header><pre className="numbered-comparison-code" aria-label={`${languageName(language)} code for comparison`}><CodeLineNumbers text={sourceCode} /><code className="comparison-code-space" aria-hidden="true">{sourceCode}</code><code className="comparison-code-reveal"><HighlightedCode code={sourceReveal} language={language} /></code></pre></section>
      <section className={`comparison-card ${other ? `tone-${lessonTone(other)}` : ""}`} key={target + (other?.title ?? "")}><header className="comparison-filebar"><div className="comparison-file-tab" data-topic-tone={other ? lessonTone(other) : "green"} title={languageName(target)}><img className="editor-file-logo" src={`/language-logos/${target}.svg`} alt={languageName(target)} width="18" height="18" /><span className="comparison-file-name">{other?.fileName || challengeFile(target)}</span></div><CopyCodeButton iconOnly code={other ? lessonExample(other, target, showComments) : ""} label={languageName(target)} /></header><pre className="numbered-comparison-code" aria-label="Other language code"><CodeLineNumbers text={targetCode} /><code className="comparison-code-space" aria-hidden="true">{targetCode || "Choose an example above to view its code."}</code><code className="comparison-code-reveal">{other ? <HighlightedCode code={targetReveal} language={target} /> : "Choose an example above to view its code."}</code></pre></section>
    </div>
    {notesOpen && <button className="comparison-notes-backdrop" aria-label="Close explanations" onClick={() => setNotesOpen(false)} />}<aside id="comparison-notes-panel" className="comparison-notes" hidden={!notesOpen} aria-label="Explanations and setup"><div className="comparison-notes-heading"><b>Explanations and setup</b><button className="comparison-notes-close" aria-label="Close explanations" onClick={() => setNotesOpen(false)}><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div className="comparison-notes-language"><h3><img className="comparison-language-logo" src={`/language-logos/${language}.svg`} alt="" width="24" height="24" />{languageName(language)}</h3><div className="comparison-description"><p>{hasEditorCode ? "This is the code currently in your editor." : sourceLesson ? <LessonExplanation lesson={sourceLesson} language={language} /> : "Choose another example to compare this topic."}</p></div></div><div className="comparison-notes-language"><h3><img className="comparison-language-logo" src={`/language-logos/${target}.svg`} alt="" width="24" height="24" />{languageName(target)}</h3><div className="comparison-description">{other && <><p><LessonExplanation lesson={other} language={target} /></p>{target === "cpp" && <CppSetupGuide lesson={other} />}{other.runHint && <p>{other.runHint}</p>}</>}</div></div></aside>
  </dialog>;
}

export default function Home() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState("");
  const [caretIndex, setCaretIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const [typedOutput, setTypedOutput] = useState("");
  const [homeDemoLanguage, setHomeDemoLanguage] = useState<Language>("javascript");
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [homeCodeLength, setHomeCodeLength] = useState(0);
  const [homeOutputLength, setHomeOutputLength] = useState(0);
  const [ghostLength, setGhostLength] = useState(0);
  const [navOpen, setNavOpen] = useState(true);
  const [mobilePane, setMobilePane] = useState("practice");

  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => document.documentElement.style.setProperty("--visible-height", `${viewport?.height ?? window.innerHeight}px`);
    resize();
    viewport?.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return () => { viewport?.removeEventListener("resize", resize); window.removeEventListener("resize", resize); document.documentElement.style.removeProperty("--visible-height"); };
  }, []);
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 850px)");
    const update = () => setNavOpen(!narrow.matches);
    narrow.addEventListener("change", update);
    return () => narrow.removeEventListener("change", update);
  }, []);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lessonListRef = useRef<HTMLElement>(null);
  useEffect(() => { if (navOpen && lessonListRef.current) lessonListRef.current.scrollTop = 0; }, [navOpen, language]);
  const [pinnedByLanguage, setPinnedByLanguage] = useState<Record<string, string[]>>({});
  const [pinsReady, setPinsReady] = useState(false);
  const [pinLimit, setPinLimit] = useState(2);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 851px)");
    const update = () => setPinLimit(desktop.matches ? 5 : 2);
    update();
    desktop.addEventListener("change", update);
    return () => desktop.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    try { setPinnedByLanguage(restoreLessonPins(localStorage.getItem("codestep-pinned-lessons") ?? localStorage.getItem("codestep-pinned-topics"), lessons, 5)); } catch {}
    setPinsReady(true);
  }, []);
  useEffect(() => {
    if (!pinsReady) return;
    try { localStorage.setItem("codestep-pinned-lessons", JSON.stringify(pinnedByLanguage)); } catch {}
  }, [pinnedByLanguage, pinsReady]);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [showGuide, setShowGuide] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const insertedComment = useRef("");
  const [colourTyping, setColourTyping] = useState(true);
  const [blockMode, setBlockMode] = useState(false);
  const [checkerVersion, setCheckerVersion] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checkerError, setCheckerError] = useState("");
  const checkContext = useRef({ code, language, index });
  checkContext.current = { code, language, index };

  useEffect(() => {
    if (!language) return;
    let active = true;
    prepareChecker(language).then(() => { if (active) setCheckerVersion(version => version + 1); }).catch(() => {});
    return () => { active = false; };
  }, [language]);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 850px), (pointer: coarse)");
    let saved: string | null = null;
    try { saved = localStorage.getItem("codestep-code-blocks"); } catch {}
    if (saved === "true" || saved === "false") setBlockMode(saved === "true");
    else setBlockMode(mobile.matches);
    setNavOpen(window.innerWidth > 850);
    const update = () => {
      try { saved = localStorage.getItem("codestep-code-blocks"); } catch {}
      if (saved !== "true" && saved !== "false") setBlockMode(mobile.matches);
    };
    mobile.addEventListener("change", update);
    return () => mobile.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const choices = Object.keys(homeDemos) as Language[];
    let previous = "";
    try { previous = sessionStorage.getItem("codestep-last-demo") ?? ""; } catch {}
    const available = choices.filter(item => item !== previous);
    const chosen = available[Math.floor(Math.random() * available.length)];
    setHomeDemoLanguage(chosen);
    try { sessionStorage.setItem("codestep-last-demo", chosen); } catch {}
  }, []);

  function changeBlockMode(enabled: boolean) {
    setBlockMode(enabled);
    try { localStorage.setItem("codestep-code-blocks", String(enabled)); } catch {}
  }

  function changeBlockCode(next: string) {
    setCode(next);
    setCaretIndex(next.length);
    setStatus("idle");
  }

  const [completed, setCompleted] = useState<Record<Language, number>>({ javascript: 0, csharp: 0, cpp: 0, python: 0, html: 0, css: 0 });

  const current = language ? lessons[language][index] : null;
  const pinnedTopics = language ? (pinnedByLanguage[language] ?? []).slice(0, pinLimit) : [];
  const visibleLessons = language ? filterTopicLessons(lessons[language], null) : [];
  const openPinnedTopic = (topic: string) => {
    if (!language) return;
    const nextIndex = pinnedLessonIndex(lessons[language], topic);
    if (nextIndex < 0) return;
    setIndex(nextIndex);
    setSettingsOpen(false);
    if (window.innerWidth <= 850) setNavOpen(false);
  };
  const togglePinnedTopic = (topic: string) => {
    if (!language) return;
    setPinnedByLanguage(previous => ({ ...previous, [language]: toggleTopicPin(previous[language] ?? [], topic, pinLimit) }));
  };
  const ghostSource = current && language ? showComments ? annotatedLessonCode(current, language) : withoutGuideComments(current.answer, language) : "";
  const visibleGhost = ghostSource.slice(0, ghostLength);
  const commentPrefix = current && language && showComments ? lessonComment(current, language) : "";
  const practiceCode = insertedComment.current && code.startsWith(insertedComment.current) ? code.slice(insertedComment.current.length) : code;
  const guideCode = alignedGuide(practiceCode, visibleGhost, language ?? "javascript");
  function changeComments(enabled: boolean) {
    const oldPrefix = insertedComment.current;
    const newPrefix = current && language && enabled ? lessonComment(current, language) : "";
    setCode(previous => {
      const body = oldPrefix && previous.startsWith(oldPrefix) ? previous.slice(oldPrefix.length) : previous;
      return newPrefix + body;
    });
    insertedComment.current = newPrefix;
    setShowComments(enabled);
    setStatus("idle");
    localStorage.setItem("codestep-lesson-comments", String(enabled));
  }
  const breakdown = current?.parts;
  const progress = language ? Math.round((index / lessons[language].length) * 100) : 0;
  const lessonCheck = useMemo(() => {
    // Loading a grammar triggers one new comparison for this course.
    void checkerVersion;
    return current && language ? checkPreparedLesson(code, current, language) : null;
  }, [code, current, language, checkerVersion]);
  const acceptedCode = lessonCheck?.accepted ?? false;
  const diagnostic: DiagnosticPart[] = [{ text: checkerError || lessonCheck?.message || "The checker is loading. Try Check code again.", help: "Equivalent supported syntax is accepted. An unverified answer may still be valid; a syntax warning means the parser found incomplete or malformed code.", kind: "message" }];
  const previewOutput = lessonCheck?.accepted && lessonCheck.output ? lessonCheck.output : current?.output;
  const previewColours = lessonCheck?.accepted && lessonCheck.colours ? lessonCheck.colours : current?.outputColors;

  useEffect(() => {
    if (current) {
      const prefix = showComments && language ? lessonComment(current, language) : "";
      insertedComment.current = prefix;
      setCode(prefix + (current.starter || ""));
      setCaretIndex((prefix + (current.starter || "")).length);
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
      if (position >= ghostSource.length) return;
      const character = ghostSource[position - 1];
      const rhythm = codeTypingDelay(character, position);
      typingTimer = setTimeout(typeGhostCharacter, rhythm);
    };
    const delay = setTimeout(typeGhostCharacter, CODE_TYPING_START_DELAY);
    return () => { clearTimeout(delay); if (typingTimer) clearTimeout(typingTimer); };
  }, [current, ghostSource, showGuide]);

  useEffect(() => {
    if (status !== "correct" || !current) { setTypedOutput(""); return; }
    const completeOutput = (previewOutput ?? current.output).join("\n");
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
  }, [status, current, previewOutput]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("codestep-theme") as ThemeMode | null;
    const savedGuide = localStorage.getItem("codestep-code-guide");
    setShowComments(localStorage.getItem("codestep-lesson-comments") === "true");
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

  useEffect(() => {
    if (language) return;
    const demoCode = homeDemos[homeDemoLanguage].code;
    const demoOutput = "Hello, coder!";
    setHomeCodeLength(0);
    setHomeOutputLength(0);
    let codePosition = 0;
    let outputPosition = 0;
    let timer: ReturnType<typeof setTimeout>;
    const typeOutput = () => {
      outputPosition += 1;
      setHomeOutputLength(outputPosition);
      if (outputPosition < demoOutput.length) timer = setTimeout(typeOutput, 28);
    };
    const typeCode = () => {
      codePosition += 1;
      setHomeCodeLength(codePosition);
      if (codePosition < demoCode.length) timer = setTimeout(typeCode, codeTypingDelay(demoCode[codePosition - 1], codePosition));
      else timer = setTimeout(typeOutput, 160);
    };
    timer = setTimeout(typeCode, CODE_TYPING_START_DELAY);
    return () => clearTimeout(timer);
  }, [language, homeDemoLanguage]);

  const lineNumbers = useMemo(() => Array.from({ length: Math.max(8, code.split("\n").length, showGuide ? (commentPrefix + ghostSource).split("\n").length : 0) }, (_, i) => i + 1), [code, ghostSource, showGuide, commentPrefix]);

  function openCourse(next: Language) {
    setLanguage(next);
    setMobilePane("practice");
    if (window.innerWidth <= 850) setNavOpen(false);
    setIndex(Math.min(completed[next], lessons[next].length - 1));
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function checkCode() {
    if (!current || !language || checking) return;
    const context = checkContext.current;
    setChecking(true);
    setCheckerError("");
    try {
      const result = lessonCheck ?? await checkLesson(code, current, language);
      if (checkContext.current.code !== context.code || checkContext.current.language !== context.language || checkContext.current.index !== context.index) return;
      setCheckerVersion(version => version + 1);
      setStatus(result.accepted ? "correct" : "wrong");
      if (result.accepted) setCompleted(old => ({ ...old, [language]: Math.max(old[language], index + 1) }));
    } catch {
      if (checkContext.current.code === context.code && checkContext.current.language === context.language && checkContext.current.index === context.index) {
        setCheckerError("The checker couldn’t load. Please try Check code again.");
        setStatus("wrong");
      }
    } finally { setChecking(false); }
  }

  function handleEditorKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    const editor = event.currentTarget;
    if (event.key === "Enter" && status === "correct") {
      event.preventDefault();
      nextLesson();
      return;
    }
    if (event.key === "Enter" && current && acceptedCode) {
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
    const indentStep = language === "python" ? "    " : "  ";
    const opensBlock = code.slice(0, start).trimEnd().endsWith(language === "python" ? ":" : "{");
    const insert = event.key === "Tab" ? indentStep : `\n${indentation}${opensBlock ? indentStep : ""}`;
    const nextCode = code.slice(0, start) + insert + code.slice(end);
    const nextCaret = start + insert.length;
    setCode(nextCode);
    setCaretIndex(nextCaret);
    setStatus("idle");
    requestAnimationFrame(() => editor.setSelectionRange(nextCaret, nextCaret));
  }

  function nextLesson() {
    if (!language) return;
    document.querySelector(".lesson-copy")?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
    if (index === lessons[language].length - 1) {
      setLanguage(null);
      setIndex(0);
    } else {
      setIndex((value) => value + 1);
    }
  }

  if (!language) {
    const homeDemoCode = homeDemos[homeDemoLanguage].code;
    const homeDemoOutput = "Hello, coder!";
    return (
      <>
      <main className="home-shell">
        <header className="home-nav app-header"><div className="brand"><span className="brand-wordmark">Code<span>Step</span></span></div><div className="home-actions"><div className="nav-note">LEARN BY TYPING</div><button className="settings-button" data-active={settingsOpen} aria-expanded={settingsOpen} aria-controls="settings-drawer" onClick={() => { setNavOpen(false); setSettingsOpen(open => !open); }} aria-label="Settings"><svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 3-.7 2.5-2.4 1L3.6 6 2 9l1.8 1.8v2.4L2 15l1.6 3 2.3-.5 2.4 1L9 21h6l.7-2.5 2.4-1 2.3.5 1.6-3-1.8-1.8v-2.4L22 9l-1.6-3-2.3.5-2.4-1L15 3Z"/><circle cx="12" cy="12" r="3"/></svg><span>Settings</span></button></div></header>
        <section className="hero">
          <div className="terminal-card" aria-hidden="true" style={{ "--demo-line-count": homeDemoCode.split("\n").length } as React.CSSProperties}>
            <div className="terminal-top"><i/><i/><i/><span>{languageName(homeDemoLanguage)} · {homeDemos[homeDemoLanguage].file}</span></div>
            <div className="terminal-code"><div className="terminal-lines">{homeDemoCode.split("\n").map((_, i) => <small key={i}>{i + 1}</small>)}</div><pre><code><HighlightedCode code={homeDemoCode.slice(0, homeCodeLength)} language={homeDemoLanguage} /></code></pre></div>
            <div className="terminal-output"><span>›</span> {homeDemoOutput.slice(0, homeOutputLength)}<i>▋</i></div>
            <div className="success-pill"><span><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></span><div><b>Nice work!</b><small>Your code ran successfully</small></div></div>
          </div>
        </section>
        <section className="courses">
          <div className="section-heading"><div><span>CHOOSE YOUR PATH</span><h2>What do you want to learn?</h2></div><p>Pick a language. You can switch at any time.</p></div>
          <div className="course-grid">
            <button className="course-card js-card" onClick={() => openCourse("javascript")}>
              <div className="course-icon language-logo" aria-hidden="true"><img src="/language-logos/javascript.svg" alt="" width="52" height="52" /></div><div className="course-count">{lessons.javascript.length} LESSONS</div>
              <h3>JavaScript</h3><p>Build interactive programs for the web, starting with functions and variables.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.javascript / lessons.javascript.length * 100}%`}} /></div></div>
            </button>
            <button className="course-card cs-card" onClick={() => openCourse("csharp")}>
              <div className="course-icon language-logo" aria-hidden="true"><img src="/language-logos/csharp.svg" alt="" width="52" height="52" /></div><div className="course-count">{lessons.csharp.length} LESSONS</div>
              <h3>C#</h3><p>Create powerful console apps and learn the foundations of strongly typed code.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.csharp / lessons.csharp.length * 100}%`}} /></div></div>
            </button>
            <button className="course-card cpp-card" onClick={() => openCourse("cpp")}>
              <div className="course-icon language-logo" aria-hidden="true"><img src="/language-logos/cpp.svg" alt="" width="52" height="52" /></div><div className="course-count">{lessons.cpp.length} LESSONS</div>
              <h3>C++</h3><p>Practice console programs, functions, classes, and collections.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: (completed.cpp / lessons.cpp.length * 100) + "%"}} /></div></div>
            </button>
            <button className="course-card python-card" onClick={() => openCourse("python")}>
              <div className="course-icon language-logo" aria-hidden="true"><img src="/language-logos/python.svg" alt="" width="52" height="52" /></div><div className="course-count">{lessons.python.length} LESSONS</div>
              <h3>Python</h3><p>Practice input, functions, classes, and collections with clear examples.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: (completed.python / lessons.python.length * 100) + "%"}} /></div></div>
            </button>
            <button className="course-card py-card" onClick={() => openCourse("html")}>
              <div className="course-icon language-logo" aria-hidden="true"><img src="/language-logos/html.svg" alt="" width="52" height="52" /></div><div className="course-count">{lessons.html.length} LESSONS</div>
              <h3>HTML</h3><p>Build web pages with structure, headings, text, links, images, and scripts.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.html / lessons.html.length * 100}%`}} /></div></div>
            </button>
            <button className="course-card css-card" onClick={() => openCourse("css")}>
              <div className="course-icon language-logo" aria-hidden="true"><img src="/language-logos/css.svg" alt="" width="52" height="52" /></div><div className="course-count">{lessons.css.length} LESSONS</div>
              <h3>CSS</h3><p>Style web pages with colours, alignment, fonts, borders, and rounded corners.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.css / lessons.css.length * 100}%`}} /></div></div>
            </button>
          </div>
        </section>
      </main>
      <SettingsPanel open={settingsOpen} themeMode={themeMode} showGuide={showGuide} showComments={showComments} onCommentsChange={changeComments} colourTyping={colourTyping} blockMode={blockMode} onBlockModeChange={changeBlockMode} onThemeChange={setThemeMode} onGuideChange={setShowGuide} onColourTypingChange={setColourTyping} onClose={() => setSettingsOpen(false)} />
      </>
    );
  }

  return (
    <>
    {comparisonOpen && <LanguageComparison language={language} pinLimit={pinLimit} pinnedTopics={pinnedTopics} onTogglePin={togglePinnedTopic} lesson={current!} editorCode={code} showComments={showComments} onClose={() => setComparisonOpen(false)} />}
    <main className={`lesson-shell mobile-${mobilePane}`}>
      <header className="lesson-nav app-header">
        <div className="lesson-brand-group"><HomeButton onClick={() => { setSettingsOpen(false); setLanguage(null); }} /><button className="drawer-toggle" onClick={() => { setSettingsOpen(false); setNavOpen(open => !open); }} aria-label={navOpen ? "Close lesson list" : "Open lesson list"} data-active={navOpen} aria-expanded={navOpen}><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14"/></svg></button></div>
        {pinLimit > 2 && pinnedTopics.length > 0 && <div className="desktop-header-pins"><PinnedTopicShortcuts topics={pinnedTopics} activeTopic={current?.title ?? null} onSelect={openPinnedTopic} language={language} /></div>}
        <div className="lesson-progress"><div><span>{languageName(language)} path</span><b>{index + 1} / {lessons[language].length}</b></div><div className="progress-track"><i style={{width: `${Math.max(progress, 4)}%`}} /></div></div>
        <nav className="mobile-pane-tabs" aria-label="Lesson view"><button data-active={mobilePane === "lesson"} aria-pressed={mobilePane === "lesson"} title="Lesson" aria-label="Lesson" onClick={() => setMobilePane("lesson")}><LessonSymbol /></button><button data-active={mobilePane === "practice"} aria-pressed={mobilePane === "practice"} title="Practice" aria-label="Practice" onClick={() => setMobilePane("practice")}><PracticeSymbol /></button></nav>
        <div className="lesson-actions"><button className="drawer-toggle editor-mode-toggle" data-active={blockMode} aria-pressed={blockMode} aria-label={blockMode ? "Use keyboard" : "Use blocks"} title={blockMode ? "Use keyboard" : "Use blocks"} onClick={() => changeBlockMode(!blockMode)}><EditorModeSymbol blockMode={blockMode} /></button><button className="compare-language-button" title="Compare languages" aria-label="Compare with another language" onClick={() => setComparisonOpen(true)}><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/></svg></button><button className="settings-button" data-active={settingsOpen} aria-expanded={settingsOpen} aria-controls="settings-drawer" onClick={() => { setNavOpen(false); setSettingsOpen(open => !open); }} aria-label="Settings"><svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 3-.7 2.5-2.4 1L3.6 6 2 9l1.8 1.8v2.4L2 15l1.6 3 2.3-.5 2.4 1L9 21h6l.7-2.5 2.4-1 2.3.5 1.6-3-1.8-1.8v-2.4L22 9l-1.6-3-2.3.5-2.4-1L15 3Z"/><circle cx="12" cy="12" r="3"/></svg><span>Settings</span></button></div>
      </header>
      <nav className="lesson-tools" aria-label="Lesson tools">
        <div className="lesson-copy-tools"><span>Full example · {current!.fileName || challengeFile(language)}</span><CopyCodeButton code={lessonExample(current!, language, showComments)} label="full lesson example for VS Code" /></div>
      </nav>
      <div className={`lesson-layout ${navOpen ? "drawer-open" : "drawer-closed"}`}>
        <aside className="lesson-drawer" aria-label="Lesson list">
          <div className="drawer-head"><span className="drawer-language-logo" aria-hidden="true"><img src={`/language-logos/${language}.svg`} alt="" width="36" height="36" /></span><div><small>LEARNING PATH</small><b>{languageName(language)}</b></div><button className="drawer-close" aria-label="Close learning path" onClick={() => setNavOpen(false)}>×</button></div>
          <div className="drawer-summary"><div><span>{completed[language]} of {lessons[language].length} completed</span><b>{Math.round(completed[language] / lessons[language].length * 100)}%</b></div><div className="drawer-progress"><i style={{width: `${completed[language] / lessons[language].length * 100}%`}} /></div></div>
          {pinnedTopics.length > 0 && <section className="drawer-pins" aria-label="Pinned lessons"><b>Pinned</b><PinnedTopicShortcuts topics={pinnedTopics} activeTopic={current?.title ?? null} onSelect={openPinnedTopic} language={language} showTitles /></section>}
          <div className="drawer-pin-hint">All topics · Pin up to {pinLimit} · {pinnedTopics.length}/{pinLimit}</div>
          <nav ref={lessonListRef} className="drawer-lessons topic-list">
            {visibleLessons.map(({ lesson, index: lessonIndex }) => (
              <div className="lesson-list-row" key={lesson.title}><button data-active={lessonIndex === index} className={`tone-${lessonTone(lesson)} ${lessonIndex === index ? "active" : ""} ${lessonIndex < completed[language] ? "done" : ""}`} onClick={() => { setIndex(lessonIndex); if (window.innerWidth <= 850) setNavOpen(false); }}>
                <span className="lesson-state">{lessonIndex + 1}</span><span><small>{lesson.eyebrow.split("·")[1]}</small><b>{lesson.title}</b></span><i>›</i>
              </button><TopicPinButton limit={pinLimit} topic={lesson.title} pins={pinnedTopics} onToggle={togglePinnedTopic} /></div>
            ))}
          </nav>
        </aside>
        {navOpen && <button className="drawer-backdrop" aria-label="Close lesson list" onClick={() => setNavOpen(false)} />}
        <aside className="lesson-copy">
          <div className="lesson-number">{String(index + 1).padStart(2, "0")} · {current!.eyebrow.split("·")[1]}</div>
          <h1>{current!.title}</h1>
          <p><LessonExplanation lesson={current!} language={language} /></p>
          {current!.eyebrow.includes("Files and paths") && <details className="symbol-guide" open>
            <summary>Filename, file contents, and image text</summary>
            <p><b>Filename:</b> chopin-nocturne.png is the name stored in the folder listing. The program can list or compare it without opening the picture.</p>
            <p><b>File contents:</b> a text file contains encoded text; a PNG contains image data. Reading a PNG as bytes gives its data, rather than the words you can see in the image.</p>
            <p><b>Text inside a picture:</b> OCR (optical character recognition) uses an extra tool to recognise visible words from pixels. It can make mistakes. Reading musical notation needs specialised recognition. Neither is needed to find a file by its name.</p>
            <p><b>Where the program looks:</b> sheet-music/chopin-nocturne.png is a relative path, starting from the terminal’s current working folder. It is not automatically relative to your code file. An absolute path gives the full location. Use forward slashes in these examples; backslashes inside ordinary strings need escaping.</p>
            <p><b>Try it:</b> create a sheet-music folder in your working folder and place an image inside named chopin-nocturne.png. Add practice-notes.txt and a subfolder to see which entries get listed. Listing needs folder access; missing or inaccessible folders can cause errors.</p>
            <p><b>Next step in a program:</b> keep the found path to pass to an image viewer or another function. Looking up a file is separate from opening, reading, or saving it.</p>
          </details>}
          {language === "cpp" && <CppSetupGuide key={current!.title} lesson={current!} initiallyOpen={index < 2} />}
          {language === "csharp" && <details className="symbol-guide csharp-essentials" open={index < 2}>
            <summary>C# essentials</summary>
            <p>C# is a separate language from JavaScript and C++. Use the .NET SDK and a console project: <InlineCode language={language} code={"dotnet new console"} />, then <InlineCode language={language} code={"dotnet run"} />.</p>
            <p>Declare types with <InlineCode language={language} code={"string"} /> (text), <InlineCode language={language} code={"int"} /> (whole numbers), <InlineCode language={language} code={"double"} /> (decimals), and <InlineCode language={language} code={"bool"} /> (true/false). <InlineCode language={language} code={"var"} /> infers a fixed type from the initial value; it does not let that type change.</p>
            <p>Names are case-sensitive: <InlineCode language={language} code={"Console.WriteLine"} /> prints and <InlineCode language={language} code={"Console.ReadLine()"} /> reads text, possibly null. End statements with <InlineCode language={language} code={";"} />. Use <InlineCode language={language} code={"=="} /> to compare and <InlineCode language={language} code={"="} /> to assign. C# has no JavaScript <InlineCode language={language} code={"==="} />.</p>
            <p>Use <InlineCode language={language} code={"using System;"} /> to bring library names into scope when needed. Modern console projects include common imports automatically. Top-level examples go in Program.cs; class examples include their own Main entry point, so replace the file rather than combining both styles.</p>
          </details>}
          {language === "javascript" && current!.title === "Choose let or const" && <section className="variable-examples" aria-label="Changeable and fixed variables">
            <article className="reference-card"><div className="reference-head"><b>let · can be reassigned</b></div><pre><code><HighlightedCode language="javascript" code={'let name = prompt ("Enter your name: ");\nconsole.log(`hello ${name}`);\n// this variable is changeable'} /></code></pre><p>Later, <InlineCode language={language} code={"name = \"Sam\";"} /> is allowed. Printing name again would use Sam.</p></article>
            <article className="reference-card"><div className="reference-head"><b>const · cannot be reassigned</b></div><pre><code><HighlightedCode language="javascript" code={'const name = prompt ("Enter your name: ");\nconsole.log(`hello ${name}`);\n// this variable is not changeable'} /></code></pre><p>Later, <InlineCode language={language} code={"name = \"Sam\";"} /> causes an error. const prevents reassignment; arrays and objects can still have their contents changed.</p></article>
            <p>Run these examples separately. For this exercise, type the let example.</p>
          </section>}
          {current!.compareNode && <section className="runtime-guide" aria-label="Browser and Node input">
            <h2>The same name question in two places</h2>
            <h3>Browser · prompt()</h3><pre><code><HighlightedCode language="javascript" code={"let name = prompt(\"What is your name?\");\nconsole.log(`Hello ${name}`);"} /></code></pre>
            <h3>VS Code terminal · name.mjs</h3><pre><code><HighlightedCode language="javascript" code={"import { createInterface } from \"node:readline/promises\";\n\nconst input = createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nlet name = await input.question(\"What is your name?\");\nconsole.log(`Hello ${name}`);\n\ninput.close();"} /></code></pre>
            <p>Node needs a little setup before it can read terminal input. <InlineCode language={language} code={"await input.question()"} /> waits for the answer. <InlineCode language={language} code={"input.close()"} /> tells Node <b>“I’m done taking input.”</b> Call it when you finish asking questions.</p>
            <p>Save as <InlineCode language={language} code={"name.mjs"} />, open <b>Terminal → New Terminal</b> in VS Code, then enter <InlineCode language={language} code={"node name.mjs"} />. Type a name and press Enter. Use the terminal so you can type a reply.</p>
            <a href="/examples/name.mjs" download>Download name.mjs</a>
          </section>}
          {(language === "html" || language === "css") && <details className="symbol-guide" open={index === 0}>
            <summary>Run these examples in a browser</summary>
            <p>HTML describes page content; CSS styles it. Neither prints terminal messages. The result preview describes the page or shows its visible text.</p>
            <p>Save a complete HTML page as <InlineCode language={language} code={"index.html"} /> and open it in a browser. Short HTML examples show one part of that page; the page-structure lessons explain where each part belongs.</p>
            <p>For CSS, save the rules in <InlineCode language={language} code={"styles.css"} /> beside your HTML file. Add <code>{'<link rel="stylesheet" href="styles.css">'}</code> inside the HTML head, and include the element named by the selector in the body. Save your changes and refresh the browser.</p>
          </details>}
          {current!.runHint && <p className="run-hint">{current!.runHint}</p>}
          {(language === "cpp" || language === "python") && <details className="symbol-guide" open={index === 0 || current!.title === "Check an answer with if and else"}>
            <summary>Brackets and symbols</summary>
            <p><code>[]</code>   {language === "python" ? 'makes a list, such as ["Jordan", "Alex"], or retrieves an item, such as names[0].' : 'accesses an item, such as names[0]. A vector initializer uses braces: std::vector<std::string> names = {"Jordan", "Alex"};'}</p>
            <p><code>{"{}"}</code>   {language === "python" ? 'creates a dictionary or a non-empty set. Python uses a colon and indentation for code blocks.' : 'groups a code block, class body, or initializer. Map entries are key/value pairs; C++ has no JavaScript-style object literal.'}</p>
            <p><code>()</code> holds function arguments {language === "cpp" ? 'and conditions.' : 'and can group expressions. Parentheses around an if condition are optional.'} Each nested function call has its own pair.</p>
            <p><code>{language === "python" ? "#" : "//"}</code> starts a comment.  {language === "python" ? 'Use four spaces for each block level; indentation is part of the program.' : '#include is a preprocessor directive that makes library declarations available.'}</p>
          </details>}
          {(language === "javascript" || language === "csharp") && <details className="symbol-guide" open={index === 0 || current!.title === "Check an answer with if and else"}>
            <summary>Brackets and symbols</summary>
            <table><thead><tr><th>Symbol</th><th>Called</th><th>Example</th></tr></thead><tbody>
              <tr><td><code>[]</code></td><td>Square brackets · array / lookup</td><td><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? '["Jordan", "Alex"]' : 'string[] names = { "Jordan", "Alex" };'} /></code></td></tr>
              <tr><td><code>{"{}"}</code></td><td>Curly braces · object / block</td><td><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? '{ name: "Jordan", age: 20 }' : 'new { Name = "Jordan", Age = 20 }'} /></code></td></tr>
              <tr><td><code>()</code></td><td>Parentheses · calls / conditions</td><td><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? 'console.log("Hello")' : 'Console.WriteLine("Hello")'} /></code></td></tr>
            </tbody></table>
            <p>{language === "javascript" ? "JavaScript arrays can grow when you add items. Square brackets also retrieve an item by position or an object value by key." : "C# arrays have a fixed length. List collections can grow when you add items. names[0] retrieves the first item."}</p>
            <p><code>()</code> holds function arguments and conditions. Each nested call has its own pair. Extra parentheses can group an expression; <code>((</code> has no special meaning for multiple functions.</p>
            <p><code>{"{}"}</code> groups a block of instructions. {language === "javascript" ? "It also creates an object literal." : "It can also hold a class body or an object or collection initializer."}</p>
            <p><code>//</code> starts a comment. Its text explains the code and is not executed.</p>
          </details>}
          {breakdown && <section className="code-breakdown" aria-label="Code breakdown">
            <div className="breakdown-label">BREAK IT DOWN</div>
            <div className="breakdown-grid">{breakdown.map((part, partIndex) => <div className="breakdown-part" key={`${part.code}-${partIndex}`}>
              <code><HighlightedCode code={part.code} language={language} /></code><div><b>{part.name}</b><span>{part.meaning}</span></div>
            </div>)}</div>
          </section>}
          {current!.title === "Check an answer with if and else" && <section className="comparison-guide speed-symbols" aria-label="Comparison and logical symbols">
            <h2>Symbols in this language</h2>
            {[
              [">", "Greater than", "True when the value on the left is larger."],
              ["<", "Less than", "True when the value on the left is smaller."],
              [">=", "Greater than or equal", "Includes the boundary value."],
              ["<=", "Less than or equal", "Includes the boundary value."],
              ["==", "Equal", language === "javascript" ? "Compares values after type conversion; usually use === in JavaScript." : "Checks whether the values are equal."],
              ["!=", "Not equal", language === "javascript" ? "Compares after type conversion; usually use !== in JavaScript." : "Checks whether the values differ."],
              ...(language === "javascript" ? [["===", "Strictly equal", "Checks equality without converting types."], ["!==", "Strictly not equal", "Checks inequality without converting types."]] : []),
              [language === "python" ? "and" : "&&", "AND", language === "python" ? "Both conditions must be true. Write and between the two conditions." : "Both conditions must be true. && is two ampersands."],
              [language === "python" ? "or" : "||", "OR", language === "python" ? "At least one condition must be true. Write or between the two conditions." : "At least one condition must be true. || is two vertical bars."],
              [language === "python" ? "not" : "!", "NOT", "Reverses true and false."],
              ["=", "Assignment", "Saves a value; it does not compare two values."],
            ].map(([symbol, name, meaning]) => <div key={symbol}><code>{symbol}</code><p><b>{name}</b><span>{meaning}</span></p></div>)}
            <p>{language === "python" ? "Python spells the logical operators and, or, and not. It does not use &&, ||, ===, or !==." : "&& combines conditions inside one check. To perform several actions, put each instruction on its own line inside the same body."}</p>
            <p>This answer check uses equality. The other symbols are a reference for later checks; you do not need to add them to this program.</p>
          </section>}
          {current!.referenceOnly ? current!.referenceKind === "comparisons" ? <div className="comparison-guide">
            <div><code>{language === "javascript" ? "==" : "=="}</code><p><b>Equal value</b><span>{language === "javascript" ? "Converts types before comparing; usually prefer ===." : "Checks whether the two values are equal."}</span></p></div>
            {language === "javascript" && <div><code>===</code><p><b>Equal value and type</b><span>Strict equality checks the value and its data type.</span></p></div>}
            <div><code>{language === "javascript" ? "!==" : "!="}</code><p><b>Not equal</b><span>True when the two values are different.</span></p></div>
            <div><code>&gt; / &lt;</code><p><b>Greater or less than</b><span>The open side faces the larger value; the point faces the smaller value.</span></p></div>
            <div><code>&gt;= / &lt;=</code><p><b>Greater or less, including equal</b><span>The added equals line means the boundary value also counts.</span></p></div>
          </div> : current!.referenceKind === "fonts" ? <div className="font-guide-note">
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
            <div><code>rgb(255, 0, 0)</code><p><b>RGB colour</b><span>Sets red, green, and blue amounts from 0 to 255. This example uses red at its maximum.</span></p></div>
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
            <div><code>&lt;p&gt;</code><p><b>Paragraph</b><span>Groups a normal block of written text.</span></p></div>
            <div><code>style=&quot;...&quot;</code><p><b>Inline style</b><span>Adds CSS directly to one element, such as a colour or centred alignment.</span></p></div>
            <div><code>&lt;a href=&quot;...&quot;&gt;</code><p><b>Link</b><span>Creates clickable text and stores its destination in href.</span></p></div>
          </div> : <>
            <div className="tip">{blockMode ? "Tap or drag lesson blocks into your code, then choose Check code." : language === "python" ? "Type over the guide, then press Enter to check it. Python uses indentation for blocks; Tab inserts four spaces. Equivalent supported code is accepted." : "Type over the guide in the editor, then press Enter to check it. Capital letters are optional in typing practice."}</div>
          </>}
        </aside>
        <section className={`workspace ${current!.referenceOnly ? "reference-workspace" : ""} ${blockMode ? "blocks-workspace" : ""}`}>
          {current!.referenceOnly ? current!.referenceKind === "comparisons" ? <div className="comparison-reference-preview">
            <div className="preview-bar"><span>◆</span> {language === "javascript" ? "JAVASCRIPT" : "C SHARP"} COMPARISON REFERENCE</div>
            <div className="comparison-start"><code>{language === "javascript" ? "let x = 5;" : "int x = 5;"}</code><span>Each row below asks a different question about the same value.</span></div>
            <div className="comparison-table" role="table" aria-label="Comparison operators">
              <div className="comparison-row comparison-header" role="row"><b>Operator</b><b>Meaning</b><b>Example</b><b>Result</b></div>
              {language === "javascript" ? <>
                <div className="comparison-row" role="row"><code>==</code><span>equal value</span><code>x == &quot;5&quot;</code><strong>true</strong></div>
                <div className="comparison-row" role="row"><code>===</code><span>equal value and type</span><code>x === &quot;5&quot;</code><strong className="result-false">false</strong></div>
                <div className="comparison-row" role="row"><code>!=</code><span>not equal value</span><code>x != 8</code><strong>true</strong></div>
                <div className="comparison-row" role="row"><code>!==</code><span>not equal value or type</span><code>x !== &quot;5&quot;</code><strong>true</strong></div>
              </> : <>
                <div className="comparison-row" role="row"><code>==</code><span>equal to</span><code>x == 5</code><strong>true</strong></div>
                <div className="comparison-row" role="row"><code>!=</code><span>not equal to</span><code>x != 5</code><strong className="result-false">false</strong></div>
              </>}
              <div className="comparison-row" role="row"><code>&gt;</code><span>greater than</span><code>x &gt; 8</code><strong className="result-false">false</strong></div>
              <div className="comparison-row" role="row"><code>&lt;</code><span>less than</span><code>x &lt; 8</code><strong>true</strong></div>
              <div className="comparison-row" role="row"><code>&gt;=</code><span>greater than or equal to</span><code>x &gt;= 5</code><strong>true</strong></div>
              <div className="comparison-row" role="row"><code>&lt;=</code><span>less than or equal to</span><code>x &lt;= 4</code><strong className="result-false">false</strong></div>
            </div>
            <div className="comparison-reminder"><b>Remember the “arrow” shapes</b><span><code>&gt;</code> points away from the greater value; <code>&lt;</code> points towards the smaller value. They are called greater-than and less-than signs.</span></div>
            <button className="reference-next" onClick={nextLesson}>Continue to names beginning with J →</button>
          </div> : current!.referenceKind === "fonts" ? <div className="font-reference-preview">
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
            <p className="text-reference-intro">This page shows some useful HTML elements.</p>
            <div className="heading-samples"><small>HEADINGS</small><h1>Main Title</h1><h2>Section Heading</h2><h3>Subsection</h3><h4>Smaller Heading</h4><h5>Even Smaller Heading</h5><h6>Smallest Heading</h6></div>
            <div className="paragraph-sample"><small>PARAGRAPH</small><p>This is a paragraph.</p></div>
            <div className="format-samples">
              <div><small>&lt;b&gt;</small><b>Bold text</b></div>
              <div><small>&lt;strong&gt;</small><strong>Important text</strong></div>
              <div><small>&lt;i&gt; and &lt;em&gt;</small><span><i>Italic text</i> · <em>Emphasized text</em></span></div>
              <div><small>&lt;mark&gt; and &lt;small&gt;</small><span><mark>Marked text</mark> · <small>Smaller text</small></span></div>
              <div><small>&lt;del&gt; and &lt;ins&gt;</small><span><del>Deleted text</del> · <ins>Inserted text</ins></span></div>
              <div><small>&lt;sub&gt; and &lt;sup&gt;</small><span>H<sub>2</sub>O · 2<sup>3</sup> = 8</span></div>
            </div>
            <div className="style-samples"><small>COLOUR AND ALIGNMENT</small><h3 style={{color:"green"}}>This heading is green.</h3><p style={{textAlign:"center"}}>This paragraph is centred.</p><a href="notes/html-basics-notes.html" onClick={(event) => event.preventDefault()}>Read the HTML basics notes</a></div>
            <button className="reference-next" onClick={nextLesson}>Continue to the next lesson →</button>
          </div> : <>
          <div className="editor-panel">
            <div className="panel-bar"><div className={`file-tab ${pinnedTopics.length && pinLimit <= 2 ? "has-pinned-topics" : ""}`} data-topic-tone={lessonTone(current!)} title={current!.fileName || challengeFile(language)}><img className="editor-file-logo" src={`/language-logos/${language}.svg`} alt={languageName(language)} width="18" height="18" /><span className="editor-file-name">{current!.fileName || challengeFile(language)}</span>{pinnedTopics.length && pinLimit <= 2 ? <PinnedTopicShortcuts topics={pinnedTopics} activeTopic={current?.title ?? null} onSelect={openPinnedTopic} language={language} /> : <small className="file-language">{languageName(language)}</small>}</div><div className="panel-actions"><span className="mobile-editor-copy"><CopyCodeButton iconOnly code={lessonExample(current!, language, showComments)} label="full lesson example for VS Code" /></span><button className="editor-reset-button" onClick={() => changeBlockCode(commentPrefix + (current!.starter || ""))} title="Reset code" aria-label="Reset code"><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/></svg><span className="editor-action-label">Reset</span></button></div></div>
              {blockMode ? <CodeBlocks key={`${language}-${index}`} code={code} answer={commentPrefix + ghostSource} onChange={changeBlockCode} renderCode={(value) => <HighlightedCode code={value} language={language} />} /> : <div className={`editor-body ${colourTyping ? "colour-typing" : ""} ${current!.starter && code === current!.starter ? "starter-only" : ""}`}><div className="editor-surface" style={{ minHeight: `max(100%, calc(${lineNumbers.length} * var(--editor-line-height) + var(--editor-padding)))`, minWidth: `max(100%, calc(${Math.max(...(code + guideCode).split("\n").map(line => line.length), 1)}ch + var(--editor-gutter) + var(--editor-inline-padding) + var(--editor-inline-padding)))` }}><CodeLineNumbers text={code + (showGuide ? guideCode : "")} minimumLines={8} />{showGuide && <pre className={`code-guide ${current!.title === "Check an answer with if and else" ? "focused-guide" : ""}`} aria-hidden="true"><span>CODE GUIDE</span><code><span className="guide-prefix">{code}</span>{current!.title === "Check an answer with if and else" ? <LearningCode code={guideCode} language={language} caretIndex={-1} focusConditions /> : <HighlightedCode code={guideCode} language={language} />}</code></pre>}{<pre className="typed-code-layer" aria-hidden="true"><code><LearningCode code={code} starter={current!.starter} language={language} caretIndex={caretIndex} focusConditions={current!.title === "Check an answer with if and else"} /></code></pre>}<textarea onScroll={event => { const editor = event.currentTarget; editor.parentElement?.querySelectorAll<HTMLElement>(".code-guide, .typed-code-layer, .line-numbers").forEach(layer => { layer.scrollTop = editor.scrollTop; layer.scrollLeft = editor.scrollLeft; }); }} aria-label="Code editor" wrap="soft" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={code} onChange={(event) => {setCode(event.target.value); setCaretIndex(event.target.selectionStart); setStatus("idle")}} onSelect={(event) => setCaretIndex(event.currentTarget.selectionStart)} onKeyDown={handleEditorKeyDown} placeholder={showGuide ? "" : language === "python" ? "# Type your code here..." : language === "html" ? "<!-- Type your HTML here... -->" : language === "css" ? "/* Type your CSS here... */" : "// Type your code here..."} /></div></div>}
          </div>
          <div className="console-panel">
            <div className="console-bar"><span><i /> {language === "html" || language === "css" ? "RESULT PREVIEW" : "CONSOLE"}</span><button onClick={() => setStatus("idle")}>Clear</button></div>
            <div className="console-body">
              {status === "idle" && <span className="console-muted">{language === "html" || language === "css" ? "Your page result preview will appear here..." : "Your program output will appear here..."}</span>}
              {status === "wrong" && <><SyntaxDiagnostic parts={diagnostic} /><div className="console-muted diagnostic-hint">Hover over or focus each underlined part to see what it means.</div></>}
              {status === "correct" && <><div className="run-line"><span><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></span> Code accepted — {language === "html" || language === "css" ? "result preview" : lessonCheck?.output ? "your output" : "example output"}</div><div className="typed-output">{current?.outputNote && <p className="console-muted">{current.outputNote}</p>}{typedOutput.split("\n").map((line, i, lines) => <div key={i} style={previewColours?.[i] ? { color: previewColours[i] } : undefined}><span className="prompt-mark">›</span> {line}{i === lines.length - 1 && <i className="output-cursor">▋</i>}{line && current?.outputAnnotations?.[i] && <span className="output-time-annotation">{current.outputAnnotations[i]}</span>}</div>)}</div></>}
            </div>
          </div>
          <div className={`feedback ${status}`}>
            <div>{status === "correct" ? <><span className="feedback-icon"><svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></span><p><b>That’s correct!</b><small>{blockMode ? "Choose the next lesson when you’re ready." : "Press Enter again or choose the next lesson."}</small></p></> : status === "wrong" ? <><span className="feedback-icon">!</span><p><b>{lessonCheck?.kind === "syntax" ? "Check the syntax" : "Not verified yet"}</b><small>{lessonCheck?.kind === "syntax" ? "Review the parser’s message above." : "Check the lesson requirements. This checker may not recognise every valid approach."}</small></p></> : <p><b>Ready to run?</b><small>{blockMode ? "Arrange your blocks, then choose Check code." : "Use your own approach, then choose Check code."}</small></p>}</div>
            {status === "correct" ? <button onClick={nextLesson}>{index === lessons[language].length - 1 ? "Finish path" : "Next lesson"} →</button> : <button onClick={checkCode} disabled={!practiceCode.trim() || checking}>{checking ? "Checking…" : "Check code"}</button>}
          </div>
          </>}
        </section>
      </div>
    </main>
    <SettingsPanel open={settingsOpen} themeMode={themeMode} showGuide={showGuide} showComments={showComments} onCommentsChange={changeComments} colourTyping={colourTyping} blockMode={blockMode} onBlockModeChange={changeBlockMode} onThemeChange={setThemeMode} onGuideChange={setShowGuide} onColourTypingChange={setColourTyping} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
