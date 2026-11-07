export type BreakdownPart = { code: string; name: string; meaning: string };
type LessonContent = { title: string; eyebrow: string; answer: string; parts?: BreakdownPart[]; referenceKind?: string };

const cppTools: Record<string, [string, string]> = {
  iostream: ['Read and print text', 'Makes std::cout and std::cin available. This lesson uses them to print text or read keyboard input.'],
  string: ['Work with text', 'Makes std::string available for storing text. It also supports reading a whole line with std::getline.'],
  vector: ['Use a growing list', 'Makes std::vector available. A vector keeps several values together and can grow when you add more.'],
  map: ['Match keys to values', 'Makes std::map available. It lets you save a value under a key and look that value up later.'],
  set: ['Keep unique values', 'Makes std::set available. A set keeps one copy of each value and puts its values in order.'],
  algorithm: ['Search a collection', 'Makes tools such as std::find available. This lesson uses them to search through values.'],
  optional: ['Allow a missing value', 'Makes std::optional and std::nullopt available. They describe a value that may not have been set yet.'],
  random: ['Choose randomly', 'Makes random-number tools available. This lesson uses them to choose a position in a list.'],
  regex: ['Check a text pattern', 'Makes std::regex available. It checks whether text follows a pattern.'],
  filesystem: ['Work with files and folders', 'Makes std::filesystem available. It can read paths, list folders, and check for files. These examples need C++17 or newer.'],
  chrono: ['Describe a length of time', 'Makes time tools such as std::chrono::seconds available. seconds(2) describes a two-second wait.'],
  thread: ['Wait or run separate work', 'Makes thread tools available. sleep_for pauses the current work; std::thread can start another piece of work.'],
  ctime: ['Read the clock', 'Makes clock tools such as std::time and std::localtime available. They help read the current hour and minute.'],
  iomanip: ['Format the output', 'Makes tools such as std::put_time available for choosing how a time is printed.'],
};
const pythonTools: Record<string, [string, string]> = {
  time: ['Wait before continuing', 'Makes the time module available. A module is a collection of tools. This lesson uses time.sleep(2) to pause for two seconds.'],
  random: ['Choose randomly', 'Makes the random module available. This lesson uses random.choice(...) to pick an item from a list.'],
  re: ['Check a text pattern', 'Makes Python’s text-pattern tools available. This lesson uses re.search(...) to check whether text matches a pattern.'],
  threading: ['Run separate work', 'Makes threading.Thread available. It lets you start separate pieces of work and wait for them to finish.'],
  datetime: ['Read the date and time', 'Makes the datetime tool available from the datetime module. datetime.now() reads the current date and time.'],
  Path: ['Work with files and folders', 'Makes Path available from pathlib. Path(...) describes a file or folder, and its tools can check or list files.'],
};
const csharpTools: Record<string, [string, string]> = {
  System: ['Use common tools', 'Lets you use names such as Console and DateTime without writing System. before them. New .NET console projects often add this using automatically.'],
  'System.IO': ['Work with files and folders', 'Lets you use Path, File, and Directory without writing System.IO. before each name. This lesson uses them to work with file paths or folders.'],
  'System.Text.RegularExpressions': ['Check a text pattern', 'Lets you use Regex and RegexOptions. They check whether text follows a pattern, such as starting with a particular letter.'],
  'System.Threading': ['Run separate work', 'Lets you use Thread. A thread can run a separate piece of work; Join() waits for it to finish.'],
};
const nodeTools: Record<string, [string, string]> = {
  'node:path': ['Read a file path', 'Makes tools such as basename available. basename(...) gets the filename from a longer path.'],
  'node:fs': ['Work with files and folders', 'Makes the named file tools available. readdirSync lists a folder; existsSync and statSync check a path.'],
  'node:readline/promises': ['Read a terminal reply', 'Makes createInterface available. It connects your program to terminal input so it can ask a question and wait for a reply.'],
};

