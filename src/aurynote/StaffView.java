package aurynote;

import javax.swing.*;
import java.awt.*;

final class StaffView extends JPanel {
    private StaffNote note = new StaffNote(28, 0);
    private boolean bass;
    StaffView() {
        setPreferredSize(new Dimension(440, 220));
        setMinimumSize(new Dimension(300, 220));
        setMaximumSize(new Dimension(520, 220));
        getAccessibleContext().setAccessibleName("Music staff");
    }
    void show(StaffNote next, boolean bassClef) { note = next; bass = bassClef; repaint(); }
    @Override protected void paintComponent(Graphics graphics) {
        super.paintComponent(graphics);
        Graphics2D g = (Graphics2D)graphics.create();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setColor(Color.BLACK);
        g.setStroke(new BasicStroke(1.3f));
        int left = 30, right = getWidth() - 30, bottom = 160;
        for (int i = 0; i < 5; i++) g.drawLine(left, bottom - i * 20, right, bottom - i * 20);
        String clef = bass ? "𝄢" : "𝄞";
        Font font = new Font("Segoe UI Symbol", Font.PLAIN, 100);
        if (!font.canDisplay(clef.codePointAt(0))) {
            for (Font candidate : GraphicsEnvironment.getLocalGraphicsEnvironment().getAllFonts())
                if (candidate.canDisplay(clef.codePointAt(0))) { font = candidate.deriveFont(100f); break; }
        }
        g.setFont(font);
        g.drawString(clef, left + 6, bass ? 145 : 166);
        int relative = note.step() - (bass ? 18 : 30);
        int y = bottom - relative * 10, x = getWidth() / 2 + 25;
        for (int s = -2; s >= relative; s -= 2) g.drawLine(x - 19, bottom - s * 10, x + 19, bottom - s * 10);
        for (int s = 10; s <= relative; s += 2) g.drawLine(x - 19, bottom - s * 10, x + 19, bottom - s * 10);
        g.setFont(new Font("Segoe UI Symbol", Font.PLAIN, 28));
        if (note.accidental() != 0) g.drawString(note.accidental() < 0 ? "♭" : "♯", x - 39, y + 9);
        g.rotate(-0.25, x, y);
        g.fillOval(x - 10, y - 7, 20, 14);
        g.rotate(0.25, x, y);
        if (relative < 4) g.drawLine(x + 9, y, x + 9, y - 55);
        else g.drawLine(x - 9, y, x - 9, y + 55);
        g.dispose();
    }
}
