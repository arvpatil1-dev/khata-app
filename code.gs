
function doGet(){
  return HtmlService.createTemplateFromFile('index').evaluate()
.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
.addMetaTag('viewport','width=device-width, initial-scale=1');
}
function getMainSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("TRANSACTION");
  if(!sh){
    sh = ss.insertSheet("TRANSACTION");
    sh.appendRow(["date","supplier","product","Type","Mode","Amount","cash_balance","bank_balance","fd_balance","total_balance","profit_loss_type","Note"]);
  }
  if(sh.getRange(1,9).getValue()!= "fd_balance"){
    sh.getRange(1,1,1,12).setValues([["date","supplier","product","Type","Mode","Amount","cash_balance","bank_balance","fd_balance","total_balance","profit_loss_type","Note"]]);
  }
  return ss.getSheetByName("TRANSACTION");
}
function getSuppliers(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("SUPPLIERS");
  if(!sh){
    var tr = ss.getSheetByName("TRANSACTION");
    if(!tr || tr.getLastRow()<2) return ["BOM","HDFC Bank","Kotak bank","ARVIND PATIL","Cash opening","Bank opening"];
    var vals = tr.getRange(2,2,tr.getLastRow()-1,1).getValues().flat().filter(String);
    return [...new Set(vals)];
  }
  if(sh.getLastRow()<2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,1).getValues().flat().filter(String);
}
function getProducts(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("PRODUCTS");
  if(!sh) return ["SBI FD","Kotak FD","BOM FD"];
  if(sh.getLastRow()<2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,1).getValues().flat().filter(String);
}
function addNewSupplier(name){
  name = (name+"").trim(); if(!name) return "नाव टाका";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("SUPPLIERS");
  if(!sh){ sh = ss.insertSheet("SUPPLIERS"); sh.appendRow(["Supplier Name"]); }
  var list = sh.getLastRow()>1? sh.getRange(2,1,sh.getLastRow()-1,1).getValues().flat().map(function(v){return (v+"").toLowerCase()}) : [];
  if(list.indexOf(name.toLowerCase())>-1) return "हे अकाउंट आधीच आहे: "+name;
  sh.appendRow([name]);
  return "OK - "+name+" Add झाला";
}
function addNewProduct(name){
  name = (name+"").trim(); if(!name) return "नाव टाका";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("PRODUCTS");
  if(!sh){ sh = ss.insertSheet("PRODUCTS"); sh.appendRow(["Product / FD Name"]); }
  var list = sh.getLastRow()>1? sh.getRange(2,1,sh.getLastRow()-1,1).getValues().flat().map(function(v){return (v+"").toLowerCase()}) : [];
  if(list.indexOf(name.toLowerCase())>-1) return "हे FD/Product आधीच आहे: "+name;
  sh.appendRow([name]);
  return "OK - "+name+" Add झाला";
}
function addTransaction(obj){
  var sh = getMainSheet();
  var lastRow = sh.getLastRow();
  var prevCash = lastRow>1? Number(sh.getRange(lastRow, 7).getValue())||0 : 0;
  var prevBank = lastRow>1? Number(sh.getRange(lastRow, 8).getValue())||0 : 0;
  var prevFD = lastRow>1? Number(sh.getRange(lastRow, 9).getValue())||0 : 0;
  var c = prevCash, b = prevBank, f = prevFD, t=0;
  var amt = Number(obj.amount)||0;
  var type = (obj.type+"").trim();
  var mode = (obj.mode+"").trim();
  var prod = (obj.product+"").trim();
  var isFD = prod.toLowerCase().indexOf("fd")>-1;
  if(isFD){
    if(type=="Paid" || type=="Purchase"){ if(mode=="Bank") b -= amt; else c -= amt; f += amt; }
    else { f -= amt; if(mode=="Bank") b += amt; else c += amt; }
  } else {
    if(type=="Sale" || type=="Received"){ if(mode=="Cash") c += amt; else if(mode=="Bank") b += amt; }
    else { if(mode=="Cash") c -= amt; else if(mode=="Bank") b -= amt; }
  }
  t = c + b + f;
  sh.appendRow([new Date(obj.date), obj.supplier, prod, obj.type, obj.mode, amt, c, b, f, t, t, obj.note||""]);
  addNewSupplier(obj.supplier);
  if(prod) addNewProduct(prod);
  return "Saved: "+type+" "+amt+" | Cash:"+c+" Bank:"+b+" FD:"+f+" Total:"+t;
}
function getReportData(){
  var sh = getMainSheet();
  if(sh.getLastRow()<2) return {sale:0,purchase:0,total:0,cash:0,bank:0,fd:0};
  var data = sh.getRange(2,1,sh.getLastRow()-1,12).getValues();
  var last = data[data.length-1];
  var jama=0, kharch=0;
  data.forEach(function(r){
    var t=r[3]+"", a=Number(r[5])||0; var prod=(r[2]+"").toLowerCase();
    if(prod.indexOf("fd")>-1) return;
    if(t=="Sale"||t=="Received") jama+=a; if(t=="Purchase"||t=="Paid") kharch+=a;
  });
  return {sale:jama, purchase:kharch, total:last[9], cash:last[6], bank:last[7], fd:last[8]};
}
function getTrialBalanceDetails(){
  var sh = getMainSheet(); if(sh.getLastRow()<2) return [];
  var data = sh.getRange(2,1,sh.getLastRow()-1,12).getValues();
  var temp = []; for(var i=0;i<data.length;i++){ temp.push({ row: i+2, dateObj: new Date(data[i][0]), d: data[i] }); }
  temp.sort(function(a,b){ return a.dateObj - b.dateObj; });
  var c=0,b=0,f=0,t=0; var res=[];
  for(var k=0;k<temp.length;k++){
    var d = temp[k].d; var type=(d[3]+"").trim(); var mode=(d[4]+"").trim(); var amt=Number(d[5])||0; var prod=(d[2]+"").toLowerCase(); var isFD = prod.indexOf("fd")>-1;
    if(isFD){ if(type=="Paid"||type=="Purchase"){ if(mode=="Bank") b-=amt; else c-=amt; f+=amt; } else { f-=amt; if(mode=="Bank") b+=amt; else c+=amt; } }
    else { if(type=="Sale"||type=="Received"){ if(mode=="Cash") c+=amt; else if(mode=="Bank") b+=amt; } else { if(mode=="Cash") c-=amt; else if(mode=="Bank") b-=amt; } }
    t=c+b+f;
    res.push({ row: temp[k].row, date: Utilities.formatDate(temp[k].dateObj, "Asia/Kolkata", "dd-MM-yyyy"), supplier: d[1], product: d[2], type: d[3], mode: d[4], amount: amt, total: t });
  }
  return res;
}
function getLedger(party){
  var sh = getMainSheet(); if(sh.getLastRow()<2) return [];
  var data = sh.getRange(2,1,sh.getLastRow()-1,12).getValues(); var list=[]; var search=(party+"").trim().toLowerCase();
  for(var i=0; i<data.length; i++){ if((data[i][1]+"").trim().toLowerCase()==search){ var d = data[i][0]; var dStr = ""; try { dStr = Utilities.formatDate(new Date(d), "Asia/Kolkata", "dd-MM-yyyy"); } catch(e){ dStr = d+""; } list.push({ row:i+2, date:dStr, sortTime: new Date(d).getTime(), product:data[i][2]+"", type:(data[i][3]+"").trim(), mode:data[i][4]+"", amount:Number(data[i][5])||0, note:data[i][11]+"" }); } }
  list.sort(function(a,b){ return a.sortTime - b.sortTime; }); var bal=0; for(var k=0;k<list.length;k++){ if(list[k].type=="Received"||list[k].type=="Sale") bal+=list[k].amount; else bal-=list[k].amount; list[k].bal=bal; list[k].total=bal; delete list[k].sortTime; } return list;
}
function getProductLedger(productName){
  var sh = getMainSheet(); if(sh.getLastRow()<2) return [];
  var data = sh.getRange(2,1,sh.getLastRow()-1,12).getValues(); var list=[]; var search=(productName+"").trim().toLowerCase();
  for(var i=0; i<data.length; i++){ if((data[i][2]+"").trim().toLowerCase()==search){ var d = data[i][0]; var dStr=""; try{ dStr=Utilities.formatDate(new Date(d), "Asia/Kolkata", "dd-MM-yyyy"); }catch(e){ dStr=d+""; } list.push({ row:i+2, date:dStr, sortTime: new Date(d).getTime(), supplier:data[i][1]+"", type:(data[i][3]+"").trim(), mode:data[i][4]+"", amount:Number(data[i][5])||0 }); } }
  list.sort(function(a,b){ return a.sortTime - b.sortTime; }); var bal=0; for(var k=0;k<list.length;k++){ if(list[k].type=="Paid"||list[k].type=="Purchase") bal+=list[k].amount; else bal-=list[k].amount; list[k].bal=bal; list[k].total=bal; delete list[k].sortTime; } return list;
}
function deleteAndRecalculate(row){
  var sh = getMainSheet(); if(row < 2) return "Invalid Row"; sh.deleteRow(row); if(sh.getLastRow() < 2) return "Deleted!";
  var data = sh.getRange(2,1,sh.getLastRow()-1,12).getValues(); var c=0,b=0,f=0,t=0;
  for(var i=0;i<data.length;i++){
    var type=data[i][3]+"", mode=data[i][4]+"", amt=Number(data[i][5])||0; var prod=(data[i][2]+"").toLowerCase(); var isFD = prod.indexOf("fd")>-1;
    if(isFD){ if(type=="Paid"||type=="Purchase"){ if(mode=="Bank") b-=amt; else c-=amt; f+=amt; } else { f-=amt; if(mode=="Bank") b+=amt; else c+=amt; } }
    else { if(type=="Sale"||type=="Received"){ if(mode=="Cash") c+=amt; else if(mode=="Bank") b+=amt; } else { if(mode=="Cash") c-=amt; else if(mode=="Bank") b-=amt; } }
    t=c+b+f; sh.getRange(i+2,7,1,5).setValues([[c,b,f,t,t]]);
  }
  return "✅ Deleted! New Total: "+t+" (Cash:"+c+" Bank:"+b+" FD:"+f+")";
}
function checkKotakMailsAuto(){
  var query = 'newer_than:2d (from:kotak OR from:hdfcbank OR from:hdfc OR from:mahabank OR from:bankofmaharashtra) (credited OR debited OR deposited OR withdrawn OR spent)';
  var threads = GmailApp.search(query, 0, 30); var count = 0;
  for(var i=0; i<threads.length; i++){
    var msgs = threads[i].getMessages();
    for(var j=0; j<msgs.length; j++){
      var msg = msgs[j]; if(!msg.isUnread()) continue;
      var body = (msg.getPlainBody() + " " + msg.getSubject()).toLowerCase();
      var originalBody = msg.getPlainBody() + " " + msg.getSubject();
      var amtMatch = originalBody.match(/(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i);
      if(!amtMatch) { msg.markRead(); continue; }
      var amt = Number(amtMatch[1].replace(/,/g,'')); if(amt <= 10) { msg.markRead(); continue; }
      var from = msg.getFrom().toLowerCase(); var bankName = "Kotak bank";
      if(from.indexOf("hdfc")>-1) bankName = "HDFC Bank"; else if(from.indexOf("maha")>-1) bankName = "BOM";
      var sh = getMainSheet();
      var allNotes = sh.getLastRow()>1? sh.getRange(2,12,sh.getLastRow()-1,1).getValues().flat().join(" ") : "";
      if(allNotes.indexOf(msg.getId()) > -1){ msg.markRead(); continue; }
      var isCredited = body.indexOf('credited')>-1 || body.indexOf('deposited')>-1;
      var tType = isCredited? "Received" : "Paid";
      addTransaction({ date: msg.getDate(), supplier: bankName, product: "", type: tType, mode: "Bank", amount: amt, note: "AUTO " + bankName + " | " + msg.getId() });
      msg.markRead(); count++;
    }
  }
  return "Added: " + count;
}
function getProfitLossData(){
  var sh = getMainSheet(); if(sh.getLastRow()<2) return {jama:0, kharch:0, profit:0, income:[], expense:[]};
  var data = sh.getRange(2,1,sh.getLastRow()-1,12).getValues(); var income=[], expense=[]; var jama=0, kharch=0;
  for(var i=0;i<data.length;i++){
    var d=data[i][0]; var dStr=""; try{ dStr=Utilities.formatDate(new Date(d), "Asia/Kolkata", "dd-MM-yyyy"); }catch(e){ dStr=d+""; }
    var obj={ date:dStr, supplier:data[i][1]+"", product:data[i][2]+"", type:data[i][3]+"", mode:data[i][4]+"", amount:Number(data[i][5])||0, row:i+2, note:data[i][11]+"" };
    var t=(data[i][3]+"").trim(); var prod=(data[i][2]+"").toLowerCase(); if(prod.indexOf("fd")>-1) continue;
    if(t=="Sale" || t=="Received"){ jama+=obj.amount; income.push(obj); } else { kharch+=obj.amount; expense.push(obj); }
  }
  return {jama:jama, kharch:kharch, profit:jama-kharch, income:income, expense:expense};
}
