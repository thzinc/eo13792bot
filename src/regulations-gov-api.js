'use latest';
import fetch from 'node-fetch';

const baseUrl = 'https://api.data.gov/regulations/v3';

export default (apiKey, docketId, count) =>
    fetch(`${baseUrl}/documents.json?api_key=${apiKey}&dktid=${docketId}&dct=PS&sb=postedDate&so=DESC&rpp=${count}`)
        .then(response => response.json())
        .then(page => page.documents);
