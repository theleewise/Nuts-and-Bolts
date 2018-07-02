The icons are pulled from a single file called `svg-symbols.svg`. This file is then injected into the DOM (via JS) immediatly after the  opening `body`.

You can then use one with `<svg height="" width=""><use xlink:href="#icon-[ID]"></use></svg>`. 

To add a new icon, move the new svg icon to the directory `source/svg-icons` while the gulp task `gulp` or `gulp-watch` is running, or manually run the task `gulp-shapes` after you have added your new file to the directory. This will create a new `svg-symbols.svg` file so you will need to re-upload this file.

To add your new icon to the pattery library list, open the file `pattern-library/data.json` and add it to the icons array list.
