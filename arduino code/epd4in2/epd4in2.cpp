/**
 *  @filename   :   epd4in2.cpp
 *  @brief      :   Implements for Dual-color e-paper library
 *  @author     :   Yehui from Waveshare
 *
 *  Copyright (C) Waveshare     August 10 2017
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documnetation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to  whom the Software is
 * furished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS OR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#include <stdlib.h>
#include <epd4in2.h>
#include <SPI.h>
//-----------------------------------------------------------------------------------------------------
Epd::Epd() {};
//-----------------------------------------------------------------------------------------------------
int Epd::Init(void) 
{   // This calls the peripheral hardware interface, see epdif
    if (IfInit() != 0) {
        return -1;
    }
    // EPD hardware init start 
    Reset();
    SendCommand(POWER_SETTING);
    SendData(0x03);                    // VDS_EN, VDG_EN
    SendData(0x00);                    // VCOM_HV, VGHL_LV[1], VGHL_LV[0]
    SendData(0x2b);                    // VDH
    SendData(0x2b);                    // VDL
    SendData(0xff);                    // VDHR
    SendCommand(BOOSTER_SOFT_START);
    SendData(0x17);
    SendData(0x17);
    SendData(0x17);                    //07 0f 17 1f 27 2F 37 2f
    SendCommand(POWER_ON);
    WaitUntilIdle();
    SendCommand(PANEL_SETTING);
    SendData(0xbf);                    // KW-BF   KWR-AF  BWROTP 0f
    SendData(0x0b);
    SendCommand(PLL_CONTROL);
    SendData(0x3A);                    // 3A 100HZ, 29 150Hz, 39 200HZ, 31 171HZ. Keep at 100Hz, otherwise the screen will be greyish
    // EPD hardware init end 
    return 0;
}
//-----------------------------------------------------------------------------------------------------
void Epd::SendCommand(unsigned char command) 
{   //  Basic function for sending commands
    digitalWrite(DC_PIN, LOW);
    SpiTransfer(command);
}
//-----------------------------------------------------------------------------------------------------
void Epd::SendData(unsigned char data) 
{   //  Basic function for sending data
    digitalWrite(DC_PIN, HIGH);
    SpiTransfer(data);
}
//-----------------------------------------------------------------------------------------------------
void Epd::WaitUntilIdle(void) 
{   //  Wait until the BUSY_PIN goes HIGH
    while(digitalRead(BUSY_PIN) == 0)// 0: busy, 1: idle 
    {                                
    }      
}
//-----------------------------------------------------------------------------------------------------
void Epd::Reset(void) 
{   //  Module reset. Often used to awaken the module in deep sleep, see Epd::Sleep();
    digitalWrite(RST_PIN, LOW);
    delay(50);
    digitalWrite(RST_PIN, HIGH);
    delay(50);   
}
//-----------------------------------------------------------------------------------------------------
void Epd::SetBlackBox(int x, int y) 
{   //  Used to send the QR modules to the SDRAM
    SendCommand(PARTIAL_IN);
    SendCommand(PARTIAL_WINDOW);
    SendData(x >> 8);
    SendData(x & 0xf8);                // x should be the multiple of 8, the last 3 bit will always be ignored
    SendData(((x & 0xf8) + 8  - 1) >> 8);
    SendData(((x & 0xf8) + 8  - 1) | 0x07);
    SendData(y >> 8);        
    SendData(y & 0xff);
    SendData((y + 8 - 1) >> 8);        
    SendData((y + 8 - 1) & 0xff);
    SendData(0x01);                    // Gates scan both inside and outside of the partial window. (default) 

    SendCommand(DATA_START_TRANSMISSION_2);
    for(int i = 0; i < 8 ; i++) {
        digitalWrite(DC_PIN, HIGH);
        SpiTransfer(0x00);             // 8 black pixels  
    }  
    SendCommand(PARTIAL_OUT);  
}
//-----------------------------------------------------------------------------------------------------
void Epd::SetLut(void) 
{   //  Set the look-up table
    unsigned int count;     
    SendCommand(LUT_FOR_VCOM);         // vcom
    for(count = 0; count < 44; count++) {
        SendData(lut_vcom0[count]);
    }
    
    SendCommand(LUT_WHITE_TO_WHITE);   // ww --
    for(count = 0; count < 42; count++) {
        SendData(lut_ww[count]);
    }   
    
    SendCommand(LUT_BLACK_TO_WHITE);   // bw r
    for(count = 0; count < 42; count++) {
        SendData(lut_bw[count]);
    } 

    SendCommand(LUT_WHITE_TO_BLACK);   // wb w
    for(count = 0; count < 42; count++) {
        SendData(lut_bb[count]);
    } 

    SendCommand(LUT_BLACK_TO_BLACK);   // bb b
    for(count = 0; count < 42; count++) {
        SendData(lut_wb[count]);
    } 
}
//-----------------------------------------------------------------------------------------------------
void Epd::ClearFrame(void) 
{   // Clear the frame data from the SRAM, this won't refresh the display
    SendCommand(RESOLUTION_SETTING);
    SendData(EPD_WIDTH >> 8);
    SendData(EPD_WIDTH & 0xff);
    SendData(EPD_HEIGHT >> 8);        
    SendData(EPD_HEIGHT & 0xff);

    SendCommand(DATA_START_TRANSMISSION_1);           
    for(int i = 0; i < EPD_HEIGHT; i++) {
        digitalWrite(DC_PIN, HIGH);
        SpiBulkTransfer();   
    }  
    SendCommand(DATA_START_TRANSMISSION_2);           
    for(int i = 0; i < EPD_HEIGHT; i++) {
        digitalWrite(DC_PIN, HIGH);
        SpiBulkTransfer();  
    }  
}
//-----------------------------------------------------------------------------------------------------
void Epd::DisplayFrame(void) 
{   //  This displays the frame data from SRAM
    SetLut();
    SendCommand(DISPLAY_REFRESH); 
    WaitUntilIdle();
}
//-----------------------------------------------------------------------------------------------------
/*
    After this command is transmitted, the chip would enter the deep-sleep mode to save power. 
    The deep sleep mode would return to standby by hardware reset. The only one parameter is a 
    check code, the command would be executed if check code = 0xA5. 
    You can use Epd::Reset() to awaken and use Epd::Init() to initialize.
*/
void Epd::Sleep() 
{
    SendCommand(VCOM_AND_DATA_INTERVAL_SETTING);
    SendData(0x17);                    // Border floating    
    SendCommand(VCM_DC_SETTING);       // VCOM to 0V
    SendCommand(PANEL_SETTING);
    
    SendCommand(POWER_SETTING);        // VG&VS to 0V fast
    SendData(0x00);        
    SendData(0x00);        
    SendData(0x00);              
    SendData(0x00);        
    SendData(0x00);
                    
    SendCommand(POWER_OFF);            // Power off
    WaitUntilIdle();
    SendCommand(DEEP_SLEEP);           // Deep sleep
    SendData(0xA5);

    SPI.end();                         // Set all the pins as INPUT to save power
    pinMode(BUSY_PIN, INPUT);
    pinMode(DC_PIN, INPUT);
    pinMode(RST_PIN, INPUT);
    pinMode(CS_PIN, INPUT);
    pinMode(DIN_PIN, INPUT);
    pinMode(CLK_PIN, INPUT);
}
//-----------------------------------------------------------------------------------------------------
const unsigned char lut_vcom0[] =
{
0x00, 0x17, 0x00, 0x00, 0x00, 0x02,        
0x00, 0x17, 0x17, 0x00, 0x00, 0x02,        
0x00, 0x0A, 0x01, 0x00, 0x00, 0x01,        
0x00, 0x0E, 0x0E, 0x00, 0x00, 0x02,        
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,        
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,        
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
};

