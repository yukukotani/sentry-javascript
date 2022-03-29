import * as fs from 'fs';

let filesJSON = JSON.stringify(fs.readdirSync('./packages/integrations/src'));
// Escape all of the quotes so that when this get parameter-expanded in a quoted
// bash string, the quotes will still be valid. (We use `split` and `join`
// because `replaceAll` support requires different tsconfig settings, and this
// is just easier.)
// filesJSON = filesJSON.split('"').join('\\"');
console.log(filesJSON);
