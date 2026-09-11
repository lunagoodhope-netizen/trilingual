/** 트리링구얼 전용 읽기 연결. Google Sheets 공유 권한은 변경하지 않습니다. */
const TRILINGUAL_SHEET_ID = '1nq5g5YUJQkATZP6Q6UnjKA8mjPHOf9hDEaiHPY3dS0g';

function setupConnection() {
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty('TRILINGUAL_READ_KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('TRILINGUAL_READ_KEY', key);
  }
  SpreadsheetApp.openById(TRILINGUAL_SHEET_ID).getSheets();
  console.log('개인 연결 키 (웹앱의 시트 연결에 입력): ' + key);
}

function doGet() {
  return ContentService.createTextOutput('Trilingual read-only connection. POST with a valid key is required.');
}

function doPost(e) {
  let result;
  try {
    const input = JSON.parse(e.postData.contents);
    const key = PropertiesService.getScriptProperties().getProperty('TRILINGUAL_READ_KEY');
    if (!key || typeof input.key !== 'string' || input.key !== key) {
      result = {ok: false, error: 'UNAUTHORIZED'};
    } else {
      const ss = SpreadsheetApp.openById(TRILINGUAL_SHEET_ID);
      const read = (name, width) => {
        const sheet = ss.getSheetByName(name);
        if (!sheet) throw new Error('MISSING_TAB');
        const values = sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), width).getDisplayValues();
        return values.filter((row, index) => index === 0 || row.some(value => value !== ''));
      };
      result = {ok: true, spreadsheetId: TRILINGUAL_SHEET_ID, fetchedAt: new Date().toISOString(), history: {chinese: read('중국어', 10), english: read('영어', 11)}};
    }
  } catch (error) { result = {ok: false, error: 'READ_FAILED'}; }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
