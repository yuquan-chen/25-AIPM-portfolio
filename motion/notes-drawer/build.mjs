import {build} from 'esbuild';
await build({entryPoints:['browser.js'], bundle:true, format:'iife', target:['es2020'], minify:true, outfile:'../../scripts/notes-drawer.js', legalComments:'eof', define:{'process.env.NODE_ENV':'"production"'}});
