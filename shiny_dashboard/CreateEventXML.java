import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class CreateEventXML {
    private static List eventList = new ArrayList();
    final private static long CURRENT_UNIX_TIME = Instant.now().getEpochSecond();
    final private static int EVENT_RATINGS_STARTED = 12960000; //5 months

    public static void main(String[] args) {
        fillEventList();
        writeEvents();
        System.out.println("Wrote event list successfully");
    }

    private static void fillEventList() {
        for(int i = 0; i < 100; i++) {
            eventList.add(new String("Event" + i));
        }
    }

    private static void writeEvents() {

        File file = new File("ratinglijst.xml");

        if(!file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        FileWriter fw = null;
        try {
            fw = new FileWriter(file.getAbsoluteFile());
        } catch (IOException e) {
            e.printStackTrace();
        }
        BufferedWriter bw = new BufferedWriter(fw);

        try {
            bw.write("<!--List generated at Unix time ");
            bw.write(String.valueOf(CURRENT_UNIX_TIME));
            bw.write("-->");
            bw.newLine();
            bw.write("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
            bw.newLine();
            bw.write("<ratingeventlijst xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");
            bw.newLine();
            for(int i = 0; i < 1000; i++) {
                int event = grabEvent();
                double rating = grabRating(event);
                long timestamp = generateUnix();
                bw.write("  <startrating>");
                bw.newLine();
                bw.write("      <event>");
                bw.write((String) eventList.get(event));
                bw.write("</event><rating>");
                bw.write(String.valueOf(rating));
                bw.write("</rating><timestamp>");
                bw.write(String.valueOf(timestamp));
                bw.write("</timestamp>");
                bw.newLine();
                bw.write("  </startrating>");
                bw.newLine();
            }
            bw.write("</ratingeventlijst>");
            bw.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static int grabEvent() {
        Random rand1 = new Random();
        Random rand2 = new Random();
        int eventNum1 = rand1.nextInt(50);
        int eventNum2 = rand2.nextInt(50);
        //System.out.print("Took out: " + eventList.get(eventNum));
        return eventNum1 + eventNum2;
    }

    private static double grabRating(int eventNum) {
        Random rand = new Random();
        double rating = rand.nextDouble() * 5;
        if(eventNum < 10) {
            rating = rating + 0.2;
            if(rating > 5) {
                rating = 5;
            }
        }
        if(eventNum >= 10 && eventNum < 50) {
            rating = rating + 0.1;
            if(rating > 5) {
                rating = 5;
            }
        }
        return rating;
    }

    private static long generateUnix() {
        Random rand = new Random();
        int timeFromNow = rand.nextInt(EVENT_RATINGS_STARTED);
        return CURRENT_UNIX_TIME - (long) timeFromNow;
    }
}
