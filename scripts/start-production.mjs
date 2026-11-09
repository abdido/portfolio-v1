import { spawn } from 'node:child_process';
const child=spawn(process.execPath,['--env-file-if-exists=.env','server/index.js'],{stdio:'inherit',env:{...process.env,NODE_ENV:'production',PORT:process.env.PORT||'8080'},windowsHide:true});
child.on('exit',code=>process.exit(code??0));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
