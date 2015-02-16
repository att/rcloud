#include <Rinternals.h>

#include <string.h>

SEXP hex2raw(SEXP sStr) {
    SEXP res;
    const char *c;
    unsigned char *dst;
    
    if (TYPEOF(sStr) != STRSXP)
        Rf_error("input must be a string");
    if (LENGTH(sStr) == 0)
        return allocVector(RAWSXP, 0);
    if (LENGTH(sStr) != 1)
        Rf_error("input must be a single string");
    c = CHAR(STRING_ELT(sStr, 0));
    dst = (unsigned char*) RAW(res = allocVector(RAWSXP, strlen(c)));
    while (*c) {
        unsigned char val = 0;
        if (*c >= '0' && *c <= '9')
            val = (unsigned char) (*c - '0');
        else if (*c >= 'A' && *c <= 'F')
            val = (unsigned char) (*c - 'A' + 10);
        else if (*c >= 'a' && *c <= 'f')
            val = (unsigned char) (*c - 'a' + 10);
        else
            Rf_error("Invalid input, not a hexadecimal string (%s)", c);

        c++;
        val <<= 4;
        if (*c >= '0' && *c <= '9')
            val |= (unsigned char) (*c - '0');
        else if (*c >= 'A' && *c <= 'F')
            val |= (unsigned char) (*c - 'A' + 10);
        else if (*c >= 'a' && *c <= 'f')
            val |= (unsigned char) (*c - 'a' + 10);
        else             
            Rf_error("Invalid input, not a hexadecimal string (%s)", c);
        c++;
        *(dst++) = val;
        /* allow separating whitespace or : or - */
        while (*c == ' ' || *c == ':' || *c == '-' || *c == '\n' || *c == '\r' || *c == '\t')
            c++;
    }
    if (dst - RAW(res) < LENGTH(res))
        SETLENGTH(res, dst - RAW(res));
    return res;
}
