"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import CodeBlocks from "./CodeBlocks";
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
      "explanation": "console.log prints the text inside quotation marks. Write \\n inside the string wherever you want a new line. In console.log(\" Hello \\n Welcome \\n Goodbye\"), the first \\n puts Welcome on the next line and the second puts Goodbye on another line. const red stores the red terminal colour code, and ${red} inserts it before the red-text message.",
      "note": "// Print This is red text in red, then print Hello, Welcome, and Goodbye on separate lines.",
      "prompt": "Print This is red text in red, then print Hello, Welcome, and Goodbye on separate lines.",
      "answer": "const red = \"\\x1b[31m\";\nconsole.log(`${red} This is red text`);\n\nconsole.log(\" Hello \\n Welcome \\n Goodbye\");",
      "output": [
        " This is red text",
        " Hello ",
        " Welcome ",
        " Goodbye"
      ],
      "parts": [
        {
          "code": "console.log",
          "name": "Print",
          "meaning": "Prints the value inside its parentheses."
        },
        {
          "code": "\\n",
          "name": "New line",
          "meaning": "Write this inside the quoted string to start the next line."
        },
        {
          "code": "\\x1b[31m",
          "name": "ANSI red",
          "meaning": "The escape character followed by [31m selects red terminal text."
        },
        {
          "code": "${red}",
          "name": "Insert a value",
          "meaning": "Inside backticks, inserts the value stored in red."
        }
      ],
      "outputColors": [
        "#ef4444"
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
          "code": "\\x1b[0m",
          "name": "Reset",
          "meaning": "Returns terminal text to its normal colour."
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
          "code": "() => {}",
          "name": "Arrow function",
          "meaning": "An unnamed function: empty () means no parameters and {} holds the body."
        },
        {
          "code": "2000",
          "name": "Milliseconds",
          "meaning": "1000 milliseconds = 1 second."
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
      "parts": []
    },
    {
      "eyebrow": "10 · Loops",
      "title": "Repeat input until the answer is correct",
      "explanation": "while (true) { } repeats forever because true never changes. On its own, it never reaches an ending. If you put that endless loop inside an HTML page, the page can freeze. This version works because break leaves the loop as soon as the answer is correct.",
      "note": "// Create the loop with input, output, and break inside if.",
      "prompt": "Create the loop with input, output, and break inside if.",
      "answer": "while (true) {\n  let answer = prompt(\"What is 1 + 1?\");\n  console.log(answer);\n\n  if (answer == \"2\") {\n    console.log(\"Correct!\");\n    break;\n  }\n\n  console.log(\"Try again.\");\n}",
      "output": [
        "INPUT  →  2",
        "OUTPUT  →  2",
        "Correct!",
        "break leaves the loop."
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Repeat",
          "meaning": "Keeps asking for input until code inside stops the loop."
        },
        {
          "code": "prompt",
          "name": "Input",
          "meaning": "Asks the user for an answer."
        },
        {
          "code": "break",
          "name": "Stop",
          "meaning": "Leaves the loop when the if condition is true."
        }
      ]
    },
    {
      "eyebrow": "11 · Variables",
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
      "outputNote": "Example output when the user enters Alex in the prompt dialog."
    },
    {
      "eyebrow": "12 · Terminal input",
      "title": "Ask for a name in VS Code",
      "explanation": "Browser prompt() opens a dialog. Node runs JavaScript in the terminal and does not provide browser prompt(), so it needs a little setup. createInterface connects process.stdin (what you type) and process.stdout (what you see). await input.question waits for your answer, then returns the text to name. input.close() tells Node “I’m done taking input.” It closes this interface so it no longer keeps waiting for terminal input.",
      "note": "// Ask in the terminal, greet the user, then close input",
      "prompt": "Set up terminal input, ask for a name, print Hello, then close input.",
      "answer": "import { createInterface } from \"node:readline/promises\";\n\nconst input = createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nlet name = await input.question(\"What is your name?\");\nconsole.log(`Hello ${name}`);\n\ninput.close();",
      "output": [
        "What is your name?  →  Alex",
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
      ]
    },
    {
      "eyebrow": "13 · Combined conditions and comparisons",
      "title": "Choose between several messages",
      "explanation": "Use one speed value to choose one message. > means greater than; <= means less than or equal to. && means AND: both comparisons must be true. if / else if / else checks the branches in order and runs only the first matching branch. With speed set to 120, the first condition is true, so only Too fast! prints. The saved value and printing are familiar; the highlighted checks are the new parts.",
      "note": "// Check speed and print one matching message.",
      "prompt": "Use the speed example to choose between Too fast!, Speed is OK., and Stopped.",
      "answer": "let speed = 120;\n\nif (speed > 100) {\n  console.log(\"Too fast!\");\n} else if (speed > 0 && speed <= 100) {\n  console.log(\"Speed is OK.\");\n} else {\n  console.log(\"Stopped.\");\n}",
      "output": [
        "Too fast!"
      ],
      "parts": [
        {
          "code": "if",
          "name": "First check",
          "meaning": "Starts the first condition. If it is true, its body runs and the remaining branches are skipped."
        },
        {
          "code": "else if",
          "name": "Next check",
          "meaning": "Checks another condition only if the earlier condition was false."
        },
        {
          "code": "else",
          "name": "Otherwise",
          "meaning": "Runs when none of the earlier conditions was true. It has no condition of its own."
        },
        {
          "code": "(...) / {...}",
          "name": "Condition and body",
          "meaning": "Parentheses hold the condition. Curly braces hold the instructions that run when it matches."
        }
      ]
    },
    {
      "eyebrow": "14 · Repeated choices",
      "title": "Build a start, options, exit menu",
      "explanation": "This menu combines the loop you learned earlier with separate if checks from the previous lesson. Each time round, it asks for one choice. Type 1 to print Starting..., 2 to print Options..., or 3 to reach break and finish the loop. The choices cannot equal 1 and 2 at the same time, so these separate if statements do not cause two messages for one answer. An if / else if chain could also handle these mutually exclusive choices. Other input matches none of them, so the menu simply appears again. break exits only this loop; return would leave the current function. This exact prompt() example runs in a browser, not a Node.js terminal. Closing the prompt returns null, which matches no choice and opens it again; enter 3 to exit. A real browser interface would use buttons or a cancel check instead of a long prompt loop.",
      "note": "// Keep asking for 1, 2, or 3. Exit on 3.",
      "prompt": "Show the menu again after Start or Options, and leave the loop on Exit.",
      "answer": "while (true) {\n    let choice = prompt(\"1. Start\\n2. Options\\n3. Exit\");\n\n    if (choice === \"1\") {\n        console.log(\"Starting...\");\n    }\n\n    if (choice === \"2\") {\n        console.log(\"Options...\");\n    }\n\n    if (choice === \"3\") {\n        break;\n    }\n}",
      "output": [
        "Starting...",
        "Options..."
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Repeat the menu",
          "meaning": "True stays true, so the menu repeats until break leaves the loop."
        },
        {
          "code": "prompt(...)",
          "name": "Read a choice",
          "meaning": "Shows a browser prompt and returns text (or null if cancelled)."
        },
        {
          "code": "if (choice === \"1\")",
          "name": "Start",
          "meaning": "Only choice 1 prints Starting...; the loop still continues afterward."
        },
        {
          "code": "if (choice === \"2\")",
          "name": "Options",
          "meaning": "Only choice 2 prints Options...; the menu then appears again."
        },
        {
          "code": "break",
          "name": "Exit the loop",
          "meaning": "Choice 3 stops the while loop. break does not mean an error, and it does not stop code after the loop from running."
        }
      ],
      "outputNote": "Example: the user enters 1, then 2, then 3. The menu prompts are input, and choosing 3 exits without printing another line. CodeStep previews this sequence; run it locally to try other choices.",
      "runHint": "Run in a browser console or script. Enter 1, then 2, then 3; this lesson previews the output instead of opening real prompts. In Node.js, prompt is not built in; use the readline approach from the name-input lesson."
    },
    {
      "eyebrow": "15 · Dictionary",
      "title": "Search a word dictionary",
      "explanation": "A dictionary connects keys to values. JavaScript can use an object for this: {} contains bonjour and hola, with hello stored under each key. words[search] looks up the value for the key entered by the user. Object.values(words) lists the stored values; joining them makes readable console text. An unknown key produces undefined.",
      "note": "// Create the word dictionary, show its values, then search for a word.",
      "prompt": "Create the word dictionary, show its values, then search for a word.",
      "answer": "const words = {\n  bonjour: \"hello\",\n  hola: \"hello\"\n};\n\nconsole.log(Object.values(words).join(\", \"));\nlet search = prompt(\"Search:\");\nconsole.log(words[search]);",
      "output": [
        "hello, hello",
        "Search:  →  bonjour",
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
        }
      ]
    },
    {
      "eyebrow": "16 · Expressions",
      "title": "Calculate a value",
      "explanation": "An expression produces a value. 80 + 20 produces 100. speed > 100 produces false when speed is 100. A statement performs an instruction, such as saving that result or printing it. + adds, - subtracts, * multiplies, / divides, and % gives the remainder. C# integer division discards the fractional part; use a double such as 5.0 when you need a decimal result.",
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
      "eyebrow": "17 · Random",
      "title": "Choose a random word",
      "explanation": "Object.keys(words) makes an array containing the object's keys: bonjour and hola. Math.random() creates a random decimal from 0 up to, but not including, 1. Multiplying by 2 gives a number from 0 up to 2, and Math.floor removes the decimal to produce position 0 or 1. The square brackets then select the key at that position.",
      "note": "// Create the word dictionary and randomly select one of its keys.",
      "prompt": "Create the word dictionary and randomly select one of its keys.",
      "answer": "const words = {\n  bonjour: \"hello\",\n  hola: \"hello\"\n};\n\nlet random = Object.keys(words)[Math.floor(Math.random() * 2)];\n\nconsole.log(random);",
      "output": [
        "bonjour"
      ],
      "parts": [
        {
          "code": "Math.random()",
          "name": "Random fraction",
          "meaning": "Produces a number from 0 up to, but not including, 1."
        },
        {
          "code": "Math.floor",
          "name": "Whole position",
          "meaning": "Rounds down to an array position."
        }
      ],
      "outputNote": "Example output; either bonjour or hola can be chosen."
    },
    {
      "eyebrow": "18 · Arrays and lists",
      "title": "Make and search a names array",
      "explanation": "The square brackets [] create an empty array: a list that can hold several values. prompt asks the user for a name, and push() adds that answer to names. A second prompt saves what to look for in search. includes() checks whether that value is in the array and returns true or false; it does not add anything. if/else prints name found or name not found. Matching is case-sensitive: Jaden and jaden are different.",
      "note": "// Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "prompt": "Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "answer": "const names = [];\n\nnames.push(prompt(\"add a name\"));\n\nconst search = prompt(\"search for a name\");\n\nif (names.includes(search)) {\n  console.log(\"name found\");\n} else {\n  console.log(\"name not found\");\n}",
      "output": [
        "add a name  →  Jaden",
        "search for a name  →  Jaden",
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
      ]
    },
    {
      "eyebrow": "19 · Sets",
      "title": "Remove duplicate names",
      "explanation": "A Set stores only unique values. Passing names into new Set(names) removes repeated names, and [...uniqueNames] spreads the remaining values back into an array for printing.",
      "note": "// Ask for three names, then remove any duplicates",
      "prompt": "Collect three names, create a Set, and print its unique values.",
      "answer": "const names = [];\n\nnames.push(prompt(\"Enter the first name:\"));\nnames.push(prompt(\"Enter the second name:\"));\nnames.push(prompt(\"Enter the third name:\"));\n\nconst uniqueNames = new Set(names);\n\nconsole.log(`[${[...uniqueNames].join(\", \")}]`);",
      "output": [
        "Enter the first name:  →  Alex",
        "Enter the second name:  →  Sam",
        "Enter the third name:  →  Alex",
        "[Alex, Sam]"
      ],
      "parts": []
    },
    {
      "eyebrow": "20 · Null",
      "title": "Mark a value as not ready yet",
      "explanation": "null deliberately means that a variable has no value yet. It is different from zero or an empty string, and the variable may receive a real value later. === null checks specifically for that missing value.",
      "note": "// null means there is deliberately no result yet",
      "prompt": "Set result to null, then print the message for its current state.",
      "answer": "let result = null; // There is no result yet\n\nif (result === null) {\n  console.log(\"No result yet\");\n} else {\n  console.log(\"Result is ready\");\n}",
      "output": [
        "No result yet"
      ],
      "parts": []
    },
    {
      "eyebrow": "21 · Regular expressions",
      "title": "Let names beginning with J enter",
      "explanation": "A regular expression checks text against a pattern. /^J/i means: the slashes hold the pattern, ^ anchors the check to the beginning, J is the required first letter, and i ignores uppercase or lowercase. It accepts any word beginning with J—not only names—and rejects J when it appears later in the text.",
      "note": "// Let people into the club when their name begins with J",
      "prompt": "Check the five names and print who may enter the club.",
      "answer": "const names = [\"Jaden\", \"James\", \"Jessica\", \"Sarah\", \"Ben\"];\n\nfor (const name of names) {\n  if (/^J/i.test(name)) {\n    console.log(name + \" can enter the club.\");\n  } else {\n    console.log(name + \" cannot enter the club.\");\n  }\n}",
      "output": [
        "Jaden can enter the club.",
        "James can enter the club.",
        "Jessica can enter the club.",
        "Sarah cannot enter the club.",
        "Ben cannot enter the club."
      ],
      "parts": []
    },
    {
      "title": "Get a filename from a path",
      "eyebrow": "22 · Files and paths",
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
      "outputNote": "Example preview. Extracting a filename does not access your computer or prove that the file exists."
    },
    {
      "title": "List files in a folder",
      "eyebrow": "23 · Files and paths",
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
      "outputNote": "Example preview for a folder containing these two files. Order may vary. CodeStep checks your code and shows sample output; run it locally to list your own files."
    },
    {
      "title": "Find a sheet-music file",
      "eyebrow": "24 · Files and paths",
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
      "outputNote": "Example preview with the score present. Remove or rename it locally to try the File not found branch. CodeStep does not inspect your device."
    },
    {
      "eyebrow": "25 · Application practice",
      "title": "Build a random word quiz",
      "explanation": "Combine the dictionary, random choice, input, and if/else. Choose a word, ask for its translation, then compare the answer with the stored value.",
      "note": "// Combine the word dictionary and random key code to make a translation quiz.",
      "prompt": "Combine the word dictionary and random key code to make a translation quiz.",
      "answer": "const words = {\n  bonjour: \"hello\",\n  hola: \"hello\"\n};\n\nlet random = Object.keys(words)[Math.floor(Math.random() * 2)];\n\nlet answer = prompt(random);\n\nif (answer == words[random]) {\n  console.log(\"Correct\");\n} else {\n  console.log(\"Wrong\");\n}",
      "output": [
        "bonjour  →  hello",
        "Correct"
      ],
      "parts": [],
      "outputNote": "Example run: bonjour is chosen and the user enters hello."
    }
  ],
  "csharp": [
    {
      "eyebrow": "01 · Console output",
      "title": "Print several lines at once",
      "explanation": "Console.WriteLine prints the text inside quotation marks. Write \\n inside the string wherever you want a new line. The first \\n puts Welcome on the next line and the second puts Goodbye on another line. const string red stores the red terminal colour code. $ before the string lets {red} insert it before the message. ANSI colours work in supporting terminals; this lesson previews red in its console.",
      "note": "// Print This is red text in red, then print Hello, Welcome, and Goodbye on separate lines.",
      "prompt": "Print This is red text in red, then print Hello, Welcome, and Goodbye on separate lines.",
      "answer": "const string red = \"\\u001b[31m\";\nConsole.WriteLine($\"{red} This is red text\");\n\nConsole.WriteLine(\" Hello \\n Welcome \\n Goodbye\");",
      "output": [
        " This is red text",
        " Hello ",
        " Welcome ",
        " Goodbye"
      ],
      "parts": [
        {
          "code": "Console.WriteLine",
          "name": "Print",
          "meaning": "Prints the value inside its parentheses."
        },
        {
          "code": "\\n",
          "name": "New line",
          "meaning": "Write this inside the quoted string to start the next line."
        },
        {
          "code": "\\u001b[31m",
          "name": "ANSI red",
          "meaning": "C# writes the escape character as \\u001b; [31m selects red terminal text."
        },
        {
          "code": "$\"{red}\"",
          "name": "Insert a value",
          "meaning": "The $ enables interpolation; {red} inserts the stored value."
        }
      ],
      "outputColors": [
        "#ef4444"
      ],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
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
          "meaning": "Says this method does not send a value back."
        },
        {
          "code": "correct()",
          "name": "Name",
          "meaning": "Names the method so you can call it later."
        },
        {
          "code": "{ ... }",
          "name": "Instructions",
          "meaning": "Holds the code the method will run."
        },
        {
          "code": "correct();",
          "name": "Call it",
          "meaning": "Runs the method you created."
        },
        {
          "code": ";",
          "name": "End statement",
          "meaning": "Marks where a statement ends. C# requires it after statements such as calling a method or printing text."
        }
      ],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
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
          "code": "\\u001b[0m",
          "name": "Reset",
          "meaning": "Returns terminal text to its normal colour."
        }
      ],
      "outputColors": [
        "#ef4444",
        "#4ade80"
      ],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
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
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
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
        }
      ],
      "outputNote": "Example output when the clock is 17:20. At other times, this snippet prints nothing.",
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
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
          "meaning": "Keeps repeating until break ends the loop."
        },
        {
          "code": "break",
          "name": "Stop",
          "meaning": "Leaves the loop after the matching time."
        }
      ],
      "outputNote": "Example output at 17:20. The lesson preview does not wait for the clock.",
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
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
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "08 · Classes",
      "title": "Create and use a class",
      "explanation": "A method is called with its name, such as Correct(). A class is used in a similar way, but you put new before its name: new Car(\"Ford\", 2014). The Car class is defined before Program, and Main then creates objects, or instances, from that class.",
      "note": "// Define Car first, then create Car objects inside Main",
      "prompt": "Create the Car class, then call its constructor with new to make Ford and Audi objects.",
      "answer": "class Car\n{\n  public string Name { get; set; }\n  public int Year { get; set; }\n\n  public Car(string name, int year)\n  {\n    // this.Name is the property stored in the car object.\n    // name is the value passed into the constructor.\n    this.Name = name;\n\n    // this.Year is the property stored in the car object.\n    // year is the value passed into the constructor.\n    this.Year = year;\n  }\n}\n\nclass Program\n{\n  static void Main()\n  {\n    Car myCar1 = new Car(\"Ford\", 2014);\n    Car myCar2 = new Car(\"Audi\", 2019);\n\n    Console.WriteLine($\"{myCar1.Name}, {myCar1.Year}\");\n    Console.WriteLine($\"{myCar2.Name}, {myCar2.Year}\");\n  }\n}",
      "output": [
        "Ford, 2014",
        "Audi, 2019"
      ],
      "parts": [],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "09 · Loops",
      "title": "Repeat input until the answer is correct",
      "explanation": "while (true) { } repeats forever because true never changes. On its own, it never reaches an ending. This version works because break immediately leaves the loop as soon as the answer is correct.",
      "note": "// Create the loop with input, output, and break inside if.",
      "prompt": "Create the loop with input, output, and break inside if.",
      "answer": "while (true)\n{\n  Console.WriteLine(\"What is 1 + 1?\");\n  string answer = Console.ReadLine();\n  Console.WriteLine(answer);\n\n  if (answer == \"2\")\n  {\n    Console.WriteLine(\"Correct!\");\n    break;\n  }\n\n  Console.WriteLine(\"Try again.\");\n}",
      "output": [
        "INPUT  →  2",
        "OUTPUT  →  2",
        "Correct!",
        "break leaves the loop."
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Repeat",
          "meaning": "Keeps asking for input until code inside stops the loop."
        },
        {
          "code": "Console.ReadLine",
          "name": "Input",
          "meaning": "Reads the user's answer."
        },
        {
          "code": "break",
          "name": "Stop",
          "meaning": "Leaves the loop when the if condition is true."
        }
      ],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "10 · Variables",
      "title": "Use changeable and fixed values",
      "explanation": "int creates a variable holding a whole number, which you can reassign. const int creates a compile-time constant you cannot reassign. Here speed changes from 80 to 100; maxSpeed stays 100. C# has no let keyword for normal variable declarations; string stores text and var lets the compiler infer a local variable’s type.",
      "note": "// Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
      "prompt": "Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
      "answer": "int speed = 80;\nconst int maxSpeed = 100;\n\nspeed = 100;\nConsole.WriteLine($\"Speed: {speed}\");",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "int",
          "name": "Whole number",
          "meaning": "Declares the type of value speed stores."
        },
        {
          "code": "const int",
          "name": "Constant",
          "meaning": "Stores a compile-time value that cannot be reassigned."
        }
      ],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "11 · Variables",
      "title": "Remember a value",
      "explanation": "string tells C# that a variable holds text. Console.ReadLine asks for input, and the answer can be stored in that variable for later.",
      "note": "// Ask for a name and greet the user",
      "prompt": "Create a name variable, then print Hello with a template string.",
      "answer": "Console.WriteLine(\"What is your name?\");\nstring name = Console.ReadLine();\nConsole.WriteLine($\"Hello {name}\");",
      "output": [
        "What is your name?  →  Alex",
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
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "12 · Combined conditions and comparisons",
      "title": "Choose between several messages",
      "explanation": "Use one speed value to choose one message. > means greater than; <= means less than or equal to. && means AND: both comparisons must be true. if / else if / else checks the branches in order and runs only the first matching branch. With speed set to 120, the first condition is true, so only Too fast! prints. The saved value and printing are familiar; the highlighted checks are the new parts.",
      "note": "// Check speed and print one matching message.",
      "prompt": "Use the speed example to choose between Too fast!, Speed is OK., and Stopped.",
      "answer": "int speed = 120;\n\nif (speed > 100) {\n  Console.WriteLine(\"Too fast!\");\n} else if (speed > 0 && speed <= 100) {\n  Console.WriteLine(\"Speed is OK.\");\n} else {\n  Console.WriteLine(\"Stopped.\");\n}",
      "output": [
        "Too fast!"
      ],
      "parts": [
        {
          "code": "if",
          "name": "First check",
          "meaning": "Starts the first condition. If it is true, its body runs and the remaining branches are skipped."
        },
        {
          "code": "else if",
          "name": "Next check",
          "meaning": "Checks another condition only if the earlier condition was false."
        },
        {
          "code": "else",
          "name": "Otherwise",
          "meaning": "Runs when none of the earlier conditions was true. It has no condition of its own."
        },
        {
          "code": "(...) / {...}",
          "name": "Condition and body",
          "meaning": "Parentheses hold the condition. Curly braces hold the instructions that run when it matches."
        }
      ],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "13 · Repeated choices",
      "title": "Build a start, options, exit menu",
      "explanation": "This menu combines the loop you learned earlier with separate if checks from the previous lesson. Each time round, it asks for one choice. Type 1 to print Starting..., 2 to print Options..., or 3 to reach break and finish the loop. The choices cannot equal 1 and 2 at the same time, so these separate if statements do not cause two messages for one answer. An if / else if chain could also handle these mutually exclusive choices. Other input matches none of them, so the menu simply appears again. break exits only this loop; return would leave the current function. The displayed choices are text, so compare with \"1\", \"2\", and \"3\".",
      "note": "// Keep asking for 1, 2, or 3. Exit on 3.",
      "prompt": "Show the menu again after Start or Options, and leave the loop on Exit.",
      "answer": "using System;\n\nwhile (true) {\n    Console.WriteLine(\"1. Start\\n2. Options\\n3. Exit\");\n    string? choice = Console.ReadLine();\n    if (choice is null) break;\n\n    if (choice == \"1\") {\n        Console.WriteLine(\"Starting...\");\n    }\n\n    if (choice == \"2\") {\n        Console.WriteLine(\"Options...\");\n    }\n\n    if (choice == \"3\") {\n        break;\n    }\n}",
      "output": [
        "Starting...",
        "Options..."
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Repeat the menu",
          "meaning": "True stays true, so the menu repeats until break leaves the loop."
        },
        {
          "code": "Console.ReadLine()",
          "name": "Read a choice",
          "meaning": "Reads the next response as text. The menu is shown again on the next loop."
        },
        {
          "code": "if (choice == \"1\")",
          "name": "Start",
          "meaning": "Only choice 1 prints Starting...; the loop still continues afterward."
        },
        {
          "code": "if (choice == \"2\")",
          "name": "Options",
          "meaning": "Only choice 2 prints Options...; the menu then appears again."
        },
        {
          "code": "break",
          "name": "Exit the loop",
          "meaning": "Choice 3 stops the while loop. break does not mean an error, and it does not stop code after the loop from running."
        }
      ],
      "outputNote": "Example: the user enters 1, then 2, then 3. The menu prompts are input, and choosing 3 exits without printing another line. CodeStep previews this sequence; run it locally to try other choices.",
      "runHint": "Put this top-level code in Program.cs in a .NET console project and run dotnet run. Type 1, then 2, then 3 to end."
    },
    {
      "eyebrow": "14 · Dictionary",
      "title": "Search a word dictionary",
      "explanation": "A Dictionary connects keys to values. Dictionary<string, string> means text keys and text values. Its initializer uses {} to add bonjour and hola, with hello under each key. string.Join prints its values. TryGetValue checks whether the entered key exists and safely returns the value; words[search] is a direct lookup but throws if the key is missing.",
      "note": "// Create the word dictionary, show its values, then search for a word.",
      "prompt": "Create the word dictionary, show its values, then search for a word.",
      "answer": "var words = new System.Collections.Generic.Dictionary<string, string> {\n  { \"bonjour\", \"hello\" },\n  { \"hola\", \"hello\" }\n};\n\nConsole.WriteLine(string.Join(\", \", words.Values));\nConsole.WriteLine(\"Search:\");\nstring search = Console.ReadLine() ?? \"\";\nif (words.TryGetValue(search, out string? translation)) {\n  Console.WriteLine(translation);\n} else {\n  Console.WriteLine(\"word not found\");\n}",
      "output": [
        "hello, hello",
        "Search:  →  bonjour",
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
        }
      ],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "15 · Expressions",
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
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "16 · Random",
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
          "code": "Random.Shared.Next(keys.Length)",
          "name": "Random position",
          "meaning": "Chooses a whole number from 0 up to, but not including, the number of keys."
        },
        {
          "code": "keys[position]",
          "name": "Retrieve the key",
          "meaning": "Looks up the key at that position."
        }
      ],
      "outputNote": "Example output; either bonjour or hola can be chosen.",
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "17 · Arrays and lists",
      "title": "Make and search a names array",
      "explanation": "An array has a fixed length; a List can grow when you add values. This example uses List<string> so it matches JavaScript’s growing array. Add saves the entered name, Contains searches for an exact match, and if/else prints name found or name not found. Matching is case-sensitive. names[0] retrieves the first item after it has been added.",
      "note": "// Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "prompt": "Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "answer": "var names = new System.Collections.Generic.List<string>();\n\nConsole.WriteLine(\"add a name\");\nnames.Add(Console.ReadLine() ?? \"\");\n\nConsole.WriteLine(\"search for a name\");\nstring search = Console.ReadLine() ?? \"\";\n\nif (names.Contains(search)) {\n  Console.WriteLine(\"name found\");\n} else {\n  Console.WriteLine(\"name not found\");\n}",
      "output": [
        "add a name  →  Jaden",
        "search for a name  →  Jaden",
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
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "18 · Sets",
      "title": "Remove duplicate names",
      "explanation": "A HashSet stores only unique values. Passing names into new HashSet<string>(names) removes repeated names, and string.Join makes the remaining values readable for printing.",
      "note": "// Ask for three names, then remove any duplicates",
      "prompt": "Collect three names, create a Set, and print its unique values.",
      "answer": "List<string> names = new List<string>();\n\nConsole.WriteLine(\"Enter the first name:\");\nnames.Add(Console.ReadLine());\nConsole.WriteLine(\"Enter the second name:\");\nnames.Add(Console.ReadLine());\nConsole.WriteLine(\"Enter the third name:\");\nnames.Add(Console.ReadLine());\n\nHashSet<string> uniqueNames = new HashSet<string>(names);\n\nConsole.WriteLine($\"[{string.Join(\", \", uniqueNames)}]\");",
      "output": [
        "Enter the first name:  →  Alex",
        "Enter the second name:  →  Sam",
        "Enter the third name:  →  Alex",
        "[Alex, Sam]"
      ],
      "parts": [],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "19 · Null",
      "title": "Mark a value as not ready yet",
      "explanation": "null deliberately means that a variable has no value yet. string? allows this text variable to hold either text or null, and == null checks whether the value is still missing.",
      "note": "// null means there is deliberately no result yet",
      "prompt": "Set result to null, then print the message for its current state.",
      "answer": "string? result = null; // There is no result yet\n\nif (result == null)\n{\n  Console.WriteLine(\"No result yet\");\n}\nelse\n{\n  Console.WriteLine(\"Result is ready\");\n}",
      "output": [
        "No result yet"
      ],
      "parts": [],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "eyebrow": "20 · Regular expressions",
      "title": "Let names beginning with J enter",
      "explanation": "A regular expression checks text against a pattern. Regex comes from System.Text.RegularExpressions. ^J means the text must begin with J, while RegexOptions.IgnoreCase accepts uppercase or lowercase. It accepts any word beginning with J—not only names—and rejects J when it appears later in the text.",
      "note": "// Let people into the club when their name begins with J",
      "prompt": "Check the five names and print who may enter the club.",
      "answer": "using System.Text.RegularExpressions;\n\nstring[] names = { \"Jaden\", \"James\", \"Jessica\", \"Sarah\", \"Ben\" };\n\nforeach (string name in names) {\n  if (Regex.IsMatch(name, \"^J\", RegexOptions.IgnoreCase)) {\n    Console.WriteLine($\"{name} can enter the club.\");\n  } else {\n    Console.WriteLine($\"{name} cannot enter the club.\");\n  }\n}",
      "output": [
        "Jaden can enter the club.",
        "James can enter the club.",
        "Jessica can enter the club.",
        "Sarah cannot enter the club.",
        "Ben cannot enter the club."
      ],
      "parts": [],
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
    },
    {
      "title": "Get a filename from a path",
      "eyebrow": "21 · Files and paths",
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
      "eyebrow": "22 · Files and paths",
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
      "eyebrow": "23 · Files and paths",
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
      "eyebrow": "24 · Concurrent work",
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
      "eyebrow": "25 · Application practice",
      "title": "Build a random word quiz",
      "explanation": "Combine the dictionary, random choice, input, and if/else. Choose a word, ask for its translation, then compare the answer with the stored value.",
      "note": "// Combine the word dictionary and random key code to make a translation quiz.",
      "prompt": "Combine the word dictionary and random key code to make a translation quiz.",
      "answer": "var words = new System.Collections.Generic.Dictionary<string, string> {\n  { \"bonjour\", \"hello\" },\n  { \"hola\", \"hello\" }\n};\n\nstring[] keys = new string[words.Count];\nwords.Keys.CopyTo(keys, 0);\nstring random = keys[Random.Shared.Next(keys.Length)];\n\nConsole.WriteLine(random);\nstring answer = Console.ReadLine() ?? \"\";\n\nif (answer == words[random]) {\n  Console.WriteLine(\"Correct\");\n} else {\n  Console.WriteLine(\"Wrong\");\n}",
      "output": [
        "bonjour  →  hello",
        "Correct"
      ],
      "parts": [],
      "outputNote": "Example run: bonjour is chosen and the user enters hello.",
      "runHint": " Save the example in Program.cs inside a console project. Create one with dotnet new console, then run it with dotnet run. Install the .NET SDK first."
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
        "Button clicked.",
        "What is 1 + 1?  →  2",
        "Correct!",
        "The page waits for another click."
      ]
    },
    {
      "eyebrow": "16 · Return values",
      "title": "Send a value back with return",
      "explanation": "return sends a value back to the place where a function was called, and the function ends immediately. Here, getMessage() returns the text Hello. That returned text is then placed in the paragraph.",
      "note": "<!-- Return a value from a function and show it on the page -->",
      "prompt": "Create the function that returns Hello, then show its returned value.",
      "answer": "<p id=\"message\"></p>\n\n<script>\n  function getMessage() {\n    return \"Hello\";\n  }\n\n  document.getElementById(\"message\").textContent = getMessage();\n</script>",
      "output": [
        "Hello",
        "return sends Hello back to getMessage()."
      ]
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
      ]
    }
  ],
  "python": [
    {
      "eyebrow": "01 · Console output",
      "title": "Print several lines at once",
      "explanation": "print displays text. Write \\n inside a quoted string to start a new line. \\033 is the ANSI escape character and [31m selects red in supporting terminals. f before the string lets {red} insert a variable. Python uses assignment without let or const.",
      "note": "# Print This is red text in red, then print Hello, Welcome, and Goodbye on separate lines.",
      "prompt": "Print This is red text in red, then print Hello, Welcome, and Goodbye on separate lines.",
      "answer": "red = \"\\033[31m\"\nprint(f\"{red} This is red text\")\n\nprint(\" Hello \\n Welcome \\n Goodbye\")",
      "output": [
        " This is red text",
        " Hello ",
        " Welcome ",
        " Goodbye"
      ],
      "parts": [
        {
          "code": "print(...)",
          "name": "Print",
          "meaning": "Displays the value inside its parentheses."
        },
        {
          "code": "\\n",
          "name": "New line",
          "meaning": "Starts a new line inside the string."
        },
        {
          "code": "f\"{red}\"",
          "name": "Insert a value",
          "meaning": "The f enables variable insertion with curly braces."
        }
      ],
      "outputColors": [
        "#ef4444"
      ],
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
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
          "code": "\\033[0m",
          "name": "Reset",
          "meaning": "Returns terminal text to its normal colour."
        }
      ],
      "outputColors": [
        "#ef4444",
        "#4ade80"
      ],
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
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
          "code": "time.hour / time.minute",
          "name": "Clock parts",
          "meaning": "Read the hour and minute from the saved time."
        },
        {
          "code": "and",
          "name": "Both",
          "meaning": "Both conditions must be true."
        }
      ],
      "outputNote": "Example output when the clock is 17:20. At other times, this snippet prints nothing.",
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
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
          "meaning": "Repeats the indented body until break."
        },
        {
          "code": "break",
          "name": "Stop",
          "meaning": "Leaves the loop after the matching time."
        }
      ],
      "outputNote": "Example output at 17:20. The lesson preview does not wait for the clock.",
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
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
          "meaning": "Returns the value to the caller."
        },
        {
          "code": "print(getMessage())",
          "name": "Nested calls",
          "meaning": "The inner call runs first."
        }
      ],
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "08 · Classes",
      "title": "Create and use a class",
      "explanation": "class defines a type. Calling Car(\"Ford\", 2014) creates an object and __init__ sets it up. self refers to that object; self.name stores the supplied name. A colon and indentation group each body. The f-string prints its properties.",
      "note": "# Define the class first, then use new Car(...) to create objects",
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "09 · Loops",
      "title": "Repeat input until the answer is correct",
      "explanation": "while True repeats until break stops the loop. input asks the question and returns the entered text. Indentation puts the answer check inside the loop and break inside if. Only \"2\" ends this loop.",
      "note": "# Create the loop with input, output, and break inside if.",
      "prompt": "Create the loop with input, output, and break inside if.",
      "answer": "while True:\n    answer = input(\"What is 1 + 1?\")\n    print(answer)\n\n    if answer == \"2\":\n        print(\"Correct!\")\n        break\n\n    print(\"Try again.\")",
      "output": [
        "INPUT  →  2",
        "OUTPUT  →  2",
        "Correct!",
        "break leaves the loop."
      ],
      "parts": [
        {
          "code": "input(...)",
          "name": "Ask",
          "meaning": "Waits for a typed line of terminal text."
        },
        {
          "code": "break",
          "name": "Stop",
          "meaning": "Leaves the repeating loop."
        }
      ],
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "10 · Variables",
      "title": "Use changeable and fixed values",
      "explanation": "Assignment creates a name such as speed and can change its value later. Python has no let or const keyword. MAX_SPEED uses capital letters to signal a constant by convention, but Python still allows reassignment. The f-string inserts speed in the text.",
      "note": "# Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "11 · Variables",
      "title": "Remember a value",
      "explanation": "input displays the question, waits for a line of terminal text, and returns it. name stores that text. The f before the string lets {name} insert the answer. Python needs no readline interface for this example.",
      "note": "# Ask for a name and greet the user",
      "prompt": "Create a name variable, then print Hello with a template string.",
      "answer": "name = input(\"What is your name?\")\nprint(f\"Hello {name}\")",
      "output": [
        "What is your name?  →  Alex",
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
      "runHint": "Save as name.py and run python3 name.py in the VS Code terminal."
    },
    {
      "eyebrow": "12 · Combined conditions and comparisons",
      "title": "Choose between several messages",
      "explanation": "Use one speed value to choose one message. > means greater than; <= means less than or equal to. and means AND: both comparisons must be true. if / elif / else checks the branches in order and runs only the first matching branch. With speed set to 120, the first condition is true, so only Too fast! prints. The saved value and printing are familiar; the highlighted checks are the new parts.",
      "note": "# Check speed and print one matching message.",
      "prompt": "Use the speed example to choose between Too fast!, Speed is OK., and Stopped.",
      "answer": "speed = 120\n\nif speed > 100:\n    print(\"Too fast!\")\nelif speed > 0 and speed <= 100:\n    print(\"Speed is OK.\")\nelse:\n    print(\"Stopped.\")",
      "output": [
        "Too fast!"
      ],
      "parts": [
        {
          "code": "if",
          "name": "First check",
          "meaning": "Starts the first condition. If it is true, its body runs and the remaining branches are skipped."
        },
        {
          "code": "elif",
          "name": "Next check",
          "meaning": "Checks another condition only if the earlier condition was false."
        },
        {
          "code": "else",
          "name": "Otherwise",
          "meaning": "Runs when none of the earlier conditions was true. It has no condition of its own."
        },
        {
          "code": ":",
          "name": "Condition and body",
          "meaning": "A colon starts the body; indentation identifies which instructions belong to that branch."
        }
      ],
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "13 · Repeated choices",
      "title": "Build a start, options, exit menu",
      "explanation": "This menu combines the loop you learned earlier with separate if checks from the previous lesson. Each time round, it asks for one choice. Type 1 to print Starting..., 2 to print Options..., or 3 to reach break and finish the loop. The choices cannot equal 1 and 2 at the same time, so these separate if statements do not cause two messages for one answer. An if / else if chain could also handle these mutually exclusive choices. Other input matches none of them, so the menu simply appears again. break exits only this loop; return would leave the current function. The displayed choices are text, so compare with \"1\", \"2\", and \"3\".",
      "note": "# Keep asking for 1, 2, or 3. Exit on 3.",
      "prompt": "Show the menu again after Start or Options, and leave the loop on Exit.",
      "answer": "while True:\n    choice = input(\"1. Start\\n2. Options\\n3. Exit\\n\")\n\n    if choice == \"1\":\n        print(\"Starting...\")\n\n    if choice == \"2\":\n        print(\"Options...\")\n\n    if choice == \"3\":\n        break",
      "output": [
        "Starting...",
        "Options..."
      ],
      "parts": [
        {
          "code": "while True:",
          "name": "Repeat the menu",
          "meaning": "True stays true, so the menu repeats until break leaves the loop."
        },
        {
          "code": "input(...)",
          "name": "Read a choice",
          "meaning": "Reads the next response as text. The menu is shown again on the next loop."
        },
        {
          "code": "if choice == \"1\":",
          "name": "Start",
          "meaning": "Only choice 1 prints Starting...; the loop still continues afterward."
        },
        {
          "code": "if choice == \"2\":",
          "name": "Options",
          "meaning": "Only choice 2 prints Options...; the menu then appears again."
        },
        {
          "code": "break",
          "name": "Exit the loop",
          "meaning": "Choice 3 stops the while loop. break does not mean an error, and it does not stop code after the loop from running."
        }
      ],
      "outputNote": "Example: the user enters 1, then 2, then 3. The menu prompts are input, and choosing 3 exits without printing another line. CodeStep previews this sequence; run it locally to try other choices.",
      "runHint": "Save as challenge.py and run python challenge.py (or python3 challenge.py). Type 1, then 2, then 3 to end."
    },
    {
      "eyebrow": "14 · Dictionary",
      "title": "Search a word dictionary",
      "explanation": "{} creates a dictionary of keys and values. \"bonjour\" is a key and \"hello\" its value. values() gets the stored values; join prints them as readable text. get searches safely and returns word not found if the key is absent. words[search] is direct lookup but raises KeyError for a missing key.",
      "note": "# Create the word dictionary, show its values, then search for a word.",
      "prompt": "Create the word dictionary, show its values, then search for a word.",
      "answer": "words = {\n    \"bonjour\": \"hello\",\n    \"hola\": \"hello\"\n}\n\nprint(\", \".join(words.values()))\nsearch = input(\"Search:\")\nprint(words.get(search, \"word not found\"))",
      "output": [
        "hello, hello",
        "Search:  →  bonjour",
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
        }
      ],
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "15 · Expressions",
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "16 · Random",
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "17 · Arrays and lists",
      "title": "Make and search a names array",
      "explanation": "[] creates an empty list. input runs first inside append and append adds its answer. in checks membership without changing the list. Matching is case-sensitive. names[0] retrieves the first item after it is added.",
      "note": "# Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "prompt": "Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "answer": "names = []\n\nnames.append(input(\"add a name\"))\n\nsearch = input(\"search for a name\")\n\nif search in names:\n    print(\"name found\")\nelse:\n    print(\"name not found\")",
      "output": [
        "add a name  →  Jaden",
        "search for a name  →  Jaden",
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "18 · Sets",
      "title": "Remove duplicate names",
      "explanation": "set(names) removes duplicates. Python sets do not promise a display order, so sorted makes an alphabetical list before join prints it. A set literal uses {\"Alex\", \"Sam\"}; empty {} creates a dictionary, so use set() for an empty set.",
      "note": "# Ask for three names, then remove any duplicates",
      "prompt": "Collect three names, create a set, and print its unique values.",
      "answer": "names = []\n\nnames.append(input(\"Enter the first name:\"))\nnames.append(input(\"Enter the second name:\"))\nnames.append(input(\"Enter the third name:\"))\n\nuniqueNames = set(names)\n\nprint(\"[\" + \", \".join(sorted(uniqueNames)) + \"]\")",
      "output": [
        "Enter the first name:  →  Alex",
        "Enter the second name:  →  Sam",
        "Enter the third name:  →  Alex",
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
        }
      ],
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "19 · Null",
      "title": "Mark a value as not ready yet",
      "explanation": "None means there is deliberately no value yet. is None checks for that specific singleton. It is different from zero or an empty string. Assign a real value to result later.",
      "note": "# null means there is deliberately no result yet",
      "prompt": "Set result to null, then print the message for its current state.",
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "eyebrow": "20 · Regular expressions",
      "title": "Let names beginning with J enter",
      "explanation": "re searches text with a pattern. ^ means the start, J is the required letter, and re.IGNORECASE accepts J or j. re.search returns a match object when found, which if treats as true.",
      "note": "# Let people into the club when their name begins with J",
      "prompt": "Check the five names and print who may enter the club.",
      "answer": "import re\n\nnames = [\"Jaden\", \"James\", \"Jessica\", \"Sarah\", \"Ben\"]\n\nfor name in names:\n    if re.search(\"^J\", name, re.IGNORECASE):\n        print(name + \" can enter the club.\")\n    else:\n        print(name + \" cannot enter the club.\")",
      "output": [
        "Jaden can enter the club.",
        "James can enter the club.",
        "Jessica can enter the club.",
        "Sarah cannot enter the club.",
        "Ben cannot enter the club."
      ],
      "parts": [
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
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    },
    {
      "title": "Get a filename from a path",
      "eyebrow": "21 · Files and paths",
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
      "runHint": "Save as file-finder.py and run python file-finder.py (or python3 file-finder.py).",
      "outputNote": "Example preview. Extracting a filename does not access your computer or prove that the file exists."
    },
    {
      "title": "List files in a folder",
      "eyebrow": "22 · Files and paths",
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
      "runHint": "Save as file-finder.py and run python file-finder.py (or python3 file-finder.py). Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview for a folder containing these two files. Order may vary. CodeStep checks your code and shows sample output; run it locally to list your own files."
    },
    {
      "title": "Find a sheet-music file",
      "eyebrow": "23 · Files and paths",
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
      "runHint": "Save as file-finder.py and run python file-finder.py (or python3 file-finder.py). Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview with the score present. Remove or rename it locally to try the File not found branch. CodeStep does not inspect your device."
    },
    {
      "eyebrow": "24 · Concurrent work",
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
      "runHint": "Save as challenge.py and run python challenge.py (or python3 challenge.py). Run it several times; either message can appear first.",
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
      "eyebrow": "25 · Application practice",
      "title": "Build a random word quiz",
      "explanation": "Combine the dictionary, random choice, input, and if/else. input displays the chosen word. words[word] retrieves its expected translation. == checks the entered answer and prints Correct or Wrong.",
      "note": "# Combine the word dictionary and random key code to make a translation quiz.",
      "prompt": "Combine the word dictionary and random key code to make a translation quiz.",
      "answer": "import random\n\nwords = {\n    \"bonjour\": \"hello\",\n    \"hola\": \"hello\"\n}\n\nword = random.choice(list(words))\nanswer = input(word)\n\nif answer == words[word]:\n    print(\"Correct\")\nelse:\n    print(\"Wrong\")",
      "output": [
        "bonjour  →  hello",
        "Correct"
      ],
      "parts": [
        {
          "code": "words[word]",
          "name": "Expected answer",
          "meaning": "Looks up the chosen word’s translation."
        },
        {
          "code": "==",
          "name": "Check",
          "meaning": "Compares the entered answer with the translation."
        }
      ],
      "outputNote": "Example run: bonjour is chosen and the user enters hello.",
      "runHint": "Save as challenge.py and run python3 challenge.py in the VS Code terminal."
    }
  ],
  "cpp": [
    {
      "eyebrow": "01 · Console output",
      "title": "Print several lines at once",
      "explanation": "std::cout prints to the terminal. << sends each value to it. Write \\n inside a string to start a new line. \\033[31m selects red in supporting terminals. #include loads declarations, std:: identifies standard-library names, and main is where execution begins. const std::string red stores the colour code.",
      "note": "// Print This is red text in red, then print Hello, Welcome, and Goodbye on separate lines.",
      "prompt": "Print This is red text in red, then print Hello, Welcome, and Goodbye on separate lines.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  const std::string red = \"\\033[31m\";\n  std::cout << red << \" This is red text\\n\";\n\n  std::cout << \" Hello \\n Welcome \\n Goodbye\\n\";\n}",
      "output": [
        " This is red text",
        " Hello ",
        " Welcome ",
        " Goodbye"
      ],
      "parts": [
        {
          "code": "std::cout <<",
          "name": "Print",
          "meaning": "Sends a value to standard output."
        },
        {
          "code": "\\n",
          "name": "New line",
          "meaning": "Starts a new line inside the string."
        }
      ],
      "outputColors": [
        "#ef4444"
      ],
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
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
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
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
          "code": "\\033[0m",
          "name": "Reset",
          "meaning": "Returns terminal text to its normal colour."
        }
      ],
      "outputColors": [
        "#ef4444",
        "#4ade80"
      ],
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
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
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
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
          "code": "tm_hour / tm_min",
          "name": "Clock parts",
          "meaning": "Read the local hour and minute."
        },
        {
          "code": "&&",
          "name": "Both",
          "meaning": "Requires both comparisons to be true."
        }
      ],
      "outputNote": "Example output when the clock is 17:20. At other times, this snippet prints nothing.",
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
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
          "meaning": "Repeats until break leaves the loop."
        },
        {
          "code": "break",
          "name": "Stop",
          "meaning": "Ends the loop after the time matches."
        }
      ],
      "outputNote": "Example output at 17:20. The lesson preview does not wait for the clock.",
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "07 · Functions",
      "title": "Use one function inside another",
      "explanation": "getMessage() returns a std::string. std::cout prints its returned value. Nested calls have their own parentheses: getMessage runs first in anotherFunction(getMessage()). Extra parentheses group an expression; (( is not a special sign for multiple functions.",
      "note": "// Return Hello from getMessage, then print it by calling the function inside the print call.",
      "prompt": "Return Hello from getMessage, then print it by calling the function inside the print call.",
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
          "meaning": "Returns the value to the caller."
        }
      ],
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "08 · Classes",
      "title": "Create and use a class",
      "explanation": "class defines a type. public makes these members accessible from main. Car(...) is its constructor. this->name is the current object’s member; name is the constructor parameter. Car myCar1(\"Ford\", 2014) creates the object without new. A class declaration ends with };.",
      "note": "// Define the class first, then use new Car(...) to create objects",
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
        }
      ],
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "09 · Loops",
      "title": "Repeat input until the answer is correct",
      "explanation": "while (true) repeats until break stops the loop. std::getline(std::cin, answer) reads a whole line of terminal input into answer. == checks for \"2\". The braces place the answer check inside the loop and break inside if.",
      "note": "// Create the loop with input, output, and break inside if.",
      "prompt": "Create the loop with input, output, and break inside if.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  while (true) {\n    std::cout << \"What is 1 + 1?\";\n    std::string answer;\n    std::getline(std::cin, answer);\n    std::cout << answer << \"\\n\";\n\n    if (answer == \"2\") {\n      std::cout << \"Correct!\\n\";\n      break;\n    }\n\n    std::cout << \"Try again.\\n\";\n  }\n}",
      "output": [
        "INPUT  →  2",
        "OUTPUT  →  2",
        "Correct!",
        "break leaves the loop."
      ],
      "parts": [
        {
          "code": "std::getline",
          "name": "Read a line",
          "meaning": "Waits for a whole line of input and stores it in answer."
        },
        {
          "code": "break",
          "name": "Stop",
          "meaning": "Leaves the loop."
        }
      ],
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "10 · Variables",
      "title": "Use changeable and fixed values",
      "explanation": "int declares a whole-number variable that can be reassigned. const int prevents reassignment. C++ has no let keyword. std::string stores text, and auto can infer a variable’s type from its initial value. << prints the text and number.",
      "note": "// Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
      "prompt": "Create speed and maxSpeed, change speed to 100, then print Speed: 100.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  int speed = 80;\n  const int maxSpeed = 100;\n\n  speed = 100;\n  std::cout << \"Speed: \" << speed << \"\\n\";\n}",
      "output": [
        "Speed: 100"
      ],
      "parts": [
        {
          "code": "int",
          "name": "Whole number",
          "meaning": "Declares a whole-number variable."
        },
        {
          "code": "const int",
          "name": "Fixed value",
          "meaning": "Prevents reassigning the number."
        }
      ],
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "11 · Variables",
      "title": "Remember a value",
      "explanation": "std::cout displays the question. std::string name declares a text variable. std::getline(std::cin, name) waits for a whole line and saves it in name. std::cout then prints Hello followed by that answer.",
      "note": "// Ask for a name and greet the user",
      "prompt": "Create a name variable, then print Hello with a template string.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n  std::cout << \"What is your name?\";\n  std::string name;\n  std::getline(std::cin, name);\n  std::cout << \"Hello \" << name << \"\\n\";\n}",
      "output": [
        "What is your name?  →  Alex",
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
      "runHint": "Save as name.cpp. In the VS Code terminal compile with g++ -std=c++17 name.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "12 · Combined conditions and comparisons",
      "title": "Choose between several messages",
      "explanation": "Use one speed value to choose one message. > means greater than; <= means less than or equal to. && means AND: both comparisons must be true. if / else if / else checks the branches in order and runs only the first matching branch. With speed set to 120, the first condition is true, so only Too fast! prints. The saved value and printing are familiar; the highlighted checks are the new parts.",
      "note": "// Check speed and print one matching message.",
      "prompt": "Use the speed example to choose between Too fast!, Speed is OK., and Stopped.",
      "answer": "#include <iostream>\n\nint main() {\n  int speed = 120;\n\n  if (speed > 100) {\n    std::cout << \"Too fast!\\n\";\n  } else if (speed > 0 && speed <= 100) {\n    std::cout << \"Speed is OK.\\n\";\n  } else {\n    std::cout << \"Stopped.\\n\";\n  }\n}",
      "output": [
        "Too fast!"
      ],
      "parts": [
        {
          "code": "if",
          "name": "First check",
          "meaning": "Starts the first condition. If it is true, its body runs and the remaining branches are skipped."
        },
        {
          "code": "else if",
          "name": "Next check",
          "meaning": "Checks another condition only if the earlier condition was false."
        },
        {
          "code": "else",
          "name": "Otherwise",
          "meaning": "Runs when none of the earlier conditions was true. It has no condition of its own."
        },
        {
          "code": "(...) / {...}",
          "name": "Condition and body",
          "meaning": "Parentheses hold the condition. Curly braces hold the instructions that run when it matches."
        }
      ],
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "13 · Repeated choices",
      "title": "Build a start, options, exit menu",
      "explanation": "This menu combines the loop you learned earlier with separate if checks from the previous lesson. Each time round, it asks for one choice. Type 1 to print Starting..., 2 to print Options..., or 3 to reach break and finish the loop. The choices cannot equal 1 and 2 at the same time, so these separate if statements do not cause two messages for one answer. An if / else if chain could also handle these mutually exclusive choices. Other input matches none of them, so the menu simply appears again. break exits only this loop; return would leave the current function. The displayed choices are text, so compare with \"1\", \"2\", and \"3\".",
      "note": "// Keep asking for 1, 2, or 3. Exit on 3.",
      "prompt": "Show the menu again after Start or Options, and leave the loop on Exit.",
      "answer": "#include <iostream>\n#include <string>\n\nint main() {\n    while (true) {\n        std::cout << \"1. Start\\n2. Options\\n3. Exit\\n\";\n        std::string choice;\n        if (!std::getline(std::cin, choice)) break;\n\n        if (choice == \"1\") {\n            std::cout << \"Starting...\\n\";\n        }\n\n        if (choice == \"2\") {\n            std::cout << \"Options...\\n\";\n        }\n\n        if (choice == \"3\") {\n            break;\n        }\n    }\n}",
      "output": [
        "Starting...",
        "Options..."
      ],
      "parts": [
        {
          "code": "while (true)",
          "name": "Repeat the menu",
          "meaning": "True stays true, so the menu repeats until break leaves the loop."
        },
        {
          "code": "std::getline(std::cin, choice)",
          "name": "Read a choice",
          "meaning": "Reads the next response as text. The menu is shown again on the next loop."
        },
        {
          "code": "if (choice == \"1\")",
          "name": "Start",
          "meaning": "Only choice 1 prints Starting...; the loop still continues afterward."
        },
        {
          "code": "if (choice == \"2\")",
          "name": "Options",
          "meaning": "Only choice 2 prints Options...; the menu then appears again."
        },
        {
          "code": "break",
          "name": "Exit the loop",
          "meaning": "Choice 3 stops the while loop. break does not mean an error, and it does not stop code after the loop from running."
        }
      ],
      "outputNote": "Example: the user enters 1, then 2, then 3. The menu prompts are input, and choosing 3 exits without printing another line. CodeStep previews this sequence; run it locally to try other choices.",
      "runHint": "Save as challenge.cpp; compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge (Windows: .\\challenge.exe). Type 1, then 2, then 3 to end."
    },
    {
      "eyebrow": "14 · Dictionary",
      "title": "Search a word dictionary",
      "explanation": "std::map stores key/value pairs. The two std::string types mean text keys and text values. find searches safely; end means no match. found->second is the matching value. [] retrieves a value, but a missing key would insert a default value, so use find when only searching.",
      "note": "// Create the word dictionary, show its values, then search for a word.",
      "prompt": "Create the word dictionary, show its values, then search for a word.",
      "answer": "#include <iostream>\n#include <string>\n#include <map>\n\nint main() {\n  std::map<std::string, std::string> words = {\n    {\"bonjour\", \"hello\"},\n    {\"hola\", \"hello\"}\n  };\n\n  std::cout << words[\"bonjour\"] << \", \" << words[\"hola\"] << \"\\n\";\n  std::cout << \"Search:\";\n  std::string search;\n  std::getline(std::cin, search);\n  auto found = words.find(search);\n  if (found != words.end()) {\n    std::cout << found->second << \"\\n\";\n  } else {\n    std::cout << \"word not found\\n\";\n  }\n}",
      "output": [
        "hello, hello",
        "Search:  →  bonjour",
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
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "15 · Expressions",
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
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "16 · Random",
      "title": "Choose a random word",
      "explanation": "The loop copies map keys into a vector. mt19937 is a random-number generator seeded by random_device. uniform_int_distribution chooses an index from 0 through size - 1, inclusive. keys[index] retrieves the chosen key. Either word may be printed.",
      "note": "// Create the word dictionary and randomly select one of its keys.",
      "prompt": "Create the word dictionary and randomly select one of its keys.",
      "answer": "#include <iostream>\n#include <string>\n#include <map>\n#include <vector>\n#include <random>\n\nint main() {\n  std::map<std::string, std::string> words = {\n    {\"bonjour\", \"hello\"},\n    {\"hola\", \"hello\"}\n  };\n\n  std::vector<std::string> keys;\n  for (const auto& entry : words) {\n    keys.push_back(entry.first);\n  }\n  std::mt19937 generator(std::random_device{}());\n  std::uniform_int_distribution<int> choose(0, static_cast<int>(keys.size()) - 1);\n  std::string random = keys[choose(generator)];\n\n  std::cout << random << \"\\n\";\n}",
      "output": [
        "bonjour"
      ],
      "parts": [
        {
          "code": "std::mt19937",
          "name": "Generator",
          "meaning": "Produces pseudo-random numbers."
        },
        {
          "code": "uniform_int_distribution",
          "name": "Choose an index",
          "meaning": "Chooses within the inclusive bounds."
        }
      ],
      "outputNote": "Example output; either bonjour or hola can be chosen.",
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "17 · Arrays and lists",
      "title": "Make and search a names array",
      "explanation": "A built-in array has a fixed size. std::vector is a growing collection that matches JavaScript’s array here. push_back adds the entered name. std::find searches between begin and end; returning end means no match. Matching is case-sensitive.",
      "note": "// Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "prompt": "Create an empty collection, add a name, ask what to search for, and print whether it was found.",
      "answer": "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\n\nint main() {\n  std::vector<std::string> names;\n\n  std::cout << \"add a name\";\n  std::string name;\n  std::getline(std::cin, name);\n  names.push_back(name);\n\n  std::cout << \"search for a name\";\n  std::string search;\n  std::getline(std::cin, search);\n\n  if (std::find(names.begin(), names.end(), search) != names.end()) {\n    std::cout << \"name found\\n\";\n  } else {\n    std::cout << \"name not found\\n\";\n  }\n}",
      "output": [
        "add a name  →  Jaden",
        "search for a name  →  Jaden",
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
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "18 · Sets",
      "title": "Remove duplicate names",
      "explanation": "std::set stores unique values in sorted order. The loop prints a comma between items and square brackets around them. firstItem prevents a comma before the first item. Alex, Sam, Alex becomes [Alex, Sam].",
      "note": "// Ask for three names, then remove any duplicates",
      "prompt": "Collect three names, create a std::set, and print its unique values.",
      "answer": "#include <iostream>\n#include <string>\n#include <set>\n\nint main() {\n  std::cout << \"Enter the first name:\";\n  std::string first;\n  std::getline(std::cin, first);\n  std::cout << \"Enter the second name:\";\n  std::string second;\n  std::getline(std::cin, second);\n  std::cout << \"Enter the third name:\";\n  std::string third;\n  std::getline(std::cin, third);\n\n  std::set<std::string> uniqueNames = {first, second, third};\n\n  std::cout << \"[\";\n  bool firstItem = true;\n  for (const auto& name : uniqueNames) {\n    if (!firstItem) std::cout << \", \";\n    std::cout << name;\n    firstItem = false;\n  }\n  std::cout << \"]\\n\";\n}",
      "output": [
        "Enter the first name:  →  Alex",
        "Enter the second name:  →  Sam",
        "Enter the third name:  →  Alex",
        "[Alex, Sam]"
      ],
      "parts": [
        {
          "code": "std::set",
          "name": "Unique values",
          "meaning": "Keeps one copy of each value in sorted order."
        }
      ],
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "19 · Null",
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
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "eyebrow": "20 · Regular expressions",
      "title": "Let names beginning with J enter",
      "explanation": "std::regex holds the pattern. ^ requires J at the beginning; std::regex::icase ignores case. regex_search returns true for a matching name. This accepts any text starting with J or j, not only names.",
      "note": "// Let people into the club when their name begins with J",
      "prompt": "Check the five names and print who may enter the club.",
      "answer": "#include <iostream>\n#include <string>\n#include <vector>\n#include <regex>\n\nint main() {\n  std::vector<std::string> names = {\"Jaden\", \"James\", \"Jessica\", \"Sarah\", \"Ben\"};\n  std::regex pattern(\"^J\", std::regex::icase);\n\n  for (const auto& name : names) {\n    if (std::regex_search(name, pattern)) {\n      std::cout << name << \" can enter the club.\\n\";\n    } else {\n      std::cout << name << \" cannot enter the club.\\n\";\n    }\n  }\n}",
      "output": [
        "Jaden can enter the club.",
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
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    },
    {
      "title": "Get a filename from a path",
      "eyebrow": "21 · Files and paths",
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
      "runHint": "Save as file-finder.cpp, compile with g++ -std=c++17 file-finder.cpp -o file-finder, then run ./file-finder (Windows: .\\file-finder.exe). A C++17 compiler is required.",
      "outputNote": "Example preview. Extracting a filename does not access your computer or prove that the file exists."
    },
    {
      "title": "List files in a folder",
      "eyebrow": "22 · Files and paths",
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
      "runHint": "Save as file-finder.cpp, compile with g++ -std=c++17 file-finder.cpp -o file-finder, then run ./file-finder (Windows: .\\file-finder.exe). A C++17 compiler is required. Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview for a folder containing these two files. Order may vary. CodeStep checks your code and shows sample output; run it locally to list your own files."
    },
    {
      "title": "Find a sheet-music file",
      "eyebrow": "23 · Files and paths",
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
      "runHint": "Save as file-finder.cpp, compile with g++ -std=c++17 file-finder.cpp -o file-finder, then run ./file-finder (Windows: .\\file-finder.exe). A C++17 compiler is required. Run from the folder containing sheet-music. Create sheet-music there and put a real image inside named chopin-nocturne.png. Add practice-notes.txt to try listing more than one file.",
      "outputNote": "Example preview with the score present. Remove or rename it locally to try the File not found branch. CodeStep does not inspect your device."
    },
    {
      "eyebrow": "24 · Concurrent work",
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
      "runHint": "Save as challenge.cpp. Compile with g++ -std=c++17 -pthread challenge.cpp -o challenge and run ./challenge (Windows with an appropriate C++ compiler: challenge.exe). Either line can appear first.",
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
      "eyebrow": "25 · Application practice",
      "title": "Build a random word quiz",
      "explanation": "Combine the map, random choice, terminal input, and if/else. std::getline reads the answer. words[random] retrieves the chosen key’s translation. == checks the answer and prints Correct or Wrong.",
      "note": "// Combine the word dictionary and random key code to make a translation quiz.",
      "prompt": "Combine the word dictionary and random key code to make a translation quiz.",
      "answer": "#include <iostream>\n#include <string>\n#include <map>\n#include <vector>\n#include <random>\n\nint main() {\n  std::map<std::string, std::string> words = {\n    {\"bonjour\", \"hello\"},\n    {\"hola\", \"hello\"}\n  };\n\n  std::vector<std::string> keys;\n  for (const auto& entry : words) {\n    keys.push_back(entry.first);\n  }\n  std::mt19937 generator(std::random_device{}());\n  std::uniform_int_distribution<int> choose(0, static_cast<int>(keys.size()) - 1);\n  std::string random = keys[choose(generator)];\n\n  std::cout << random;\n  std::string answer;\n  std::getline(std::cin, answer);\n\n  if (answer == words[random]) {\n    std::cout << \"Correct\\n\";\n  } else {\n    std::cout << \"Wrong\\n\";\n  }\n}",
      "output": [
        "bonjour  →  hello",
        "Correct"
      ],
      "parts": [
        {
          "code": "words[random]",
          "name": "Expected answer",
          "meaning": "Looks up the chosen word’s translation."
        },
        {
          "code": "==",
          "name": "Check",
          "meaning": "Compares the entered answer with the translation."
        }
      ],
      "outputNote": "Example run: bonjour is chosen and the user enters hello.",
      "runHint": "Save as challenge.cpp. In the VS Code terminal compile with g++ -std=c++17 challenge.cpp -o challenge, then run ./challenge. A C++ compiler must be installed."
    }
  ]
};

type CodePart = { code: string; name: string; meaning: string };

const breakdowns: Record<Language, Partial<Record<number, CodePart[]>>> = {
  cpp: {},
  python: {},
  javascript: {
    0: [{ code: "\\x1b[31m", name: "Red text", meaning: "An ANSI escape code that switches terminal text to red." }, { code: "${red}", name: "Insert the colour", meaning: "Inside backticks, inserts the value stored in red before the message." }, { code: "\\n", name: "New line", meaning: "Write \\n inside the quoted text in console.log. It starts a new line: Hello, Welcome, and Goodbye each print on their own line." }],
    1: [{ code: "function", name: "Create", meaning: "Starts a reusable block of code." }, { code: "correct()", name: "Name", meaning: "Names the function so you can call it later." }, { code: "{ ... }", name: "Instructions", meaning: "Holds the code the function will run." }, { code: "correct();", name: "Call it", meaning: "Runs the function you created." }, { code: ";", name: "End instruction", meaning: "Marks where an instruction ends. JavaScript can sometimes work without it, but using it consistently makes the ending clear." }],
    2: [{ code: "while (true)", name: "Repeat", meaning: "Keeps asking for input until code inside stops the loop." }, { code: "prompt", name: "Input", meaning: "Asks the user for an answer." }, { code: "break", name: "Stop", meaning: "Leaves the loop when the if condition is true." }],
    3: [{ code: "let", name: "Create", meaning: "Makes a variable that can remember something." }, { code: "name", name: "Label", meaning: "Shows that you choose a useful name for the saved value." }, { code: "=", name: "Save", meaning: "Puts the value on the right into the variable on the left." }],
    6: [{ code: "if ( ... )", name: "Check", meaning: "Runs a block only when its condition is true." }, { code: 'answer === "green"', name: "Condition", meaning: "Checks whether the saved answer is exactly green." }, { code: "else", name: "Otherwise", meaning: "Runs when the condition is false." }],
    8: [{ code: ">= 0", name: "Lower limit", meaning: "Checks that age is zero or greater." }, { code: "&&", name: "Two ampersands", meaning: "Read this as AND: the condition on each side must be true." }, { code: "<= 18", name: "Upper limit", meaning: "Checks that age is eighteen or less." }],
    13: [{ code: "{ ... }", name: "Object brackets", meaning: "Curly braces hold the object's named values." }, { code: "bonjour: \"hello\"", name: "Key and value", meaning: "bonjour is the key to search for, and hello is the value stored under it." }, { code: "words[search]", name: "Look it up", meaning: "Uses the saved search as a key and retrieves its value from words." }],
    16: [
      {"code": "setTimeout", "name": "Schedule for later", "meaning": "Starts a timer and schedules a function to run later. It does not stop the next line from running."},
      {"code": "() => {}", "name": "Arrow function", "meaning": "Creates the small function passed to the timer. The timer runs it after the delay."},
      {"code": "()", "name": "No inputs", "meaning": "The empty parentheses before => mean this arrow function has no named inputs (parameters)."},
      {"code": "=>", "name": "Arrow", "meaning": "Connects the function inputs on the left to its body on the right."},
      {"code": "{}", "name": "Empty body", "meaning": "Curly braces hold the instructions to run later. Here they contain no instructions, so the timer does nothing when it finishes."},
      {"code": "2000", "name": "Delay", "meaning": "The delay is in milliseconds. 2000 milliseconds = 2 seconds."},
      {"code": ",", "name": "Separate the arguments", "meaning": "The comma separates the function to run, () => {}, from the delay, 2000. These two values are called arguments."},
      {"code": "setTimeout( ... )", "name": "Call parentheses", "meaning": "The outer parentheses call setTimeout and surround its two arguments: the function and the delay."},
      {"code": "console.log", "name": "Print now", "meaning": "Prints the message immediately here because it is before setTimeout, outside the arrow function body."},
      {"code": "correct();", "name": "First function call", "meaning": "Runs correct: prints correct immediately, then schedules its empty timer."},
      {"code": "incorrect();", "name": "Second function call", "meaning": "Runs incorrect next: prints thats is incorrect immediately, then schedules its empty timer. It does not wait for the first timer."},
    ],
    17: [{ code: "new Date()", name: "Current moment", meaning: "Creates a Date using the device's current date and time." }],
  },
  csharp: {
    0: [{ code: "void", name: "Result type", meaning: "Says this method does not send a value back." }, { code: "Correct()", name: "Name", meaning: "Names the method so you can call it later." }, { code: "{ ... }", name: "Instructions", meaning: "Holds the code the method will run." }, { code: "Correct();", name: "Call it", meaning: "Runs the method you created." }, { code: ";", name: "End statement", meaning: "Marks where a statement ends. C# requires it after statements such as calling a method or printing text." }],
    1: [{ code: "\\n", name: "New line", meaning: "Moves the next word onto a new line in the terminal." }],
    2: [{ code: "while (true)", name: "Repeat", meaning: "Keeps asking for input until code inside stops the loop." }, { code: "Console.ReadLine", name: "Input", meaning: "Reads the user's answer." }, { code: "break", name: "Stop", meaning: "Leaves the loop when the if condition is true." }],
    3: [{ code: 'return "Hello"', name: "Send a value back", meaning: "Ends GetMessage and sends Hello back to the code that called it." }, { code: "GetMessage()", name: "Use the returned value", meaning: "Calls the method and receives the text that return sent back." }],
    4: [{ code: "string", name: "Type", meaning: "Says this variable will store text." }, { code: "name", name: "Label", meaning: "Shows that you choose a useful name for the saved value." }, { code: "=", name: "Save", meaning: "Puts the value on the right into the variable on the left." }],
    7: [{ code: "if ( ... )", name: "Check", meaning: "Runs a block only when its condition is true." }, { code: 'answer == "green"', name: "Condition", meaning: "Checks whether the saved answer is green." }, { code: "else", name: "Otherwise", meaning: "Runs when the condition is false." }],
    9: [{ code: ">= 0", name: "Lower limit", meaning: "Checks that age is zero or greater." }, { code: "&&", name: "Two ampersands", meaning: "Read this as AND: the condition on each side must be true." }, { code: "<= 18", name: "Upper limit", meaning: "Checks that age is eighteen or less." }],
    12: [{ code: "string[]", name: "Array type", meaning: "Says fruits is a list of text values." }, { code: "foreach", name: "Loop", meaning: "Visits every item in the array." }, { code: "fruit", name: "Current item", meaning: "Temporarily holds the item being visited." }],
    13: [{ code: "List<string>", name: "Flexible text list", meaning: "Creates a list that can grow and accepts string values." }, { code: "new List<string>()", name: "Empty list", meaning: "Builds the list with zero items inside it." }],
    14: [{ code: "cars.Add(newCar)", name: "Add an item", meaning: "Adds the saved car to the end of the cars list." }],
    15: [{ code: "string.Join", name: "Join items", meaning: "Turns all list items into one readable piece of text." }, { code: '", "', name: "Separator", meaning: "Places a comma and space between multiple cars." }],
    17: [{ code: "cars[0]", name: "First position", meaning: "Zero retrieves the first item because list counting starts at zero." }],
    18: [{ code: "var", name: "Inferred type", meaning: "Lets C# work out the variable's type from the value assigned to it." }, { code: "new { ... }", name: "Object", meaning: "Groups related values into one thing." }, { code: "car.Brand", name: "Property", meaning: "Reads the Brand value stored on car." }],
    19: [{ code: "Task.Delay", name: "Timer", meaning: "Creates a pause for a number of milliseconds." }, { code: "1000", name: "Duration", meaning: "One thousand milliseconds means one second." }, { code: "await", name: "Wait", meaning: "Pauses here before moving to the next line." }],
    20: [{ code: "DateTime", name: "Type", meaning: "Represents a date and a time in C#." }, { code: "DateTime.Now", name: "Current moment", meaning: "Reads the computer's current local date and time." }],
  },
  html: {
    0: [{ code: "<!DOCTYPE", name: "Declaration", meaning: "Tells the browser what kind of document follows." }, { code: "html", name: "Modern HTML", meaning: "Selects the current HTML standard." }],
    1: [{ code: "<html>", name: "Opening tag", meaning: "Marks where the HTML page begins." }, { code: 'lang="en"', name: "Page language", meaning: "Identifies the document as English." }, { code: "</html>", name: "Closing tag", meaning: "The slash marks where that element ends." }],
    2: [{ code: "<head>", name: "Page information", meaning: "Contains information used by the browser." }, { code: '<meta charset="UTF-8">', name: "Character encoding", meaning: "Supports letters, symbols, and characters from many languages." }, { code: "<title>", name: "Tab title", meaning: "Sets the words shown on the browser tab." }],
    3: [{ code: "<body>", name: "Visible content", meaning: "Starts the part visitors can see." }],
    4: [{ code: "<div>", name: "Section box", meaning: "Starts a separate block used to group content inside the body." }, { code: "style", name: "Inline styling", meaning: "Adds a visual rule directly to this particular div." }, { code: "background-color", name: "Box colour", meaning: "Changes the colour behind the content inside the div." }],
    5: [{ code: "h1", name: "Main heading", meaning: "The page's most important heading." }, { code: "h2", name: "Section heading", meaning: "Introduces a major section beneath the h1." }],
    6: [{ code: "<a>", name: "Anchor", meaning: "Creates a clickable link." }, { code: "href", name: "Destination", meaning: "Stores the page or address to open." }],
    7: [{ code: "<section>", name: "Content group", meaning: "Keeps a related part of the page together." }, { code: "<strong>", name: "Important text", meaning: "Marks text as important and normally displays it in bold." }, { code: "<del>", name: "Deleted text", meaning: "Shows text that has been removed with a line through it." }],
    8: [{ code: "<script>", name: "JavaScript area", meaning: "Tells the browser that the code inside is JavaScript." }, { code: "const", name: "Fixed variable", meaning: "Creates a variable that will not be reassigned." }, { code: "new Date()", name: "Current moment", meaning: "Creates a Date using the device's current date and time." }, { code: "console.log", name: "Developer console", meaning: "Displays the value in the browser's developer tools." }],
    10: [{ code: "<img>", name: "Image element", meaning: "Places an image in the HTML page; it does not need a closing tag." }, { code: 'src="car.png"', name: "Image source", meaning: "Loads car.png from the same folder as the HTML file." }, { code: 'alt="A car"', name: "Alternative text", meaning: "Describes the image for accessibility and when it cannot load." }],
    11: [{ code: "<video>", name: "Video element", meaning: "Creates a video player inside the webpage." }, { code: "controls", name: "Playback controls", meaning: "Shows the browser's play, pause, volume, and timeline controls." }],
    12: [{ code: "<audio>", name: "Audio element", meaning: "Creates an audio player without a video picture area." }],
    13: [{ code: 'id="p1"', name: "Unique ID", meaning: "Gives this element the unique name p1." }, { code: "#p1", name: "Matching CSS", meaning: "CSS uses a hash before the ID name to select this exact element." }],
    14: [{ code: "onclick", name: "Wait for a click", meaning: "Runs checkAnswer once when the visitor presses the button." }, { code: ".textContent", name: "Change the page text", meaning: "Places the result inside the selected paragraph." }],
    15: [{ code: 'return "Hello"', name: "Send a value back", meaning: "Ends getMessage and sends Hello back to the code that called it." }, { code: "getMessage()", name: "Use the returned value", meaning: "Calls the function and receives the text that return sent back." }],
  },
  css: {
    0: [{ code: "body", name: "Selector", meaning: "Chooses the HTML body element to style." }, { code: "background-color", name: "Property", meaning: "Chooses the colour behind the element." }, { code: ":", name: "Property separator", meaning: "Separates the property name from its value." }, { code: "lightblue", name: "Value", meaning: "The background colour to apply." }, { code: ";", name: "Rule ending", meaning: "Ends this CSS declaration so another can follow." }],
    1: [{ code: "p", name: "Selector", meaning: "Chooses every paragraph on the page." }, { code: "color: red", name: "Text colour", meaning: "Makes the selected text red." }, { code: "text-align: center", name: "Alignment", meaning: "Centres inline content inside each paragraph." }],
    2: [{ code: "#p1", name: "ID selector", meaning: "The hash selects the element whose ID is p1." }],
  },
};

const breakdownLessonTitles: Record<Language, string[]> = {"javascript": ["Print several lines at once", "Choose a text colour", "Run code after a delay", "Repeat code every second", "Check for a particular time", "Keep checking until the time is reached", "Make something happen", "Use one function inside another", "Create and use a class", "Repeat input until the answer is correct", "Choose let or const", "Ask for a name in VS Code", "Choose between several messages", "Search a word dictionary", "Calculate a value", "Choose a random word", "Make and search a names array", "Remove duplicate names", "Mark a value as not ready yet", "Let names beginning with J enter", "Build a random word quiz"], "csharp": ["Print several lines at once", "Choose a text colour", "Run code after a delay", "Check for a particular time", "Keep checking until the time is reached", "Make something happen", "Use one function inside another", "Create and use a class", "Repeat input until the answer is correct", "Use changeable and fixed values", "Remember a value", "Choose between several messages", "Search a word dictionary", "Calculate a value", "Choose a random word", "Make and search a names array", "Remove duplicate names", "Mark a value as not ready yet", "Let names beginning with J enter", "Build a random word quiz"], "html": ["Tell the browser it is HTML", "Start the HTML page", "Name the browser tab", "Add visible page content", "Separate content into boxes", "Create a heading hierarchy", "Open another page", "Explore HTML text elements", "Show the current date and time", "Link two HTML pages", "Place an image on the page", "Place a video on the page", "Place audio on the page", "Give one element a unique name", "Use a button instead of while (true)", "Send a value back with return"], "css": ["Colour the page background", "Colour and centre text", "Style one unique element", "Compare website fonts", "Explore borders and colour formats", "Create a rounded dotted border"], "python": ["Print several lines at once", "Choose a text colour", "Run code after a delay", "Check for a particular time", "Keep checking until the time is reached", "Make something happen", "Use one function inside another", "Create and use a class", "Repeat input until the answer is correct", "Use changeable and fixed values", "Remember a value", "Choose between several messages", "Search a word dictionary", "Calculate a value", "Choose a random word", "Make and search a names array", "Remove duplicate names", "Mark a value as not ready yet", "Let names beginning with J enter", "Build a random word quiz"], "cpp": ["Print several lines at once", "Choose a text colour", "Run code after a delay", "Check for a particular time", "Keep checking until the time is reached", "Make something happen", "Use one function inside another", "Create and use a class", "Repeat input until the answer is correct", "Use changeable and fixed values", "Remember a value", "Choose between several messages", "Search a word dictionary", "Calculate a value", "Choose a random word", "Make and search a names array", "Remove duplicate names", "Mark a value as not ready yet", "Let names beginning with J enter", "Build a random word quiz"]};

const nullBreakdowns: Partial<Record<Language, CodePart[]>> = {
  javascript: [
    { code: "null", name: "No value yet", meaning: "Deliberately stores no value for now; result can receive one later." },
    { code: "=== null", name: "Exact check", meaning: "Checks whether result is specifically the null value." },
  ],
  csharp: [
    { code: "string?", name: "Nullable text", meaning: "The question mark allows a string variable to hold text or null." },
    { code: "null", name: "No value yet", meaning: "Deliberately stores no value for now; result can receive one later." },
    { code: "== null", name: "Null check", meaning: "Checks whether result still contains no value." },
  ],
};

const setsBreakdowns: Partial<Record<Language, CodePart[]>> = {
  javascript: [
    { code: "new Set(names)", name: "Remove duplicates", meaning: "Creates a Set from names. A Set keeps only one copy of each value." },
    { code: "[...uniqueNames]", name: "Spread into an array", meaning: "The three dots copy every Set value into a new array for familiar array-style output." },
  ],
  csharp: [
    { code: "HashSet<string>", name: "Unique text collection", meaning: "Defines a collection that stores no duplicate text values." },
    { code: "new HashSet<string>(names)", name: "Remove duplicates", meaning: "Creates the HashSet from names and keeps only one copy of each value." },
  ],
};

const namesArrayBreakdown: CodePart[] = [
  { code: "[]", name: "Make the array", meaning: "The square brackets create an empty array. An array is JavaScript's name for a list." },
  { code: 'names.push(prompt("add a name"))', name: "Add a name", meaning: "prompt runs first and asks for a name. push() adds the entered name to the end of the names array." },
  { code: 'const search = prompt("search for a name")', name: "Ask what to find", meaning: "Stores the second answer in search. This does not add another name to the array." },
  { code: "names.includes(search)", name: "Search the array", meaning: "Returns true when names contains an exact match for search, or false when it does not. includes() checks the array without changing it." },
  { code: "if / else", name: "Show the result", meaning: "if prints name found when includes() returns true. else prints name not found when it returns false. Add Jaden and search for Ben or jaden to get name not found." },
];

const randomWordBreakdown: CodePart[] = [
  { code: "Object.keys(words)", name: "Get the keys", meaning: "Creates an array containing bonjour and hola, the two keys from words." },
  { code: "Math.random() * 2", name: "Make a random position", meaning: "Creates a random number from 0 up to 2 because there are two keys." },
  { code: "Math.floor(...)", name: "Remove the decimal", meaning: "Turns the random number into position 0 or position 1." },
  { code: "[ ... ]", name: "Choose that key", meaning: "Uses the random position to select either bonjour or hola from the keys array." },
];

const classBreakdowns: Partial<Record<Language, CodePart[]>> = {
  javascript: [
    { code: "class Car", name: "Create the class", meaning: "Defines the blueprint before any Car objects are created." },
    { code: "constructor(name, year)", name: "Receive values", meaning: "Runs when new Car(...) creates an object." },
    { code: "this.name = name", name: "Store a property", meaning: "Saves the received name on this particular car object." },
    { code: "new Car(\"Ford\", 2014)", name: "Create an instance", meaning: "Calls the constructor and creates one Car object." },
  ],
  csharp: [
    { code: "class Car", name: "Define Car first", meaning: "Places the Car blueprint before the Program class that uses it." },
    { code: "public string Name", name: "Property", meaning: "Stores a text name that other code can read or change." },
    { code: "Car(string name, int year)", name: "Constructor", meaning: "Receives the starting values when new Car(...) creates an object." },
    { code: "new Car(\"Ford\", 2014)", name: "Create an instance", meaning: "Creates one Car object inside Main." },
  ],
};

const regexBreakdowns: Partial<Record<Language, CodePart[]>> = {
  javascript: [
    { code: "/ ... /", name: "Pattern", meaning: "The forward slashes mark the beginning and end of a regular expression." },
    { code: "^", name: "Beginning", meaning: "The caret says the match must start at the very beginning of the text." },
    { code: "J", name: "Required letter", meaning: "This is the letter that must appear first." },
    { code: "i", name: "Ignore case", meaning: "Accepts either uppercase J or lowercase j." },
    { code: ".test(name)", name: "Check a name", meaning: "Returns true when name begins with J and false when it does not." },
  ],
  csharp: [
    { code: '"^J"', name: "Pattern", meaning: "The caret requires J to be at the beginning of the text." },
    { code: "Regex.IsMatch", name: "Check a name", meaning: "Returns true when the supplied name matches the pattern." },
    { code: "RegexOptions.IgnoreCase", name: "Ignore case", meaning: "Accepts either uppercase J or lowercase j." },
  ],
};


const lessonTone = (lesson: Lesson) => {
  const label = `${lesson.eyebrow} ${lesson.title}`.toLowerCase();
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

  return uncommented.split("\n").filter((line) => line.trim()).join("\n");
};

const languageName = (language: Language) => language === "cpp" ? "C++" : language === "python" ? "Python" : language === "javascript" ? "JavaScript" : language === "csharp" ? "C Sharp" : language === "html" ? "HTML" : "CSS";
const languageBadge = (language: Language) => language === "cpp" ? "C++" : language === "python" ? "PY" : language === "javascript" ? "JS" : language === "csharp" ? "C#" : language === "html" ? "HTML" : "CSS";
const challengeFile = (language: Language) => language === "cpp" ? "challenge.cpp" : language === "python" ? "challenge.py" : language === "javascript" ? "challenge.js" : language === "csharp" ? "Program.cs" : language === "html" ? "index.html" : "styles.css";

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
  const remainingGuide = expected.slice(expectedPosition).replace(/^\s+/, "");
  return code.replace(/[^\n]/g, " ") + remainingGuide;
}

