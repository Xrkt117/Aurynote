package notely;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

public final class UiTest {
    public static void main(String[] args) throws Exception {
        Notely[] holder = new Notely[1];
        SwingUtilities.invokeAndWait(() -> {
            Notely.configureStyle();
            holder[0] = new Notely();
            holder[0].setVisible(true);
        });
        try {
            for (String screen : new String[]{"menu", "ear", "staff", "explore"}) {
                SwingUtilities.invokeAndWait(() -> holder[0].showScreen(screen));
                Thread.sleep(250);
                SwingUtilities.invokeAndWait(() -> capture(holder[0], screen));
            }
            SwingUtilities.invokeAndWait(() -> {
                StaffPractice practice = new StaffPractice(note -> {});
                JPanel answers = findAnswers(practice);
                JButton choice = (JButton)answers.getComponent(0);
                choice.doClick();
                choice.doClick();
                for (Component child : answers.getComponents())
                    if (child.isEnabled()) throw new AssertionError("Answers must lock after a guess");
                boolean scoredOnce = false;
                for (Component child : practice.getComponents())
                    if (child instanceof JLabel label && label.getText().startsWith("Score:"))
                        scoredOnce = label.getText().endsWith(" / 1");
                if (!scoredOnce) throw new AssertionError("Each question must score only once");
                StaffView staff = new StaffView();
                staff.setSize(520, 220);
                staff.show(new StaffNote(28, 1), false);
                capture(staff, "treble-ledger");
                staff.show(new StaffNote(14, -1), true);
                capture(staff, "bass-ledger");
            });
            System.out.println("Four screens rendered; staff answer locking passed.");
        } finally {
            SwingUtilities.invokeAndWait(holder[0]::dispose);
        }
    }

    private static JPanel findAnswers(Container parent) {
        for (Component child : parent.getComponents()) {
            if (child instanceof JPanel panel && panel.getLayout() instanceof GridLayout) return panel;
        }
        throw new AssertionError("Choice buttons missing");
    }

    private static void capture(Component component, String name) {
        BufferedImage image = new BufferedImage(component.getWidth(), component.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        component.paint(graphics);
        graphics.dispose();
        try { ImageIO.write(image, "png", new File("out/" + name + ".png")); }
        catch (Exception e) { throw new RuntimeException(e); }
    }
}
