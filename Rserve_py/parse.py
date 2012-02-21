import struct
from log import Logger
from Rsrv import *
import scipy

##############################################################################

def parse(sock):
    d = struct.unpack('i', sock.recv(4))[0]
    (t, l) = par_parse(d)
    if t == DT_INT:
        return struct.unpack('i', sock.recv(4))[0], 8
    elif t == DT_STRING:
        return sock.recv(l)[:-1], 4 + l
    elif t == DT_BYTESTREAM:
        return sock.recv(l), 4 + l
    elif t == DT_SEXP:
        sexp, l2 = parse_sexp(sock)
        return sexp, l + l2
    else:
        raise Exception("bad type for parse? %d %d" % t, l)

def parse_sexp(sock):
    Logger.log("reading SEXPR")
    Logger.push()
    d = struct.unpack('i', sock.recv(4))[0]
    (t, l) = par_parse(d)
    Logger.log("TL: %d %d" % (t, l))
    total_read = 4
    if t == XT_NULL:
        Logger.log("reading XT_NULL")
        Logger.pop()
        return None, total_read
    elif t == XT_VECTOR:
        Logger.log("reading XT_VECTOR")
        result = []
        while l > 0:
            Logger.push()
            (sexp, read_t) = parse_sexp(sock)
            Logger.pop()
            l = l - read_t
            total_read += read_t
            result.append(sexp)
        Logger.pop()
        return result, total_read
    elif t == XT_CLOS:
        Logger.log("reading XT_CLOS")
        (formals, read_1) = parse_sexp(sock)
        (body, read_2) = parse_sexp(sock)
        return [formals, body], total_read + read_1 + read2
    elif t == XT_SYMNAME:
        Logger.log("reading XT_SYMNAME")
        v = sock.recv(l)
        Logger.pop()
        return v[:-1], total_read + l
    elif t == XT_LIST_NOTAG:
        Logger.log("reading XT_LIST_NOTAG")
        result = []
        while l > 0:
            Logger.push()
            (sexp, read_t) = parse_sexp(sock)
            Logger.pop()
            l = l - read_t
            total_read += read_t
            result.append(sexp)
        Logger.pop()
        return result, total_read
    elif t == XT_LIST_TAG:
        Logger.log("reading XT_LIST_TAG")
        result = []
        while l > 0:
            Logger.push()
            (tag, read_t_1) = parse_sexp(sock)
            (value, read_t_2) = parse_sexp(sock)
            Logger.pop()
            l = l - read_t_1 - read_t_2
            total_read += read_t_1 + read_t_2
            result.append((tag, value))
        Logger.pop()
        return result, total_read
    elif t == XT_VECTOR_EXP:
        Logger.log("reading XT_VECTOR_EXP")
        result = []
        while l > 0:
            Logger.push()
            (sexp, read_t) = parse_sexp(sock)
            Logger.pop()
            l = l - read_t
            total_read += read_t
            result.append(sexp)
        Logger.pop()
        return result, total_read
    elif t == XT_ARRAY_INT:
        Logger.log("reading XT_ARRAY_INT")
        result = scipy.fromstring(sock.recv(l), dtype='int32')
        total_read += l
        Logger.pop()
        return result, total_read
    elif t == XT_ARRAY_DOUBLE:
        Logger.log("reading XT_ARRAY_DOUBLE")
        result = scipy.fromstring(sock.recv(l), dtype='float64')
        total_read += l
        Logger.pop()
        return result, total_read
    elif t == XT_ARRAY_STR:
        Logger.log("reading XT_ARRAY_STR")
        result = []
        Logger.pop()
        return sock.recv(l).split('\0')[:-1], total_read + l
    elif t == XT_ARRAY_BOOL:
        Logger.log("reading XT_ARRAY_BOOL")
        d = sock.recv(l)
        n = struct.unpack('i', d[:4])[0]
        result = scipy.fromstring(d[4:4+n], dtype='bool')
        total_read += l
        Logger.pop()
        return result, total_read
    elif t == XT_RAW:
        raise Exception("unimplemented")
    elif t == XT_ARRAY_CPLX:
        raise Exception("unimplemented")
    elif t == XT_UNKNOWN:
        raise Exception("unimplemented")
    else:
        raise Exception("Bad data?!")
