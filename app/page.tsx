"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "javascript" | "csharp" | "html";
type Lesson = {
  title: string;
  eyebrow: string;
  explanation: string;
  note: string;
  prompt: string;
  starter?: string;
  answer: string;
  output: string[];
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
      eyebrow: "02 · Variables",
      title: "Remember a value",
      explanation: "let creates a variable—a labelled place to keep a value. prompt asks the user a question and saves their answer.",
      note: "// Ask for a name and greet the user",
      prompt: "Create a name variable, then print Hello with a template string.",
      answer: 'let name = prompt("What is your name?");\nconsole.log(`Hello ${name}`);',
      output: ["What is your name?  →  Alex", "Hello Alex"],
    },
    {
      eyebrow: "03 · Console",
      title: "Clear the screen",
      explanation: "The console is where your text program shows its output. console.clear() removes everything currently shown there.",
      note: "// Clear all previous console output",
      prompt: "Write the single line that clears the console.",
      answer: "console.clear();",
      output: ["Console cleared."],
    },
    {
      eyebrow: "04 · Decisions",
      title: "Check an answer",
      explanation: "if checks whether a condition is true. Its braces contain the code to run when it is true; else handles everything else.",
      note: "// Check whether 1 + 1 equals 2",
      prompt: "Complete the if / else check and print the right message.",
      answer: 'let answer = prompt("What is 1 + 1?");\n\nif (answer == "2") {\n  console.log("Correct!");\n} else {\n  console.log("Incorrect! The answer is 2.");\n}',
      output: ["What is 1 + 1?  →  2", "Correct!"],
    },
    {
      eyebrow: "05 · Arrays",
      title: "Keep a list",
      explanation: "A JavaScript list is called an array. Square brackets hold its items, and a for...of loop visits each item one at a time.",
      note: "// Store three fruits, then print each one",
      prompt: "Create the fruits array and loop through it.",
      answer: 'let fruits = ["Apple", "Banana", "Orange"];\n\nfor (let fruit of fruits) {\n  console.log(fruit);\n}',
      output: ["Apple", "Banana", "Orange"],
    },
    {
      eyebrow: "06 · Array positions",
      title: "Pick one item",
      explanation: "Arrays count from zero. That means position 0 is the first item, position 1 is the second, and so on.",
      note: "// Print the first item from fruits",
      prompt: "Use its position to print Apple from the fruits array.",
      starter: 'let fruits = ["Apple", "Banana", "Orange"];\n',
      answer: 'let fruits = ["Apple", "Banana", "Orange"];\nconsole.log(fruits[0]);',
      output: ["Apple"],
    },
    {
      eyebrow: "07 · Objects",
      title: "Give values names",
      explanation: "Objects keep related values under named keys. Here, BMW and Ford are keys, and each car has a colour property.",
      note: "// Look up a car brand and print its colour",
      prompt: "Create the cars object and safely show the chosen car.",
      answer: 'let cars = {\n  BMW: { colour: "Blue" },\n  Ford: { colour: "Red" }\n};\n\nlet brand = prompt("Enter BMW or Ford:");\n\nif (cars[brand]) {\n  console.log("Brand: " + brand);\n  console.log("Colour: " + cars[brand].colour);\n} else {\n  console.log("Car not found");\n}',
      output: ["Enter BMW or Ford:  →  BMW", "Brand: BMW", "Colour: Blue"],
    },
    {
      eyebrow: "08 · Timers",
      title: "Run code later",
      explanation: "setTimeout schedules a function to run after a delay. The delay is measured in milliseconds, so 1000 means one second.",
      note: "// Print One, Two, and Three one second apart",
      prompt: "Schedule each message with the correct delay.",
      answer: 'setTimeout(() => console.log("One"), 1000);\nsetTimeout(() => console.log("Two"), 2000);\nsetTimeout(() => console.log("Three"), 3000);',
      output: ["One", "Two", "Three"],
    },
    {
      eyebrow: "09 · Date and time",
      title: "Get the current moment",
      explanation: "new Date() creates a Date object containing the current date and time from the device running the code. console.log then displays that value.",
      note: "// Create the current date and time, then print it",
      prompt: "Store a new Date in currentDateTime and show it in the console.",
      answer: "const currentDateTime = new Date();\nconsole.log(currentDateTime);",
      output: ["Thu Aug 06 2026 19:05:00 GMT+0100 (British Summer Time)"],
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
      eyebrow: "02 · Variables",
      title: "Remember a value",
      explanation: "string tells C# that a variable holds text. Console.ReadLine asks for input, and the answer can be stored in that variable for later.",
      note: "// Ask for a name and greet the user",
      prompt: "Create a name variable, then print Hello with an interpolated string.",
      answer: 'Console.WriteLine("What is your name?");\nstring name = Console.ReadLine();\nConsole.WriteLine($"Hello {name}");',
      output: ["What is your name?  →  Ada", "Hello Ada"],
    },
    {
      eyebrow: "03 · Console",
      title: "Clear the screen",
      explanation: "The console is where a C# text program shows its output. Console.Clear() removes everything currently shown there.",
      note: "// Clear all previous console output",
      prompt: "Write the single line that clears the console.",
      answer: "Console.Clear();",
      output: ["Console cleared."],
    },
    {
      eyebrow: "04 · Decisions",
      title: "Check an answer",
      explanation: "if checks whether a condition is true. Its braces contain the code to run when it is true; else handles everything else.",
      note: "// Check whether 1 + 1 equals 2",
      prompt: "Complete the if / else check and print the right message.",
      answer: 'Console.WriteLine("What is 1 + 1?");\nstring answer = Console.ReadLine();\n\nif (answer == "2") {\n  Console.WriteLine("Correct!");\n} else {\n  Console.WriteLine("Incorrect! The answer is 2.");\n}',
      output: ["What is 1 + 1?  →  2", "Correct!"],
    },
    {
      eyebrow: "05 · Arrays",
      title: "Keep a list",
      explanation: "A C# array keeps several values of the same type. Square brackets mark the array, and a foreach loop visits each item one at a time.",
      note: "// Store three fruits, then print each one",
      prompt: "Create the fruits array and loop through it.",
      answer: 'string[] fruits = { "Apple", "Banana", "Orange" };\n\nforeach (string fruit in fruits) {\n  Console.WriteLine(fruit);\n}',
      output: ["Apple", "Banana", "Orange"],
    },
    {
      eyebrow: "06 · Array positions",
      title: "Pick one item",
      explanation: "C# arrays count from zero. That means position 0 is the first item, position 1 is the second, and so on.",
      note: "// Print the first item from fruits",
      prompt: "Use its position to print Apple from the fruits array.",
      starter: 'string[] fruits = { "Apple", "Banana", "Orange" };\n',
      answer: 'string[] fruits = { "Apple", "Banana", "Orange" };\nConsole.WriteLine(fruits[0]);',
      output: ["Apple"],
    },
    {
      eyebrow: "07 · Objects",
      title: "Give values names",
      explanation: "C# objects keep related values in named properties. Here, an anonymous object groups a car's Brand and Colour together.",
      note: "// Create a car object and print its properties",
      prompt: "Create the car object, then print its brand and colour.",
      answer: 'var car = new { Brand = "BMW", Colour = "Blue" };\n\nConsole.WriteLine($"Brand: {car.Brand}");\nConsole.WriteLine($"Colour: {car.Colour}");',
      output: ["Brand: BMW", "Colour: Blue"],
    },
    {
      eyebrow: "08 · Timers",
      title: "Run code later",
      explanation: "Task.Delay pauses asynchronous C# code for a number of milliseconds. Using await lets each message appear after another one-second delay.",
      note: "// Print One, Two, and Three one second apart",
      prompt: "Wait one second before printing each message.",
      answer: 'await Task.Delay(1000);\nConsole.WriteLine("One");\n\nawait Task.Delay(1000);\nConsole.WriteLine("Two");\n\nawait Task.Delay(1000);\nConsole.WriteLine("Three");',
      output: ["One", "Two", "Three"],
    },
    {
      eyebrow: "09 · Date and time",
      title: "Get the current moment",
      explanation: "DateTime.Now gets the computer's current local date and time. Storing it in currentDateTime lets the program use or display that moment later.",
      note: "// Get the current date and time, then print it",
      prompt: "Store DateTime.Now in currentDateTime and show it in the console.",
      answer: "DateTime currentDateTime = DateTime.Now;\nConsole.WriteLine(currentDateTime);",
      output: ["06/08/2026 19:05:00"],
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
      explanation: "The html element wraps the whole page. Most elements use an opening tag and a closing tag; the forward slash marks the closing tag.",
      note: "<!-- Wrap the page in opening and closing html tags -->",
      prompt: "Create the outer html element.",
      answer: "<html>\n</html>",
      output: ["Page wrapper created."],
    },
    {
      eyebrow: "03 · Head and title",
      title: "Name the browser tab",
      explanation: "The head holds information about the page rather than visible page content. The title inside it supplies the text shown on the browser tab.",
      note: "<!-- Add a title inside the head section -->",
      prompt: "Create the head and give the page a title.",
      answer: "<head>\n  <title>My page</title>\n</head>",
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
      eyebrow: "05 · Background colour",
      title: "Style the page background",
      explanation: "The style attribute adds CSS directly to an HTML element. background-color chooses the colour behind everything inside the body.",
      note: "<!-- Give the page a light-blue background -->",
      prompt: "Add a background colour to the body tag.",
      answer: '<body style="background-color: lightblue;">\n</body>',
      output: ["The page background is light blue."],
    },
    {
      eyebrow: "06 · Headings",
      title: "Create a heading hierarchy",
      explanation: "Headings organise the page. h1 is the main heading; h2 introduces a major section; h3 and h4 create smaller subsections below it.",
      note: "<!-- Add a main heading and a section heading -->",
      prompt: "Create an h1 followed by an h2.",
      answer: "<h1>Main heading</h1>\n<h2>Main section</h2>",
      output: ["Main heading", "Main section"],
    },
    {
      eyebrow: "07 · Links",
      title: "Open another page",
      explanation: "The a element creates a link. Its href attribute stores the destination, while the text between the tags is what the visitor clicks.",
      note: "<!-- Link to a second HTML page -->",
      prompt: "Create a link to page.html.",
      answer: '<a href="page.html">Open page</a>',
      output: ["Open page  →  page.html"],
    },
    {
      eyebrow: "08 · Text and colour",
      title: "Style a heading",
      explanation: "A paragraph uses p tags for normal text. The color CSS property changes the foreground text colour; here it is applied to a heading through style.",
      note: "<!-- Create a red heading and a paragraph -->",
      prompt: "Add the styled heading and paragraph.",
      answer: '<h1 style="color: red;">Red Title</h1>\n<p>This is a paragraph.</p>',
      output: ["Red Title", "This is a paragraph."],
    },
    {
      eyebrow: "09 · Centred text section",
      title: "Build a centred text section",
      explanation: "A section groups related content. text-align: center centres the text inside that whole section, while h1, h2, h5, and h6 demonstrate different heading levels and strong marks important text as bold.",
      note: "<!-- Group several heading levels and bold text in one centred section -->",
      prompt: "Create the centred section with four heading levels and bold text.",
      answer: '<section style="text-align: center;">\n  <h1>Main heading</h1>\n  <h2>Section heading</h2>\n  <h5>Small heading</h5>\n  <h6>Smallest heading</h6>\n  <strong>Bold text</strong>\n</section>',
      output: ["Main heading", "Section heading", "Small heading", "Smallest heading", "Bold text — all centred"],
    },
    {
      eyebrow: "10 · JavaScript in HTML",
      title: "Show the current date and time",
      explanation: "The script element lets an HTML page run JavaScript. new Date() creates the current date and time, and console.log displays it in the browser's developer console.",
      note: "<!-- Run JavaScript from inside the HTML page -->",
      prompt: "Put the date-and-time code inside a script element.",
      answer: "<script>\n  const currentDateTime = new Date();\n  console.log(currentDateTime);\n</script>",
      output: ["Current date and time printed in the browser console."],
    },
  ],
};

