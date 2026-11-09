export type InputRuntime = 'node' | 'browser';
export const BROWSER_INPUT_CODE = 'let name = prompt("What is your name?");\nconsole.log(`Hello ${name}`);';
export const BROWSER_INPUT_HTML = '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><title>Name input</title></head>\n<body>\n<script src="name.js"></script>\n</body>\n</html>';

export function browserInputPatch() {
  return {
    answer: BROWSER_INPUT_CODE,
    fileName: 'name.js',
    explanation: 'prompt() opens a browser dialog and returns the text you enter. name stores that reply. console.log prints the greeting in the browser developer console. The browser provides prompt(); Node.js does not provide it by default.',
    prompt: 'Ask for a name with browser prompt(), then print Hello and the name.',
    note: '// Run in a browser, not with node',
    runHint: 'Save the browser example as name.js and the HTML launcher as index.html in the same folder. Open index.html in a browser, enter your name, then open the browser developer console to see the greeting. Do not run this example with node name.js.',
    parts: [
      {code: 'prompt(...)', name: 'Ask in a browser dialog', meaning: 'Displays a question and returns the entered text. The browser provides this function; Node.js does not provide it by default.'},
      {code: 'let name', name: 'Store the reply', meaning: 'Creates a variable called name and saves the reply in it.'},
      {code: 'console.log(`Hello ${name}`)', name: 'Print the greeting', meaning: 'Writes Hello and the saved name in the browser developer console.'},
    ],
    output: ['Hello Alex'],
    outputAnnotations: ['shown in the browser developer console'],
    outputNote: 'Example output when you enter Alex in the browser dialog. The question is shown in the dialog, not printed in the console.',
  };
}

export type RunCommand = {label: string; code: string; note: string};
export function runCommands(language: string, fileName: string, answer: string): RunCommand[] {
  if (language === 'javascript') {
    if (/\b(?:prompt|document|window)\b/.test(answer)) return [];
    return [{label:'Node.js · terminal',code:`node ${fileName}`,note:'Install Node.js, then run this in the folder containing the file. The node command starts the JavaScript runtime; it is not JavaScript code. VS Code is the editor, not the runtime.'}];
  }
  if (language === 'cpp') return [
    {label:'macOS / Linux · Clang',code:`clang++ -std=c++17 ${fileName} -o main && ./main`,note:'Requires Clang. Compile this source file to an executable called main, then run it if compilation succeeds.'},
    {label:'macOS / Linux · GCC alternative',code:`g++ -std=c++17 ${fileName} -o main && ./main`,note:'Use this instead if GCC is installed. You only need one compiler option.'},
    {label:'macOS / Linux · run again',code:'./main',note:'Runs the existing executable. After editing the source, compile again before running.'},
    {label:'Windows PowerShell · MinGW-w64 GCC',code:`g++ -std=c++17 ${fileName} -o main.exe\n.\\main.exe`,note:'Requires MinGW-w64 GCC on PATH. Run the second line only after compilation succeeds. MSVC uses different commands; the macOS/Linux command is not universal.'},
  ];
  if (language === 'python') return [{label:'Python 3 · macOS / Linux',code:`python3 ${fileName}`,note:'Requires Python 3. On Windows, the Python launcher command is often py; use the command installed on your system.'}];
  if (language === 'csharp') return [
    {label:'C# · existing project',code:'dotnet run',note:'Run inside the folder containing your .csproj project. Requires the .NET SDK; dotnet run does not automatically create a project.'},
    {label:'C# · single file, .NET 10+',code:`dotnet run --file ${fileName}`,note:'Requires .NET SDK 10 or newer and a supported file-based app. Older SDKs require a project.'},
  ];
  return [];
}
