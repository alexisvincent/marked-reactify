# Marked Reactify - A react wrapper for marked
Marked is a markdown parser and compiler. Built for speed.

Marked Reactify takes markdown as a string and returns a React Component Tree of your HTML.
Since Marked Reactify is just a wrapper for Marked, you should refer to it's documentation for
usage instructions.

To use Marked Reactify in your project simply wrap marked as follows

```javascript
/* Essentially this is how you use marked-reactify
 * Where marked is the instance of marked,
 */

 var market_reactify_config = {};
 var new_marked = marked_reactify(marked, marked_reactify_config);

 var ReactComponentTree = new_marked('# Marked in browser\n\nRendered by **marked**.', {});
 React.render(ReactComponentTree, document.getElementById('md'));
```
