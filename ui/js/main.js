const { ipcRenderer } = require('electron');
const ace = require('ace-builds/src-min/ace');
require('ace-builds/src-min/theme-solarized_dark');
require('ace-builds/src-min/mode-mysql');
const Handsontable = require('handsontable/dist/handsontable.full');

ace.config.set('basePath', './js/ace');
let editor = ace.edit("editor");
editor.setTheme("ace/theme/solarized_dark");
editor.session.setMode("ace/mode/mysql");
editor.setOptions({
    showPrintMargin: false,
    scrollPastEnd: 1,
});

editor.commands.addCommand({
    name: 'sendSqlCommand',
    bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
    exec: (editor) => {
        // console.log('sendSqlCommand');
        let sql = getActiveStatement();
        ipcRenderer.send('sendSql', sql);
    },
    readOnly: true,
});

ipcRenderer.on('sqlError', (e, message) => {
    renderError(message);
});

ipcRenderer.on('sqlResult', (e, message) => {
    renderTable(message);
});

function getActiveStatement() {
    let r = /\;+(.*)\;+/;
    let sql = editor.getValue();
    let cursorPosition = editor.getCursorPosition();
    return sql;
}

function renderTable(result) {
    console.log(result);
    var container = document.getElementById('result');
    new Handsontable(container, {
        data: result.rows,
        rowHeaders: true,
        colHeaders: result.fields,
        filters: true,
        stretchH: 'last',
        dropdownMenu: true
    });
}

function renderError(error) {
    console.log(error);
    document.getElementById('result').innerHTML = '';
    document.getElementById('result').innerText = error;
}
