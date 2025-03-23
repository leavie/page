/**
 * 1. how JS loaded into a web broswer
 * 2. how JS obtain input
 * 3. how JS produce output
 * 4. how JS respond to events asynchronously
 *
 * JS in HTML <script> Tags
 * 1. basic usage
 * 2. modules
 * 3. purpose of script type attribute nowadays
 *  1. To specify that the script is a module
 *  2. To embed data into a web page without displaying it @see Ch15.3.4
 * 4. run: async and deferred attributes
 *  1. do not use `document.write()` to generate HTML output
 *  2. default: run script or element in order of html
 *  2. defer: wait html loaded to run script, run in order
 *  3. async: run script as soon as it loaded, out of order
 *  4. async take precedence over defer if they are both presented in tag
 * 5. load script on demand
 *  1.  load module on demand with `import()` function
 *  2. add <script> tag to your document dynamically
 */

