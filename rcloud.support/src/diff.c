#define USE_RINTERNALS 1
#include <Rinternals.h>

#define s_add(X,V) X = SETCDR(X, CONS((V), R_NilValue))

/* this is highly annoying - R doesn't expose Scollate()
   so it's impossible to do compatibe string comparison,
   so we have to resort to eval() to re-implement it ... */
static int Scollate(SEXP c0, SEXP c1) {
    SEXP s0 = PROTECT(ScalarString(c0));
    SEXP s1 = PROTECT(ScalarString(c1));
    int cmp = asInteger(eval(PROTECT(
                                 lang3(install("<"),
                                       s0, s1)), R_GlobalEnv));
    UNPROTECT(3);
    return cmp;
}

static SEXP mk_state(SEXP env, SEXP ls) {
    SEXP state = PROTECT(allocVector(VECSXP, 3));
    SEXP *ptr;
    R_xlen_t i, n = XLENGTH(ls);
    SET_VECTOR_ELT(state, 0, ls);
    ptr = (SEXP*) RAW(SET_VECTOR_ELT(state, 1, allocVector(RAWSXP, sizeof(SEXP*) * n)));
    setAttrib(state, R_ClassSymbol, mkString("env_diff_state"));
        
    for (i = 0; i < n; i++) {
        SEXP val = findVarInFrame3(env, Rf_install(CHAR(STRING_ELT(ls, i))), TRUE);
        /* This is our magic - by setting all bindings to named > 1 we guarantee
           duplication on modification so we only need to look at the addresses.
           It is at a cost - in-place modifications of atomic objects will not
           be possible, but since diffs are typically done between evaluations,
           this should affect barely any code while the savings of not having
           to compute full hashes or anything like that are huge. */
        if (NAMED(val) < 1)
            SET_NAMED(val, 2);
        ptr[i] = val;
    }
    UNPROTECT(1);
    return state;
}


SEXP env_diff(SEXP env, SEXP state, SEXP sAll) {
    int all = asInteger(sAll);
    SEXP ls = R_lsInternal(env, all);
    SEXP ch_new = PROTECT(list1(R_NilValue)), ch_new_t = ch_new;
    SEXP ch_rm  = PROTECT(list1(R_NilValue)), ch_rm_t  = ch_rm;
    SEXP ch_mod = PROTECT(list1(R_NilValue)), ch_mod_t = ch_mod;

    if (state == R_NilValue) {
        SEXP res;
        res = PROTECT(allocVector(VECSXP, 4)); /* new, rm, ch, state */
        SET_VECTOR_ELT(res, 0, ls); /* new = all */
        SET_VECTOR_ELT(res, 1, SET_VECTOR_ELT(res, 2, allocVector(STRSXP, 0))); /* rm, ch = {} */
        SET_VECTOR_ELT(res, 3, mk_state(env, ls));
        UNPROTECT(4);
        return res;
    }

    {
        SEXP new_state = PROTECT(mk_state(env, ls));
        SEXP ls0 = VECTOR_ELT(state, 0);
        SEXP sPtr0 = VECTOR_ELT(state, 1), tmp, res;
        const SEXP *ptr0 = (const SEXP*) RAW(sPtr0);
        const SEXP *ptr  = (const SEXP*) RAW(VECTOR_ELT(new_state,1));
        R_xlen_t i0 = 0, n0 = XLENGTH(ls0), i;
        R_xlen_t i1 = 0, n1 = XLENGTH(ls), n_new = 0, n_rm = 0, n_mod = 0;
        while (i0 < n0 || i1 < n1) {
            if (i0 == n0) { /* new */
                n_new++;
                s_add(ch_new_t, STRING_ELT(ls, i1));
                i1++;
            } else if (i1 == n1) { /* removed */
                n_rm++;
                s_add(ch_rm_t, STRING_ELT(ls0, i0));
                i0++;
            } else if (STRING_ELT(ls0, i0) == STRING_ELT(ls, i1)) { /* same name */
                if (ptr0[i0] != ptr[i1]) { /* mod */
                    n_mod++;
                    s_add(ch_mod_t, STRING_ELT(ls0, i0));
                } /* otherwise no change */
                i0++;
                i1++;
            } else {
                if (Scollate(STRING_ELT(ls0, i0), STRING_ELT(ls, i1))) { /* old has more = rm */
                    n_rm++;
                    s_add(ch_rm_t, STRING_ELT(ls0, i0));
                    i0++;
                } else { /* new */
                    n_new++;
                    s_add(ch_new_t, STRING_ELT(ls, i1));
                    i1++;
                }
            }
        }
        
        res = PROTECT(allocVector(VECSXP, 4));
        tmp = SET_VECTOR_ELT(res, 0, allocVector(STRSXP, n_new));
        for (i = 0; i < n_new; i++, ch_new = CDR(ch_new))
            SET_STRING_ELT(tmp, i, CADR(ch_new));
        tmp = SET_VECTOR_ELT(res, 1, allocVector(STRSXP, n_rm));
        for (i = 0; i < n_rm; i++, ch_rm = CDR(ch_rm))
            SET_STRING_ELT(tmp, i, CADR(ch_rm));
        tmp = SET_VECTOR_ELT(res, 2, allocVector(STRSXP, n_mod));
        for (i = 0; i < n_mod; i++, ch_mod = CDR(ch_mod))
            SET_STRING_ELT(tmp, i, CADR(ch_mod));
        SET_VECTOR_ELT(res, 3, new_state);
        UNPROTECT(5); /* res, new_state, ch_* */
        return res;
    }
}
