"use client";

import {useState} from "react";

export function linkedPageCode(second: boolean) {
  return `<!DOCTYPE html>\n<html>\n<body>\n\n  <h1>${second ? "Page 2" : "First Page"}</h1>\n\n  <a href="${second ? "index.html" : "page2.html"}">${second ? "Go back" : "Go to Page 2"}</a>\n\n</body>\n</html>`;
}

export default function LinkedPagesPreview() {
  const [second, setSecond] = useState(false);
  return <section className="linked-pages-browser" aria-label="Linked pages preview">
    <div className="linked-pages-address"><b>Web page preview</b><span aria-live="polite">{second ? "page2.html" : "index.html"}</span></div>
    <iframe title="Linked HTML page" sandbox="allow-same-origin" srcDoc={linkedPageCode(second)} onLoad={event => {
      const doc = event.currentTarget.contentDocument;
      doc?.querySelector("a")?.addEventListener("click", click => {
        click.preventDefault();
        setSecond(!second);
      });
    }} />
    <p>Follow the link in the preview to open the other page.</p>
  </section>;
}
