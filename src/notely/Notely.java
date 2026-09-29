package notely;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.*;
import java.util.Arrays;
import java.util.Random;

public final class Notely extends JFrame {
    private final Audio audio = new Audio();
    private final Random random = new Random();
    private final JComboBox<String> instrument = new JComboBox<>(new String[]{"Piano", "Tenor sax"});
    private final JComboBox<String> notation = new JComboBox<>(new String[]{"Written pitch", "Concert pitch"});
    private final JComboBox<String> difficulty = new JComboBox<>(new String[]{"Natural notes", "All 12 notes"});
    private final JComboBox<String> root = new JComboBox<>(Music.NOTES);
    private final JComboBox<String> category = new JComboBox<>(new String[]{"Scales", "Chords"});
    private final JComboBox<String> pattern = new JComboBox<>();
    private final JLabel feedback = new JLabel("Press New note to begin.");
    private final JLabel score = new JLabel("0 / 0 correct");
    private final JLabel pitchHint = new JLabel();
    private final JLabel noteList = new JLabel();
    private final JLabel formula = new JLabel();
    private final JLabel audioStatus = new JLabel(" ");
    private final JButton[] answers = new JButton[12];
    private final Keyboard keyboard = new Keyboard();
    private int target = -1, correct, total;
    private boolean answered;

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            configureStyle();
            new Notely().setVisible(true);
        });
    }

    static void configureStyle() {
            UIManager.put("Panel.background", Color.WHITE);
            UIManager.put("Label.foreground", new Color(25, 25, 25));
            UIManager.put("TabbedPane.background", Color.WHITE);
            UIManager.put("TabbedPane.selected", new Color(235, 235, 235));
            for (String key : new String[]{"Label.font", "Button.font", "ComboBox.font", "TabbedPane.font"})
                UIManager.put(key, new Font("SansSerif", Font.PLAIN, 14));
    }

    public Notely() {
        super("Notely");
        setDefaultCloseOperation(WindowConstants.DISPOSE_ON_CLOSE);
        setSize(960, 760);
        setMinimumSize(new Dimension(940, 740));
        setLocationRelativeTo(null);
        JPanel content = new JPanel(new BorderLayout(0, 20));
        content.setBorder(new EmptyBorder(26, 32, 20, 32));
        setContentPane(content);
        JPanel header = column();
        JLabel title = new JLabel("Notely");
        title.setFont(new Font("SansSerif", Font.BOLD, 32));
        header.add(title);
        header.add(new JLabel("Listen closely. Find the note. Learn the pattern."));
        header.add(Box.createVerticalStrut(16));
        header.add(row(new JLabel("Instrument"), instrument, notation));
        header.add(pitchHint);
        content.add(header, BorderLayout.NORTH);
        JTabbedPane tabs = new JTabbedPane();
        tabs.addTab("Ear training", training());
        tabs.addTab("Scales & chords", explore());
        tabs.addChangeListener(e -> audio.stop());
        content.add(tabs, BorderLayout.CENTER);
        audioStatus.setFont(new Font("SansSerif", Font.PLAIN, 12));
        content.add(audioStatus, BorderLayout.SOUTH);
        instrument.addActionListener(e -> settingsChanged());
        notation.addActionListener(e -> settingsChanged());
        difficulty.addActionListener(e -> resetQuestion());
        addWindowListener(new WindowAdapter() {
            @Override public void windowClosed(WindowEvent e) { audio.close(); }
        });
        settingsChanged();
    }

    private JPanel training() {
        JPanel panel = column();
        panel.setBorder(new EmptyBorder(22, 18, 12, 18));
        panel.add(heading("What note do you hear?"));
        panel.add(Box.createVerticalStrut(8));
        panel.add(new JLabel("Listen, then choose a note below. Replay as often as you like."));
        panel.add(Box.createVerticalStrut(16));
        panel.add(row(difficulty, button("New note", this::newQuestion), button("Replay", this::replay)));
        panel.add(Box.createVerticalStrut(20));
        JPanel grid = new JPanel(new GridLayout(2, 6, 8, 8));
        grid.setMaximumSize(new Dimension(Integer.MAX_VALUE, 104));
        for (int i = 0; i < 12; i++) {
            final int note = i;
            answers[i] = button(Music.NOTES[i], () -> answer(note));
            grid.add(answers[i]);
        }
        panel.add(grid);
        panel.add(Box.createVerticalStrut(20));
        panel.add(feedback);
        panel.add(Box.createVerticalStrut(8));
        panel.add(score);
        panel.add(Box.createVerticalStrut(14));
        panel.add(row(button("Hear reference C", () -> play(new int[]{60}, false)),
                button("Reset score", () -> { correct = total = 0; updateScore(); resetQuestion(); })));
        panel.add(Box.createVerticalStrut(10));
        panel.add(new JLabel("Use reference C to practice hearing the distance between notes."));
        return panel;
    }

    private JPanel explore() {
        JPanel panel = column();
        panel.setBorder(new EmptyBorder(22, 18, 12, 18));
        panel.add(heading("Find your way around a key"));
        panel.add(Box.createVerticalStrut(10));
        panel.add(row(root, category, pattern));
        panel.add(Box.createVerticalStrut(12));
        panel.add(noteList);
        panel.add(Box.createVerticalStrut(8));
        panel.add(formula);
        panel.add(Box.createVerticalStrut(16));
        panel.add(keyboard);
        panel.add(Box.createVerticalStrut(12));
        panel.add(row(button("Play", () -> play(selectedPitches(), category.getSelectedIndex() == 1)),
                button("Play one at a time", () -> play(selectedPitches(), false)), button("Stop", audio::stop)));
        panel.add(Box.createVerticalStrut(10));
        panel.add(new JLabel("Filled dots mark note classes; extended chords can span several octaves."));
        root.addActionListener(e -> updatePattern());
        category.addActionListener(e -> populatePatterns());
        pattern.addActionListener(e -> updatePattern());
        populatePatterns();
        return panel;
    }

    private void populatePatterns() {
        pattern.removeAllItems();
        (category.getSelectedIndex() == 0 ? Music.SCALES : Music.CHORDS).keySet().forEach(pattern::addItem);
        updatePattern();
    }

    private int[] selectedPitches() {
        int[] intervals = (category.getSelectedIndex() == 0 ? Music.SCALES : Music.CHORDS).get(pattern.getSelectedItem());
        return Music.pitches(60 + root.getSelectedIndex(), intervals == null ? new int[]{0} : intervals);
    }

    private void updatePattern() {
        int[] pitches = selectedPitches();
        noteList.setText(String.join("  ·  ", Arrays.stream(pitches).mapToObj(Music::name).toList()));
        formula.setText("Semitones from root: " + Arrays.toString(Arrays.stream(pitches).map(n -> n - pitches[0]).toArray()));
        keyboard.setNotes(pitches);
    }

    private void settingsChanged() {
        boolean tenor = instrument.getSelectedIndex() == 1;
        notation.setEnabled(tenor);
        pitchHint.setText(tenor && notation.getSelectedIndex() == 0
                ? "Tenor written C4 sounds as concert B♭2. Answers use written pitch."
                : "Notes and answers use concert pitch. C4 is middle C.");
        resetQuestion();
    }

    private void resetQuestion() {
        audio.stop();
        target = -1;
        answered = false;
        feedback.setText("Press New note to begin.");
        for (JButton answer : answers) { answer.setEnabled(false); answer.setBackground(Color.WHITE); }
    }

    private void newQuestion() {
        int previous = target;
        int[] pool = difficulty.getSelectedIndex() == 0 ? new int[]{0, 2, 4, 5, 7, 9, 11} : new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11};
        do { target = 60 + pool[random.nextInt(pool.length)]; } while (target == previous);
        answered = false;
        feedback.setText("Listen and choose a note.");
        for (int i = 0; i < answers.length; i++) {
            final int n = i;
            answers[i].setEnabled(Arrays.stream(pool).anyMatch(p -> p == n));
            answers[i].setBackground(Color.WHITE);
        }
        replay();
    }

    private void replay() { if (target >= 0) play(new int[]{target}, false); }

    private void answer(int choice) {
        if (target < 0 || answered) return;
        answered = true;
        total++;
        boolean right = choice == target % 12;
        if (right) correct++;
        feedback.setText((right ? "Correct! " : "Not quite. ") + "That was " + Music.name(target) + ". Press New note to continue.");
        for (JButton answer : answers) answer.setEnabled(false);
        answers[target % 12].setBackground(new Color(205, 205, 205));
        updateScore();
    }

    private void updateScore() { score.setText(correct + " / " + total + " correct" + (total == 0 ? "" : "  ·  " + Math.round(100.0 * correct / total) + "%")); }

    private void play(int[] displayed, boolean together) {
        audioStatus.setText(" ");
        boolean tenor = instrument.getSelectedIndex() == 1;
        int[] sounding = Arrays.stream(displayed).map(n -> Music.soundingPitch(n, tenor, notation.getSelectedIndex() == 0)).toArray();
        audio.play(sounding, tenor, together, message -> SwingUtilities.invokeLater(() -> audioStatus.setText(message)));
    }

    private static JPanel column() {
        JPanel panel = new JPanel() {
            @Override protected void addImpl(Component component, Object constraints, int index) {
                if (component instanceof JComponent child) child.setAlignmentX(Component.LEFT_ALIGNMENT);
                super.addImpl(component, constraints, index);
            }
        };
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);
        return panel;
    }

    private static JPanel row(Component... items) {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);
        panel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 46));
        for (Component item : items) panel.add(item);
        return panel;
    }

    private static JLabel heading(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("SansSerif", Font.BOLD, 23));
        return label;
    }

    private static JButton button(String text, Runnable action) {
        JButton button = new JButton(text);
        button.setBackground(Color.WHITE);
        button.setForeground(Color.BLACK);
        button.setFocusPainted(true);
        button.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createLineBorder(new Color(180, 180, 180)), new EmptyBorder(9, 10, 9, 10)));
        button.addActionListener(e -> action.run());
        return button;
    }

    private static final class Keyboard extends JPanel {
        private int[] notes = {};
        private float fade = 1;
        private final Timer animation = new Timer(16, e -> { fade = Math.min(1, fade + 0.09f); repaint(); if (fade == 1) ((Timer)e.getSource()).stop(); });
        Keyboard() {
            setPreferredSize(new Dimension(680, 125));
            setMaximumSize(new Dimension(Integer.MAX_VALUE, 125));
            setAlignmentX(Component.LEFT_ALIGNMENT);
            getAccessibleContext().setAccessibleName("Keyboard showing selected scale or chord notes");
        }
        void setNotes(int[] value) { notes = value; fade = 0; animation.restart(); }
        private boolean active(int pitch) { return Arrays.stream(notes).anyMatch(n -> n % 12 == pitch); }
        @Override protected void paintComponent(Graphics graphics) {
            super.paintComponent(graphics);
            Graphics2D g = (Graphics2D)graphics.create();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            int w = (getWidth() - 2) / 7, h = getHeight() - 2;
            int[] whites = {0, 2, 4, 5, 7, 9, 11};
            for (int i = 0; i < 7; i++) {
                g.setColor(Color.WHITE); g.fillRoundRect(i * w, 0, w, h, 4, 4);
                g.setColor(Color.BLACK); g.drawRoundRect(i * w, 0, w, h, 4, 4);
                g.drawString(Music.name(whites[i]), i * w + w / 2 - 5, h - 10);
                if (active(whites[i])) { g.setColor(new Color(0, 0, 0, (int)(255 * fade))); g.fillOval(i * w + w / 2 - 5, h - 40, 10, 10); }
            }
            int[] blacks = {1, 3, 6, 8, 10};
            int[] positions = {1, 2, 4, 5, 6};
            for (int i = 0; i < 5; i++) {
                int x = positions[i] * w - w / 3;
                g.setColor(Color.BLACK); g.fillRoundRect(x, 0, w * 2 / 3, h * 3 / 5, 4, 4);
                if (active(blacks[i])) { g.setColor(new Color(255, 255, 255, (int)(255 * fade))); g.fillOval(x + w / 3 - 5, h * 3 / 5 - 22, 10, 10); }
            }
            g.dispose();
        }
    }
}
