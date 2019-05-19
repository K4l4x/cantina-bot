const Crawler = require('simplecrawler');

const crawler = new Crawler('http://www.studierendenwerk-bielefeld.de/essen-trinken/essen-und-trinken-in-mensen/bielefeld/mensa-gebaeude-x.html');

crawler.interval = 10000; // Ten seconds, but should be higher in production, because it's not time critical.
crawler.maxConcurrency = 3; // How many times the crawler should gather info.

crawler.maxDepth = 1; // Only first page is fetched (with linked CSS & images).


