#!/usr/bin/env node

/* eslint-env node */

'use strict';

const chalk                         = require('chalk');
const { createReadStream }          = require('fs');
const { createServer }              = require('http');
const { networkInterfaces }         = require('os');
const { dirname, extname, join }    = require('path');
const { fileURLToPath }             = require('url');

const pathDir = dirname(__dirname);
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
        const baseUrl = `http://${ip}:${port}`;
        console.log
        (`\n${chalk.bold('Spec Runner URL')}\n${chalk.blue(`${baseUrl}/test/spec-runner.html`)}\n`);
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
                if (assignedNetworkAddress.family !== 'IPv4')
                    address = `[${address}]`;
                if (!ip || ip.length > address.length)
                    ip = address;
            }
        }
    }
    return ip;
}
