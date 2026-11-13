import ExcelJS from 'exceljs';

export function createSheetKit({ sheetName, cols, colWidths, colWidth = 8.6, font = process.env.EXPORT_FONT || 'Urdu Typesetting' }) {
  if (colWidths) cols = colWidths.length;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName, { views: [{ rightToLeft: true, showGridLines: false }], pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: .3, right: .3, top: .3, bottom: .3, header: .3, footer: .3 } } });
  for (let c = 1; c <= cols; c++) ws.getColumn(c).width = colWidths ? colWidths[c - 1] : colWidth;
  const thin = { style: 'thin', color: { argb: 'FF000000' } };
  const medium = { style: 'medium', color: { argb: 'FF000000' } };
  const put = (r1, c1, r2, c2, value, opts = {}) => {
    if (r1 !== r2 || c1 !== c2) ws.mergeCells(r1, c1, r2, c2);
    const master = ws.getCell(r1, c1);
    master.value = value === '' || value == null ? null : value;
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) {
      const cell = ws.getCell(r, c);
      cell.font = { name: font, size: 11, ...opts.font };
      cell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true, readingOrder: 'rtl', ...(opts.rotate !== undefined ? { textRotation: opts.rotate } : {}), ...opts.alignment };
      cell.border = opts.border === false ? {} : { top: thin, bottom: thin, left: thin, right: thin };
      if (opts.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
    }
    return master;
  };
  const label = (r1,c1,r2,c2,v,o={}) => put(r1,c1,r2,c2,v,{...o,font:{size:11,...o.font},alignment:{horizontal:'right',indent:1,...o.alignment}});
  const labelC = (r1,c1,r2,c2,v,o={}) => label(r1,c1,r2,c2,v,{...o,alignment:{horizontal:'center',indent:0,...o.alignment}});
  const val = (r1,c1,r2,c2,v,o={}) => put(r1,c1,r2,c2,v,{...o,font:{size:13,bold:true,...o.font},alignment:{horizontal:'center',...o.alignment}});
  const heading = (r1,c1,r2,c2,v,o={}) => val(r1,c1,r2,c2,v,{...o,font:{size:14,bold:true,...o.font}});
  const outline = (r1,c1,r2,c2) => { for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) { if(r!==r1 && r!==r2 && c!==c1 && c!==c2) continue; const cell=ws.getCell(r,c); cell.border={...cell.border,...(r===r1?{top:medium}:{}),...(r===r2?{bottom:medium}:{}),...(c===c1?{left:medium}:{}),...(c===c2?{right:medium}:{})}; } };
  const signature = (r,c1,c2,labelCols,text) => { label(r,c1,r,c1+labelCols-1,text,{border:false,font:{bold:true}}); put(r,c1+labelCols,r,c2,null,{border:false}); for(let c=c1+labelCols;c<=c2;c++) ws.getCell(r,c).border={bottom:thin}; };
  const rich = (r1,c1,r2,c2,parts,opts={}) => put(r1,c1,r2,c2,{richText:parts.map(p=>({text:p.text,font:{name:font,size:10,...p.font}}))},opts);
  const heights = values => Object.entries(values).forEach(([row,height]) => { ws.getRow(Number(row)).height=height; });
  const extrasSection = (start,title,items,perRow=3,pairs) => { heading(start,1,start,cols,title,{fill:'FFDCEBEA',font:{size:12}}); let row=start; for(let i=0;i<items.length;i++) { if(i%perRow===0) { row++; ws.getRow(row).height=32; } const j=i%perRow, a=Math.floor(j*cols/perRow)+1, b=Math.floor((j+1)*cols/perRow), split=a+Math.max(1,Math.round((b-a+1)*.57))-1, [la,lb,va,vb]=pairs?.[j] ?? [a,split,split+1,b]; label(row,la,row,lb,items[i][0]); val(row,va,row,vb,items[i][1],{font:{size:11}}); } outline(start,1,row,cols); return row; };
  const tableSection = (start,title,headers,rows,spans) => {
    heading(start,1,start,cols,title,{fill:'FFDCEBEA',font:{size:12}});
    const cells = (row, values, header) => values.forEach((value,i) => {
      const [from,to]=spans?.[i] ?? [Math.floor(i*cols/headers.length)+1, Math.floor((i+1)*cols/headers.length)];
      (header ? heading : labelC)(row,from,row,to,value,{font:{size:10}});
    });
    cells(start+1,headers,true);
    rows.forEach((row,i) => { ws.getRow(start+2+i).height=32; cells(start+2+i,row,false); });
    const last=start+1+rows.length; outline(start,1,last,cols); return last;
  };
  return {wb,ws,put,label,labelC,val,heading,outline,signature,rich,heights,extrasSection,tableSection};
}
