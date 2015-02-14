#define USE_RINTERNALS 1
#include <Rinternals.h>

#include <string.h>
#include <stdlib.h>

#define skip_ws(c, e) while (c < e && (*c == ' ' || *c == '\t' || *c == '\n' || *c == '\r')) c++;

#define TY_NUL 0
#define TY_NUM 1
#define TY_STR 2
#define TY_ARR 3
#define TY_OBJ 4
#define TY_TRUE  -1
#define TY_FALSE -2

static int elt_type(const char **where, const char *e) {
    const char *c = *where;
    while (c < e) {
	switch (*c) {
	case ' ':
	case '\t':
	case '\n':
	case '\r':
	    c++;
	    continue;
	case '[':
	    *where = c;
	    return TY_ARR;
	case '{':
	    *where = c;
	    return TY_OBJ;
	case '"':
	    *where = c;
	    return TY_STR;
	case 't':
	    *where = c;
	    if (!strncmp(c, "true", 4))
		return TY_TRUE;
	    Rf_error("JSON error: element expected, found invalid word");
	case 'f':
	    *where = c;
	    if (!strncmp(c, "false", 5))
		return TY_FALSE;	
	    Rf_error("JSON error: element expected, found invalid word");
	case 'n':
	    *where = c;
	    if (!strncmp(c, "null", 4))
		return TY_NUL;
	    Rf_error("JSON error: element expected, found invalid word");
	default: /* number */
	    *where = c;
	    if (*c != '-' && (*c < '0' || *c > '9'))
		Rf_error("JSON error: element expected, found invalid word (%s)", c);
	    return TY_NUM;
	}
	Rf_error("JSON error: element expected, found invalid word");
    }
    Rf_error("JSON error: unexpected end if input");
    return TY_NUL; /* not reached */
}

static char *tmp_buf;
static unsigned long tmp_len;

