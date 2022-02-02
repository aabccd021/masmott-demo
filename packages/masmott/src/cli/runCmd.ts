/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/no-return-void */
import * as cp from 'child_process';

export const runCmd = (cmd: string): Promise<number | undefined> =>
  new Promise((resolve, reject) => {
    const proc = cp.spawn(cmd, { shell: true });
    proc.stdout.on('data', (data: Buffer) => process.stdout.write(data.toString()));
    proc.stderr.on('data', (data: Buffer) => process.stderr.write(data.toString()));
    proc.on('exit', resolve);
    proc.on('error', reject);
  });
