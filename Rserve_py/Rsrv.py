import struct

class phdr:
    def __init__(self, *args):
        if len(args) == 1:
            self._init_from_str(args[0])
        else:
            self._init_from_values(*args)
    def _init_from_str(self, s):
        self.cmd, self.len, self.dof, self.res = struct.unpack('iiii', s)
    def _init_from_values(self, cmd=0, len=0, dof=0, res=0):
        self.cmd = cmd
        self.len = len
        self.dof = dof
        self.res = res
    def ptoi(self):
        self.cmd = ptoi(self.cmd)
        self.len = ptoi(self.len)
        self.dof = ptoi(self.dof)
        self.res = ptoi(self.res)
    def itop(self):
        self.cmd = itop(self.cmd)
        self.len = itop(self.len)
        self.dof = itop(self.dof)
        self.res = itop(self.res)
    def buf(self):
        return struct.pack('iiii', self.cmd, self.len, self.dof, self.res)

def PAR_TYPE(X): return X & 255
def PAR_LEN(X): return int(X) >> 8
PAR_LENGTH = PAR_LEN

def par_parse(X): return (PAR_TYPE(X), PAR_LEN(X))

def SET_PAR(TY, LEN): return ((int(LEN) & 0xffffff) << 8) | (TY & 255)

def CMD_STAT(X): return (X >> 24) & 127
def SET_STAT(X,s): return X | ((s & 127) << 24)
CMD_RESP = 0x10000
RESP_OK            = CMD_RESP | 0x0001
RESP_ERR           = CMD_RESP | 0x0002
ERR_auth_failed    = 0x41
ERR_conn_broken    = 0x42
ERR_inv_cmd        = 0x43
ERR_inv_par        = 0x44
ERR_Rerror         = 0x45
ERR_IOerror        = 0x46
ERR_notOpen        = 0x47
ERR_accessDenied   = 0x48
ERR_unsupportedCmd = 0x49
ERR_unknownCmd     = 0x4a
ERR_data_overflow  = 0x4b
ERR_object_too_big = 0x4c
ERR_out_of_mem     = 0x4d
ERR_ctrl_closed    = 0x4e
ERR_session_busy   = 0x50
ERR_detach_failed  = 0x51


CMD_long             = 0x001
CMD_voidEval         = 0x002
CMD_eval             = 0x003
CMD_shutdown         = 0x004
CMD_openFile         = 0x010
CMD_createFile       = 0x011
CMD_closeFile        = 0x012
CMD_readFile         = 0x013
CMD_writeFile        = 0x014
CMD_removeFile       = 0x015
CMD_setSEXP          = 0x020
CMD_assignSEXP       = 0201
CMD_detachSession    = 0x030
CMD_detachedVoidEval = 0x031
CMD_attachSession    = 0x032
CMD_ctrl             = 0x40
CMD_ctrlEval         = 0x42
CMD_ctrlSource       = 0x45
CMD_ctrlShutdown     = 0x44
CMD_setBufferSize    = 0x081
CMD_setEncoding      = 0x082
CMD_SPECIAL_MASK     = 0xf0
CMD_serEval          = 0xf5
CMD_serAssign        = 0xf6
CMD_serEEval         = 0xf7


DT_INT        = 1
DT_CHAR       = 2
DT_DOUBLE     = 3
DT_STRING     = 4
DT_BYTESTREAM = 5
DT_SEXP       = 10
DT_ARRAY      = 11
DT_LARGE      = 64

XT_NULL          = 0
XT_INT           = 1
XT_DOUBLE        = 2
XT_STR           = 3
XT_LANG          = 4
XT_SYM           = 5
XT_BOOL          = 6
XT_S4            = 7
XT_VECTOR        = 16
XT_LIST          = 17
XT_CLOS          = 18
XT_SYMNAME       = 19
XT_LIST_NOTAG    = 20
XT_LIST_TAG      = 21
XT_LANG_NOTAG    = 22
XT_LANG_TAG      = 23
XT_VECTOR_EXP    = 26
XT_VECTOR_STR    = 27
XT_ARRAY_INT     = 32
XT_ARRAY_DOUBLE  = 33
XT_ARRAY_STR     = 34
XT_ARRAY_BOOL_UA = 35
XT_ARRAY_BOOL    = 36
XT_RAW           = 37
XT_ARRAY_CPLX    = 38
XT_UNKNOWN       = 48
XT_LARGE         = 64
XT_HAS_ATTR      = 128

BOOL_TRUE  = 1
BOOL_FALSE = 0
BOOL_NA    = 2

def GET_XT(X): return X & 63
def GET_DT(X): return X & 63
def HAS_ATTR(X): return (X & XT_HAS_ATTR) > 0
def IS_LARGE(X): return (X & XT_LARGE) > 0

# FIXME A WHOLE LOT OF MACROS HERE WHICH ARE PROBABLY IMPORTANT
##############################################################################

# FIXME FOR BIG-ENDIAN

def itop(x): return x
def ptoi(x): return x
def dtop(x): return x
def ptod(x): return x

def fixdcpy(T, S): raise "NOT YET"
