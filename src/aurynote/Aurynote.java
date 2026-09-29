package aurynote;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.*;
import java.util.Arrays;

public final class Aurynote extends JFrame {
    private final Audio audio = new Audio();
    private final JComboBox<String> instrument = new JComboBox<>(new String[]{"Piano", "Tenor sax"});
    private final JComboBox<String> notation = new JComboBox<>(new String[]{"Written pitch", "Concert pitch"});
    private final JComboBox<String> root = new JComboBox<>(Music.PITCH_NAMES);
    private final JComboBox<String> category = new JComboBox<>(new String[]{"Scales", "Chords"});
    private final JComboBox<String> pattern = new JComboBox<>();
    private final JLabel pitchHint = new JLabel();
    private final JPanel noteTiles = new JPanel(new GridLayout(1, 0, 8, 0));
    private final JLabel patternTitle = new JLabel();
    private final JLabel patternHint = new JLabel();
    private final JLabel instrumentKey = new JLabel();
    private final JLabel registerHint = new JLabel();
    private final JLabel explorerHeading = new JLabel("Scales");
    private final JToggleButton scalesTab = new JToggleButton("Scales");
    private final JToggleButton chordsTab = new JToggleButton("Chords");
    private final JLabel audioStatus = new JLabel(" ");
    private final EarPractice ear = new EarPractice(this::playLesson, audio::stop);
    private final Keyboard keyboard = new Keyboard();
    private final CardLayout navigation = new CardLayout();
    private final JPanel screens = new JPanel(navigation);
    private final JPanel practiceHeader = column();

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            configureStyle();
            new Aurynote().setVisible(true);
        });
    }

    static void configureStyle() {
            javax.swing.plaf.metal.MetalLookAndFeel.setCurrentTheme(new javax.swing.plaf.metal.DefaultMetalTheme() {
                private final javax.swing.plaf.ColorUIResource gray = new javax.swing.plaf.ColorUIResource(210, 210, 210);
                @Override protected javax.swing.plaf.ColorUIResource getPrimary1() { return new javax.swing.plaf.ColorUIResource(90, 90, 90); }
                @Override protected javax.swing.plaf.ColorUIResource getPrimary2() { return gray; }
                @Override protected javax.swing.plaf.ColorUIResource getPrimary3() { return gray; }
            });
            try { UIManager.setLookAndFeel(new javax.swing.plaf.metal.MetalLookAndFeel()); }
            catch (UnsupportedLookAndFeelException e) { throw new IllegalStateException(e); }
            UIManager.put("Panel.background", Color.WHITE);
            UIManager.put("Label.foreground", new Color(25, 25, 25));
            UIManager.put("TabbedPane.background", Color.WHITE);
            UIManager.put("TabbedPane.selected", new Color(235, 235, 235));
            for (String key : new String[]{"Label.font", "Button.font", "ComboBox.font", "TabbedPane.font"})
                UIManager.put(key, new Font("SansSerif", Font.PLAIN, 14));
            UIManager.put("ComboBox.background", Color.WHITE);
            UIManager.put("ComboBox.selectionBackground", Color.BLACK);
            UIManager.put("ComboBox.selectionForeground", Color.WHITE);
    }

    public Aurynote() {
        super("aurynote");
        setDefaultCloseOperation(WindowConstants.DISPOSE_ON_CLOSE);
        setSize(960, 860);
        setMinimumSize(new Dimension(940, 800));
        setLocationRelativeTo(null);
        JPanel content = new JPanel(new BorderLayout(0, 20));
        content.setBorder(new EmptyBorder(26, 32, 20, 32));
        setContentPane(content);
        practiceHeader.add(row(button("← Menu", () -> showScreen("menu")), new JLabel("Instrument"), instrument, notation));
        practiceHeader.add(Box.createVerticalStrut(8));
        practiceHeader.add(pitchHint);
        content.add(practiceHeader, BorderLayout.NORTH);
        screens.add(menu(), "menu");
        screens.add(scrollable(ear), "ear");
        screens.add(scrollable(new StaffPractice(note -> play(new int[]{note}, false))), "staff");
        screens.add(scrollable(centered(explore())), "explore");
        content.add(screens, BorderLayout.CENTER);
        audioStatus.setFont(new Font("SansSerif", Font.PLAIN, 12));
        content.add(audioStatus, BorderLayout.SOUTH);
        instrument.addActionListener(e -> settingsChanged());
        notation.addActionListener(e -> settingsChanged());
        addWindowListener(new WindowAdapter() {
            @Override public void windowClosed(WindowEvent e) { ear.pause(); audio.close(); }
        });
        settingsChanged();
        showScreen("menu");
    }

    void showScreen(String name) {
        ear.pause();
        audio.stop();
        audioStatus.setText(" ");
        practiceHeader.setVisible(!name.equals("menu"));
        navigation.show(screens, name);
        revalidate();
        repaint();
    }

    private JPanel menu() {
        JPanel panel = column();
        panel.add(Box.createVerticalGlue());
        JLabel title = new JLabel("aurynote");
        title.setFont(new Font("Segoe UI", Font.BOLD, 34));
        panel.add(title);
        panel.add(Box.createVerticalStrut(18));
        JPanel divider = new JPanel();
        divider.setBackground(Color.BLACK);
        divider.setMaximumSize(new Dimension(60, 3));
        divider.setMinimumSize(new Dimension(60, 3));
        divider.setPreferredSize(new Dimension(60, 3));
        panel.add(divider);
        panel.add(Box.createVerticalStrut(18));
        JLabel subtitle = new JLabel("Learn the sound. Read the note.");
        subtitle.setForeground(new Color(100, 100, 100));
        panel.add(subtitle);
        panel.add(Box.createVerticalStrut(40));
        String[] titles = {"Ear training", "Staff reading", "Scales", "Chords"};
        String[] destinations = {"ear", "staff", "explore", "explore"};
        for (int i = 0; i < titles.length; i++) {
            final String destination = destinations[i];
            final int menuIndex = i;
            JButton choice = button(titles[i], () -> {
                if (menuIndex >= 2) category.setSelectedIndex(menuIndex - 2);
                showScreen(destination);
            });
            choice.setMaximumSize(new Dimension(260, 52));
            choice.setPreferredSize(new Dimension(260, 52));
            panel.add(choice);
            panel.add(Box.createVerticalStrut(14));
        }
        panel.add(Box.createVerticalGlue());
        return panel;
    }

    private static JPanel centered(JPanel panel) {
        JPanel wrapper = new JPanel(new GridBagLayout());
        GridBagConstraints constraints = new GridBagConstraints();
        constraints.weightx = 1;
        constraints.fill = GridBagConstraints.HORIZONTAL;
        wrapper.add(panel, constraints);
        return wrapper;
    }

    private static JScrollPane scrollable(JPanel panel) {
        JScrollPane scroll = new JScrollPane(panel, JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED, JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        scroll.setBorder(null);
        scroll.getVerticalScrollBar().setUnitIncrement(20);
        return scroll;
    }

    private JPanel explore() {
        JPanel panel = column();
        panel.setBorder(new EmptyBorder(8, 8, 8, 8));
        ButtonGroup tabs = new ButtonGroup();
        tabs.add(scalesTab); tabs.add(chordsTab);
        for (JToggleButton tab : new JToggleButton[]{scalesTab, chordsTab}) {
            tab.setFont(new Font("SansSerif", Font.BOLD, 15));
            tab.setBackground(Color.WHITE);
            tab.setPreferredSize(new Dimension(160, 40));
        }
        scalesTab.addActionListener(e -> category.setSelectedIndex(0));
        chordsTab.addActionListener(e -> category.setSelectedIndex(1));
        panel.add(row(scalesTab, chordsTab));
        explorerHeading.setFont(new Font("SansSerif", Font.BOLD, 26));
        panel.add(explorerHeading);
        panel.add(Box.createVerticalStrut(10));
        patternTitle.setFont(new Font("SansSerif", Font.BOLD, 30));
        patternHint.setFont(new Font("SansSerif", Font.PLAIN, 13));
        JPanel identity = column();
        identity.add(patternTitle);
        identity.add(patternHint);
        instrumentKey.setFont(new Font("SansSerif", Font.BOLD, 13));
        identity.add(Box.createVerticalStrut(8));
        identity.add(instrumentKey);
        registerHint.setFont(new Font("SansSerif", Font.PLAIN, 12));
        identity.add(registerHint);
        JPanel selection = new JPanel(new GridLayout(1, 2, 12, 0));
        JPanel controls = column();
        controls.add(row(new JLabel("Concert key"), root));
        controls.add(row(new JLabel("Type"), pattern));
        selection.add(section("01  CHOOSE", controls));
        selection.add(section("02  NAME & SYMBOL", identity));
        panel.add(selection);
        panel.add(Box.createVerticalStrut(10));
        noteTiles.setPreferredSize(new Dimension(800, 64));
        panel.add(section("03  NOTES TO PLAY · DEGREES BELOW", noteTiles));
        panel.add(Box.createVerticalStrut(10));
        JPanel keys = column();
        keys.add(keyboard);
        keys.add(Box.createVerticalStrut(6));
        JLabel keyHint = new JLabel("Dots show the notes · doubled ring marks the root · one octave shown");
        keyHint.setFont(new Font("SansSerif", Font.PLAIN, 12));
        keys.add(keyHint);
        panel.add(section("04  KEYBOARD", keys));
        panel.add(Box.createVerticalStrut(8));
        panel.add(row(button("Play", () -> play(selectedPitches(), category.getSelectedIndex() == 1 && instrument.getSelectedIndex() == 0)),
                button("One note at a time", () -> play(selectedPitches(), false)), button("Stop", audio::stop)));
        root.addActionListener(e -> updatePattern());
        category.addActionListener(e -> populatePatterns());
        pattern.addActionListener(e -> updatePattern());
        populatePatterns();
        return panel;
    }

    private static JPanel section(String title, JComponent body) {
        JPanel section = new JPanel(new BorderLayout(0, 8));
        section.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(220, 220, 220)), new EmptyBorder(10, 14, 10, 14)));
        JLabel label = new JLabel(title);
        label.setFont(new Font("SansSerif", Font.BOLD, 11));
        label.setForeground(new Color(90, 90, 90));
        section.add(label, BorderLayout.NORTH);
        section.add(body, BorderLayout.CENTER);
        return section;
    }

    private void populatePatterns() {
        audio.stop();
        scalesTab.setSelected(category.getSelectedIndex() == 0);
        chordsTab.setSelected(category.getSelectedIndex() == 1);
        explorerHeading.setText(category.getSelectedIndex() == 0 ? "Explore scales" : "Explore chords");
        pattern.removeAllItems();
        (category.getSelectedIndex() == 0 ? Music.SCALES : Music.CHORDS).keySet().forEach(pattern::addItem);
        updatePattern();
    }

    private int[] selectedPitches() {
        int[] intervals = (category.getSelectedIndex() == 0 ? Music.SCALES : Music.CHORDS).get(pattern.getSelectedItem());
        return Music.instrumentPitches(root.getSelectedIndex(), intervals == null ? new int[]{0} : intervals,
                instrument.getSelectedIndex() == 1, notation.getSelectedIndex() == 0);
    }

    private void updatePattern() {
        if (pattern.getSelectedItem() == null) return;
        audio.stop();
        int[] pitches = selectedPitches();
        String type = pattern.getSelectedItem().toString();
        boolean chord = category.getSelectedIndex() == 1;
        int displayedRoot = pitches[0] % 12;
        String rootName = Music.PITCH_NAMES[displayedRoot];
        boolean writtenTenor = instrument.getSelectedIndex() == 1 && notation.getSelectedIndex() == 0;
        instrumentKey.setText(writtenTenor ? "Tenor written " + rootName + " · concert " + Music.PITCH_NAMES[root.getSelectedIndex()]
                : instrument.getSelectedIndex() == 1 ? "Concert notes · choose Written pitch to play on sax" : "Piano · concert pitch");
        registerHint.setText("Start on " + rootName + (pitches[0] / 12 - 1) + (instrument.getSelectedIndex() == 1 && chord ? " · play chord tones one at a time" : ""));
        patternTitle.setFont(new Font("SansSerif", Font.BOLD, chord ? 30 : 24));
        patternTitle.setText(chord ? Music.chordSymbol(displayedRoot, type) : rootName + " " + type.toLowerCase(java.util.Locale.ROOT).replace(" (ascending)", ""));
        patternHint.setText(chord ? type + (type.equals("Major seventh") ? " · also written " + rootName + "Δ7" : type.equals("Half-diminished seventh") ? " · also written " + rootName + "m7♭5" : type.equals("Dominant thirteenth") ? " · voicing omits the 11th" : " chord") : "Scale tones in ascending order");
        noteTiles.removeAll();
        for (int pitch : pitches) {
            JPanel tile = new JPanel(new BorderLayout(0, 5));
            tile.setBackground(new Color(246, 246, 246));
            tile.setBorder(new EmptyBorder(8, 4, 8, 4));
            JLabel note = new JLabel(Music.spelledNote(displayedRoot, pitch - pitches[0], type), SwingConstants.CENTER);
            note.setFont(new Font("SansSerif", Font.BOLD, 20));
            JLabel degree = new JLabel(Music.degree(pitch - pitches[0], type), SwingConstants.CENTER);
            degree.setFont(new Font("SansSerif", Font.PLAIN, 13));
            degree.setForeground(Color.DARK_GRAY);
            tile.add(note, BorderLayout.CENTER);
            tile.add(degree, BorderLayout.SOUTH);
            noteTiles.add(tile);
        }
        noteTiles.revalidate(); noteTiles.repaint();
        keyboard.setNotes(pitches);
    }

    private void settingsChanged() {
        boolean tenor = instrument.getSelectedIndex() == 1;
        notation.setEnabled(tenor);
        pitchHint.setText(tenor && notation.getSelectedIndex() == 0
                ? "Tenor written C4 sounds as concert B♭2. Answers use written pitch."
                : "Notes and answers use concert pitch. C4 is middle C.");
        ear.settingsChanged();
        updatePattern();
    }

    private void play(int[] displayed, boolean together) {
        audioStatus.setText(" ");
        boolean tenor = instrument.getSelectedIndex() == 1;
        int[] sounding = Arrays.stream(displayed).map(n -> Music.soundingPitch(n, tenor, notation.getSelectedIndex() == 0)).toArray();
        audio.play(sounding, tenor, together, message -> SwingUtilities.invokeLater(() -> audioStatus.setText(message)));
    }

    private void playLesson(int[] displayed, java.util.function.IntConsumer onNote, Runnable done) {
        audioStatus.setText(" ");
        boolean tenor = instrument.getSelectedIndex() == 1;
        int offset = tenor && notation.getSelectedIndex() == 0 ? 14 : 0;
        int[] sounding = Arrays.stream(displayed).map(n -> n - offset).toArray();
        audio.play(sounding, tenor, false,
                message -> SwingUtilities.invokeLater(() -> audioStatus.setText(message)),
                note -> SwingUtilities.invokeLater(() -> onNote.accept(note + offset)),
                () -> SwingUtilities.invokeLater(done));
    }

    private static JPanel column() {
        JPanel panel = new JPanel() {
            @Override protected void addImpl(Component component, Object constraints, int index) {
                if (component instanceof JComponent child) child.setAlignmentX(Component.CENTER_ALIGNMENT);
                super.addImpl(component, constraints, index);
            }
        };
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);
        return panel;
    }

    private static JPanel row(Component... items) {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 4));
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);
        panel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 56));
        for (Component item : items) panel.add(item);
        return panel;
    }

    private static JLabel heading(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.BOLD, 26));
        return label;
    }

    private static JButton button(String text, Runnable action) {
        return new PracticeButton(text, action);
    }

    static final class Keyboard extends JPanel {
        private int[] notes = {};
        private float fade = 1;
        private final Timer animation = new Timer(16, e -> { fade = Math.min(1, fade + 0.09f); repaint(); if (fade == 1) ((Timer)e.getSource()).stop(); });
        Keyboard() {
            setPreferredSize(new Dimension(680, 105));
            setMinimumSize(new Dimension(300, 105));
            setMaximumSize(new Dimension(Integer.MAX_VALUE, 105));
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
                if (notes.length > 0 && notes[0] % 12 == whites[i]) g.drawOval(i * w + w / 2 - 8, h - 43, 16, 16);
            }
            int[] blacks = {1, 3, 6, 8, 10};
            int[] positions = {1, 2, 4, 5, 6};
            for (int i = 0; i < 5; i++) {
                int x = positions[i] * w - w / 3;
                g.setColor(Color.BLACK); g.fillRoundRect(x, 0, w * 2 / 3, h * 3 / 5, 4, 4);
                if (active(blacks[i])) { g.setColor(new Color(255, 255, 255, (int)(255 * fade))); g.fillOval(x + w / 3 - 5, h * 3 / 5 - 22, 10, 10); }
                if (notes.length > 0 && notes[0] % 12 == blacks[i]) { g.setColor(Color.WHITE); g.drawOval(x + w / 3 - 8, h * 3 / 5 - 25, 16, 16); }
            }
            g.dispose();
        }
    }
}
