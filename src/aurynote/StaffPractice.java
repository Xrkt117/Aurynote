package aurynote;

import javax.swing.*;
import java.awt.*;
import java.util.*;
import java.util.function.BiConsumer;
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
    private final BiConsumer<Integer, Boolean> progressRecorder;
    private StaffNote current;
    private boolean answered;
    private int correct, total, question;

    StaffPractice(IntConsumer playback) {
        this(playback, (note, right) -> {});
    }

    StaffPractice(IntConsumer playback, BiConsumer<Integer, Boolean> progressRecorder) {
        this.playback = playback;
        this.progressRecorder = progressRecorder;
        setPreferredSize(new Dimension(820, 650));
        setBorder(BorderFactory.createEmptyBorder(16, 20, 16, 20));
        setLayout(new BorderLayout(0, 14));

        JPanel header = new JPanel();
        header.setLayout(new BoxLayout(header, BoxLayout.Y_AXIS));
        JLabel title = new JLabel("Staff reading");
        title.setFont(new Font("SansSerif", Font.BOLD, 28));
        header.add(title);
        header.add(Box.createVerticalStrut(5));
        JLabel instructions = new JLabel("Identify the displayed note by name.");
        instructions.setForeground(new Color(95, 95, 95));
        header.add(instructions);
        header.add(Box.createVerticalStrut(14));
        JPanel settings = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        settings.add(clef); settings.add(level); settings.add(mode);
        header.add(settings);
        add(header, BorderLayout.NORTH);

        JPanel stage = new JPanel(new BorderLayout(0, 8));
        stage.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(220, 220, 220)),
                BorderFactory.createEmptyBorder(12, 18, 14, 18)));
        questionLabel.setFont(new Font("SansSerif", Font.BOLD, 12));
        stage.add(questionLabel, BorderLayout.NORTH);
        stage.add(staff, BorderLayout.CENTER);
        JLabel prompt = new JLabel("What note is on the staff? Include its sharp or flat.", SwingConstants.CENTER);
        prompt.setFont(new Font("SansSerif", Font.BOLD, 16));
        stage.add(prompt, BorderLayout.SOUTH);
        add(stage, BorderLayout.CENTER);

        JPanel answerArea = new JPanel();
        answerArea.setLayout(new BoxLayout(answerArea, BoxLayout.Y_AXIS));
        JLabel answerLabel = new JLabel("Your answer");
        answerLabel.setFont(new Font("SansSerif", Font.BOLD, 12));
        answerArea.add(answerLabel);
        answerArea.add(Box.createVerticalStrut(8));
        input.setMaximumSize(new Dimension(Integer.MAX_VALUE, 86));
        answerArea.add(input);
        answerArea.add(Box.createVerticalStrut(8));
        answerArea.add(feedback);
        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 4));
        actions.add(score);
        actions.add(new PracticeButton("Hear note", () -> playback.accept(current.midi())));
        actions.add(new PracticeButton("Skip note", this::next));
        answerArea.add(actions);
        add(answerArea, BorderLayout.SOUTH);
        clef.addActionListener(e -> next());
        level.addActionListener(e -> next());
        mode.addActionListener(e -> next());
        next();
    }

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
            input.setLayout(new GridLayout(1, 4, 12, 0));
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
        progressRecorder.accept(Math.floorMod(current.midi(), 12), right);
        feedback.result(right, current.name());
        score.setText("Score: " + correct + " / " + total);
        for (Component component : input.getComponents()) {
            component.setEnabled(false);
            if (component instanceof JButton button) {
                if (button.getText().equals(current.name())) button.setBackground(new Color(224, 241, 228));
                else if (button.getText().equals(value)) button.setBackground(new Color(248, 226, 218));
            }
        }
    }
}
