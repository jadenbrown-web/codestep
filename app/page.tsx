"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "javascript" | "csharp";
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
  ],
  csharp: [
    {
      eyebrow: "01 · Output",
      title: "Write to the console",
      explanation: "C# console apps use Console.WriteLine to show a line of text. Every instruction ends with a semicolon.",
      note: "// Print Hello, world! to the console",
      prompt: "Write your first line of C#.",
      answer: 'Console.WriteLine("Hello, world!");',
      output: ["Hello, world!"],
    },
    {
      eyebrow: "02 · Variables",
      title: "Store some text",
      explanation: "string tells C# that a variable will hold text. Give the variable a name, then assign its value with =.",
      note: "// Store a name and print a greeting",
      prompt: "Create a string called name and greet Ada.",
      answer: 'string name = "Ada";\nConsole.WriteLine($"Hello {name}");',
      output: ["Hello Ada"],
    },
    {
      eyebrow: "03 · Input",
      title: "Ask the user",
      explanation: "Console.ReadLine waits for the user to type. The answer can be saved in a string variable for later.",
      note: "// Ask for and save the user's name",
      prompt: "Print the question, then read the answer into name.",
      answer: 'Console.WriteLine("What is your name?");\nstring name = Console.ReadLine();',
      output: ["What is your name?", "Ada"],
    },
    {
      eyebrow: "04 · Decisions",
      title: "Choose what happens",
      explanation: "An if statement runs its block when the condition is true. Two equals signs compare values; else provides the other path.",
      note: "// Check whether answer is 2",
      prompt: "Print Correct when answer equals 2, otherwise print Try again.",
      answer: 'if (answer == "2") {\n  Console.WriteLine("Correct!");\n} else {\n  Console.WriteLine("Try again.");\n}',
      output: ["Correct!"],
    },
  ],
};

const normalize = (value: string) =>
  value.replace(/\/\/.*$/gm, "").replace(/\s+/g, "").replace(/'/g, '"').trim();

export default function Home() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState<Record<Language, number>>({ javascript: 0, csharp: 0 });

  const current = language ? lessons[language][index] : null;
  const progress = language ? Math.round((index / lessons[language].length) * 100) : 0;

  useEffect(() => {
    if (current) {
      setCode(current.starter || "");
      setStatus("idle");
      setCopied(false);
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

  async function copyExample() {
    if (!current) return;
    await navigator.clipboard.writeText(current.answer);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
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
          <div className="hero-copy">
            <div className="kicker"><span /> Your coding journey starts here</div>
            <h1>Read it.<br />Type it. <em>Run it.</em></h1>
            <p>No long lectures. Learn one idea at a time, type the real code, and see it come alive in the console.</p>
            <div className="hero-meta"><span>⌨ Hands-on lessons</span><span>↗ Instant feedback</span></div>
          </div>
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
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="lesson-shell">
      <header className="lesson-nav">
        <button className="brand brand-button" onClick={() => setLanguage(null)}><span className="brand-mark">&gt;_</span> Code<span>Step</span></button>
        <div className="lesson-progress"><div><span>{language === "javascript" ? "JavaScript" : "C Sharp"} path</span><b>{index + 1} / {lessons[language].length}</b></div><div className="progress-track"><i style={{width: `${Math.max(progress, 4)}%`}} /></div></div>
        <button className="exit-button" onClick={() => setLanguage(null)}>Exit lesson ×</button>
      </header>
      <div className="lesson-layout">
        <aside className="lesson-copy">
          <button className="back-link" onClick={() => index ? setIndex(index - 1) : setLanguage(null)}>← Back</button>
          <div className="lesson-number">{current!.eyebrow}</div>
          <h1>{current!.title}</h1>
          <p>{current!.explanation}</p>
          <div className="comment-card"><div className="comment-label">READ THE COMMENT</div><code>{current!.note}</code></div>
          <div className="reference-card">
            <div className="reference-head"><div><span>STEP 1</span><b>Look at this code</b></div><button onClick={copyExample}>{copied ? "✓ Copied" : "Copy code"}</button></div>
            <pre><code>{current!.answer}</code></pre>
          </div>
          <div className="task-card"><div className="task-icon">⌨</div><div><b>Your turn</b><p>{current!.prompt}</p></div></div>
          <div className="tip"><span>i</span> Copy or type the example into the editor on the right, then check it.</div>
        </aside>
        <section className="workspace">
          <div className="editor-panel">
            <div className="panel-bar"><div className="file-tab"><span>◆</span> {language === "javascript" ? "challenge.js" : "Program.cs"}</div><div className="panel-actions"><span>UTF-8</span><button onClick={() => setCode("")} title="Reset code">↻ Reset</button></div></div>
            <div className="editor-body"><div className="line-numbers">{lineNumbers.map(n => <span key={n}>{n}</span>)}</div><textarea aria-label="Code editor" spellCheck={false} value={code} onChange={(e) => {setCode(e.target.value); setStatus("idle")}} placeholder="// Type your code here..." /></div>
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
            <div>{status === "correct" ? <><span className="feedback-icon">✓</span><p><b>That’s correct!</b><small>Your code ran successfully. Ready for the next step?</small></p></> : status === "wrong" ? <><span className="feedback-icon">!</span><p><b>Keep going</b><small>You’re close. Compare each symbol with the explanation.</small></p></> : <p><b>Ready to run?</b><small>Type the code described on the left, then check it.</small></p>}</div>
            {status === "correct" ? <button onClick={nextLesson}>{index === lessons[language].length - 1 ? "Finish path" : "Next lesson"} →</button> : <button onClick={checkCode} disabled={!code.trim()}>▶ Check code</button>}
          </div>
        </section>
      </div>
    </main>
  );
}