type CodePart = { code: string; name: string; meaning: string };

const breakdowns: Record<Language, Partial<Record<number, CodePart[]>>> = {
  javascript: {
    0: [{ code: "function", name: "Create", meaning: "Starts a reusable block of code." }, { code: "correct()", name: "Name", meaning: "Names the function so you can call it later." }, { code: "{ ... }", name: "Instructions", meaning: "Holds the code the function will run." }, { code: "correct();", name: "Call it", meaning: "Runs the function you created." }],
    1: [{ code: "let", name: "Create", meaning: "Makes a variable that can remember something." }, { code: "name", name: "Label", meaning: "The name used to find the saved value later." }, { code: "prompt( ... )", name: "Ask", meaning: "Shows a question and returns the user's answer." }, { code: "=", name: "Save", meaning: "Puts the answer from prompt into name." }],
    3: [{ code: "if ( ... )", name: "Check", meaning: "Runs a block only when its condition is true." }, { code: 'answer == "2"', name: "Condition", meaning: "Compares the saved answer with 2." }, { code: "else", name: "Otherwise", meaning: "Runs when the condition is false." }],
    4: [{ code: "[ ... ]", name: "Array", meaning: "Keeps several values together in one list." }, { code: "for ... of", name: "Loop", meaning: "Visits every item in the array." }, { code: "fruit", name: "Current item", meaning: "Temporarily holds the item being visited." }],
    6: [{ code: "{ key: value }", name: "Object", meaning: "Groups values under names such as BMW and Ford." }, { code: "cars[brand]", name: "Look up", meaning: "Uses brand to find the matching car." }, { code: ".colour", name: "Property", meaning: "Selects the colour stored on that car." }],
    7: [{ code: "setTimeout", name: "Schedule", meaning: "Asks JavaScript to run some code later." }, { code: "() => ...", name: "Code to run", meaning: "A short function waiting inside the timer." }, { code: "1000", name: "Delay", meaning: "One thousand milliseconds means one second." }],
    8: [{ code: "const", name: "Fixed variable", meaning: "Creates a variable that will not be reassigned." }, { code: "new Date()", name: "Current moment", meaning: "Creates a Date using the device's current date and time." }, { code: "console.log", name: "Display", meaning: "Shows the stored Date in the console." }],
  },
  csharp: {
    0: [{ code: "void", name: "Result type", meaning: "Says this method does not send a value back." }, { code: "Correct()", name: "Name", meaning: "Names the method so you can call it later." }, { code: "{ ... }", name: "Instructions", meaning: "Holds the code the method will run." }, { code: "Correct();", name: "Call it", meaning: "Runs the method you created." }],
    1: [{ code: "string", name: "Type", meaning: "Says this variable will store text." }, { code: "name", name: "Label", meaning: "The name used to find the saved text later." }, { code: "Console.ReadLine()", name: "Read", meaning: "Waits for the user to type an answer." }, { code: "=", name: "Save", meaning: "Puts that answer into name." }],
    3: [{ code: "if ( ... )", name: "Check", meaning: "Runs a block only when its condition is true." }, { code: 'answer == "2"', name: "Condition", meaning: "Compares the saved answer with 2." }, { code: "else", name: "Otherwise", meaning: "Runs when the condition is false." }],
    4: [{ code: "string[]", name: "Array type", meaning: "Says fruits is a list of text values." }, { code: "foreach", name: "Loop", meaning: "Visits every item in the array." }, { code: "fruit", name: "Current item", meaning: "Temporarily holds the item being visited." }],
    6: [{ code: "var car", name: "Variable", meaning: "Creates a place named car for the object." }, { code: "new { ... }", name: "Object", meaning: "Groups related values into one thing." }, { code: "car.Brand", name: "Property", meaning: "Reads the Brand value stored on car." }],
    7: [{ code: "Task.Delay", name: "Timer", meaning: "Creates a pause for a number of milliseconds." }, { code: "1000", name: "Duration", meaning: "One thousand milliseconds means one second." }, { code: "await", name: "Wait", meaning: "Pauses here before moving to the next line." }],
    8: [{ code: "DateTime", name: "Type", meaning: "Represents a date and a time in C#." }, { code: "DateTime.Now", name: "Current moment", meaning: "Reads the computer's current local date and time." }, { code: "Console.WriteLine", name: "Display", meaning: "Shows the stored value in the console." }],
  },
  html: {
    0: [{ code: "<!DOCTYPE", name: "Declaration", meaning: "Tells the browser what kind of document follows." }, { code: "html", name: "Modern HTML", meaning: "Selects the current HTML standard." }],
    1: [{ code: "<html>", name: "Opening tag", meaning: "Marks where the HTML page begins." }, { code: "</html>", name: "Closing tag", meaning: "The slash marks where that element ends." }],
    2: [{ code: "<head>", name: "Page information", meaning: "Contains information used by the browser." }, { code: "<title>", name: "Tab title", meaning: "Sets the words shown on the browser tab." }, { code: "</title>", name: "Close title", meaning: "The slash ends the title element." }],
    3: [{ code: "<body>", name: "Visible content", meaning: "Starts the part visitors can see." }, { code: "</body>", name: "End content", meaning: "Closes the visible page area." }],
    4: [{ code: "style=", name: "Style attribute", meaning: "Adds CSS rules directly to this element." }, { code: "background-color", name: "CSS property", meaning: "Chooses the colour behind the content." }, { code: "lightblue", name: "CSS value", meaning: "The particular background colour to use." }, { code: ";", name: "Rule ending", meaning: "Marks the end of this CSS instruction." }],
    5: [{ code: "h1", name: "Main heading", meaning: "The page's most important heading." }, { code: "h2", name: "Section heading", meaning: "Introduces a major section beneath the h1." }, { code: "</...>", name: "Closing tag", meaning: "Ends the heading so later text stays separate." }],
    6: [{ code: "<a>", name: "Anchor", meaning: "Creates a clickable link." }, { code: "href", name: "Destination", meaning: "Stores the page or address to open." }, { code: "Open page", name: "Link text", meaning: "The words the visitor clicks." }],
    7: [{ code: "color: red", name: "Text colour", meaning: "Changes the heading's foreground colour." }, { code: "<p>", name: "Paragraph", meaning: "Wraps a block of ordinary text." }, { code: "</p>", name: "Close paragraph", meaning: "Marks where the paragraph ends." }],
    8: [{ code: "<section>", name: "Content group", meaning: "Keeps a related part of the page together." }, { code: "text-align: center", name: "Centre text", meaning: "Centres the inline content inside the whole section." }, { code: "h1 — h6", name: "Heading levels", meaning: "Create a hierarchy from most to least important." }, { code: "<strong>", name: "Important text", meaning: "Marks text as important and normally displays it in bold." }],
    9: [{ code: "<script>", name: "JavaScript area", meaning: "Tells the browser that the code inside is JavaScript." }, { code: "const", name: "Fixed variable", meaning: "Creates a variable that will not be reassigned." }, { code: "new Date()", name: "Current moment", meaning: "Creates a Date using the device's current date and time." }, { code: "console.log", name: "Developer console", meaning: "Displays the value in the browser's developer tools." }],
  },
};

