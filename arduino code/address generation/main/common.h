#ifndef COMMON_H
#define COMMON_H

#include <string.h>
#include "sha3.h"

/* ----------------------------------------------------------------------- */
/* -                         OS ALTERNATIVES                             - */
/* ----------------------------------------------------------------------- */

//#define os_swap_u32 __builtin_bswap32
#define os_swap_u32(u32)                                                       \
    (((unsigned long int)(u32) >> 24) |                                        \
     (((unsigned long int)(u32) << 8) & 0x00FF0000UL) |                        \
     (((unsigned long int)(u32) >> 8) & 0x0000FF00UL) |                        \
     ((unsigned long int)(u32) << 24))


#define os_memcpy memcpy

#define os_memset memset

/* ----------------------------------------------------------------------- */
/* -                          CRYPTO FUNCTIONS                           - */
/* ----------------------------------------------------------------------- */

#define CX_LAST (1 << 0)

typedef SHA3_CTX cx_sha3_t;
typedef SHA3_CTX cx_hash_t;

static inline void cx_keccak_init(SHA3_CTX* hash, int size) {
        (void)size; // unused

        keccak_384_Init(hash);
}

static inline void cx_hash(SHA3_CTX* hash, int mode, const signed char *in,
                           unsigned int len,signed char *out) {

        if (mode != CX_LAST) {
                // if CX_LAST is not set, add input data to add to current hash
                keccak_Update(hash, in, len);
        } else if (len == 0) {
                // if no input data given, compute and copy the hash
                keccak_Final(hash, out);
        } else {
                // if CX_LAST is set, compute hash for input
                keccak_Update(hash, in, len);
                keccak_Final(hash, out);
        }
}

/* ----------------------------------------------------------------------- */
/* -                            COMMON                                   - */
/* ----------------------------------------------------------------------- */

#define CX_KECCAK384_SIZE 48

#endif // COMMON_H

