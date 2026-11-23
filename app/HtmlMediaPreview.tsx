"use client";
import {useState} from "react";
export type HtmlMediaKind = "image" | "video" | "audio" | "link";
const files = {image:"car.png", video:"my-video.mp4", audio:"my-audio.mp3"};
export default function HtmlMediaPreview({kind,code}:{kind:HtmlMediaKind;code:string}) {
  const [destination,setDestination] = useState(false);
  const attr = (name:string) => code.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`,"i"))?.[1] ?? "";
  const filename = kind === "link" ? "page.html" : files[kind];
  const linkText = code.match(/<a\b[^>]*>([^<]*)<\/a>/i)?.[1] || "Open page";
  const available = kind === "link" || attr("src") === filename;
  return <section className="html-media-preview" aria-label="HTML example preview">
    <div className="linked-pages-address"><b>Web page preview</b><span>{kind === "link" && destination ? filename : "index.html"}</span></div>
    <div className="sample-browser-document" role="document">
      {!available ? <p>The example file is {filename}. Download it below and keep it beside your HTML file.</p> : kind === "image" ? <img src="examples/car.png" alt={attr("alt")} /> : kind === "video" ? <video controls={/\bcontrols\b/i.test(code)} playsInline preload="metadata"><source src="examples/my-video.mp4" type="video/mp4" /><source src="examples/my-video.webm" type="video/webm" /></video> : kind === "audio" ? <audio src="examples/my-audio.mp3" controls={/\bcontrols\b/i.test(code)} preload="metadata" /> : destination ? <><h1>Page</h1><a href="index.html" onClick={event=>{event.preventDefault();setDestination(false);}}>Go back</a></> : <a href={attr("href") || "page.html"} onClick={event=>{event.preventDefault();setDestination(true);}}>{linkText}</a>}
    </div>
    <p className="media-sample-note">{kind === "link" ? <>The link opens <code>page.html</code>. This preview includes a sample destination page.</> : <>Try the sample {kind === "image" ? "image" : `${kind} player`}. <a href={`examples/${filename}`} download={filename}>Download {filename}</a> and save it beside <code>index.html</code>.</>}</p>
  </section>;
}
