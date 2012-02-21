_debug = True
class Logger:
    indent=0
    @staticmethod
    def log(s):
        if _debug:
            print ' ' * Logger.indent + s
    @staticmethod
    def push():
        Logger.indent += 2
    @staticmethod
    def pop():
        Logger.indent -= 2
