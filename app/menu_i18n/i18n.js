import { app } from 'electron';

const path = require("path")
const electron = require('electron')
const fs = require('fs');
let loadedLanguage;

module.exports = i18n;

function i18n() {
    if(fs.existsSync(path.join(__dirname, app.getLocale() + '1.js'))) {
         loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, app.getLocale() + '1.js'), 'utf8'));
    }
    else {
         loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, 'en1.js'), 'utf8'))
    }
}

i18n.prototype.__ = function(phrase, local) {
    let translation = loadedLanguage[phrase]
    if(translation === undefined) {
         translation = phrase
    }
    return translation
}