#include <SPI.h>
#include "epd4in2.h"
#include "epdpaint.h"
#include <qrcode.h>

#define COLORED     0
#define UNCOLORED   1

//-----------------------------------------------------------------------------------------------------
void setup() {
  // put your setup code here, to run once:

  Serial.begin(115200);
  pinMode(2, OUTPUT);
  pinMode(3, INPUT);
  /* This clears the SRAM of the e-paper display */
}
//-----------------------------------------------------------------------------------------------------
void get_qr( QRCode &qrcode, char* input )
{
  //  QR data gets completely scrambled.
  // Allocate a chunk of memory to store the QR code
  uint8_t qrcodeBytes[qrcode_getBufferSize(3)];

  qrcode_initText(&qrcode, qrcodeBytes, 3, 0, input);
  Serial.println("derup");

}
//-----------------------------------------------------------------------------------------------------
void draw( QRCode &qrcode )
{
  uint32_t dt = millis();
  Epd epd;
  if (epd.Init() != 0) {
    Serial.print("e-Paper init failed");
    return;
  }
  /* This clears the SRAM of the e-paper display */
  epd.ClearFrame();

  /*
      Due to RAM not enough in Arduino UNO, a frame buffer is not allowed.
      In this case, a smaller image buffer is allocated and you have to
      update a partial display several times.
      1 byte = 8 pixels, therefore you have to set 8*N pixels at a time.
  */

  unsigned char image[296];
  Paint paint(image, 296, 8);    //width should be the multiple of 8
  paint.SetWidth(8);
  paint.SetHeight(8);

  paint.Clear(UNCOLORED);

  for ( int y = 0; y < qrcode.size; y++ )
  {
    for ( int x = 0; x < qrcode.size; x++ )
    {
      if ( qrcode_getModule(&qrcode, x, y) )
      {
        paint.DrawFilledRectangle(0, 0, 8, 8, COLORED);
        epd.SetPartialWindow(paint.GetImage(), (x * 8), (y * 8), paint.GetWidth(), paint.GetHeight());
      }
    }
    Serial.println(y);
  }

  /*
    paint.Clear(UNCOLORED);
    paint.DrawFilledRectangle(0, 0, 10, 10, COLORED);
    epd.SetPartialWindow(paint.GetImage(), 0, 0, paint.GetWidth(), paint.GetHeight());
    paint.DrawFilledRectangle(0, 0, 10, 10, COLORED);
    epd.SetPartialWindow(paint.GetImage(), 30, 0, paint.GetWidth(), paint.GetHeight());
  */

  /* This displays the data from the SRAM in e-Paper module */
  /*
    dt = millis() - dt;
    Serial.print("actual time: ");
    Serial.print(dt);
    Serial.print("\n");
    epd.DisplayFrame();
  */
  /* This displays an image */
  while ( !digitalRead(3) )
  {
    digitalWrite(2, HIGH);
  }
  digitalWrite(2, LOW);

  epd.DisplayFrame();

  /* Deep sleep */
  epd.Sleep();
}
//-----------------------------------------------------------------------------------------------------
void loop() {
  //  Quick perf test.
  uint32_t dt = millis();

  QRCode qrcode;

  char* input = "1bcdEfghijklmnoPqrstuvWxyZabcd:)";


  //  QR data gets completely scrambled.
  // Allocate a chunk of memory to store the QR code
  uint8_t qrcodeBytes[qrcode_getBufferSize(5)];

  qrcode_initText(&qrcode, qrcodeBytes, 5, 0, input);
  Serial.println("derup");

  //get_qr( qrcode, input );

  for (uint8_t y = 0; y < qrcode.size; y++) {
    // Each horizontal module
    for (uint8_t x = 0; x < qrcode.size; x++) {
      // Print each module (UTF-8 \u2588 is a solid block)
      Serial.print(qrcode_getModule(&qrcode, x, y) ? "\u2588" : "  ");
    }
    Serial.print("\n");
  }

  draw( qrcode );


  //  perf
  dt = millis() - dt;
  Serial.print("QR Code Generation Time: ");
  Serial.print(dt);
  Serial.print("\n");
  // put your main code here, to run repeatedly:
  // The structure to manage the QR code
}
//-----------------------------------------------------------------------------------------------------
//  EOF
//-----------------------------------------------------------------------------------------------------