function SyntaxDiagnostic({ parts }: { parts: DiagnosticPart[] }) {
  return <div className="syntax-diagnostic" role="alert">{parts.map((part, index) => <span key={`${part.text}-${index}`} className={`diagnostic-${part.kind}`} tabIndex={0} data-help={part.help} aria-label={`${part.text}: ${part.help}`}>{part.text}</span>)}</div>;
}

function HighlightedCode({ code, language, caretIndex }: { code: string; language: Language; caretIndex?: number }) {
  let pattern = language === "html"
    ? /(<!--[\s\S]*?-->|<\/?|\/?>|"[^"]*"|'[^']*'|\b(?:html|head|meta|title|body|div|section|script|img|video|audio|h[1-6]|p|a|span|b|strong|i|em|mark|small|del|ins|sub|sup)\b|\b(?:style|href|src|alt|controls|id|lang|charset)\b|\b(?:background-color)\b|\b(?:const|new)\b|\b(?:Date|console|log)\b|\d+|[{}()[\];=.:#])/g
    : language === "css"
    ? /(\/\*[\s\S]*?\*\/|#[0-9a-fA-F]{3,8}\b|#[A-Za-z_]\w*|\b(?:body|p|background-color|color|text-align|font-family|border|border-radius|solid|dotted|center|lightblue|red|blue|tomato)\b|\d+(?:px)?|[{}();:.,])/g
    : language === "python"
    ? /(#.*|f?"[^"\n]*"|f?'[^'\n]*'|\b(?:def|class|self|return|import|from|if|else|for|in|while|True|False|None|break|and|or|not|is)\b|\b(?:print|input|datetime|random|re|time|set|list|sorted)\b|\b[A-Za-z_]\w*(?=\s*\()|\d+|[{}()[\];=.:<>+*%/-])/g
    : /(\/\/[^\n]*|\/\^[A-Za-z]+\/[gimsuy]*|"[^"\n]*"|'[^'\n]*'|`[^`]*`|\b(?:def|self|import|from|True|False|None|and|or|not|is|function|class|constructor|this|let|const|double|bool|out|auto|include|new|null|if|else|for|of|while|true|false|break|return|setTimeout|setInterval|clearInterval|public|static|void|string|int|get|set|var|foreach|in|await)\b|\b(?:console|Console|Task|Date|DateTime|List|Set|HashSet|Dictionary|Random|std|cout|cin|vector|map|optional|print|input|datetime|random|re|time|Regex|RegexOptions)\b|\b[A-Za-z_]\w*(?=\s*\()|\d+|===|!==|==|!=|&&|\|\||!|>=|<=|\+\+|--|[{}()[\];=.:<>?^/])/g;
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
    else if (/^(and|or|not|import|from|function|class|constructor|this|let|const|double|bool|out|new|null|if|else|for|of|while|true|false|break|return|setTimeout|setInterval|clearInterval|public|static|void|string|int|get|set|var|foreach|in|await|<\/?|\/?>|html|head|meta|title|body|div|section|script|img|video|audio|h[1-6]|p|a|span|b|strong|i|em|mark|small|del|ins|sub|sup)$/.test(text)) kind = "keyword";
    else if (/^(console|Console|Task|Date|DateTime|List|Set|HashSet|Dictionary|Random|Regex|RegexOptions|log)$/.test(text)) kind = "api";
    else if (/^(style|href|src|alt|controls|id|lang|charset)$/.test(text)) kind = "attribute";
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

function SettingsPanel({ open, themeMode, showGuide, colourTyping, blockMode, onBlockModeChange, onThemeChange, onGuideChange, onColourTypingChange, onClose }: { open: boolean; themeMode: ThemeMode; showGuide: boolean; colourTyping: boolean; blockMode: boolean; onBlockModeChange: (enabled: boolean) => void; onThemeChange: (mode: ThemeMode) => void; onGuideChange: (show: boolean) => void; onColourTypingChange: (show: boolean) => void; onClose: () => void }) {
  if (!open) return null;
  return <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="settings-head"><div><small>CODESTEP</small><h2 id="settings-title">Settings</h2></div><button onClick={onClose} aria-label="Close settings">×</button></div>
      <div className="settings-group"><b>Appearance</b><span>Choose a theme or follow your device setting.</span><div className="theme-options">
        {(["light", "dark", "system"] as ThemeMode[]).map((mode) => <button key={mode} className={themeMode === mode ? "selected" : ""} onClick={() => onThemeChange(mode)}><i>{mode === "light" ? "☀" : mode === "dark" ? "☾" : "◐"}</i><span>{mode[0].toUpperCase() + mode.slice(1)}</span><small>{mode === "system" ? "Use device setting" : `${mode} appearance`}</small></button>)}
      </div></div>
      <div className="settings-group guide-setting"><div><b>Code blocks</b><span>Tap or drag ready-made lines into your code. Turn off to type instead. Your choice is saved on this device.</span></div><button aria-label="Code blocks" className={`switch ${blockMode ? "on" : ""}`} role="switch" aria-checked={blockMode} onClick={() => onBlockModeChange(!blockMode)}><i /></button></div>
      <div className="settings-group guide-setting"><div><b>Code guide</b><span>Show a faint, colour-coded copy of the expected answer in the editor.</span></div><button className={`switch ${showGuide ? "on" : ""}`} role="switch" aria-checked={showGuide} onClick={() => onGuideChange(!showGuide)}><i /></button></div>
      <div className="settings-group guide-setting"><div><b>Colour typed code</b><span>Give your typed code the same syntax colours as the ghost guide.</span></div><button className={`switch ${colourTyping ? "on" : ""}`} role="switch" aria-checked={colourTyping} onClick={() => onColourTypingChange(!colourTyping)}><i /></button></div>
      <p className="settings-foot">The guide shows only the code you need to type. Lesson comments stay in the explanation panel.</p>
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
      <div><dt><code>#include &lt;iostream&gt;</code></dt><dd><code>#include</code> is a preprocessor instruction: it brings a header’s declarations into this file before compilation. A header describes library tools your code can use. The angle brackets <code>&lt; &gt;</code> tell the compiler to search its configured include locations. This does not install a library. Use <code>#include "myfile.h"</code> for a project header, usually searched relative to the current file first. Include directives do not need a semicolon.</dd></div>
      <div><dt><code>int main()</code></dt><dd><code>main</code> is the starting function for a normal C++ console program. <code>int</code> means it returns a whole number to the operating system; it is not the number your program prints. Empty <code>()</code> means this version takes no parameters. Write ordinary executable statements inside main or another function. Removing main from this standalone example prevents it from linking as a normal executable.</dd></div>
      <div><dt><code>{"{ ... }"}</code></dt><dd>The braces mark the start and end of the function body. Indentation makes it easier to read; the braces determine which instructions belong to it.</dd></div>
      <div><dt><code>std::cout &lt;&lt; "Hello\\n";</code></dt><dd><code>std</code> is the standard-library namespace, a group of names. <code>::</code> selects a name inside it. <code>cout</code> is the standard output stream; <code>&lt;&lt;</code> sends the text into it. <code>\n</code> starts a new line and <code>;</code> ends the statement. Removing <code>std::</code> makes cout unknown unless you have brought that name into scope.</dd></div>
      <div><dt><code>return 0;</code></dt><dd>Ends main and sends a success status to the operating system. A nonzero status usually signals a problem. You can leave this line out at the end of main: C++ automatically returns 0 there. That special rule does not apply to ordinary functions that must return a value.</dd></div>
      <div><dt><code>int</code>, <code>void</code>, and <code>std::string</code></dt><dd>Types describe values. <code>int score = 5;</code> stores a whole number; <code>double speed = 5.5;</code> stores a decimal; <code>bool ready = true;</code> stores true or false; <code>std::string name = "Jaden";</code> stores text. Before a function name, its type describes what it returns: <code>void correct()</code> returns no value. main must return int, so do not replace it with void main.</dd></div>
      <div><dt>Defining and calling a function</dt><dd><code>void correct() {"{ ... }"}</code> defines instructions; <code>correct();</code> runs them. In these examples, define your function before main, then call it inside main. Otherwise, you need a declaration before its first use. Do not call correct from inside its own body just to start it: that repeatedly calls itself.</dd></div>
      <div><dt>Can it be simpler?</dt><dd>For a program that only prints, you need just <code>&lt;iostream&gt;</code>, <code>int main()</code>, its braces, and the print statement. Add other headers only when you use their tools. <code>using std::cout;</code> lets you write cout without std::, but keeping std:: makes its source clear.</dd></div>
    </dl>
    <p>Code colours are reading aids, not errors. A header such as <code>&lt;string&gt;</code> names a library header; <code>std::string</code> is a text type; <code>"Hello"</code> is an actual string value.</p>
    <h3>Headers in this lesson</h3>
    {headers.map(header => <p key={header}><code>{`#include <${header}>`}</code> — {cppHeaderNotes[header] ?? "Makes this header’s declarations available to the example."}</p>)}
    <p>If you remove a required header, the compiler may report an unknown name. Another header can sometimes include it indirectly; include what your code uses so it does not depend on that accident.</p>
  </details>;
}

const homeDemos: Record<Language, { code: string; file: string }> = {
  javascript: { file: "hello.js", code: 'function sayHello() {\n  console.log("Hello, coder!");\n}\n\nsayHello();' },
  csharp: { file: "Program.cs", code: 'void SayHello() {\n  Console.WriteLine("Hello, coder!");\n}\n\nSayHello();' },
  python: { file: "hello.py", code: 'def sayHello():\n    print("Hello, coder!")\n\nsayHello()' },
  cpp: { file: "hello.cpp", code: '#include <iostream>\n\nvoid sayHello() {\n  std::cout << "Hello, coder!\\n";\n}\n\nint main() {\n  sayHello();\n}' },
  html: { file: "index.html", code: '<!DOCTYPE html>\n<html lang="en">\n<body>\n  <p>Hello, coder!</p>\n</body>\n</html>' },
  css: { file: "styles.css + HTML", code: '/* HTML: <p class="hello">Hello, coder!</p> */\n.hello {\n  color: green;\n  font-family: monospace;\n}' },
};

function matchingLesson(source: Lesson, target: Language) {
  const aliases: Record<string, string[]> = {
    "Choose let or const": ["Use changeable and fixed values"],
    "Use changeable and fixed values": ["Choose let or const"],
    "Print the current date and time": ["Show the current date and time"],
    "Show the current date and time": ["Print the current date and time"],
    "Use one function inside another": ["Send a value back with return"],
    "Send a value back with return": ["Use one function inside another"],
    "Repeat input until the answer is correct": ["Use a button instead of while (true)"],
    "Use a button instead of while (true)": ["Repeat input until the answer is correct"],
    "Give one element a unique name": ["Style one unique element"],
    "Style one unique element": ["Give one element a unique name"],
  };
  return lessons[target].find(item => item.title === source.title)
    ?? lessons[target].find(item => aliases[source.title]?.includes(item.title));
}

function LanguageComparison({ language, lesson, onClose }: { language: Language; lesson: Lesson; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<Language>(language === "javascript" ? "cpp" : "javascript");
  const [pickedTitle, setPickedTitle] = useState("");
  const equivalent = matchingLesson(lesson, target);
  const other = lessons[target].find(item => item.title === pickedTitle) ?? equivalent;
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => { setPickedTitle(""); }, [lesson, target]);
  return <dialog ref={dialog} className="language-comparison" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="language-comparison-title">
    <div className="language-comparison-head"><h2 id="language-comparison-title">Compare code</h2><button onClick={onClose} aria-label="Close language comparison">×</button></div>
    <div className="language-comparison-controls"><div className="compare-language-choices"><span>Compare {languageName(language)} with</span><div role="group" aria-label="Comparison language">{(Object.keys(lessons) as Language[]).filter(item => item !== language).map(item => <button key={item} aria-pressed={target === item} onClick={() => { setTarget(item); setPickedTitle(""); }}>{languageName(item)}</button>)}</div></div>
      {!equivalent && <p>{target === "html" || target === "css" || language === "html" || language === "css" ? "HTML describes page content and CSS styles it; they do not have a direct equivalent for every programming task." : "There is no matching lesson for this topic yet."} Choose an example below to view alongside your lesson.</p>}
      <details key={target} className="compare-example-picker"><summary><span>Example</span><b>{other?.title ?? "Choose an example"}</b><span className="example-picker-hint">Change</span></summary><div className="compare-example-list" role="group" aria-label={`${languageName(target)} examples`}>{lessons[target].map((item, i) => <button key={item.title} aria-pressed={other?.title === item.title} onClick={event => { setPickedTitle(item.title); const picker = event.currentTarget.closest("details"); if (picker) { picker.open = false; picker.querySelector("summary")?.focus(); } }}><span>{String(i + 1).padStart(2, "0")}</span><b>{item.title}</b>{other?.title === item.title && <span aria-hidden="true">✓</span>}</button>)}</div></details>
      {other && other !== equivalent && <p>These examples cover different topics.</p>}
    </div>
    <div className="language-comparison-columns">
      <section><h3>{languageName(language)}</h3><b>{lesson.title}</b><pre><code><HighlightedCode code={lesson.answer} language={language} /></code></pre><p>{lesson.explanation}</p></section>
      <section><h3>{languageName(target)}</h3>{other ? <><b>{other.title}</b><pre><code><HighlightedCode code={other.answer} language={target} /></code></pre><p>{other.explanation}</p>{target === "cpp" && <CppSetupGuide key={other.title} lesson={other} />}{other.runHint && <p>{other.runHint}</p>}</> : <p>Select an example to show its code here.</p>}</section>
    </div>
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [showGuide, setShowGuide] = useState(true);
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
    if (mobile.matches) setNavOpen(false);
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
  const ghostSource = current ? withoutGuideComments(current.answer, language ?? "javascript") : "";
  const visibleGhost = ghostSource.slice(0, ghostLength);
  const guideCode = alignedGuide(code, visibleGhost);
  const breakdownIndex = language && current ? Object.keys(breakdowns[language]).map(Number).find(key => breakdownLessonTitles[language][key] === current.title) ?? index : index;
  const breakdown = language
    ? current?.parts?.length ? current.parts : current?.referenceKind === "comparisons" ? undefined
      : ((current?.title === "Mark a value as not ready yet") && nullBreakdowns[language])
      || ((current?.title === "Create and use a class") && classBreakdowns[language])
      || ((current?.title === "Let names beginning with J enter") && regexBreakdowns[language])
      || ((current?.title === "Make and search a names array" && language === "javascript") && namesArrayBreakdown)
      || ((current?.title === "Choose a random word" && language === "javascript") && randomWordBreakdown)
      || ((current?.title === "Remove duplicate names") && setsBreakdowns[language])
      || breakdowns[language][breakdownIndex]
    : undefined;
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
      if (position >= ghostSource.length) return;
      const character = ghostSource[position - 1];
      const rhythm = character === "\n" ? 24 : /[.,;{}]/.test(character) ? 11 : 5 + (position % 3) * 2;
      typingTimer = setTimeout(typeGhostCharacter, rhythm);
    };
    const delay = setTimeout(typeGhostCharacter, 180);
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
      if (codePosition < demoCode.length) timer = setTimeout(typeCode, demoCode[codePosition - 1] === "\n" ? 28 : 10);
      else timer = setTimeout(typeOutput, 160);
    };
    timer = setTimeout(typeCode, 220);
    return () => clearTimeout(timer);
  }, [language, homeDemoLanguage]);

  const lineNumbers = useMemo(() => Array.from({ length: Math.max(8, code.split("\n").length) }, (_, i) => i + 1), [code]);

  function openCourse(next: Language) {
    setLanguage(next);
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
        <header className="home-nav"><div className="brand"><span className="brand-mark">&gt;_</span> Code<span>Step</span></div><div className="home-actions"><div className="nav-note">LEARN BY TYPING</div><button className="settings-button" onClick={() => setSettingsOpen(true)}>⚙ <span>Settings</span></button></div></header>
        <section className="hero">
          <div className="terminal-card" aria-hidden="true">
            <div className="terminal-top"><i/><i/><i/><span>{languageName(homeDemoLanguage)} · {homeDemos[homeDemoLanguage].file}</span></div>
            <div className="terminal-code"><div className="terminal-lines">{homeDemoCode.split("\n").map((_, i) => <small key={i}>{i + 1}</small>)}</div><pre><code><HighlightedCode code={homeDemoCode.slice(0, homeCodeLength)} language={homeDemoLanguage} /></code></pre></div>
            <div className="terminal-output"><span>›</span> {homeDemoOutput.slice(0, homeOutputLength)}<i>▋</i></div>
            <div className="success-pill"><span>✓</span><div><b>Nice work!</b><small>Your code ran successfully</small></div></div>
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
            <button className="course-card cpp-card" onClick={() => openCourse("cpp")}>
              <div className="course-icon">C++</div><div className="course-count">{lessons.cpp.length} LESSONS</div>
              <h3>C++</h3><p>Practice console programs, functions, classes, and collections.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: (completed.cpp / lessons.cpp.length * 100) + "%"}} /></div></div>
            </button>
            <button className="course-card python-card" onClick={() => openCourse("python")}>
              <div className="course-icon">PY</div><div className="course-count">{lessons.python.length} LESSONS</div>
              <h3>Python</h3><p>Practice input, functions, classes, and collections with clear examples.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: (completed.python / lessons.python.length * 100) + "%"}} /></div></div>
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
      <SettingsPanel open={settingsOpen} themeMode={themeMode} showGuide={showGuide} colourTyping={colourTyping} blockMode={blockMode} onBlockModeChange={changeBlockMode} onThemeChange={setThemeMode} onGuideChange={setShowGuide} onColourTypingChange={setColourTyping} onClose={() => setSettingsOpen(false)} />
      </>
    );
  }

  return (
    <>
    {comparisonOpen && <LanguageComparison language={language} lesson={current!} onClose={() => setComparisonOpen(false)} />}
    <main className="lesson-shell">
      <header className="lesson-nav">
        <div className="lesson-brand-group"><button className="drawer-toggle" onClick={() => setNavOpen((open) => !open)} aria-label={navOpen ? "Close lesson list" : "Open lesson list"} aria-expanded={navOpen}><span>☰</span></button><button className="brand brand-button" onClick={() => setLanguage(null)}><span className="brand-mark">&gt;_</span> Code<span>Step</span></button></div>
        <div className="lesson-progress"><div><span>{languageName(language)} path</span><b>{index + 1} / {lessons[language].length}</b></div><div className="progress-track"><i style={{width: `${Math.max(progress, 4)}%`}} /></div></div>
        <div className="lesson-actions"><button className="settings-button" onClick={() => setSettingsOpen(true)}>⚙ <span>Settings</span></button><button className="exit-button" onClick={() => setLanguage(null)}>Exit lesson ×</button></div>
      </header>
      <div className={`lesson-layout ${navOpen ? "drawer-open" : "drawer-closed"}`}>
        <aside className="lesson-drawer" aria-label="Lesson list">
          <div className="drawer-head"><span>{languageBadge(language)}</span><div><small>LEARNING PATH</small><b>{languageName(language)}</b></div></div>
          <div className="drawer-summary"><div><span>{completed[language]} of {lessons[language].length} completed</span><b>{Math.round(completed[language] / lessons[language].length * 100)}%</b></div><div className="drawer-progress"><i style={{width: `${completed[language] / lessons[language].length * 100}%`}} /></div></div>
          <nav className="drawer-lessons">
            {lessons[language].map((lesson, lessonIndex) => (
              <button key={lesson.title} className={`tone-${lessonTone(lesson)} ${lessonIndex === index ? "active" : ""} ${lessonIndex < completed[language] ? "done" : ""}`} onClick={() => { setIndex(lessonIndex); if (window.innerWidth <= 850) setNavOpen(false); }}>
                <span className="lesson-state">{lessonIndex + 1}</span><span><small>{lesson.eyebrow.split("·")[1]}</small><b>{lesson.title}</b></span><i>›</i>
              </button>
            ))}
          </nav>
          <button className="drawer-home" onClick={() => setLanguage(null)}>← Choose another language</button>
        </aside>
        {navOpen && <button className="drawer-backdrop" aria-label="Close lesson list" onClick={() => setNavOpen(false)} />}
        <aside className="lesson-copy">
          <button className="back-link" onClick={() => index ? setIndex(index - 1) : setLanguage(null)}>← Back</button>
          <div className="lesson-number">{String(index + 1).padStart(2, "0")} · {current!.eyebrow.split("·")[1]}</div>
          <h1>{current!.title}</h1>
          <p>{current!.explanation}</p>
          <button className="compare-language-button" onClick={() => setComparisonOpen(true)}>Compare with another language</button>
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
            <p>C# is a separate language from JavaScript and C++. Use the .NET SDK and a console project: <code>dotnet new console</code>, then <code>dotnet run</code>.</p>
            <p>Declare types with <code>string</code> (text), <code>int</code> (whole numbers), <code>double</code> (decimals), and <code>bool</code> (true/false). <code>var</code> infers a fixed type from the initial value; it does not let that type change.</p>
            <p>Names are case-sensitive: <code>Console.WriteLine</code> prints and <code>Console.ReadLine()</code> reads text, possibly null. End statements with <code>;</code>. Use <code>==</code> to compare and <code>=</code> to assign. C# has no JavaScript <code>===</code>.</p>
            <p>Use <code>using System;</code> to bring library names into scope when needed. Modern console projects include common imports automatically. Top-level examples go in Program.cs; class examples include their own Main entry point, so replace the file rather than combining both styles.</p>
          </details>}
          {language === "javascript" && current!.title === "Choose let or const" && <section className="variable-examples" aria-label="Changeable and fixed variables">
            <article className="reference-card"><div className="reference-head"><b>let · can be reassigned</b></div><pre><code><HighlightedCode language="javascript" code={'let name = prompt ("Enter your name: ");\nconsole.log(`hello ${name}`);\n// this variable is changeable'} /></code></pre><p>Later, <code>name = "Sam";</code> is allowed. Printing name again would use Sam.</p></article>
            <article className="reference-card"><div className="reference-head"><b>const · cannot be reassigned</b></div><pre><code><HighlightedCode language="javascript" code={'const name = prompt ("Enter your name: ");\nconsole.log(`hello ${name}`);\n// this variable is not changeable'} /></code></pre><p>Later, <code>name = "Sam";</code> causes an error. const prevents reassignment; arrays and objects can still have their contents changed.</p></article>
            <p>Run these examples separately. For this exercise, type the let example.</p>
          </section>}
          {current!.compareNode && <section className="runtime-guide" aria-label="Browser and Node input">
            <h2>The same name question in two places</h2>
            <h3>Browser · prompt()</h3><pre><code><HighlightedCode language="javascript" code={"let name = prompt(\"What is your name?\");\nconsole.log(`Hello ${name}`);"} /></code></pre>
            <h3>VS Code terminal · name.mjs</h3><pre><code><HighlightedCode language="javascript" code={"import { createInterface } from \"node:readline/promises\";\n\nconst input = createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nlet name = await input.question(\"What is your name?\");\nconsole.log(`Hello ${name}`);\n\ninput.close();"} /></code></pre>
            <p>Node needs a little setup before it can read terminal input. <code>await input.question()</code> waits for the answer. <code>input.close()</code> tells Node <b>“I’m done taking input.”</b> Call it when you finish asking questions.</p>
            <p>Save as <code>name.mjs</code>, open <b>Terminal → New Terminal</b> in VS Code, then enter <code>node name.mjs</code>. Type a name and press Enter. Use the terminal so you can type a reply.</p>
            <a href="/examples/name.mjs" download>Download name.mjs</a>
          </section>}
          {current!.runHint && <p className="run-hint">{current!.runHint}</p>}
          {(language === "cpp" || language === "python") && <details className="symbol-guide" open={index === 0}>
            <summary>Brackets and symbols</summary>
            <p><code>[]</code>   {language === "python" ? 'makes a list, such as ["Jaden", "Alex"], or retrieves an item, such as names[0].' : 'accesses an item, such as names[0]. A vector initializer uses braces: std::vector<std::string> names = {"Jaden", "Alex"};.'}</p>
            <p><code>{"{}"}</code>   {language === "python" ? 'creates a dictionary or a non-empty set. Python uses a colon and indentation for code blocks.' : 'groups a code block, class body, or initializer. Map entries are key/value pairs; C++ has no JavaScript-style object literal.'}</p>
            <p><code>()</code> holds function arguments {language === "cpp" ? 'and conditions.' : 'and can group expressions. Parentheses around an if condition are optional.'} Each nested function call has its own pair.</p>
            <p><code>{language === "python" ? "#" : "//"}</code> starts a comment.  {language === "python" ? 'Use four spaces for each block level; indentation is part of the program.' : '#include is a preprocessor directive that makes library declarations available.'}</p>
          </details>}
          {(language === "javascript" || language === "csharp") && <details className="symbol-guide" open={index === 0}>
            <summary>Brackets and symbols</summary>
            <table><thead><tr><th>Symbol</th><th>Called</th><th>Example</th></tr></thead><tbody>
              <tr><td><code>[]</code></td><td>Square brackets · array / lookup</td><td><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? '["Jaden", "Alex"]' : 'string[] names = { "Jaden", "Alex" };'} /></code></td></tr>
              <tr><td><code>{"{}"}</code></td><td>Curly braces · object / block</td><td><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? '{ name: "Jaden", age: 20 }' : 'new { Name = "Jaden", Age = 20 }'} /></code></td></tr>
              <tr><td><code>()</code></td><td>Parentheses · calls / conditions</td><td><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? 'console.log("Hello")' : 'Console.WriteLine("Hello")'} /></code></td></tr>
            </tbody></table>
            <p><code>[]</code> creates JavaScript arrays or accesses an item by position or key. In C#, <code>string[]</code> declares an array type; <code>names[0]</code> accesses its first item. A List can grow; an array has a fixed length.</p>
            <pre><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? 'let trains = ["Class 390", "Class 801"];' : 'string[] trains = { "Class 390", "Class 801" };'} /></code></pre>
            <p><code>()</code> holds function arguments and conditions. Each nested call has its own pair. Extra parentheses can group an expression; <code>((</code> has no special meaning for multiple functions.</p>
            <pre><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? 'console.log("Hello");\nif (speed > 100) { }' : 'Console.WriteLine("Hello");\nif (speed > 100) { }'} /></code></pre>
            <p><code>{"{}"}</code> groups a block of instructions. It also creates an object literal in JavaScript. In C#, braces can hold blocks, class bodies, or object and collection initializers.</p>
            <pre><code className="symbol-example"><HighlightedCode language={language} code={language === "javascript" ? 'if (speed > 100) {\n  console.log("Too fast!");\n}' : 'if (speed > 100) {\n  Console.WriteLine("Too fast!");\n}'} /></code></pre>
            <p><code>//</code> starts a comment that explains the code and is not executed. These speed examples show the bracket shapes; define speed before running them.</p>
          </details>}
          {breakdown && <section className="code-breakdown" aria-label="Code breakdown">
            <div className="breakdown-label">BREAK IT DOWN</div>
            <div className="breakdown-grid">{breakdown.map((part, partIndex) => <div className="breakdown-part" key={`${part.code}-${partIndex}`}>
              <code><HighlightedCode code={part.code} language={language} /></code><div><b>{part.name}</b><span>{part.meaning}</span></div>
            </div>)}</div>
          </section>}
          {current!.eyebrow.includes("Combined conditions") && <section className="comparison-guide speed-symbols" aria-label="Comparison and logical symbols">
            <h2>Symbols in this language</h2>
            {[
              [">", "Greater than", "True when the value on the left is larger."],
              ["<", "Less than", "True when the value on the left is smaller."],
              [">=", "Greater than or equal", "Includes the boundary value."],
              ["<=", "Less than or equal", "Includes the boundary value."],
              ["==", "Equal", language === "javascript" ? "Compares values after type conversion; usually use === in JavaScript." : "Checks whether the values are equal."],
              ["!=", "Not equal", language === "javascript" ? "Compares after type conversion; usually use !== in JavaScript." : "Checks whether the values differ."],
              ...(language === "javascript" ? [["===", "Strictly equal", "Checks equality without converting types."], ["!==", "Strictly not equal", "Checks inequality without converting types."]] : []),
              [language === "python" ? "and" : "&&", "AND", "Both conditions must be true. && is two ampersands."],
              [language === "python" ? "or" : "||", "OR", "At least one condition must be true. || is two vertical bars."],
              [language === "python" ? "not" : "!", "NOT", "Reverses true and false."],
              ["=", "Assignment", "Saves a value; it does not compare two values."],
            ].map(([symbol, name, meaning]) => <div key={symbol}><code>{symbol}</code><p><b>{name}</b><span>{meaning}</span></p></div>)}
            <p>{language === "python" ? "Python spells the logical operators and, or, and not. It does not use &&, ||, ===, or !==." : "&& combines conditions inside one check. To perform several actions, put each instruction on its own line inside the same body."}</p>
            <p>Change speed in this same program to 60 or 0 to explore the other branches. There is no second program to learn.</p>
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
            <div className="comment-card"><div className="comment-label">READ THE COMMENT</div><code>{current!.note}</code></div>
            <div className="tip">{blockMode ? "Tap or drag lesson blocks into your code, then choose Check code." : language === "python" ? "Type over the guide, then press Enter to check it. Python uses indentation for blocks; Tab inserts four spaces. Equivalent supported code is accepted." : "Type over the guide in the editor, then press Enter to check it. Equivalent supported code is accepted."}</div>
          </>}
        </aside>
        <section className={`workspace ${blockMode ? "blocks-workspace" : ""}`}>
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
            <div className="panel-bar"><div className="file-tab"><span>◆</span> {current!.fileName || challengeFile(language)}</div><div className="panel-actions"><button className="editor-mode-button" onClick={() => changeBlockMode(!blockMode)}>{blockMode ? "Use keyboard" : "Use blocks"}</button><button onClick={() => changeBlockCode(current!.starter || "")} title="Reset code">↻ Reset</button></div></div>
            {blockMode ? <CodeBlocks key={`${language}-${index}`} code={code} answer={ghostSource} onChange={changeBlockCode} renderCode={(value) => <HighlightedCode code={value} language={language} />} /> : <div className={`editor-body ${colourTyping ? "colour-typing" : ""} ${current!.starter && code === current!.starter ? "starter-only" : ""}`}><div className="line-numbers">{lineNumbers.map(n => <span key={n}>{n}</span>)}</div>{showGuide && <pre className={`code-guide ${current!.title === "Choose between several messages" ? "focused-guide" : ""}`} aria-hidden="true"><span>CODE GUIDE</span><code>{current!.title === "Choose between several messages" ? <LearningCode code={guideCode} language={language} caretIndex={-1} focusConditions /> : <HighlightedCode code={guideCode} language={language} />}</code></pre>}{colourTyping && <pre className="typed-code-layer" aria-hidden="true"><code><LearningCode code={code} starter={current!.starter} language={language} caretIndex={caretIndex} focusConditions={current!.title === "Choose between several messages"} /></code></pre>}<textarea aria-label="Code editor" spellCheck={false} value={code} onChange={(event) => {setCode(event.target.value); setCaretIndex(event.target.selectionStart); setStatus("idle")}} onSelect={(event) => setCaretIndex(event.currentTarget.selectionStart)} onKeyDown={handleEditorKeyDown} placeholder={showGuide ? "" : "// Type your code here..."} /></div>}
          </div>
          <div className="console-panel">
            <div className="console-bar"><span><i /> CONSOLE</span><button onClick={() => setStatus("idle")}>Clear</button></div>
            <div className="console-body">
              {status === "idle" && <span className="console-muted">Your program output will appear here...</span>}
              {status === "wrong" && <><SyntaxDiagnostic parts={diagnostic} /><div className="console-muted diagnostic-hint">Hover over or focus each underlined part to see what it means.</div></>}
              {status === "correct" && <><div className="run-line"><span>✓</span> Code accepted — {lessonCheck?.output ? "your output" : "example output"}</div><div className="typed-output">{current?.outputNote && <p className="console-muted">{current.outputNote}</p>}{typedOutput.split("\n").map((line, i, lines) => <div key={i} style={previewColours?.[i] ? { color: previewColours[i] } : undefined}><span className="prompt-mark">›</span> {line}{i === lines.length - 1 && <i className="output-cursor">▋</i>}{line && current?.outputAnnotations?.[i] && <span className="output-time-annotation">{current.outputAnnotations[i]}</span>}</div>)}</div></>}
            </div>
          </div>
          <div className={`feedback ${status}`}>
            <div>{status === "correct" ? <><span className="feedback-icon">✓</span><p><b>That’s correct!</b><small>{blockMode ? "Choose the next lesson when you’re ready." : "Press Enter again or choose the next lesson."}</small></p></> : status === "wrong" ? <><span className="feedback-icon">!</span><p><b>{lessonCheck?.kind === "syntax" ? "Check the syntax" : "Not verified yet"}</b><small>{lessonCheck?.kind === "syntax" ? "Review the parser’s message above." : "Check the lesson requirements. This checker may not recognise every valid approach."}</small></p></> : <p><b>Ready to run?</b><small>{blockMode ? "Arrange your blocks, then choose Check code." : "Use your own approach, then choose Check code."}</small></p>}</div>
            {status === "correct" ? <button onClick={nextLesson}>{index === lessons[language].length - 1 ? "Finish path" : "Next lesson"} →</button> : <button onClick={checkCode} disabled={!code.trim() || checking}>{checking ? "Checking…" : "▶ Check code"}</button>}
          </div>
          </>}
        </section>
      </div>
    </main>
    <SettingsPanel open={settingsOpen} themeMode={themeMode} showGuide={showGuide} colourTyping={colourTyping} blockMode={blockMode} onBlockModeChange={changeBlockMode} onThemeChange={setThemeMode} onGuideChange={setShowGuide} onColourTypingChange={setColourTyping} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
