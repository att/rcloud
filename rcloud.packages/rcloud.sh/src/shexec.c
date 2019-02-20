#include <sys/types.h>
#include <sys/time.h>
#include <sys/select.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>

#include <Rinternals.h>

#define ulog(...) 

static char buf[1024*1024];

static int shexec_(const char *shell, const char *what) {
    int pfd1[2], pfd2[2];
    int stdoutFD, stderrFD;

    if (pipe(pfd1))
        Rf_error("unable to create stdout pipe");

    if (pipe(pfd2)) {
        close(pfd1[0]);
        close(pfd1[1]);
        Rf_error("unable to create stderr pipe");
    }

    pid_t pid = fork();
    
    if (pid < 0) {
        close(pfd1[0]);
        close(pfd1[1]);
        close(pfd2[0]);
        close(pfd2[1]);
        Rf_error("unable to fork: %s", strerror(errno));
    }

    if (pid == 0) { /* child -> exec */
        dup2(pfd1[1], STDOUT_FILENO);
        close(pfd1[1]);
        close(pfd1[0]); /* the parent has this read end */
        dup2(pfd2[1], STDERR_FILENO);
        close(pfd2[1]);
        close(pfd2[0]); /* the parent has this read end */
        execl(shell, shell, what, NULL);
        ulog("ERROR: failed to exec: %s", strerror(errno));
        exit(-2);
    } else { /* parent - read and watch */
        stdoutFD = pfd1[0];
        stderrFD = pfd2[0];
        close(pfd1[1]);
        close(pfd2[1]);
        while (1) {
            int stat = 0, has_terminated = 0, sel;
            fd_set fds;
            struct timeval tv;
            tv.tv_sec = 0;
            tv.tv_usec = 200000; /* 200ms */

            has_terminated = (waitpid(pid, &stat, WNOHANG) == pid) ? 1 : 0;
            /* fprintf(stderr, "INFO: wait(%d): %s\n", (int) pid, has_terminated ? "TERM" : "running"); */

            FD_ZERO(&fds);
            FD_SET(stdoutFD, &fds);
            FD_SET(stderrFD, &fds);
            sel = select(((stdoutFD > stderrFD) ? stdoutFD : stderrFD) + 1, &fds, 0, 0, &tv);
            /* fprintf(stderr, "INFO: select = %d, err: %s\n", sel, strerror(errno)); */
            if (sel < 0) {
                if (errno == EINTR) /* interrupt? Nothing to worry about, go back */
                    continue;
                close(stdoutFD);
                close(stderrFD);
                Rf_error("error waiting for child process I/O: %s", strerror(errno));
            }
            if (sel > 0) {
                if (FD_ISSET(stderrFD, &fds)) {
                    int n = read(stderrFD, buf, sizeof(buf) - 1);
                    /* fprintf(stderr, "INFO: stderr %d\n", n); */
                    if (n > 0) {
                        buf[n] = 0;
                        /* this is a bit wastefull since we'll be piping it through another buffer
                           so we could issue the OOB directly insrtead if we cared ... */
                        REprintf("%s", buf);
                    }
                }
                if (FD_ISSET(stdoutFD, &fds)) {
                    int n = read(stdoutFD, buf, sizeof(buf) - 1);
                    /* fprintf(stderr, "INFO: stdout %d\n", n); */
                    if (n > 0) {
                        buf[n] = 0;
                        Rprintf("%s", buf);
                    }
                }
            }
            
            if (has_terminated) {
                close(stderrFD);
                close(stdoutFD);
                if (WIFEXITED(stat)) return WEXITSTATUS(stat);
                return -1;
            }
        }
    }
    /* we should never really end up here ... */
    return -3;
}

SEXP shexec(SEXP sShell, SEXP sWhat) {
    if (TYPEOF(sShell) != STRSXP || LENGTH(sShell) != 1) Rf_error("invalid shell argument");
    if (sWhat == R_NilValue)
        return ScalarInteger(shexec_(CHAR(STRING_ELT(sShell, 0)), 0));
    if (TYPEOF(sWhat) != STRSXP || LENGTH(sWhat) != 1) Rf_error("invalid script argument");
    return ScalarInteger(shexec_(CHAR(STRING_ELT(sShell, 0)), CHAR(STRING_ELT(sWhat, 0))));
}
