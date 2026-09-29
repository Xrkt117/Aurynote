package aurynote;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.HierarchyEvent;
import java.util.Random;
import java.util.function.IntConsumer;

final class EarPractice extends JPanel {
    interface Playback { void play(int[] notes, IntConsumer onNote, Runnable done); }
    private final PitchLesson lesson = new PitchLesson(new Random());
    private final Random random = new Random();
    private final Playback playback;
    private final Runnable stopAudio;
    private final JComboBox<String> mode = new JComboBox<>(new String[]{"Guided lessons", "Natural notes", "All 12 notes", "Find the degree · C major"});
    private final JComboBox<String> range = new JComboBox<>(new String[]{"One octave", "Two octaves"});
    private final JCheckBox reference = new JCheckBox("Play reference C first", true);
    private final JLabel title = new JLabel();
    private final JLabel progress = new JLabel();
    private final JLabel phase = new JLabel();
    private final JLabel prompt = new JLabel();
    private final JLabel score = new JLabel("Score: 0 / 0");
    private final JPanel choices = new JPanel(new GridLayout(1, 2, 10, 10));
    private final Aurynote.Keyboard keyboard = new Aurynote.Keyboard();
    private final RoundFeedback feedback = new RoundFeedback(this::continueRound);
    private final JButton start = new PracticeButton("Start quiz", this::startOrNext);
    private final JButton replay = new PracticeButton("Replay", this::replay);
    private final JButton compare = new PracticeButton("Hear comparison again", this::compare);
    private boolean studying = true, answered, busy;
    private int target = -1, choice = -1, octave, correct, total, question, generation;

    EarPractice(Playback playback, Runnable stopAudio) {
        this.playback = playback;
        this.stopAudio = stopAudio;
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        setBorder(new EmptyBorder(12, 16, 12, 16));
        setPreferredSize(new Dimension(820, 620));
        title.setFont(new Font("SansSerif", Font.BOLD, 25));
        phase.setFont(new Font("SansSerif", Font.BOLD, 12));
        addCentered(title);
        addCentered(row(mode, range));
        reference.setBackground(Color.WHITE);
        addCentered(reference);
        add(Box.createVerticalStrut(6));
        addCentered(progress);
        add(Box.createVerticalStrut(12));
        addCentered(phase);
        add(Box.createVerticalStrut(6));
        addCentered(prompt);
        add(Box.createVerticalStrut(12));
        choices.setPreferredSize(new Dimension(760, 104));
        choices.setMaximumSize(new Dimension(800, 104));
        addCentered(choices);
        add(Box.createVerticalStrut(12));
        addCentered(keyboard);
        add(Box.createVerticalStrut(12));
        addCentered(feedback);
        addCentered(row(start, replay, compare));
        addCentered(row(new PracticeButton("Listen & learn", () -> study("Listen before testing")),
                new PracticeButton("Restart practice", this::restart), score));
        mode.addActionListener(e -> restart());
        range.addActionListener(e -> settingsChanged());
        reference.addActionListener(e -> settingsChanged());
        addHierarchyListener(e -> {
            if ((e.getChangeFlags() & HierarchyEvent.SHOWING_CHANGED) != 0 && !isShowing()) pause();
        });
        study("Start with two notes");
    }

