#ifndef ADDRESSES_H
#define ADDRESSES_H

#include "iota_types.h"


#define MAX_SECURITY 3

void get_public_addr(signed char *seed_bytes, uint32_t idx, uint8_t security,
                   signed char *address_bytes);

#endif // ADDRESSES_H

