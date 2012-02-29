##Embedding Ace

Ace can be easily embedded into any existing web page. The Ace git repository ships with a pre-packaged version of Ace inside of the build directory. The same packaged files are also available as a separate download. Simply copy the contents of the src subdirectory somewhere into your project and take a look at the included demos of how to use Ace.

The easiest version is simply:

```html
<div id="editor" style="height: 500px; width: 500px">some text</div>
<script src="src/ace.js" type="text/javascript" charset="utf-8"></script>
<script>
window.onload = function() {
    var editor = ace.edit("editor");
};
</script>
```

To change the theme simply include the Theme's JavaScript file

```html
<script src="src/theme-twilight.js" type="text/javascript" charset="utf-8"></script>
```

and configure the editor to use the theme:

```javascript
editor.setTheme("ace/theme/twilight");
```


By default the editor only supports plain text mode. However all other language modes are available as separate modules. After including the mode's Javascript file

```html
<script src="src/mode-javascript.js" type="text/javascript" charset="utf-8"></script>
```

the mode can be used like this:

```javascript
var JavaScriptMode = require("ace/mode/javascript").Mode;
editor.getSession().setMode(new JavaScriptMode());
```

## API
Set content:

```javascript
editor.getSession().setValue("the new text here");
```

Get content:

```javascript
editor.getSession().getValue();
```

Get selection:

```javascript
editor.getSession().doc.getTextRange(editor.getSelectionRange());
```

Insert at cursor:

```javascript
editor.insert("Something cool");
```

Go to line:

```javascript
editor.gotoLine(line_number);
```

Tab size:

```javascript
editor.getSession().setTabSize(4);
```

Use soft tabs:

```javascript
editor.getSession().setUseSoftTabs(true);
```

Font size:

```javascript
document.getElementById('editor').style.fontSize='12px';
```

Toggle Word Wrap:

```javascript
editor.getSession().setUseWrapMode(true);
```

Toggle Highlight line:

```javascript
editor.setHighlightActiveLine(false);
```

Set Print Margin Visibility:

```javascript
editor.setShowPrintMargin(false);
```

Set to read-only:

```javascript
editor.setReadOnly(true);  // false for the editable
```

Find

```javascript
editor.find('needle',{
  backwards: false,
  wrap: false,
  caseSensitive: false,
  wholeWord: false,
  regExp: false
});
editor.findNext();
editor.findPrevious();
```

Replace:

```javascript
editor.find('foo');
editor.replace('bar');
```

Replace All:

```javascript
editor.replaceAll('bar');
```

## Events
OnChange:

```javascript
editor.getSession().on('change', callback);
```

Selection change:

```javascript
editor.getSession().selection.on('changeSelection', callback);
```

Cursor change:

```javascript
editor.getSession().selection.on('changeCursor', callback);
```

Assign key binding to custom function:

```javascript
editor.commands.addCommand({
    name: 'myCommand',
    bindKey: {
        win: 'Ctrl-M',
        mac: 'Command-M',
        sender: 'editor'
    },
    exec: function(env, args, request) {
        //...
    }
})
```

## Still to work out


## Howtos

How do you get access to the editor (not the DOM element, but the ace.edit() editor)?

```javascript
window.onload = function()
{
  window.aceEditor = ace.edit("editor");
}

// Then elsewhere...
window.aceEditor.getSession().insert("Awesome!");
```