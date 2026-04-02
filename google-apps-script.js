// ============================================================
// CLICK TRACKER - Google Apps Script
// ============================================================
// Paste this into a Google Apps Script project attached to
// a Google Sheet. Deploy as a web app (execute as: me,
// access: anyone). Copy the web app URL and use it as the
// webhook URL in the tracking setup page.
// ============================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Clicks");

    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Clicks");
      sheet.appendRow([
        "Timestamp", "Applicant ID", "Applicant Name",
        "IP Address", "City", "Region", "Country",
        "Coordinates", "ISP/Org", "Timezone", "User Agent"
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.ts || new Date().toISOString(),
      data.id || "",
      data.name || "",
      data.ip || "",
      data.city || "",
      data.region || "",
      data.country || "",
      data.loc || "",
      data.org || "",
      data.timezone || "",
      data.ua || ""
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    "Click tracker is running. Use POST to log clicks."
  );
}
