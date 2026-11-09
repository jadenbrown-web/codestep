import CopyCodeButton from './CopyCodeButton';
import {runCommands} from './input-runtimes';
export default function RunCommands({language,fileName,answer}:{language:string;fileName:string;answer:string}) {
  const commands=runCommands(language,fileName,answer);
  if(!commands.length)return null;
  return <div className="run-commands"><p>These are terminal commands, not assembly language. Copy a command into your terminal, not into the code editor. Save your changes first: the terminal runs the file on disk, not unsaved editor text. Open the folder containing <code>{fileName}</code>.</p>{language==='cpp'&&<p>The C++ source is compiled first. The executable depends on the operating system and CPU you build for; recompile on the target system. The program code stays the same for these compiler choices.</p>}{commands.map(command=><article key={command.label}><h3>{command.label}</h3><div className="runtime-command"><pre><code>{command.code}</code></pre><CopyCodeButton iconOnly code={command.code} label={command.label+' command'}/></div><p>{command.note}</p></article>)}</div>;
}
