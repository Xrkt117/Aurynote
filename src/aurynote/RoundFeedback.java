package aurynote;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.HierarchyEvent;

final class RoundFeedback extends JPanel {
    static final Color GREEN = new Color(24, 112, 65);
    private final JLabel message = new JLabel(" ", SwingConstants.CENTER);
    private final JLabel detail = new JLabel(" ", SwingConstants.CENTER);
    private final JProgressBar progress = new JProgressBar(0, 1400);
    private final Timer timer;
    private long started;

    RoundFeedback(Runnable advance) {
        setLayout(new BorderLayout(0, 6));
        setBorder(new EmptyBorder(10, 16, 10, 16));
        setMaximumSize(new Dimension(800, 86));
        setPreferredSize(new Dimension(600, 86));
        message.setFont(new Font("SansSerif", Font.BOLD, 20));
        detail.setFont(new Font("SansSerif", Font.PLAIN, 13));
        progress.setPreferredSize(new Dimension(100, 3));
        progress.setBorderPainted(false);
        progress.setForeground(GREEN);
        progress.setBackground(new Color(225, 237, 228));
        add(message, BorderLayout.NORTH);
        add(detail, BorderLayout.CENTER);
        add(progress, BorderLayout.SOUTH);
        timer = new Timer(20, e -> {
            int elapsed = (int)((System.nanoTime() - started) / 1_000_000);
            progress.setValue(Math.min(1400, elapsed));
            if (elapsed >= 1400) {
                ((Timer)e.getSource()).stop();
                if (isShowing()) advance.run();
            }
        });
        addHierarchyListener(e -> {
            if ((e.getChangeFlags() & HierarchyEvent.SHOWING_CHANGED) != 0 && !isShowing()) cancel();
        });
        ready("Ready to practice", "Start a question to begin.");
    }

    void ready(String title, String hint) {
        cancel();
        setBackground(new Color(245, 245, 245));
        message.setForeground(Color.BLACK);
        message.setText(title);
        detail.setText(hint);
        progress.setVisible(false);
    }

    void result(boolean correct, String note) {
        cancel();
        setBackground(correct ? new Color(234, 246, 237) : new Color(250, 240, 237));
        message.setForeground(correct ? GREEN : new Color(156, 57, 38));
        message.setText(correct ? "Correct — " + note : "Not quite — the answer is " + note);
        detail.setText(correct ? "Next question in a moment…" : "Take a look, then select Next note when you're ready.");
        progress.setVisible(correct);
        progress.setValue(0);
        if (correct) { started = System.nanoTime(); timer.restart(); }
    }

    void cancel() {
        if (timer.isRunning()) detail.setText("Select Next note to continue.");
        timer.stop();
        progress.setVisible(false);
    }
}
