package aurynote;

import javax.swing.*;
import java.util.concurrent.atomic.AtomicInteger;

public final class FeedbackTest {
    public static void main(String[] args) throws Exception {
        AtomicInteger advanced = new AtomicInteger();
        JFrame[] frame = new JFrame[1];
        RoundFeedback[] feedback = new RoundFeedback[1];
        SwingUtilities.invokeAndWait(() -> {
            Aurynote.configureStyle();
            frame[0] = new JFrame();
            feedback[0] = new RoundFeedback(advanced::incrementAndGet);
            frame[0].add(feedback[0]);
            frame[0].pack();
            frame[0].setVisible(true);
            feedback[0].result(true, "C");
        });
        try {
            Thread.sleep(450);
            check(advanced.get() == 0, "Correct answer must remain visible before advancing");
            Thread.sleep(1200);
            SwingUtilities.invokeAndWait(() -> {});
            check(advanced.get() == 1, "Correct answer must advance once");
            SwingUtilities.invokeAndWait(() -> feedback[0].result(false, "D"));
            Thread.sleep(1600);
            check(advanced.get() == 1, "Wrong answer must remain for review");
            SwingUtilities.invokeAndWait(() -> {
                feedback[0].result(true, "E");
                feedback[0].ready("New question", "Read the note.");
            });
            Thread.sleep(1600);
            check(advanced.get() == 1, "Manual next must cancel the previous timer");
            SwingUtilities.invokeAndWait(() -> {
                feedback[0].result(true, "F");
                frame[0].setVisible(false);
            });
            Thread.sleep(1600);
            check(advanced.get() == 1, "Hidden practice must not advance");
            System.out.println("Feedback timing and cancellation checks passed.");
        } finally {
            SwingUtilities.invokeAndWait(frame[0]::dispose);
        }
    }

    private static void check(boolean value, String message) {
        if (!value) throw new AssertionError(message);
    }
}
