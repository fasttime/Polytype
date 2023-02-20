/* eslint-env shared-node-browser */

let counter = 0;

export default function (relativeURL)
{
    const url = new URL(relativeURL, import.meta.url);
    url.search = `${++counter}`;
    const promise = import(url);
    return promise;
}
