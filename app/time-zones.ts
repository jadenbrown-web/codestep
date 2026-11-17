export const timeZones = [
  {id:'local', label:'Your local time', region:'Local'},
  {id:'Europe/London', label:'London, United Kingdom', region:'Europe'},
  {id:'Europe/Paris', label:'Paris, France', region:'Europe'},
  {id:'America/New_York', label:'New York, USA', region:'America'},
  {id:'America/Los_Angeles', label:'Los Angeles, USA', region:'America'},
] as const;
export type TimeZoneId = typeof timeZones[number]['id'];
export function timeZoneLabel(id:TimeZoneId){return timeZones.find(zone=>zone.id===id)!.label;}
export function formatZonedClock(now:Date,id:TimeZoneId){
  return new Intl.DateTimeFormat('en-GB',{...(id==='local'?{}:{timeZone:id}),hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
}
type TimeLesson={displayCurrentTime?:boolean;answer:string;explanation:string;prompt:string;note:string;outputNote?:string;runHint?:string;parts?:{code:string;name:string;meaning:string}[]};
export function applyTimeZone<T extends TimeLesson>(lesson:T,language:string,id:TimeZoneId):T & {timeZone?:TimeZoneId}{
  if(!lesson.displayCurrentTime)return lesson;
  if(id==='local')return {...lesson,timeZone:id};
  const label=timeZoneLabel(id),zone=JSON.stringify(id);
  let answer='',clock='',format='',runHint=lesson.runHint;
  if(language==='python'){
    answer=`from datetime import datetime\nfrom zoneinfo import ZoneInfo\n\ntime = datetime.now(ZoneInfo(${zone}))\nprint(time.strftime("%H:%M"))`;
    clock=`datetime.now(ZoneInfo(${zone}))`;format='time.strftime("%H:%M")';
    runHint='Save as main.py and run python3 main.py. Requires Python 3.9 or newer and time-zone data. If ZoneInfo cannot find the zone (often on Windows), run python3 -m pip install tzdata.';
  }else if(language==='javascript'){
    answer=`const time = new Date();\nconsole.log(time.toLocaleTimeString("en-GB", { timeZone: ${zone}, hour: "2-digit", minute: "2-digit", hour12: false }));`;
    clock='new Date()';format='time.toLocaleTimeString(...)';
  }else if(language==='csharp'){
    answer=`TimeZoneInfo zone = TimeZoneInfo.FindSystemTimeZoneById(${zone});\nDateTime time = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, zone);\nConsole.WriteLine(time.ToString("HH:mm"));`;
    clock='TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, zone)';format='time.ToString("HH:mm")';
    runHint='Save in Program.cs in a console project and run dotnet run. Use .NET 6 or newer with ICU time-zone data enabled for these IANA zone names (including on Windows).';
  }else if(language==='cpp'){
    answer=`#include <chrono>\n#include <format>\n#include <iostream>\n\nint main() {\n  auto time = std::chrono::zoned_time{${zone}, std::chrono::system_clock::now()};\n  std::cout << std::format("{:%H:%M}", time) << "\\n";\n}`;
    clock=`std::chrono::zoned_time{${zone}, std::chrono::system_clock::now()}`;format='std::format("{:%H:%M}", time)';
    runHint='Save as main.cpp. Compile with g++ -std=c++20 main.cpp -o main, then run ./main. Requires a recent C++20 standard library with chrono time zones, a time-zone database and std::format support (for example GCC 14 or newer). The local-time example uses C++17.';
  }else return lesson;
  return {...lesson,timeZone:id,answer,runHint,
    explanation:`Read the clock once and display the current time in ${label}, in 24-hour HH:MM format. ${id} is a named time zone: its rules handle daylight saving automatically. Use the zone name rather than adding or subtracting hours. This shows one reading; it does not wait or loop.`,
    prompt:`Read the current time and print it for ${label} using ${id}, in 24-hour HH:MM format.`,
    note:`${language==='python'?'#':'//'} Read the clock once and display the time in ${label}.`,
    outputNote:`Time in ${label} when Check code was pressed. Clear and check again for a fresh reading. Copied code reads the clock when you run it.`,
    parts:[
      {code:zone,name:'Choose a named time zone',meaning:`${id} identifies ${label}. Countries can have several time zones; a city makes the choice precise. The time-zone database handles daylight saving changes.`},
      {code:clock,name:'Read the clock once',meaning:language==='javascript'?'new Date() captures the current instant. The timeZone option below chooses where to display that instant.':'Reads the current instant and represents it in the selected time zone. The saved reading does not keep ticking.'},
      {code:format,name:'Display hours and minutes',meaning:'Displays the selected location’s time using a 24-hour clock with two digits for the hour and minute, such as 09:05.'},
    ]};
}
