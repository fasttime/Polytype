#!/usr/bin/env node

/* eslint-env node */

import { createReadStream }     from 'node:fs';
import { createServer }         from 'node:http';
import { networkInterfaces }    from 'node:os';
import { extname, join }        from 'node:path';
import { fileURLToPath }        from 'node:url';
import ansiColors               from 'ansi-colors';

const pathDir = fileURLToPath(new URL('..', import.meta.url));
const mimeTypes =
{
    '.css':     'text/css',
    '.html':    'text/html',
    '.js':      'application/javascript',
    '.mjs':     'application/javascript',
};
const port = 8080;
createServer
(
    ({ url }, response) =>
    {
        const requestPath = fileURLToPath(new URL(url, 'file:'));
        if (requestPath === '/favicon.ico')
        {
            const headers = { 'Content-Type': 'image/x-icon' };
            response.writeHead(204, headers);
            response.end();
            return;
        }
        const pathname = join(pathDir, requestPath);
        const stream = createReadStream(pathname);
        stream.on
        (
            'open',
            () =>
            {
                const headers = { };
                {
                    const ext = extname(requestPath);
                    if (mimeTypes.hasOwnProperty(ext))
                        headers['Content-Type'] = mimeTypes[ext];
                }
                response.writeHead(200, headers);
                stream.pipe(response);
            },
        );
        stream.on
        (
            'error',
            () =>
            {
                if (!response.headersSent)
                    response.writeHead(404);
                response.end();
            },
        );
    },
)
.listen(port);

{
    const ip = getIP();
    if (ip)
    {
        const { blue, bold } = ansiColors;
        const baseUrl = `http://${ip}:${port}`;
        console.log(`\n${bold('Spec Runner URL')}\n${blue(`${baseUrl}/test/spec-runner.html`)}\n`);
    }
}

function getIP()
{
    let ip;
    const networkInterfaceList = Object.values(networkInterfaces());
    for (const networkInterface of networkInterfaceList)
    {
        for (const assignedNetworkAddress of networkInterface)
        {
            if (!assignedNetworkAddress.internal)
            {
                let { address } = assignedNetworkAddress;
                const { family } = assignedNetworkAddress;
                // For IPv4, family is 4 in Node.js 18.0-18.3.
                if (family !== 'IPv4' && family !== 4)
                    address = `[${address}]`;
                if (!ip || ip.length > address.length)
                    ip = address;
            }
        }
    }
    return ip;
}
