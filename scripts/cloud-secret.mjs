import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const input=await fs.readFile(path.resolve(root,process.env.GOOGLE_APPLICATION_CREDENTIALS||'.secrets/firebase-service-account.json'),'utf8');
const account=JSON.parse(input);
if(account.project_id!=='portfolio-backend-fe034'||!account.private_key||!account.client_email)throw new Error('Invalid service account');
const child=spawn(process.execPath,[path.join(root,'node_modules/wrangler/bin/wrangler.js'),'secret','put','FIREBASE_SERVICE_ACCOUNT'],{
  cwd:root,stdio:['pipe','inherit','inherit'],windowsHide:true
});
child.stdin.end(JSON.stringify(account));
child.on('exit',code=>process.exit(code??1));

