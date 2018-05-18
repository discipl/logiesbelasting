//-----------------------------------------------------------------------------------------------------
/*
   Copyrighted, William Goudswaard, williamgoudswaard@gmail.com
*/
//-----------------------------------------------------------------------------------------------------
#include <epd4in2.h>            //  Waveshare 4.2 b/w E-ink
#include <qrcode.h>             //  Qr code
#include <DS3231.h>             //  DS3231 RTC 
#include <Wire.h>
#include <avr/sleep.h>          //  Standard AVR sleep library
#include <avr/wdt.h>            //  Standard AVR watchdog library
//-----------------------------------------------------------------------------------------------------
const long event_nr = 1;        //  The event this pole belongs to
const int pole_nr   = 1;        //  The exact pole at this event
const int QR_time   = 24 >> 3;  //  Only multiplications of 8 as Watchdog timer will sleep for 8s at a time

long press_count    = 0;        //  The number of button presses from power up.
int sleep_counter   = 0;        //  Counter for the watchdog, to determine when to in deep_sleep
bool deep_sleep     = false;    //  When the deep_sleep is true, the watchdog timer won't be needed anymore

RTClib RTC;                     //  Attach the RTC to the i2c interface (A4, A5)
DateTime now;                   //  Init a Time-data structure
Epd epd;                        //  Init the E-ink display
//-----------------------------------------------------------------------------------------------------
void setup()
{ //Serial.begin(115200);       //  For debugging purposes only
  pinMode(2, INPUT);            //  The standard Arduino Nano interrupt pin
  digitalWrite(2, HIGH);        //  Enable pull-up

  Wire.begin();                 //  Init the RTC
 

  if ( epd.Init() != 0 ) {      //  Init the E-ink
    return;
  }
  epd.Sleep();                  //  Make it sleep to preserve power
  //  The following lines can be uncommented to set the date and time
  //rtc.setDOW(WEDNESDAY);      //  Set Day-of-Week to DAYOFWEEK
  //rtc.setTime(15, 21, 30);    //  Set the time to 12:00:00 (24hr format)
  //rtc.setDate(4, 25, 2018);   //  Set the date to month day, year
}
//-----------------------------------------------------------------------------------------------------
void loop()
{ //  The whole process takes about 4150ms
  sleep();
  generate_qr();
}
//-----------------------------------------------------------------------------------------------------
void sleep()
{
  ADCSRA = 0;                   //  disable ADC

  if ( !deep_sleep )            //  Start counting after the QR code has been displayed.
  {
    sleep_counter++;
    MCUSR = 0;                  //  Clear various "reset" flags
    //  Allow changes, disable reset
    WDTCSR = bit (WDCE) | bit (WDE);
    //  Set interrupt mode and an interval
    //  Set WDIE, and 8 seconds delay
    WDTCSR = bit (WDIE) | bit (WDP3) | bit (WDP0);    
    wdt_reset();                //  Reset the watchdog timer
  }

  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
  sleep_enable();
  
  //  Do not interrupt before we go to sleep, or the
  //  ISR will detach interrupts and we won't wake.
  noInterrupts();
  
  //  Will be called when pin D2 goes low
  attachInterrupt(0, wake, FALLING);
  EIFR = bit(INTF0);            //  Clear flag for interrupt 0

  //  Turn off brown-out enable in software
  //  BODS must be set to one and BODSE must be set to zero within four clock cycles
  MCUCR = bit(BODS) | bit(BODS);
  //  The BODS bit is automatically cleared after three clock cycles
  MCUCR = bit(BODS);

  //  We are guaranteed that the sleep_cpu call will be done
  //  As the processor executes the next instruction after
  //  Interrupts are turned on.
  interrupts();                 //  One cycle
  sleep_cpu();                  //  One cycle
}
//-----------------------------------------------------------------------------------------------------
ISR (WDT_vect)                  //  Watchdog interrupt
{
  if ( sleep_counter < QR_time )
  {
    wdt_disable();              //  Disable watchdog
    sleep();                    //  Go back to sleep
  }
  else if ( sleep_counter >= QR_time )
  {
    deep_sleep = true;
    sleep_counter = 0;
    if (epd.Init() != 0) {      //  Wake E-ink from sleep
      return;
    }
    epd.ClearFrame();           //  Clear the SDRAM of the display
    epd.DisplayFrame();         //  Black, because the SDRAM is empty
    epd.Sleep();                //  Sleep the display when done
    sleep();                    //  Go to deep sleep
  }
}  
//-----------------------------------------------------------------------------------------------------
void wake()
{
  sleep_disable();              //  Cancel sleep as a precaution
  detachInterrupt(0);           //  Precautionary while we do other stuff
  deep_sleep = false;           //  Disable deep sleep
  sleep_counter = 0;            //  Reset the sleep counter
}
//-----------------------------------------------------------------------------------------------------
void generate_qr()
{
  press_count++;                //  Increment the press counter
  now = RTC.now();             //  Get the time from the RTC

  String input = "";            //  Strings in c++ are shit
  input += event_nr;    input += ",";
  input += pole_nr;     input += ",";
  input += press_count; input += ",";
  input += now.unixtime();

  char* qr_data = const_cast<char*>(input.c_str());
  //  Allocate a chunk of memory to store the QR code
  uint8_t qrcodeBytes[qrcode_getBufferSize(5)];

  QRCode qrcode;
  //  Generating with high error correction seems to be faster: 1560ms
  //  We use version 5 because the screen can only display multiples of 8
  //  The screen height is 300px, so 300 / 8 = 37,5 a version 5 QR is 37x37 modules
  qrcode_initText(&qrcode, qrcodeBytes, 5, ECC_HIGH, qr_data);
  draw(qrcode);
}
//-----------------------------------------------------------------------------------------------------
void draw(QRCode &qrcode)
{ //  Init, clearing and sending to sdram takes about 495ms
  if (epd.Init() != 0) {        //  Wake E-ink from sleep
    return;
  }
  epd.ClearFrame();             //  Clear the SDRAM of the display

  //  Every module is a 8x8px black box.
  //  290ms
  for ( int y = 0; y < qrcode.size; y++ )
  {
    for ( int x = 0; x < qrcode.size; x++ )
    {
      if ( qrcode_getModule(&qrcode, x, y) )
      {
        epd.SetBlackBox(x * 8 + 104, y * 8 + 2);
      }
    }
  }
  //  After the SDRAM is updated, the screen will refresh, and draw the new image
  epd.DisplayFrame();           //  2090ms
  epd.Sleep();                  //  Sleep the display when done
}
//-----------------------------------------------------------------------------------------------------
//  EOF
//-----------------------------------------------------------------------------------------------------
