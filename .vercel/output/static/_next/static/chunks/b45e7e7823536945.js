(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,36717,t=>{"use strict";async function e(e,o){o(5,"Loading libraries...");let n=await t.A(604229);o(15,"Reading Word document...");let i=await e.arrayBuffer();o(25,"Converting to HTML...");let a=await n.convertToHtml({arrayBuffer:i});if(!a.value||0===a.value.trim().length)throw Error("The Word document appears to be empty or could not be parsed.");o(40,"Preparing document layout...");let c=document.createElement("div");c.style.cssText=`
    position: fixed;
    left: -9999px;
    top: 0;
    width: 210mm;
    background: white;
    color: black;
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
    padding: 20mm;
    box-sizing: border-box;
  `,c.innerHTML=`
    <style>
      .docx-content h1 { font-size: 24pt; font-weight: bold; margin: 16pt 0 8pt; }
      .docx-content h2 { font-size: 18pt; font-weight: bold; margin: 14pt 0 6pt; }
      .docx-content h3 { font-size: 14pt; font-weight: bold; margin: 12pt 0 4pt; }
      .docx-content p { margin: 0 0 6pt; }
      .docx-content ul, .docx-content ol { margin: 4pt 0 4pt 24pt; }
      .docx-content li { margin: 2pt 0; }
      .docx-content table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
      .docx-content td, .docx-content th { border: 1px solid #999; padding: 4pt 6pt; }
      .docx-content img { max-width: 100%; height: auto; }
    </style>
    <div class="docx-content">${a.value}</div>
  `,document.body.appendChild(c);try{o(55,"Rendering to PDF...");let n=(await t.A(504986)).default,i=await n().from(c).set({margin:0,filename:"output.pdf",image:{type:"jpeg",quality:.95},html2canvas:{scale:2,useCORS:!0,logging:!1},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}}).outputPdf("blob");o(95,"Finalizing...");let a=e.name.replace(/\.docx?$/i,"");return o(100,"Done!"),{blob:i,filename:`${a}.pdf`}}finally{document.body.removeChild(c)}}t.s(["wordToPdf",()=>e])},604229,t=>{t.v(e=>Promise.all(["static/chunks/125f2dfe46bb02f7.js","static/chunks/2721c38919d5cb98.js","static/chunks/dfeac5dd819c349f.js","static/chunks/e26b343474bede60.js","static/chunks/04e5bf300fe82786.js"].map(e=>t.l(e))).then(()=>e(507267)))},504986,t=>{t.v(e=>Promise.all(["static/chunks/76b77f6501132066.js","static/chunks/71e0f23d99948cf0.js"].map(e=>t.l(e))).then(()=>e(742144)))}]);