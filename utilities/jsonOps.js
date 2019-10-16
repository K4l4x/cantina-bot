const fileSystem = require('fs');

class JsonOps {
    async saveAs(folder, name, content) {
        const path = 'resources/' + folder + '/' + name + '.json';
        const json = JSON.stringify(content, null, 2);
        try {
            console.log('[JsonOps]: Trying to write to ' + path + ' ...');
            fileSystem.writeFileSync(path, json, 'utf8');
            console.log('[JsonOps]: Writing done');
        } catch (err) {
            console.error('Error writing JSON file:' +
                '\n => path: ' + path + '\n => message' + err);
        }
    }

    async loadFrom(folder, name) {
        const path = 'resources/' + folder + '/' + name + '.json';
        let result = null;
        try {
            console.log('[JsonOps]: Trying to read from ' + path + ' ...');
            result = JSON.parse(fileSystem.readFileSync(path, 'utf8'));
            console.log('[JsonOps]: Reading done');
        } catch (err) {
            console.error('Error loading JSON file:' +
                '\n => path: ' + path + '\n => message: ' + err);
        }
        return result;
    }
}

module.exports.JsonOps = JsonOps;
