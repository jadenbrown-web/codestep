export const phoneFileView=page=>page.locator('.mobile-html-file-view[open]');

export async function openHtmlFile(page,width){
 if(width<=850){
  await page.getByRole('button',{name:'View HTML file',exact:true}).click();
  await phoneFileView(page).waitFor();
  return phoneFileView(page);
 }
 return page.locator('.stylesheet-companion');
}

export async function closeHtmlFile(page,width){
 if(width>850)return;
 await page.getByRole('button',{name:'Back to CSS',exact:true}).click();
 await phoneFileView(page).waitFor({state:'detached'});
 await page.waitForFunction(()=>!window.history.state?.codestepHtmlFile);
}

export async function inHtmlFile(page,width,action){
 const file=await openHtmlFile(page,width);
 try{return await action(file);}finally{await closeHtmlFile(page,width);}
}

export async function openHtmlLesson(page,width){
 if(width<=850){
  await openHtmlFile(page,width);
  await page.getByRole('button',{name:'Open HTML lesson',exact:true}).click();
  await phoneFileView(page).waitFor({state:'detached'});
  await page.waitForFunction(()=>!window.history.state?.codestepHtmlFile);
 }else await page.getByRole('button',{name:'See matching HTML →',exact:true}).click();
}