const unsigned char lut_ww[] =
{
0x40, 0x17, 0x00, 0x00, 0x00, 0x02,
0x90, 0x17, 0x17, 0x00, 0x00, 0x02,
0x40, 0x0A, 0x01, 0x00, 0x00, 0x01,
0xA0, 0x0E, 0x0E, 0x00, 0x00, 0x02,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
};

const unsigned char lut_bw[] =
{
0x40, 0x17, 0x00, 0x00, 0x00, 0x02,
0x90, 0x17, 0x17, 0x00, 0x00, 0x02,
0x40, 0x0A, 0x01, 0x00, 0x00, 0x01,
0xA0, 0x0E, 0x0E, 0x00, 0x00, 0x02,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  
};

const unsigned char lut_bb[] =
{
0x80, 0x17, 0x00, 0x00, 0x00, 0x02,
0x90, 0x17, 0x17, 0x00, 0x00, 0x02,
0x80, 0x0A, 0x01, 0x00, 0x00, 0x01,
0x50, 0x0E, 0x0E, 0x00, 0x00, 0x02,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,          
};

const unsigned char lut_wb[] =
{
0x80, 0x17, 0x00, 0x00, 0x00, 0x02,
0x90, 0x17, 0x17, 0x00, 0x00, 0x02,
0x80, 0x0A, 0x01, 0x00, 0x00, 0x01,
0x50, 0x0E, 0x0E, 0x00, 0x00, 0x02,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00,          
};
//-----------------------------------------------------------------------------------------------------
//  EOF
//-----------------------------------------------------------------------------------------------------