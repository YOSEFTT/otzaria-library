const mediaWikiEndPoint = "https://wiki.jewishbooks.org.il/mediawiki/api.php"
const main_url = "https://wiki.jewishbooks.org.il/mediawiki/wiki/"

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("תפריט פעולות")
    .addItem("הרץ כעת", "main")
    .addItem("הסתר את הגליונות שטופלו", "hideDoneBooks")
    .addItem("הצג את הגליונות שטופלו", "showDoneBooks")
    .addToUi();
}

function getListByCategory(name='אמרי_נועם_(הגר"א)'){
  let pages = []
  let apcontinue = ''
  while(true){
    let url = `${mediaWikiEndPoint}?action=query&list=allpages&apprefix=${encodeURIComponent(name)}&aplimit=max&format=json`
    if (apcontinue) {
      url += `&apcontinue=${encodeURIComponent(apcontinue)}`
    }
    let response = UrlFetchApp.fetch(url)
    let jsonResponse = JSON.parse(response.getContentText())
    if(!(jsonResponse.query && jsonResponse.query.allpages)){
      break
    }
    jsonResponse["query"]["allpages"].forEach(page => {
      pages.push(page.title)
    })
    if(!jsonResponse["continue"]){
      break
    }
    apcontinue = jsonResponse['continue']['apcontinue']
  }
  return pages
}

function main(){
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName("ספרים")
  const range = sheet.getRange(2, 1, sheet.getLastRow()-1, 5)
  const data = range.getValues()
  data.forEach(row => {
    const [book_name, book_author, done, book_link, book_page_name] = row;
    if(done){
      return
    }
    let bookSheet = ss.getSheetByName(book_name)
    // if(!bookSheet){
    //   bookSheet = ss.insertSheet(book_name)
    // }
    if(bookSheet){
      return
    }
    bookSheet = ss.insertSheet(book_name)
    let pages = getListByCategory(book_page_name)
    let headers = ["דף", "לינק", "כותרת רמה 1", "כותרת רמה 2", "כותרת רמה 3", "כותרת רמה 4", "כותרת רמה 5", "כותרת רמה 6"]
    let headersRange = bookSheet.getRange(1, 1, 1, headers.length)
    headersRange.setValues([headers])
    headersRange.setBackground("yellow");
    bookSheet.setFrozenRows(1);
    bookSheet.setRightToLeft(true)
    let bookSheetData = []
    pages.forEach(page => {
      // let url = main_url + page.replaceAll(" ", "_").replaceAll(")", "%29").replaceAll("(", "%28")
      // let url = main_url + encodeURIComponent(page).replace(/%20/g, "_");
      let url = main_url + page
      let row = [page, url, ...page.split("/")]
      while (row.length < headers.length) {
        row.push("");
      }
      bookSheetData.push(row)
    })
    let pagesRange = bookSheet.getRange(2, 1, bookSheetData.length, headers.length)
    pagesRange.setValues(bookSheetData)
  })
}

function hideDoneBooks(){
  changeVisibilityDoneBooks(true)
}
function showDoneBooks(){
  changeVisibilityDoneBooks(false)
}

function changeVisibilityDoneBooks(hide) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("ספרים");
  if (!sheet) throw new Error("לא נמצא גיליון בשם 'ספרים'");

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();

  data.forEach(row => {
    const [book_name, , done] = row;
    if (!done || !book_name) return;

    const bookSheet = ss.getSheetByName(book_name);
    if (!bookSheet) return;
    const isHidden = bookSheet.isSheetHidden();

    if (hide && !isHidden) {
      bookSheet.hideSheet();
      Logger.log(`הוסתר: ${book_name}`);
    } else if (!hide && isHidden) {
      bookSheet.showSheet();
      Logger.log(`הוצג: ${book_name}`);
    }
  });
}


