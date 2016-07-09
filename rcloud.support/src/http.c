/* this is a simple utility to parse HTTP headers
   into a named vector. It allocates a fixed-length
   output vector for simplicity so it only supports
   a limited number of header entries, but since the
   main purpose is simply to pass-through request
   headers, it is sufficient.
   
   Simon Urbanek <simon.urbanek@R-project.org> */

#include <Rinternals.h>

#include <string.h>

#define MAX_HDR_ENTRIES 128

SEXP parse_headers(SEXP sRaw) {
    SEXP res = PROTECT(allocVector(STRSXP, MAX_HDR_ENTRIES)), rn = allocVector(STRSXP, MAX_HDR_ENTRIES);
    Rf_setAttrib(res, R_NamesSymbol, rn);
    int i = 0;
    const char *cs = (const char*) RAW(sRaw), *c = cs, *e;
    R_xlen_t len = XLENGTH(sRaw), ct = 0;
    e = c + len;
    while (c < e) {
        const char *r = memchr(c, ':', e - c);
        if (!r) /* we jsut ignore trailing content - it shouldn't be there ... */
            break;

        if (i == MAX_HDR_ENTRIES)
            Rf_error("Sorry, too many header entries, aborting");

        /* we have header field entry - add it */
        SET_STRING_ELT(rn, i, mkCharLen(c, r - c));
        c = r + 1;
        while (c < e && (*c == ' ' || *c == '\t')) c++;
        const char *val = c;
        while (1) {
            r = memchr(c, '\n', e - c);
            /* if we don't find a newline then just use everything till the end */
            if (!r) {
                while (e > c && (e[-1] == '\r' || e[-1] == '\n')) e--;
                SET_STRING_ELT(res, i, mkCharLen(val, e - val));
                i++;
                c = e; /* end */
                break;
            }
            /* advance */
            c = r + 1;
            /* not a continuation? add it */
            if (!(c < e && (*c == ' ' || *c == '\t'))) {
                /* trim newlines */
                while (r > val && (*r == '\n' || *r == '\t')) r--;
                SET_STRING_ELT(res, i, mkCharLen(val, r - val));
                i++;
                break;
            }
            /* continuation */
        }
    }
    SETLENGTH(rn, i);
    SETLENGTH(res, i);
    UNPROTECT(1);
    return res;
}
