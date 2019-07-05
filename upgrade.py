#!/usr/bin/python
#!coding=utf-8
import sqlite3

s_db = sqlite3.connect("source.db")
gsc_db = sqlite3.connect("gsc1.db")
cursor = s_db.execute("select * from works group by title, author having count(1) = 1")
cursor2 = gsc_db.execute("select work_title, work_author from gsc")
exist = set()
count = 0
for x in cursor2:
    exist.add((x[0], x[1]))

start = 8100
for x in cursor:
    if ((x[1], x[6])) not in exist:
        start += 1
        params = (
                start, x[1], x[6], x[10], 
                x[15] if x[15] else '', 
                x[18] if x[18] else '', 
                x[16] if x[16] else '', 
                x[13] if x[13] else '', 
                x[14] if x[14] else '', 
                 x[17] if x[17] else '', 
                  x[19] if x[19] else '', 
                  x[20] if x[20] else '', 
                  x[21] if x[21] else '')
        sql = '''INSERT INTO "gsc"(
            "id",
            "work_title", 
            "work_author", 
            "work_dynasty", 
            "content", 
            "translation", 
            "intro", 
            "baidu_wiki", 
            "foreword", 
            "annotation_", 
            "appreciation", 
            "master_comment", "layout") VALUES 
            (?,?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?, ?, ?)'''
        gsc_db.execute(sql, params)
        count += 1
gsc_db.commit()
gsc_db.close()
s_db.close()
print(count)