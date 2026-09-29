package notely;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;

final class PracticeButton extends JButton {
    private float hover;
    private final Timer animation = new Timer(16, e -> {
        float goal = isEnabled() && (getModel().isRollover() || getModel().isPressed()) ? 1 : 0;
        hover += Math.signum(goal - hover) * Math.min(0.16f, Math.abs(goal - hover));
        repaint();
        if (Math.abs(hover - goal) < 0.01f) ((Timer)e.getSource()).stop();
    });

    PracticeButton(String title, Runnable action) {
        super(title);
        setFont(new Font("SansSerif", Font.PLAIN, 16));
        setOpaque(false);
        setContentAreaFilled(false);
        setBorderPainted(false);
        setFocusPainted(false);
        setRolloverEnabled(true);
        setBackground(Color.WHITE);
        setBorder(new EmptyBorder(12, 18, 12, 18));
        setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        getModel().addChangeListener(e -> animation.start());
        addActionListener(e -> action.run());
    }

    @Override protected void paintComponent(Graphics graphics) {
        Graphics2D g = (Graphics2D)graphics.create();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        int shade = (int)(getBackground().getRed() * (1 - hover));
        g.setColor(new Color(shade, shade, shade));
        g.fillRoundRect(1, 1, getWidth() - 3, getHeight() - 3, 14, 14);
        g.setColor(isEnabled() ? Color.BLACK : Color.LIGHT_GRAY);
        g.setStroke(new BasicStroke(1.3f));
        g.drawRoundRect(1, 1, getWidth() - 3, getHeight() - 3, 14, 14);
        if (hasFocus()) {
            g.setColor(Color.GRAY);
            g.drawRoundRect(4, 4, getWidth() - 9, getHeight() - 9, 10, 10);
        }
        g.dispose();
        int text = (int)(255 * hover);
        setForeground(isEnabled() ? new Color(text, text, text) : Color.GRAY);
        super.paintComponent(graphics);
    }

    @Override public void removeNotify() { animation.stop(); super.removeNotify(); }
}
