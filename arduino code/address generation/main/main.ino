#include "main.h"

#include <stdio.h>
#include <stdlib.h>
// iota-related stuff
#include "kerl.h"
#include "conversion.h"
#include "common.h"
#include "addresses.h"
int counter = 0;
//int print_help();
//void address(char* seedChars, int index, int security, char* result);


void setup()
{
  Serial.begin(115200);
  Serial.println(F("test_1"));
  delay(1000);
}

void loop()
{
  Serial.println(F("test_2"));
  signed char address[81];
  char seedChars[] = "SPGL9URRLRRGKUNEWNCPUT9PGOTGLIW9UTTHO9ZZOPOIFVAVCF9BUTDAPLVQMCKGCR9VEGGFTBHTUT9TC";
  signed char seedBytes[48];
  chars_to_bytes(seedChars, seedBytes, 81);
  Serial.println(F("test_3"));
  get_public_addr(seedBytes, 0, 2, address);
  Serial.println(F("test_4"));

  char charAddress[81];
  bytes_to_chars(address, charAddress, 48);
  Serial.println("");
  for (int i = 0; i < 81; i++)
  {
    Serial.print(charAddress[i]);
  }
  Serial.println("");
  counter++;
  Serial.println(counter);
  Serial.println("");
}
