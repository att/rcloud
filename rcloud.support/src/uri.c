#define USE_RINTERNALS 1
#include <Rinternals.h>

#include <string.h>
#include <ctype.h>

// https://tools.ietf.org/html/rfc3986#section-2.3
// unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
#define unreserved(c) (isalnum(c) || c == '-' || c == '.' || c == '_' || c == '~')
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
            if (!unreserved(ci)) {
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
            if (!unreserved(ci))
                extra++;
            c++;
        }
        c = orig;
        if (!extra)
            return c;
        dst = d = R_alloc(extra * 2 + len + 1, 1);
        while (c < e) {
            int ci = (int) *((unsigned char*)c);
            if (!unreserved(ci)) {
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

static const char *decode1(const char *c) {
    int len = strlen(c);
    char *d, *e;
    /* shortcut - if there is no % -> nothing encoded */
    if (!memchr(c, '%', len)) return c;
    e = d = (len >= sizeof(buf)) ? R_alloc(len + 1, 1) : buf;
    while (*c)
        if (*c == '%') {
            unsigned int a = 0;
            c++;
            if (*c >= '0' && *c <= '9') a = *c - '0';
            else if (*c >= 'a' && *c <= 'f') a = *c - 'a' + 10;
            else if (*c >= 'A' && *c <= 'F') a = *c - 'A' + 10;
            else if (*c == '%') { *(d++) = *(c++); continue; }
            else { *(d++) = c[-1]; continue; } /* ignore escape */
            a <<= 4;
            c++;
            if (*c >= '0' && *c <= '9') a |= *c - '0';
            else if (*c >= 'a' && *c <= 'f') a |= *c - 'a' + 10;
            else if (*c >= 'A' && *c <= 'F') a |= *c - 'A' + 10;
            else { *(d++) = c[-2]; *(d++) = c[-1]; continue; } /* ignore escape */
            *(d++) = a;
            c++;
        } else
            *(d++) = *(c++);
    *d = 0;
    return e;
}

SEXP uri_encode(SEXP sWhat) {
    int i, n = LENGTH(sWhat);
    SEXP res = PROTECT(allocVector(STRSXP, n));
    for (i = 0; i < n; i++)
        SET_STRING_ELT(res, i, (STRING_ELT(sWhat, i) == NA_STRING) ? NA_STRING : mkChar(encode1(CHAR(STRING_ELT(sWhat, i)))));
    UNPROTECT(1);
    return res;
}

SEXP uri_decode(SEXP sWhat) {
    int i, n = LENGTH(sWhat);
    SEXP res = PROTECT(allocVector(STRSXP, n));
    for (i = 0; i < n; i++)
        SET_STRING_ELT(res, i, (STRING_ELT(sWhat, i) == NA_STRING) ? NA_STRING : mkChar(decode1(CHAR(STRING_ELT(sWhat, i)))));
    UNPROTECT(1);
    return res;
}
