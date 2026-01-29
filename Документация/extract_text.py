# -*- coding: utf-8 -*-
from docx import Document

doc = Document('Проект Школа.docx')
with open('extracted_text.txt', 'w', encoding='utf-8') as f:
    for para in doc.paragraphs:
        f.write(para.text + '\n')
print("Done!")
