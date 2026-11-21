#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
for(const file of ['quiz-tests.cjs','quiz-validate.cjs','quiz-integrity.cjs','quiz-offline-check.cjs'])execFileSync(process.execPath,[path.join(root,'scripts',file)],{cwd:root,stdio:'inherit'});
