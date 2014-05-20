#!/usr/bin/env python

import json
import sys

class Output:

    def __init__(self):
        self.part = 1

    def markdown_cell(self, content):
        f = open('part%s.md' % self.part, 'w')
        f.write(content)
        f.write('\n')
        f.close()
        self.part += 1

    def python_cell(self, content):
        f = open('part%s.py' % self.part, 'w')
        f.write(content.encode('utf-8'))
        f.write('\n')
        f.close()
        self.part += 1

class Main:

    def __init__(self):
        self.out = Output()

    def process(self, j):
        for cell in j[u'worksheets'][0][u'cells']:
            try:
                getattr(self, str(cell[u'cell_type']))(cell)
            except AttributeError, e:
                print >> sys.stderr, e
                print json.dumps(cell)
                raise

    def heading(self, cell):
        self.out.markdown_cell('#' * cell[u'level'] + ' ' + " ".join(cell[u'source']))

    def markdown(self, cell):
        self.out.markdown_cell("\n".join(cell[u'source']))

    def code(self, cell):
        self.out.python_cell("".join(cell[u'input']))

if __name__ == '__main__':
    main = Main()
    main.process(json.load(file(sys.argv[1])))
