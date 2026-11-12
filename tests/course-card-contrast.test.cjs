'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const css=fs.readFileSync('dist/experience.css','utf8');
const app=fs.readFileSync('dist/app.js','utf8');
test('all active courses have a strong dark card background instead of nth-child white overrides',()=>{
  assert.match(app,/course\.active\?'qualification-available':'qualification-upcoming'/);
  assert.match(css,/\.qualification-card\.qualification-available\{background:linear-gradient\([^}]+!important/);
  assert.doesNotMatch(css,/\.qualification-card:nth-child\((?:3|4|5)\)[^}]*background:#fffefa!important/);
  assert.match(css,/\.qualification-card\.qualification-upcoming:nth-child\(3\)/);
});
test('course headings and summaries keep high contrast against the active card',()=>{
  assert.match(css,/\.qualification-card\.qualification-available h2\{[^}]*color:#fff/);
  assert.match(css,/\.qualification-card\.qualification-available p\{[^}]*color:#cfdfd7/);
  assert.match(css,/\.qualification-available \.qualification-index\{color:#b6c8c3/);
  assert.match(css,/\.qualification-available \.text-link\{color:#f3e3b8/);
});
