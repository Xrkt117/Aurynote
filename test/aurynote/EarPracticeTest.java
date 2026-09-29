package aurynote;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

public final class EarPracticeTest {
    public static void main(String[] args) throws Exception {
        JFrame[] frame = new JFrame[1];
        EarPractice[] practice = new EarPractice[1];
        int[][] played = new int[1][];
        SwingUtilities.invokeAndWait(() -> {
            Aurynote.configureStyle();
            practice[0] = new EarPractice((notes, onNote, done) -> {
                played[0] = notes.clone();
                for (int note : notes) onNote.accept(note);
                done.run();
            }, () -> {});
            frame[0] = new JFrame();
            frame[0].add(practice[0]);
            frame[0].setSize(900, 720);
            frame[0].setVisible(true);
            click(practice[0], "C");
            check(played[0].length == 1 && played[0][0] == 60, "Learning button plays its named note");
            click(practice[0], "Start quiz");
            check(played[0].length == 2 && played[0][0] == 60, "Reference C precedes the question");
            int answer = played[0][1] % 12;
            int wrong = answer == 0 ? 7 : 0;
            click(practice[0], Music.name(wrong));
            check(played[0][0] % 12 == wrong && played[0][1] % 12 == answer, "Comparison plays chosen note then answer");
            check(hasLabel(practice[0], "Score: 0 / 1"), "Wrong answer scores once");
        });
        try {
            Thread.sleep(250);
            SwingUtilities.invokeAndWait(() -> capture(frame[0], "lesson-comparison"));
            Thread.sleep(3250);
            SwingUtilities.invokeAndWait(() -> {
                check(hasLabel(practice[0], "02  QUIZ · QUESTION 2"), "Wrong answer advances automatically");
                click(practice[0], Music.name(played[0][played[0].length - 1] % 12));
                check(hasLabel(practice[0], "Score: 1 / 2"), "Correct answer scores once");
            });
            Thread.sleep(250);
            SwingUtilities.invokeAndWait(() -> capture(frame[0], "lesson-correct"));
            Thread.sleep(1450);
            SwingUtilities.invokeAndWait(() -> {
                check(hasLabel(practice[0], "02  QUIZ · QUESTION 3"), "Correct answer advances faster");
                for (Component component : descendants(practice[0]))
                    if (component instanceof JComboBox<?> combo && combo.getItemCount() == 4) combo.setSelectedIndex(3);
                click(practice[0], "Start quiz");
                check(played[0].length == 5 && played[0][0] == 60 && played[0][1] == 64 && played[0][2] == 67 && played[0][3] == 72, "Degree mode establishes C major");
            });
            Thread.sleep(250);
            SwingUtilities.invokeAndWait(() -> capture(frame[0], "lesson-degrees"));
            System.out.println("Learning, comparison, automatic advancement, and degree mode passed.");
        } finally { SwingUtilities.invokeAndWait(frame[0]::dispose); }
    }
    private static void click(Container parent, String title) {
        for (Component child : descendants(parent))
            if (child instanceof JButton button && button.getText().equals(title)) { button.doClick(); return; }
        throw new AssertionError("Missing button: " + title);
    }
    private static boolean hasLabel(Container parent, String title) {
        return descendants(parent).stream().anyMatch(c -> c instanceof JLabel label && label.getText().equals(title));
    }
    private static java.util.List<Component> descendants(Container parent) {
        java.util.List<Component> result = new java.util.ArrayList<>();
        for (Component child : parent.getComponents()) {
            result.add(child);
            if (child instanceof Container container) result.addAll(descendants(container));
        }
        return result;
    }
    private static void capture(Component component, String name) {
        if (component instanceof Container container) container.validate();
        BufferedImage image = new BufferedImage(component.getWidth(), component.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics(); component.paint(graphics); graphics.dispose();
        try { ImageIO.write(image, "png", new File("out/" + name + ".png")); }
        catch (Exception exception) { throw new RuntimeException(exception); }
    }
    private static void check(boolean value, String message) { if (!value) throw new AssertionError(message); }
}
