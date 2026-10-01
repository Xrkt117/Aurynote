package aurynote;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.util.function.IntConsumer;

final class PitchPractice extends JPanel {
    private final JComboBox<String> target = new JComboBox<>(Music.PITCH_NAMES);
    private final JLabel note = new JLabel("C4", SwingConstants.CENTER);
    private final IntConsumer playback;
    private final IntConsumer recordMatch;

    PitchPractice(IntConsumer playback, IntConsumer recordMatch) {
        this.playback = playback;
        this.recordMatch = recordMatch;
        setLayout(new BorderLayout(0, 22));
        setBorder(new EmptyBorder(24, 34, 24, 34));

        JPanel heading = new JPanel();
        heading.setLayout(new BoxLayout(heading, BoxLayout.Y_AXIS));
        JLabel title = new JLabel("Pitch matching");
        title.setFont(new Font("SansSerif", Font.BOLD, 28));
        JLabel instructions = new JLabel("Choose a target, listen, then match it on your instrument.");
        instructions.setForeground(new Color(95, 95, 95));
        heading.add(title);
        heading.add(Box.createVerticalStrut(6));
        heading.add(instructions);
        add(heading, BorderLayout.NORTH);

        JPanel card = new JPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(220, 220, 220)),
                new EmptyBorder(24, 28, 24, 28)));
        JPanel picker = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        picker.add(new JLabel("Target note"));
        picker.add(target);
        picker.add(new PracticeButton("Random target", this::randomTarget));
        card.add(picker);
        card.add(Box.createVerticalStrut(28));
        note.setFont(new Font("SansSerif", Font.BOLD, 72));
        note.setAlignmentX(CENTER_ALIGNMENT);
        card.add(note);
        card.add(Box.createVerticalStrut(24));
        JPanel actions = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        actions.add(new PracticeButton("Hear target", () -> playback.accept(midi())));
        actions.add(new PracticeButton("Mark matched", () -> recordMatch.accept(target.getSelectedIndex())));
        card.add(actions);
        JLabel limitation = new JLabel("Microphone detection is available in the Electron desktop app.", SwingConstants.CENTER);
        limitation.setForeground(new Color(110, 110, 110));
        limitation.setBorder(new EmptyBorder(14, 0, 0, 0));
        card.add(limitation);
        add(card, BorderLayout.CENTER);

        target.addActionListener(event -> note.setText(Music.name(target.getSelectedIndex()) + "4"));
    }

    private int midi() {
        return 60 + target.getSelectedIndex();
    }

    private void randomTarget() {
        int next = target.getSelectedIndex();
        while (next == target.getSelectedIndex()) next = (int) (Math.random() * 12);
        target.setSelectedIndex(next);
    }
}