const normalize = (value: string) =>
  value.replace(/\/\/.*$/gm, "").replace(/\s+/g, "").replace(/'/g, '"').trim();

const languageName = (language: Language) => language === "javascript" ? "JavaScript" : language === "csharp" ? "C Sharp" : "HTML";
const languageBadge = (language: Language) => language === "javascript" ? "JS" : language === "csharp" ? "C#" : "HTML";
const challengeFile = (language: Language) => language === "javascript" ? "challenge.js" : language === "csharp" ? "Program.cs" : "index.html";

export default function Home() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const [navOpen, setNavOpen] = useState(true);
  const [completed, setCompleted] = useState<Record<Language, number>>({ javascript: 0, csharp: 0, html: 0 });

  const current = language ? lessons[language][index] : null;
  const breakdown = language ? breakdowns[language][index] : undefined;
  const progress = language ? Math.round((index / lessons[language].length) * 100) : 0;

  useEffect(() => {
    if (current) {
      setCode(current.starter || "");
      setStatus("idle");
    }
  }, [current]);

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
      <main className="home-shell">
        <header className="home-nav"><div className="brand"><span className="brand-mark">&gt;_</span> Code<span>Step</span></div><div className="nav-note">LEARN BY TYPING</div></header>
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
              <h3>HTML</h3><p>Build a web page with structure, headings, links, paragraphs, and colour.</p>
              <div className="course-bottom"><span>Start learning <b>→</b></span><div className="mini-progress"><i style={{width: `${completed.html / lessons.html.length * 100}%`}} /></div></div>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="lesson-shell">
      <header className="lesson-nav">
        <div className="lesson-brand-group"><button className="drawer-toggle" onClick={() => setNavOpen((open) => !open)} aria-label={navOpen ? "Close lesson list" : "Open lesson list"} aria-expanded={navOpen}><span>☰</span></button><button className="brand brand-button" onClick={() => setLanguage(null)}><span className="brand-mark">&gt;_</span> Code<span>Step</span></button></div>
        <div className="lesson-progress"><div><span>{languageName(language)} path</span><b>{index + 1} / {lessons[language].length}</b></div><div className="progress-track"><i style={{width: `${Math.max(progress, 4)}%`}} /></div></div>
        <button className="exit-button" onClick={() => setLanguage(null)}>Exit lesson ×</button>
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
              <code>{part.code}</code><div><b>{part.name}</b><span>{part.meaning}</span></div>
            </div>)}</div>
          </section>}
          <div className="comment-card"><div className="comment-label">READ THE COMMENT</div><code>{current!.note}</code></div>
          <div className="reference-card">
            <div className="reference-head"><div><span>STEP 1</span><b>Look at this code</b></div></div>
            <pre><code>{current!.answer}</code></pre>
          </div>
          <div className="tip"><span>↵</span> Copy or type the example into the editor, then press Enter to check it.</div>
        </aside>
        <section className="workspace">
          <div className="editor-panel">
            <div className="panel-bar"><div className="file-tab"><span>◆</span> {challengeFile(language)}</div><div className="panel-actions"><span>UTF-8</span><button onClick={() => setCode("")} title="Reset code">↻ Reset</button></div></div>
            <div className="editor-body"><div className="line-numbers">{lineNumbers.map(n => <span key={n}>{n}</span>)}</div><textarea aria-label="Code editor" spellCheck={false} value={code} onChange={(e) => {setCode(e.target.value); setStatus("idle")}} onKeyDown={(e) => { if (e.key === "Enter" && status === "correct") { e.preventDefault(); nextLesson(); } else if (e.key === "Enter" && normalize(code) === normalize(current!.answer)) { e.preventDefault(); checkCode(); } }} placeholder="// Type your code here..." /></div>
          </div>
          <div className="console-panel">
            <div className="console-bar"><span><i /> CONSOLE</span><button onClick={() => setStatus("idle")}>Clear</button></div>
            <div className="console-body">
              {status === "idle" && <span className="console-muted">Your program output will appear here...</span>}
              {status === "wrong" && <><div className="error-line">× Not quite yet.</div><div className="console-muted">Check the comment and look for missing punctuation, names, or brackets.</div></>}
              {status === "correct" && current!.output.map((line, i) => <div key={i}><span className="prompt-mark">›</span> {line}</div>)}
            </div>
          </div>
          <div className={`feedback ${status}`}>
            <div>{status === "correct" ? <><span className="feedback-icon">✓</span><p><b>That’s correct!</b><small>Press Enter again or choose the next lesson.</small></p></> : status === "wrong" ? <><span className="feedback-icon">!</span><p><b>Keep going</b><small>You’re close. Compare each symbol with the explanation.</small></p></> : <p><b>Ready to run?</b><small>When your code matches the example, press Enter.</small></p>}</div>
            {status === "correct" ? <button onClick={nextLesson}>{index === lessons[language].length - 1 ? "Finish path" : "Next lesson"} →</button> : <button onClick={checkCode} disabled={!code.trim()}>▶ Check code</button>}
          </div>
        </section>
      </div>
    </main>
  );
}
