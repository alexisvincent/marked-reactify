var React = require('react');
var marked = require('marked');
var marked_reactify = require('../../');

window.onload = function () {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var markdown = xhr.responseText;

            /* Essentially this is how you use marked-react-wrapper
             * Where marked is the instance of marked,
             */
            React.render(marked_reactify(marked, {})(markdown, {}), document.getElementById('md'));
        }
    };
    xhr.open("GET", "../../README.md", true);
    xhr.send();
}