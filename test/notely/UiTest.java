package notely;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

public final class UiTest {
    public static void main(String[] args) throws Exception {
        SwingUtilities.invokeAndWait(() -> {
            Notely.configureStyle();
            Notely app = new Notely();
            try {
                app.setVisible(true);
                BufferedImage image = new BufferedImage(app.getWidth(), app.getHeight(), BufferedImage.TYPE_INT_RGB);
                Graphics2D graphics = image.createGraphics();
                app.paint(graphics);
                graphics.dispose();
                ImageIO.write(image, "png", new File("out/ear-training.png"));
                JTabbedPane tabs = findTabs(app);
                tabs.setSelectedIndex(1);
                app.validate();
                graphics = image.createGraphics();
                app.paint(graphics);
                graphics.dispose();
                ImageIO.write(image, "png", new File("out/explorer.png"));
                System.out.println("Both app screens rendered.");
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                app.dispose();
            }
        });
    }

    private static JTabbedPane findTabs(Container parent) {
        for (Component child : parent.getComponents()) {
            if (child instanceof JTabbedPane tabs) return tabs;
            if (child instanceof Container container) {
                JTabbedPane found = findTabs(container);
                if (found != null) return found;
            }
        }
        return null;
    }
}
