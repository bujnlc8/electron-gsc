const fs = require("fs")

// format语法糖
String.prototype.format = function () {
    if (arguments.length == 0) return this;
    for (var s = this, i = 0; i < arguments.length; i++)
        s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    return s;
};

// 写文件

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

// 处理古诗词格式
const beautifyGsc = (gsc_obj) => {
    if (!gsc_obj.annotation_) {
        gsc_obj.annotation_ = ""
    }
    if (!gsc_obj.appreciation) {
        gsc_obj.appreciation = ""
    }
    if (!gsc_obj.content) {
        gsc_obj.content = ""
    }
    if (!gsc_obj.foreword) {
        gsc_obj.foreword = ""
    }
    if (!gsc_obj.intro) {
        gsc_obj.intro = ""
    }
    if (!gsc_obj.master_comment) {
        gsc_obj.master_comment = ""
    }
    if (!gsc_obj.translation) {
        gsc_obj.translation = ""
    }
    if (!gsc_obj.work_author) {
        gsc_obj.work_author = ""
    }
    if (!gsc_obj.work_dynasty) {
        gsc_obj.work_dynasty = ""
    }
    if (!gsc_obj.work_title) {
        gsc_obj.work_title = ""
    }
    // 句号
    let period_index = gsc_obj.content.indexOf("。");
    if (period_index == -1) {
        // 感叹号
        let exclamatory_mark_index = gsc_obj.content.indexOf("！");
        if (exclamatory_mark_index == -1) {
            // 问号
            let question_mark_index = gsc_obj.content.indexOf("？");
            gsc_obj.short_content = gsc_obj.content.slice(
                0,
                question_mark_index + 1
            );
        } else
            [
                (gsc_obj.short_content = gsc_obj.content.slice(
                    0,
                    exclamatory_mark_index + 1
                ))
            ];
    } else {
        gsc_obj.short_content = gsc_obj.content.slice(0, period_index + 1);
    }
    gsc_obj.short_content = gsc_obj.short_content.replace(/\\r|\\n/g, "")
    if (gsc_obj.layout == "indent") {
        gsc_obj.content = gsc_obj.content.replace(/\t|\n|\r/g, "</br>&emsp;&emsp;");
    } else {
        gsc_obj.content = gsc_obj.content.replace(/\t|\n|\r/g, "</br>");
    }
    gsc_obj.content = gsc_obj.content.replace(/\\r|\\n/g, "")
    gsc_obj.translation = gsc_obj.translation.replace(
        /\t|\n|\r/g,
        "</br>&emsp;&emsp;"
    );
    gsc_obj.translation = gsc_obj.translation.replace(/\\r|\\n/g, "");
    gsc_obj.annotation_ = gsc_obj.annotation_.replace(
        /\t|\n|\r/g,
        "</br>&emsp;&emsp;"
    );
    gsc_obj.annotation_ = gsc_obj.annotation_.replace(/\\r|\\n/g, "");
    gsc_obj.appreciation = gsc_obj.appreciation.replace(
        /\t|\n|\r/g,
        "</br>&emsp;&emsp;"
    );
    gsc_obj.appreciation = gsc_obj.appreciation.replace(
        /\\r|\\n/g, ""
    );
    gsc_obj.master_comment = gsc_obj.master_comment.replace(
        /\t|\n|\r/g,
        "</br>&emsp;&emsp;"
    );
    gsc_obj.master_comment = gsc_obj.master_comment.replace(
        /\\r|\\n/g, ""
    );
    gsc_obj.intro = gsc_obj.intro.replace(/\n|\t/g, "</br>&emsp;&emsp;");
    gsc_obj.intro = gsc_obj.intro.replace(/\\r|\\n/g, "");
    return gsc_obj
}

export {
    writeFile,
    beautifyGsc
}