static SEXP parse(const char **c, const char *e)
{
    int et = elt_type(c, e);
    switch (et) {
    case TY_NUL:
	*c += 4;
	return R_NilValue;
    case TY_TRUE:
	*c += 4;
	return ScalarLogical(TRUE);
    case TY_FALSE:
	*c += 5;
	return ScalarLogical(FALSE);
    case TY_NUM:
	{
	    const char *n = *c;
	    double d = atof(n);
	    /* [+-]\d+[.\d+][e[+-]\d+] */
	    if (n < e && (*n == '-' || *n == '+')) n++;
	    while (n < e && *n >= '0' && *n <= '9') n++;
	    if (n < e && *n == '.') {
		n++;
		while (n < e && *n >= '0' && *n <= '9') n++;
	    }
	    if (n < e && (*n == 'e' || *n == 'E')) {
		n++;
		if (n < e && (*n == '-' || *n == '+')) n++;
		while (n < e && *n >= '0' && *n <= '9') n++;
	    }
	    *c = n;
	    return ScalarReal(d);
	}
    case TY_STR:
	{
	    int use_binary = 0;
	    const char *n = *c, *m;
            char *dst;

	    n++;
            m = n; /* guess the length - need only an upper bound */
            while (m < e && *m != '"') {
                if (*m == '\\')
                    m++;
                m++;
            }
            if (m >= e)
                Rf_error("JSON error: unterminated string");

            if (!tmp_buf || tmp_len < (m - n + 2)) {
                tmp_len = m - n + 128;
                if (tmp_len < 4096) /* use at least 4k to avoid unncessary re-allocation */
                    tmp_len = 4096;
                if (tmp_buf)
                    free(tmp_buf);
                tmp_buf = (char*) malloc(tmp_len);
                if (!tmp_buf)
                    Rf_error("out of memory while trying to allocate JSON parse buffer of %lu bytes", tmp_len);
            }

            dst = tmp_buf; /* guaranteed to fit */

	    while (n < e && *n != '"') {
		if (*n == '\\') {
		    n++;
		    if (n >= e)
			Rf_error("JSON error: unterminated string");
		    switch (*n) {
		    case '"':
		    case '\\':
		    case '/':
                        *(dst++) = *(n++);
                        break;
		    case 'b':
                        *(dst++) = '\b';
                        n++;
                        break;
		    case 'f':
                        *(dst++) = '\f';
                        n++;
                        break;
		    case 'n':
                        *(dst++) = '\n';
                        n++;
                        break;
		    case 'r':
                        *(dst++) = '\r';
                        n++;
                        break;
		    case 't':
                        *(dst++) = '\t';
                        n++;
                        break;
		    case 'u':
			{
			    int i = 0;
                            unsigned int val = 0;
			    n++;
			    for (i = 0; i < 4; i++) {
                                val <<= 4;
                                if (n < e) {
                                    if (*n >= '0' && *n <= '9')
                                        val |= (unsigned int) (*n - '0');
                                    else if (*n >= 'A' && *n <= 'F')
                                        val |= (unsigned int) (10 + *n - 'A');
                                    else if (*n >= 'a' && *n <= 'f')
                                        val |= (unsigned int) (10 + *n - 'a');
                                    else
                                        Rf_error("JSON error: invalid \\uXXXX specification");
                                } else
                                    Rf_error("JSON error: invalid \\uXXXX specification");
                                n++;
			    }
                            *(dst++) = (char) val;

                            if ((val & 255) == 0)
                                use_binary = 1;
                            
                            /* FIXME: what do we do with anything beyond 8 bits ? Encode as UTF-8? */
                            break;
			}
		    default:
			Rf_error("JSON error: invalid escape \\%c in string", *n);
		    }
		} else
		    *(dst++) = *(n++);
	    }
	    if (n >=e || *n != '"')
		Rf_error("JSON error: unterminated string");
            n++;
            *c = n;
            /* FIXME: detect correct UTF-8 and flag accordingly? */
            if (use_binary) {
                SEXP res = allocVector(RAWSXP, dst - tmp_buf);
                memcpy(RAW(res), tmp_buf, dst - tmp_buf);
                return res;
            }
            return mkCharLenCE(tmp_buf, dst - tmp_buf, CE_BYTES);
	}

    case TY_ARR:
    {
	SEXP list = PROTECT(CONS(R_NilValue, R_NilValue)), tail = list, res = R_NilValue;
	unsigned long n = 0, i;
        SEXPTYPE common_type = VECSXP;
	const char *p = *c;
	p++;
        skip_ws(p, e);
        if (p < e && *p == ']') {
            p++;
            skip_ws(p, e);
            *c = p;
            UNPROTECT(1);
            return allocVector(VECSXP, 0);
        }
	while (p < e) {
	    SEXP elt = parse(&p, e);
            if (n == 0)
                common_type = TYPEOF(elt);
            else if (common_type != TYPEOF(elt) && common_type != VECSXP)
                common_type = VECSXP;

	    tail = SETCDR(tail, CONS(elt, R_NilValue));
            n++;
            skip_ws(p, e);
            if (p >= e || (*p != ',' && *p != ']'))
                Rf_error("JSON syntax error: , or ] expected after array element");
            if (*p == ']') break;
            p++;
        }
        if (p < e)
            p++;
        *c = p;
        /* if everything is a number, boolean or string, create the corresponding vector */
        if (common_type == REALSXP) {
            SEXP cur = CDR(list);
            res = PROTECT(allocVector(REALSXP, n));
            for (i = 0; i < n; i++, cur = CDR(cur))
                REAL(res)[i] = REAL(CAR(cur))[0];
        } else if (common_type == LGLSXP) {
            SEXP cur = CDR(list);
            res = PROTECT(allocVector(LGLSXP, n));
            for (i = 0; i < n; i++, cur = CDR(cur))
                LOGICAL(res)[i] = LOGICAL(CAR(cur))[0];
        } else if (common_type == CHARSXP) {
            SEXP cur = CDR(list);
            res = PROTECT(allocVector(STRSXP, n));
            for (i = 0; i < n; i++, cur = CDR(cur))
                SET_STRING_ELT(res, i, (CAR(cur) == R_NilValue) ? NA_STRING : CAR(cur));
        } else {
            SEXP cur = CDR(list);
            res = PROTECT(allocVector(VECSXP, n));
            for (i = 0; i < n; i++, cur = CDR(cur))
                SET_VECTOR_ELT(res, i, (TYPEOF(CAR(cur)) == CHARSXP) ? ScalarString(CAR(cur)) : CAR(cur));
        }            
        UNPROTECT(2); /* list, res */
        return res;
    }
    
    case TY_OBJ:
    {
	SEXP list = PROTECT(CONS(R_NilValue, R_NilValue)), tail = list, cur, res, nam;
        unsigned long n = 0, i;
        const char *p = *c;
        p++;
        skip_ws(p, e);
        if (p < e && *p == '}') {
            p++;
            skip_ws(p, e);
            *c = p;
            UNPROTECT(1);
            return allocVector(VECSXP, 0);
        }
        while (p < e) {
            SEXP name = PROTECT(parse(&p, e)), elt;
            if (TYPEOF(name) != CHARSXP)
                Rf_error("invalid object name - expecting a string");
            skip_ws(p, e);
            if (p >= e || *p != ':')
                Rf_error("JSON syntax error: `:' expected after object name");
            p++;
            elt = CONS(parse(&p, e), R_NilValue);
            n++;
            tail = SETCDR(tail, elt);
            SET_TAG(elt, Rf_install(CHAR(name)));
            UNPROTECT(1);
            skip_ws(p, e);
            if (p >= e || (*p != ',' && *p != '}'))
                Rf_error("JSON syntax error: `,' or `}' expected after object value (%s)", (p >= e) ? "**END-OF-INPUT**" : p);
            if (*p == '}') break;
            p++;
        }
        if (p < e)
            p++;
        *c = p;
        /* convert to VECSXP and wrap CHARSXP */
        cur = CDR(list);
        res = PROTECT(allocVector(VECSXP, n));
        nam = allocVector(STRSXP, n);
        Rf_setAttrib(res, R_NamesSymbol, nam);
        for (i = 0; i < n; i++, cur = CDR(cur)) {
            SET_VECTOR_ELT(res, i, (TYPEOF(CAR(cur)) == CHARSXP) ? ScalarString(CAR(cur)) : CAR(cur));
            SET_STRING_ELT(nam, i, PRINTNAME(TAG(cur)));
        }
        UNPROTECT(2);
        return res;
    }
    }
    
    /* unreachable */
    Rf_error("invalid element type");
    return R_NilValue;
}

SEXP parseJSON(SEXP sWhat) {
    const char *c = CHAR(STRING_ELT(sWhat, 0));
    SEXP res = parse(&c, c + strlen(c));
    return (TYPEOF(res) == CHARSXP) ? ScalarString(res) : res;
}