export function importBreakdown(lesson: LessonContent, language: string): BreakdownPart[] {
  const result: BreakdownPart[] = [];
  for (const line of lesson.answer.split('\n')) {
    const code = line.trim();
    let entry: [string, string] | undefined;
    if (language === 'cpp') {
      const match = code.match(/^#include\s*<([^>]+)>/);
      if (!match) continue;
      entry = cppTools[match[1]] ?? ['Add library tools', 'Makes the tools described by this header available to this file. A header lists tools the compiler can use; it does not install them.'];
      result.push({ code: match[0], name: entry[0], meaning: entry[1] });
    } else if (language === 'python') {
      const match = code.match(/^(?:import\s+(\w+)|from\s+(\w+)\s+import\s+(\w+))/);
      if (!match) continue;
      entry = pythonTools[match[3] ?? match[1]] ?? ['Add Python tools', 'Makes this module or its named tool available so the program can use it.'];
      result.push({ code: match[0], name: entry[0], meaning: entry[1] });
    } else if (language === 'csharp') {
      const match = code.match(/^using\s+([\w.]+);/);
      if (!match) continue;
      entry = csharpTools[match[1]] ?? ['Use library names', 'Lets you use the names in this group without writing the group’s full name each time.'];
      result.push({ code: match[0], name: entry[0], meaning: entry[1] });
    } else if (language === 'javascript') {
      const match = code.match(/^import\s+.*?from\s+["']([^"']+)["'];?/);
      if (!match) continue;
      entry = nodeTools[match[1]] ?? ['Add tools from another file', 'Makes the named tools from this module available in this file.'];
      result.push({ code: match[0], name: entry[0], meaning: entry[1] });
    }
  }
  if (language === 'csharp') {
    const implicit = [
      [/\b(?:Console|DateTime|Random)\b/, 'System', 'Use common tools'],
      [/\bTask\./, 'System.Threading.Tasks', 'Use waiting tasks'],
      [/\b(?:List|Dictionary|HashSet)</, 'System.Collections.Generic', 'Use collections'],
    ] as const;
    for (const [pattern, namespace, name] of implicit) {
      if (pattern.test(lesson.answer) && !result.some(part => part.code === `using ${namespace};`)) result.push({ code: `using ${namespace};`, name: `${name} · often automatic`, meaning: `New .NET console projects commonly include this using automatically, so you may not see this line in the example. It makes names from ${namespace} available without their full prefix.` });
    }
  }
  return [...new Map(result.map(part => [part.code, part])).values()];
}

const plainParts: Record<string, [string, string, string?]> = {
  print: ['Print text', 'Shows the value inside print(...) in the console.'],
  'console.log': ['Print text', 'Shows the value inside console.log(...) in the console.'],
  'Console.WriteLine': ['Print a line', 'Shows a value in the console, then moves to the next line.'],
  'std::cout <<': ['Print text', 'std::cout is the console output. The separate << card explains how to send a value to it.', 'std::cout'],
  '\\\\n': ['Start a new line', 'Write \\n inside quoted text to move the following text to a new line.', '\\n'],
  return: ['Send a value back', 'Ends this function and gives a value back to the code that called it. It does not print the value.'],
  break: ['Stop repeating', 'Leaves the nearest loop. The program continues with the instruction after that loop.'],
  'break;': ['Stop repeating', 'Leaves the nearest loop. The program continues with the instruction after that loop.'],
  '==': ['Compare two values', 'Checks whether the value on the left is equal to the value on the right. The result is true or false.'],
  '=': ['Save a value', 'Stores the value on the right under the name on the left. This is different from ==, which compares values.'],
  '&&': ['Both checks must pass', 'Joins two checks. The whole check is true only when both are true.'],
  and: ['Both checks must pass', 'Joins two checks. The whole check is True only when both are True.'],
  if: ['Make a choice', 'Runs the next group of instructions only when its check is true.'],
  else: ['The other choice', 'Runs this group of instructions when the if check is false.'],
  'while (true)': ['Keep repeating', 'Repeats the instructions in the loop. Use break when it is time to stop.'],
  'while True:': ['Keep repeating', 'Repeats the indented instructions. Use break when it is time to stop.'],
  '()': ['Put a check inside', 'The parentheses hold the check used by this if statement. In a function call, parentheses hold the values you pass in.'],
  '{}': ['Keep instructions together', 'The opening and closing braces mark which instructions belong to this group.'],
  ': / indentation': ['Keep instructions together', 'The colon starts a group of instructions. Put the instructions on the following lines and indent them by four spaces.'],
  'std::string': ['Store text', 'A type for text, such as a word or a sentence.'],
  string: ['Store text', 'A type for text, such as a word or a sentence.'],
  void: ['No value sent back', 'This function does its work without giving a value back to the code that called it.'],
  ';': ['Finish an instruction', 'Marks the end of this instruction.'],
  'input(...)': ['Ask for text', 'Shows a question, waits for someone to type, then gives their reply back as text.'],
  'f"Hello {name}"': ['Put a value into text', 'The f before the quote lets you put a value inside the text. Write the value or expression between { and }. Use the variable or expression whose value you want to show. You choose variable names yourself.', 'f"Hello {value}"'],
  'f"{red}"': ['Put a value into text', 'The f before the quote replaces each {value} with its current value. Here the value contains a colour code.', 'f"{value}"'],
  '$"{red}"': ['Put a value into text', 'The $ before the quote replaces each {value} with its current value. Here the value contains a colour code.', '$"{value}"'],
  'time.sleep(2)': ['Wait two seconds', 'Pauses this work for the number of seconds inside the parentheses, then continues.'],
  sleep_for: ['Wait before continuing', 'Pauses the current work for the length of time you give it.'],
  'std::chrono::seconds(2)': ['Describe two seconds', 'Makes a two-second duration. Change the number to describe a different wait.'],
  'datetime.now()': ['Read the clock', 'Gets the current date and time when this line runs.'],
  'DateTime.Now': ['Read the clock', 'Gets the current date and time when this line runs.'],
  append: ['Add an item', 'Adds a value to the end of a list.'],
  push_back: ['Add an item', 'Adds a value to the end of a vector, which is a growing list.'],
  in: ['Look for a value', 'Checks whether a value is in this collection. The result is True or False.'],
  None: ['No value yet', 'Means there is no value here yet. It is different from an empty piece of text.'],
  null: ['No value yet', 'Means there is no value here yet. It is different from an empty piece of text.'],
};

const patterns: Record<string, BreakdownPart> = {
  'std::time(nullptr)': { code: 'std::time(nullptr)', name: 'Read the clock', meaning: 'Gets a number that represents the current time. nullptr means no extra place to save a copy is being supplied.' },
  'std::localtime(&now)': { code: 'std::localtime(&value)', name: 'Read local date and time', meaning: 'Turns a saved clock value into local calendar parts, such as the hour and minute. & passes the location of that saved value.' },
  '*std::localtime(&now)': { code: '*std::localtime(&value)', name: 'Copy the clock parts', meaning: 'The * reads the date-and-time details that localtime points to, so the program can save its own copy.' },
  'tm_hour / tm_min': { code: 'tm_hour / tm_min', name: 'Read the hour and minute', meaning: 'tm_hour holds the hour from 0 to 23. tm_min holds the minute from 0 to 59. The slash here means “or”; it is not a line to type.' },
  'time.hour / time.minute': { code: 'value.hour / value.minute', name: 'Read the hour and minute', meaning: 'The dot selects a part of the saved time. hour is from 0 to 23; minute is from 0 to 59. The slash here means “or”; it is not a line to type.' },
  'time.Hour': { code: 'value.Hour', name: 'Read the hour', meaning: 'The dot selects Hour from the saved time. Its value is from 0 to 23.' },
  'time.Minute': { code: 'value.Minute', name: 'Read the minute', meaning: 'The dot selects Minute from the saved time. Its value is from 0 to 59.' },
  'for name in names:': { code: 'for item in items:', name: 'Use each item', meaning: 'Repeats the indented instructions once for each item in the collection. You choose the item and collection names.' },
  'for (const auto& entry : words)': { code: 'for (const auto& item : collection)', name: 'Use each item', meaning: 'Repeats the instructions once for each item in the collection. auto works out the item’s type, & uses the existing item, and const prevents this loop from changing it.' },
  'Car(std::string name, int year)': { code: 'ClassName(std::string text, int number)', name: 'Set up a new object', meaning: 'This constructor runs when a new object is made. Its name matches the class name. The values inside the parentheses provide its starting information.' },
  'Car(string name, int year)': { code: 'ClassName(string text, int number)', name: 'Set up a new object', meaning: 'This constructor runs when a new object is made. Its name matches the class name. The values inside the parentheses provide its starting information.' },
  'new Car("Ford", 2014)': { code: 'new ClassName("text", 123)', name: 'Make a new object', meaning: 'new creates an object from this class. The values inside the parentheses are passed to its constructor. You choose the class name and starting values.' },
  'public string Name': { code: 'public string PropertyName', name: 'Allow access to text', meaning: 'public lets other code use this property. string says it holds text. You choose the property name.' },
  'this.Name = name': { code: 'this.PropertyName = value', name: 'Save an object’s value', meaning: 'this means the current object. The equals sign stores the value on the right in its property on the left.' },
  'string? answer': { code: 'string? value', name: 'Allow text or no value', meaning: 'string holds text. The question mark also allows null, meaning there may be no text value yet.' },
  'self.name': { code: 'self.attribute', name: 'Use this object’s value', meaning: 'self means the object this method is working with. The dot selects one of its saved values. You choose the attribute name.' },
  'this->name': { code: 'this->member', name: 'Use this object’s value', meaning: 'this points to the current object. The arrow selects a value that belongs to that object. You choose the member name.' },
  'class Car': { code: 'class ClassName', name: 'Make a class', meaning: 'class starts a plan for a kind of object. You choose the class name. Its body describes the values and actions its objects have.' },
  'print(getMessage())': { code: 'print(functionName())', name: 'Use a function’s result', meaning: 'The inner function runs first. Its returned value is passed to print so it can be shown in the console.' },
  'Console.WriteLine(getMessage())': { code: 'Console.WriteLine(functionName())', name: 'Use a function’s result', meaning: 'The inner function runs first. Its returned value is passed to Console.WriteLine so it can be printed.' },
  'int speed = 80;': { code: 'int value = 80;', name: 'Save a whole number', meaning: 'int says this value is a whole number. The equals sign saves the starting value. You choose the variable name and number.' },
  'const int maxSpeed = 100;': { code: 'const int value = 100;', name: 'Keep a value fixed', meaning: 'const means you cannot give this variable a different value later. int means it holds a whole number.' },
  'speed = 100;': { code: 'value = 100;', name: 'Change a saved value', meaning: 'The equals sign replaces the value stored under the name on the left.' },
  'speed = 100': { code: 'value = 100', name: 'Save a value', meaning: 'The equals sign saves the number under the name on the left. Using that name later gets the saved value.' },
  'name': { code: '=', name: 'Save a value', meaning: 'Use a variable name of your choice on the left and the value to save on the right.' },
  'std::string name': { code: 'std::string value', name: 'Save some text', meaning: 'std::string says this variable holds text. You choose the variable name.' },
  'std::getline(std::cin, name)': { code: 'std::getline(std::cin, value)', name: 'Read a whole line', meaning: 'Waits for keyboard input and saves the whole reply, including spaces, in the variable you give it.' },
  'std::getline(std::cin, answer)': { code: 'std::getline(std::cin, value)', name: 'Read a whole line', meaning: 'Waits for keyboard input and saves the whole reply, including spaces, in the variable you give it.' },
  'answer == "2"': { code: 'value == "text"', name: 'Compare the reply', meaning: 'The double equals sign checks whether the saved reply matches the quoted text. Change the quoted text to choose the reply you want.' },
  'words.get(...)': { code: 'dictionary.get(key)', name: 'Look up a value safely', meaning: 'Gets the value saved under this key. If the key is missing, get can use a fallback value instead of raising an error.' },
  'words.values()': { code: 'dictionary.values()', name: 'Read the saved values', meaning: 'Gets the values in this dictionary, rather than their keys.' },
  'names.Add': { code: 'list.Add(value)', name: 'Add a value', meaning: 'Adds a value to the end of this list. You choose the list’s name.' },
  'names.Contains(search)': { code: 'list.Contains(value)', name: 'Look for a value', meaning: 'Checks whether this list contains the value you give it. The result is true or false.' },
};

const keywordDefinitions: Record<string, [string, string]> = {
  let: ['Make a changeable variable', 'Creates a variable: a name that stores a value. Give it a starting value with =. You can save a different value under that name later.'],
  const: ['Keep the saved value fixed', 'Creates a variable whose saved value cannot be replaced. If the value is an object or a list, its contents can still change.'],
  function: ['Define a function', 'Gives a group of instructions a name. Defining the function saves its instructions; calling it runs them.'],
  if: ['Make a choice', 'Runs the next group of instructions only when its check is true.'],
  else: ['The other choice', 'Runs this group of instructions when the if check is false.'],
  while: ['Keep checking and repeating', 'Checks its condition before each turn. If the check is true, it runs the loop’s instructions again.'],
  true: ['A check that passes', 'Means yes, or “this check passes”. In while (true), the check always passes, so the loop needs something such as break to stop it.'],
  false: ['A check that does not pass', 'Means no, or “this check does not pass”. An if or while check that is false will not run its body.'],
  True: ['A check that passes', 'Python’s spelling of true. In while True, the check always passes, so the loop needs something such as break to stop it.'],
  False: ['A check that does not pass', 'Python’s spelling of false. An if or while check that is False will not run its body.'],
  return: ['Send a value back', 'Ends this function and gives a value back to the code that called it. It does not print the value.'],
  break: ['Stop repeating', 'Leaves the nearest loop. The program continues with the instruction after that loop.'],
  class: ['Define a class', 'Describes a kind of object: the values it can hold and the actions it can perform. You choose the class name.'],
  new: ['Make a new object', 'Creates an object from a class. The values inside the following parentheses provide its starting information.'],
  def: ['Define a function', 'Python uses def to give a group of instructions a name. The indented instructions run when you call that function.'],
  for: ['Visit items in turn', 'Runs a group of instructions repeatedly, usually once for each item in a collection.'],
  int: ['A whole number', 'A type for whole numbers, such as 0, 12 or -3.'],
  double: ['A decimal number', 'A type for numbers that can have a decimal part, such as 2.5.'],
  bool: ['A yes-or-no value', 'A type with two possible values: true and false.'],
  string: ['Text', 'A type for text, such as a word or sentence.'],
  void: ['No value sent back', 'This function does its work without giving a value back to the code that called it.'],
  var: ['Let C# work out the type', 'Creates a variable and lets C# work out its type from its starting value. The variable can change value, but its type stays the same.'],
  auto: ['Let C++ work out the type', 'Lets C++ work out a value’s type from the code around it, instead of you writing the type yourself.'],
  await: ['Wait for the result', 'Waits for this task to finish before continuing with the following instruction.'],
};

const extraKeywords: Record<string, [string, string]> = {
  async: ['A function that can wait', 'Marks a function that gives back a promise: a value that may be ready later. Inside it, await can wait for a result.'],
  this: ['The current object', 'Refers to the object this method is working with, so its values can be read or changed.'],
  constructor: ['Set up a new object', 'Runs when an object is created from this class. Use it to save the object’s starting values.'],
  public: ['Allow other code to use it', 'Lets code outside this class use this member, such as a property or method.'],
  static: ['Belongs to the class', 'Belongs to the class itself, rather than one object made from it.'],
  foreach: ['Visit each item', 'Runs these instructions once for each item in the collection.'],
  get: ['Read a property', 'Provides the value when other code reads this property.'],
  set: ['Change a property', 'Accepts a new value when other code changes this property.'],
  out: ['Get a value back through an argument', 'Lets a method put a result into the variable you pass to it.'],
  and: ['Both checks must pass', 'Joins two checks. The result is True only when both are True.'],
  or: ['At least one check must pass', 'Joins two checks. The result is True when at least one is True.'],
  not: ['Reverse a check', 'Changes True to False, or False to True.'],
  in: ['Use or find an item', 'In a for loop, connects the loop to the collection it reads. In a check, asks whether a value is in a collection.'],
  is: ['Check whether it is the same object', 'Checks whether two names refer to the same object. is None checks for no value, rather than comparing text.'],
  None: ['No value yet', 'Means there is no value here yet. It is different from an empty piece of text.'],
};
Object.assign(keywordDefinitions, extraKeywords);

function keywordPart(keyword: string, language: string): BreakdownPart {
  const [name, defaultMeaning] = keywordDefinitions[keyword];
  const meaning = keyword === 'const' && language === 'cpp' ? 'Marks a value as read-only here. This code can read it, but cannot change it through this name.' : keyword === 'const' && language === 'csharp' ? 'Keeps a starting value fixed. It must be a value C# can work out before the program runs, such as a number or text.' : defaultMeaning;
  return { code: keyword, name, meaning };
}

/** Ignore words in messages and comments when finding language syntax. */
function executableText(answer: string, language: string) {
  const text = answer.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, ' ');
  return language === 'python' ? text.replace(/#[^\n]*/g, ' ') : text;
}

function missingKeywordParts(lesson: LessonContent, language: string, existing: BreakdownPart[]): BreakdownPart[] {
  const supported: Record<string, string[]> = {
    javascript: ['let', 'const', 'async', 'await', 'this', 'constructor', 'function', 'if', 'else', 'while', 'true', 'false', 'return', 'break', 'class', 'new', 'for'],
    csharp: ['const', 'var', 'public', 'static', 'foreach', 'get', 'set', 'out', 'int', 'double', 'bool', 'string', 'void', 'await', 'if', 'else', 'while', 'true', 'false', 'return', 'break', 'class', 'new', 'for'],
    cpp: ['const', 'auto', 'int', 'double', 'bool', 'void', 'if', 'else', 'while', 'true', 'false', 'return', 'break', 'class', 'for'],
    python: ['and', 'or', 'not', 'in', 'is', 'None', 'def', 'if', 'else', 'while', 'True', 'False', 'return', 'break', 'class', 'for'],
  };
  const code = language === 'html' ? [...lesson.answer.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => executableText(match[1], 'javascript')).join('\n') : executableText(lesson.answer, language);
  const syntaxLanguage = language === 'html' ? 'javascript' : language;
  const result: BreakdownPart[] = [];
  for (const keyword of supported[syntaxLanguage] ?? []) {
    const token = new RegExp(`\\b${keyword}\\b`);
    const alreadyExplained = existing.some(part => new RegExp(`^${keyword}\\b`).test(part.code));
    if (token.test(code) && !alreadyExplained) {
      result.push(keywordPart(keyword, language));
    }
  }
  if (['javascript', 'csharp', 'cpp', 'python'].includes(syntaxLanguage) && /(^|[^=!<>])=(?!=|>)/m.test(code) && !existing.some(part => part.code === '=')) result.push({ code: '=', name: 'Save a value', meaning: 'Stores the value on the right under the name on the left. One equals sign saves a value; two equals signs compare values.' });
  return result;
}

const htmlTags: Record<string, [string, string]> = {
  html: ['The whole HTML page', 'Wraps the page’s HTML. The opening tag starts it and the closing tag ends it.'],
  head: ['Information about the page', 'Holds information such as the browser-tab title and links to stylesheets. Its contents are not the main visible page.'],
  body: ['Visible page content', 'Holds the content people see on the page.'],
  title: ['Name the browser tab', 'Sets the text shown in the browser tab.'],
  meta: ['Describe the page', 'Adds page information. charset="UTF-8" tells the browser how to read the text characters.'],
  div: ['Group page content', 'Groups content into a box that you can style or arrange.'],
  p: ['Make a paragraph', 'Groups text into a paragraph.'],
  a: ['Make a link', 'Creates a link. href gives its destination; the text between the tags is what people click.'],
  img: ['Show an image', 'Displays an image from src. alt describes the image for people who cannot see it. This element has no closing tag.'],
  video: ['Show a video', 'Adds a video player. controls gives people play, pause and other playback buttons.'],
  audio: ['Play audio', 'Adds an audio player. controls gives people buttons to play or pause it.'],
  script: ['Run JavaScript', 'Places JavaScript inside this page. The JavaScript keywords in this lesson have their own cards.'],
  button: ['Make a button', 'Creates a button people can activate with a mouse, touch, or keyboard.'],
  style: ['Write CSS for this page', 'Holds CSS rules that change how this page looks.'],
  b: ['Make text bold', 'Displays bold text without saying it has extra importance.'],
  strong: ['Mark important text', 'Marks text as important. Browsers usually show it in bold.'],
  i: ['Change the text style', 'Marks text in a different voice or style. Browsers usually show it in italics.'],
  em: ['Emphasise text', 'Marks words that should be stressed when read. Browsers usually show them in italics.'],
  mark: ['Mark text to notice', 'Marks text as relevant, usually with a coloured background.'],
  small: ['Show a side note', 'Marks a small side note, such as a copyright notice.'],
  del: ['Mark removed text', 'Marks text as deleted. Browsers usually draw a line through it.'],
  ins: ['Mark added text', 'Marks text as inserted. Browsers usually underline it.'],
  sub: ['Lower the text', 'Lowers text below the normal line, as in a chemical formula.'],
  sup: ['Raise the text', 'Raises text above the normal line, as in a power or a footnote number.'],
};
const htmlAttributes: Record<string, [string, string]> = {
  href: ['Choose a link destination', 'Gives the page or address a link opens. You choose the destination.'],
  src: ['Choose a media file', 'Gives the path or address of an image, video, or audio file. Use the name of the file you actually saved.'],
  alt: ['Describe an image', 'Gives an image a text description for people who cannot see it. Describe its meaning, rather than just its filename.'],
  id: ['Give an element a unique ID', 'Gives one element an ID so CSS or JavaScript can find it. You choose the ID and use it consistently.'],
  class: ['Put elements in a group', 'Gives elements a class name so the same CSS rule can style them. You choose the class name.'],
  style: ['Style this element', 'Holds CSS declarations that apply to this element only. Each declaration names a property and its value.'],
  lang: ['Set the page language', 'Tells the browser and reading tools the language of the text. en means English.'],
  charset: ['Set the text encoding', 'UTF-8 lets the browser read letters, symbols, and many writing systems correctly.'],
  controls: ['Show playback buttons', 'Adds the browser’s controls for playing and pausing audio or video.'],
  onclick: ['Respond to a click', 'Runs the JavaScript you give it when this element is activated. A function call here runs the function when the click happens.'],
};
const cssProperties: Record<string, [string, string]> = {
  'background-color': ['Choose the background colour', 'Sets the colour behind an element’s content.'],
  color: ['Choose the text colour', 'Sets the colour of text in the selected element.'],
  'text-align': ['Line up text', 'Chooses how text lines up inside its box, such as left, right, or centre.'],
  'font-family': ['Choose a font', 'Lists fonts in order of preference. The browser uses the first one available; a final choice such as serif or sans-serif provides a fallback style.'],
  border: ['Draw a border', 'Combines the border’s width, line style, and colour in one declaration. For example, 5px dotted blue makes a blue dotted border five CSS pixels wide.'],
  'border-left': ['Style the left border', 'Sets the width, line style, and colour of the left edge only.'],
  'border-bottom': ['Style the bottom border', 'Sets the width, line style, and colour of the bottom edge only.'],
  'border-radius': ['Round the corners', 'Chooses how round the corners of an element’s border are. A larger value makes a stronger curve.'],
};

function webParts(lesson: LessonContent, language: string, existing: BreakdownPart[]): BreakdownPart[] {
  if (language !== 'html' && language !== 'css') return [];
  const result: BreakdownPart[] = [];
  const add = (code: string, definition: [string, string]) => { if (!existing.some(part => part.code === code || part.code.startsWith(code + '=') || part.code.startsWith(code + ':'))) result.push({ code, name: definition[0], meaning: definition[1] }); };
  const cssSources: string[] = language === 'css' ? [lesson.answer] : [];
  if (language === 'html') {
    for (const match of lesson.answer.matchAll(/<([a-z][\w-]*)([^>]*)>/gi)) {
      const tag = match[1].toLowerCase();
      if (htmlTags[tag] && !existing.some(part => part.code === tag)) add(`<${tag}>`, htmlTags[tag]);
      if (/^h[1-6]$/.test(tag) && !existing.some(part => /^h[1-6]$/.test(part.code))) add('<h1> … <h6>', ['Choose a heading level', 'h1 is the main heading. h2 to h6 give smaller levels of headings inside sections. Choose the level for the structure of the page, not just its text size.']);
      for (const attribute of Object.keys(htmlAttributes)) if (new RegExp(`\\b${attribute}(?:\\s*=|\\s|$)`, 'i').test(match[2])) add(attribute, htmlAttributes[attribute]);
      for (const inline of match[2].matchAll(/style\s*=\s*["']([^"']*)["']/gi)) cssSources.push(inline[1]);
    }
    for (const style of lesson.answer.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) cssSources.push(style[1]);
  }
  for (const css of cssSources) {
    for (const match of css.matchAll(/(?:^|[;{])\s*([\w-]+)\s*:/g)) {
      const property = match[1];
      if (cssProperties[property]) add(property, cssProperties[property]);
    }
    if (css.includes(':')) add(':', ['Separate a property and value', 'Write the property before the colon and its value after it.']);
    if (css.includes(';')) add(';', ['Finish a declaration', 'Separates this CSS declaration from the next one.']);
    if (css.includes('{') && !existing.some(part => /^\{\s*(?:…|\.\.\.)\s*\}$/.test(part.code))) add('{ … }', ['Group the styles', 'Put declarations inside the braces. The selector before the opening brace chooses which elements they apply to.']);
    if (/#[-\w]+/.test(css) && !existing.some(part => part.code.startsWith('#'))) add('#elementId', ['Select one element', 'The hash selects the element whose id matches the name after it. You choose the ID and use that same name in your HTML.']);
    if (/\.[a-z_-][\w-]*\s*\{/i.test(css) && !existing.some(part => /\.[a-z]/i.test(part.code))) add('.className', ['Select a group', 'The dot selects elements with this class. You choose the class name and use that same name in your HTML.']);
  }
  if (lesson.referenceKind === 'css') {
    for (const property of ['border-left', 'border-bottom', 'border-radius']) add(property, cssProperties[property]);
    add('rgb(255, 0, 0)', ['Mix a colour', 'The three numbers choose the amounts of red, green, and blue. Each amount is from 0 to 255. This example uses full red.']);
    add('#222222', ['Write a hex colour', 'The six letters or digits after # describe red, green, and blue in three pairs. This example makes a dark grey.']);
    add('rgba(0, 0, 0, 0.4)', ['Make a colour see-through', 'The first three numbers choose a colour. The last number chooses how solid it is: 0 is invisible and 1 is fully solid.']);
  }
  if (lesson.referenceKind === 'fonts') add('serif / sans-serif / monospace', ['Choose a font style', 'Serif letters have small finishing strokes. Sans-serif letters have plain ends. Monospace gives every character the same width. Use one as the last choice if your preferred font is unavailable.']);
  return [...new Map(result.map(part => [part.code, part])).values()];
}

export function syntaxBreakdown(lesson: LessonContent, language: string): BreakdownPart[] {
  const parts = (lesson.parts ?? []).flatMap(part => {
    if (/^(?:#include|import |from |using )/.test(part.code)) return [];
    if (['Name', 'Label', 'Constant convention'].includes(part.name)) return [];
    const replacement = plainParts[part.code];
    const keyword = keywordDefinitions[part.code] ? keywordPart(part.code, language) : null;
    let next = patterns[part.code] ?? keyword ?? (replacement ? { code: replacement[2] ?? part.code, name: replacement[0], meaning: replacement[1] } : { ...part });
    if (/^(?:void |def )?correct\(\)/.test(next.code)) {
      const defining = /^(?:void |def )/.test(next.code);
      next = { code: defining ? (language === 'python' ? 'def functionName():' : 'void functionName()') : (language === 'python' ? 'functionName()' : 'functionName();'), name: defining ? 'Make a function' : 'Run a function', meaning: defining ? 'Gives a group of instructions a name so you can run them later. You choose the name.' : 'Write the function’s name followed by () to run its instructions.' };
    }
    const declaration = next.code.match(/^(let|const|var|auto)\b/);
    if (declaration) next = keywordPart(declaration[1], language);
    if (language === 'css' && next.code === ';') next = { code: ';', name: 'Finish a declaration', meaning: 'Separates this CSS declaration from the next one.' };
    if (next.code === 'name' || next.code === 'MAX_SPEED') return [];
    return [next];
  });
  const interpolation = language === 'python' ? /\bf["']/.test(lesson.answer) : language === 'csharp' ? /\$["']/.test(lesson.answer) : language === 'javascript' ? /`[^`]*\$\{/.test(lesson.answer) : false;
  if (interpolation) {
    for (let index = parts.length - 1; index >= 0; index--) if (/^(?:(?:f|\$)["']|\$\{)/.test(parts[index].code)) parts.splice(index, 1);
    parts.push({ code: language === 'python' ? 'f"Hello {value}"' : language === 'csharp' ? '$"Hello {value}"' : '`Hello ${value}`', name: 'Put a value into text', meaning: `${language === 'python' ? 'f before the quote' : language === 'csharp' ? '$ before the quote' : 'Backticks and ${…}'} lets you insert a value into text. The part inside the braces is replaced by its current value. You choose the variable name; it is not a special word you have to copy.` });
  }
  if (language === 'cpp') {
    if (/std::/.test(lesson.answer)) parts.push({ code: '::', name: 'Find a tool inside a group', meaning: 'In std::cout, std is the group and cout is the tool inside it. The two colons connect the group name to the tool name.' });
    if (/std::cout\s*<</.test(lesson.answer)) parts.push({ code: '<<', name: 'Send a value to the console', meaning: 'With std::cout, << sends the value on its right to the console. You can use it again to print another value on the same line.' });
  }
  return [...new Map([...missingKeywordParts(lesson, language, parts), ...parts, ...webParts(lesson, language, parts)].map(part => [part.code, part])).values()];
}

export function setupBreakdown(lesson: LessonContent, language: string): BreakdownPart[] {
  if (language !== 'cpp' || !/\bint\s+main\s*\(/.test(lesson.answer)) return [];
  const parts = [{ code: 'int main() { … }', name: 'Start the program', meaning: 'C++ starts this program inside main. Put the program’s starting instructions between its braces.' }];
  if (/return\s+0\s*;/.test(lesson.answer)) parts.push({ code: 'return 0;', name: 'Finish successfully', meaning: 'Ends main and tells the computer the program finished successfully. It does not print 0. At the end of main, C++ can do this automatically.' });
  return parts;
}

export function lessonOverview(lesson: LessonContent) {
  const topic = lesson.eyebrow.split('·').slice(1).join('·').trim().toLowerCase();
  const summaries: Record<string, string> = {
    'console output': 'Show text in the console and choose where each new line begins.',
    functions: 'Give instructions a name so you can run them when you need them.',
    'ansi colours': 'Use colour codes to change how text looks in the console.',
    time: 'Choose when the next action should happen.',
    'date and time': 'Read the clock and use the time to decide what happens next.',
    classes: 'Group related values and actions into an object.',
    variables: 'Save values so your program can use them later.',
    'terminal input': 'Ask a question and use the reply in your program.',
    'if statements and symbols': 'Use a check to choose which instructions run.',
    loops: 'Repeat instructions until it is time to stop.',
    dictionary: 'Save values under keys so you can find them again.',
    expressions: 'Combine values to calculate a result.',
    random: 'Let the program choose an item at random.',
    'arrays and lists': 'Keep several values together and search through them.',
    sets: 'Keep one copy of each different value.',
    null: 'Represent a value that has not been set yet.',
    'regular expressions': 'Check whether text follows a pattern.',
    'files and paths': 'Use a path to find a file or folder.',
    'concurrent work': 'Start separate pieces of work and wait for them to finish.',
    'application practice': 'Combine the tools you have learned to build a small program.',
  };
  return summaries[topic] ?? 'Explore the code below, one part at a time.';
}