    private static JPanel row(Component... components) {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 4));
        panel.setMaximumSize(new Dimension(820, 54));
        for (Component component : components) panel.add(component);
        return panel;
    }
    private void addCentered(JComponent component) { component.setAlignmentX(CENTER_ALIGNMENT); add(component); }
    private boolean guided() { return mode.getSelectedIndex() == 0; }
    private boolean degrees() { return mode.getSelectedIndex() == 3; }
    private int[] pool() {
        return guided() ? lesson.pool() : PitchLesson.LEVELS[mode.getSelectedIndex() == 2 ? 4 : 3];
    }
    private String label(int note) {
        if (!degrees()) return Music.name(note);
        return switch (note) {
            case 0 -> "1 · root"; case 2 -> "2 · second"; case 4 -> "3 · third";
            case 5 -> "4 · fourth"; case 7 -> "5 · fifth"; case 9 -> "6 · sixth";
            default -> "7 · seventh";
        };
    }
    private void updateProgress() {
        title.setText(guided() ? "Lesson " + (lesson.level() + 1) + " · " + PitchLesson.NAMES[lesson.level()] : degrees() ? "Find the note in C major" : "Pitch practice");
        progress.setText(guided() ? lesson.correct() + " / " + lesson.answered() + " recent answers correct · aim for 80% across " + lesson.goal() + " questions"
                : degrees() ? "Hear C–E–G–C, then identify the mystery note's role." : "Missed notes return more often, mixed with easier questions.");
    }
    private void buildChoices(boolean enabled) {
        choices.removeAll();
        int[] pool = pool();
        choices.setLayout(new GridLayout(pool.length > 6 ? 2 : 1, 0, 10, 10));
        for (int note : pool) {
            JButton button = new PracticeButton(label(note), () -> {
                if (studying) listen(note); else answer(note);
            });
            button.setEnabled(enabled);
            choices.add(button);
        }
        choices.revalidate(); choices.repaint();
    }
    private void setChoicesEnabled(boolean enabled) {
        for (Component component : choices.getComponents()) component.setEnabled(enabled);
    }
    private void study(String message) {
        pause();
        studying = true;
        target = -1;
        answered = false;
        phase.setText("01  LISTEN & LEARN");
        prompt.setText("Press each note to learn its sound, then start the quiz.");
        start.setText("Start quiz");
        start.setEnabled(true);
        replay.setEnabled(false);
        compare.setEnabled(false);
        keyboard.setNotes(new int[0]);
        feedback.ready(message, "You can return here at any time. Progress is kept during this session.");
        updateProgress();
        buildChoices(true);
    }
    private void listen(int note) {
        phase.setText("01  LISTEN & LEARN · " + label(note));
        play(range.getSelectedIndex() == 1 ? new int[]{60 + note, 72 + note} : new int[]{60 + note}, true, () -> {});
    }
    private void startOrNext() { if (studying) next(); else continueRound(); }
    private void continueRound() {
        if (guided() && lesson.advance()) { study("Lesson complete — meet your new notes"); return; }
        next();
    }
    private void next() {
        pause();
        studying = false;
        answered = false;
        choice = -1;
        target = lesson.choose(pool());
        octave = range.getSelectedIndex() == 1 && random.nextBoolean() ? 12 : 0;
        phase.setText("02  QUIZ · QUESTION " + (++question));
        prompt.setText(degrees() ? "Which scale degree follows the C-major pattern?" : "Listen, then choose the mystery note.");
        feedback.ready("New question", degrees() ? "The pattern establishes the key. Answer the final note." : reference.isSelected() ? "Reference C first. Answer the second note." : "Name the note you hear.");
        keyboard.setNotes(new int[0]);
        start.setText("Next note");
        compare.setEnabled(false);
        buildChoices(false);
        updateProgress();
        replay();
    }
    private int targetMidi() { return 60 + octave + target; }
    private void replay() {
        if (target < 0 || studying) return;
        if (answered) {
            feedback.result(choice == target, label(target));
            play(new int[]{targetMidi()}, true, () -> {});
            return;
        }
        keyboard.setNotes(new int[0]);
        setChoicesEnabled(false);
        int[] sequence = degrees() ? new int[]{60, 64, 67, 72, targetMidi()}
                : reference.isSelected() ? new int[]{60, targetMidi()} : new int[]{targetMidi()};
        play(sequence, false, () -> setChoicesEnabled(true));
    }
    private void answer(int note) {
        if (answered || studying || busy || target < 0) return;
        choice = note;
        answered = true;
        total++;
        boolean right = choice == target;
        if (right) correct++;
        lesson.record(target, choice);
        score.setText("Score: " + correct + " / " + total);
        setChoicesEnabled(false);
        updateProgress();
        feedback.result(right, label(target));
        if (right) keyboard.setNotes(new int[]{targetMidi()});
        else compare();
        compare.setEnabled(!right);
    }
    private void compare() {
        if (!answered || choice == target) return;
        feedback.result(false, label(target));
        phase.setText("03  COMPARE · YOUR ANSWER → CORRECT NOTE");
        prompt.setText(Music.name(choice) + " → " + Music.name(target) + " · watch the highlighted keys as you listen");
        play(new int[]{60 + octave + choice, targetMidi()}, true, () -> {});
    }
    private void play(int[] sequence, boolean reveal, Runnable done) {
        int token = ++generation;
        busy = true;
        replay.setEnabled(false);
        playback.play(sequence, note -> {
            if (token == generation && reveal) keyboard.setNotes(new int[]{note});
        }, () -> {
            if (token != generation) return;
            busy = false;
            replay.setEnabled(!studying);
            done.run();
        });
    }
    void pause() {
        generation++;
        busy = false;
        feedback.cancel();
        stopAudio.run();
        replay.setEnabled(!studying && target >= 0);
    }
    void settingsChanged() { lesson.resetPractice(); study("Listen with your new settings"); }
    private void restart() {
        lesson.restart(); correct = total = question = 0;
        score.setText("Score: 0 / 0");
        reference.setEnabled(!degrees());
        study("Listen before testing");
    }
}
