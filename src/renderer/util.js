String.prototype.format = function () {
    if (arguments.length == 0) return this;
    for (var s = this, i = 0; i < arguments.length; i++)
        s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    return s;
};

const fs = require("fs")

const writeFile = (file_url, content) => {
    if (!fs.existsSync(file_url)) {
        fs.writeFileSync(file_url, JSON.stringify(content))
    } else {
        let old_data = fs.readFileSync(file_url)
        old_data = JSON.parse(old_data)
        for (let key in content) {
            old_data[key] = content[key]
        }
        fs.writeFileSync(file_url, JSON.stringify(old_data))
    }
}

export {
    writeFile
}