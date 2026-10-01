package aurynote;

import javax.swing.*;
import java.awt.*;
import java.util.*;
import java.util.function.IntConsumer;

final class StaffPractice extends JPanel {
    private final Random random = new Random();
    private final StaffView staff = new StaffView();
    private final JComboBox<String> clef = new JComboBox<>(new String[]{"Treble clef", "Bass clef"});
    private final JComboBox<String> level = new JComboBox<>(new String[]{"Natural notes", "With accidentals"});
    private final JComboBox<String> mode = new JComboBox<>(new String[]{"Multiple choice", "Type the note"});
    private final JPanel input = new JPanel();
    private final RoundFeedback feedback = new RoundFeedback(this::next);
    private final JLabel questionLabel = new JLabel();
    private final JLabel score = new JLabel("Score: 0 / 0");
    private final IntConsumer playback;
    private StaffNote current;
    private boolean answered;
    private int correct, total, question;

    StaffPractice(IntConsumer playback) {
        this.playback = playback;
        setPreferredSize(new Dimension(820, 620));
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        add(Box.createVerticalGlue());
        JLabel title = new JLabel("Read the staff");
        title.setFont(new Font("Segoe UI", Font.BOLD, 26));
        addCentered(title);
        add(Box.createVerticalStrut(12));
        JPanel settings = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        settings.add(clef); settings.add(level); settings.add(mode);
        settings.setMaximumSize(new Dimension(700, 35));
        addCentered(settings);
        add(Box.createVerticalStrut(8));
        questionLabel.setFont(new Font("SansSerif", Font.BOLD, 12));
        addCentered(questionLabel);
        addCentered(staff);
        addCentered(new JLabel("Name the note shown, including its sharp or flat."));
        add(Box.createVerticalStrut(8));
        input.setMaximumSize(new Dimension(420, 110));
        addCentered(input);
        add(Box.createVerticalStrut(8));
        addCentered(feedback);
        add(Box.createVerticalStrut(8));
        addCentered(score);
        JPanel actions = new JPanel();
        actions.add(new PracticeButton("Next note", this::next));
        actions.add(new PracticeButton("Hear note", () -> playback.accept(current.midi())));
        actions.setMaximumSize(new Dimension(700, 58));
        addCentered(actions);
        add(Box.createVerticalGlue());
        clef.addActionListener(e -> next());
        level.addActionListener(e -> next());
        mode.addActionListener(e -> next());
        next();
    }

    private void addCentered(JComponent component) { component.setAlignmentX(CENTER_ALIGNMENT); add(component); }

    private void next() {
        feedback.cancel();
        StaffNote previous = current;
        do { current = new StaffNote((clef.getSelectedIndex() == 0 ? 28 : 14) + random.nextInt(13), level.getSelectedIndex() == 0 ? 0 : random.nextInt(3) - 1); }
        while (current.equals(previous));
        answered = false;
        questionLabel.setText("STAFF READING · QUESTION " + (++question));
        feedback.ready("New question", "Read the note, then choose or type your answer.");
        staff.show(current, clef.getSelectedIndex() == 1);
        input.removeAll();
        if (mode.getSelectedIndex() == 0) {
            input.setLayout(new GridLayout(2, 2, 12, 12));
            Set<String> names = new LinkedHashSet<>();
            names.add(current.name());
            while (names.size() < 4) names.add(new StaffNote(28 + random.nextInt(7), current.accidental()).name());
            java.util.List<String> choices = new ArrayList<>(names);
            Collections.shuffle(choices, random);
            for (String choice : choices) input.add(new PracticeButton(choice, () -> answer(choice)));
        } else {
            input.setLayout(new FlowLayout(FlowLayout.CENTER, 12, 25));
            JTextField text = new JTextField(8);
            text.setFont(new Font("Segoe UI", Font.PLAIN, 20));
            text.getAccessibleContext().setAccessibleName("Note name, such as C, F# or Bb");
            text.setToolTipText("Examples: C, F#, Bb. No octave needed.");
            text.addActionListener(e -> answer(text.getText()));
            input.add(text);
            input.add(new PracticeButton("Submit", () -> answer(text.getText())));
        }
        input.revalidate(); input.repaint();
    }

    private void answer(String value) {
        if (answered) return;
        if (value.isBlank()) { feedback.ready("Enter a note name", "Examples: C, F# or Bb."); return; }
        answered = true;
        boolean right = current.matches(value);
        if (right) correct++;
        total++;
        feedback.result(right, current.name());
        score.setText("Score: " + correct + " / " + total);
        for (Component component : input.getComponents()) component.setEnabled(false);
    }
}
