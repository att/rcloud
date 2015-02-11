#define USE_RINTERNALS 1
#include <Rinternals.h>

#include <string.h>

static const char *encoded_set = ":/?#[]@!$&'()*+,;=%";
static const char *hex = "0123456789ABCDEF";

static char buf[1024];

static const char *encode1(const char *c) {
    int len = strlen(c);
    const char *e = c + len;
    if (len * 3 < sizeof(buf) - 1) { /* guarateed to fit */
        const char *e = c + len;
        char *d = buf;
        while (c < e) {
            int ci = (int) *((unsigned char*)c);
            if (ci > 127 || ci < 32 || strchr(encoded_set, ci)) {
                *(d++) = '%';
                *(d++) = hex[(ci >> 4)];
                *(d++) = hex[ci & 15];
            } else
                *(d++) = *c;
            c++;
        }
        *d = 0;
        return buf;
    } else { /* two pass - count then create */
        int extra = 0;
        const char *orig = c;
        char *d, *dst;

        while (c < e) {
            int ci = (int) *((unsigned char*)c);
            if (ci > 127 || ci < 32 || strchr(encoded_set, ci))
                extra++;
            c++;
        }
        c = orig;
        if (!extra)
            return c;
        dst = d = R_alloc(extra * 2 + len + 1, 1);
        while (c < e) {
            int ci = (int) *((unsigned char*)c);
            if (ci > 127 || ci < 32 || strchr(encoded_set, ci)) {
                *(d++) = '%';
                *(d++) = hex[(ci >> 4)];
                *(d++) = hex[ci & 15];
            } else
                *(d++) = *c;
            c++;
        }
        *d = 0;
        return dst;
    }
}

SEXP uri_encode(SEXP sWhat) {
    int i, n = LENGTH(sWhat);
    SEXP res = PROTECT(allocVector(STRSXP, n));
    for (i = 0; i < n; i++)
        SET_STRING_ELT(res, i, (STRING_ELT(sWhat, i) == NA_STRING) ? NA_STRING : mkChar(encode1(CHAR(STRING_ELT(sWhat, i)))));
    UNPROTECT(1);
    return res;
}
