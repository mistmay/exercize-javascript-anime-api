import {
    InitPage,
    searchButton
} from "./functions.js";

window.addEventListener('load', () => InitPage());
document.querySelector('nav button').addEventListener('click', () => searchButton());