package aurynote;

import java.util.LinkedHashMap;
import java.util.Map;

final class Music {
    static final String[] NOTES = {"C", "C♯ / D♭", "D", "D♯ / E♭", "E", "F", "F♯ / G♭", "G", "G♯ / A♭", "A", "A♯ / B♭", "B"};
    static final Map<String, int[]> SCALES = new LinkedHashMap<>();
    static final Map<String, int[]> CHORDS = new LinkedHashMap<>();
    static final String[] PITCH_NAMES = {"C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"};
    static final Map<String, String> SYMBOLS = new LinkedHashMap<>();
    static {
        SCALES.put("Major", new int[]{0, 2, 4, 5, 7, 9, 11, 12});
        SCALES.put("Natural minor", new int[]{0, 2, 3, 5, 7, 8, 10, 12});
        SCALES.put("Harmonic minor", new int[]{0, 2, 3, 5, 7, 8, 11, 12});
        SCALES.put("Melodic minor (ascending)", new int[]{0, 2, 3, 5, 7, 9, 11, 12});
        SCALES.put("Major pentatonic", new int[]{0, 2, 4, 7, 9, 12});
        SCALES.put("Minor pentatonic", new int[]{0, 3, 5, 7, 10, 12});
        SCALES.put("Blues", new int[]{0, 3, 5, 6, 7, 10, 12});
        SCALES.put("Dorian", new int[]{0, 2, 3, 5, 7, 9, 10, 12});
        SCALES.put("Mixolydian", new int[]{0, 2, 4, 5, 7, 9, 10, 12});
        CHORDS.put("Major", new int[]{0, 4, 7});
        CHORDS.put("Minor", new int[]{0, 3, 7});
        CHORDS.put("Diminished", new int[]{0, 3, 6});
        CHORDS.put("Augmented", new int[]{0, 4, 8});
        CHORDS.put("Suspended second", new int[]{0, 2, 7});
        CHORDS.put("Suspended fourth", new int[]{0, 5, 7});
        CHORDS.put("Major seventh", new int[]{0, 4, 7, 11});
        CHORDS.put("Minor seventh", new int[]{0, 3, 7, 10});
        CHORDS.put("Dominant seventh", new int[]{0, 4, 7, 10});
        CHORDS.put("Dominant ninth", new int[]{0, 4, 7, 10, 14});
        CHORDS.put("Dominant thirteenth", new int[]{0, 4, 7, 10, 14, 21});
        CHORDS.put("Dominant ninth sus4", new int[]{0, 5, 7, 10, 14});
        CHORDS.put("Diminished seventh", new int[]{0, 3, 6, 9});
        CHORDS.put("Half-diminished seventh", new int[]{0, 3, 6, 10});
        String[] symbols = {"", "m", "°", "+", "sus2", "sus4", "maj7", "m7", "7", "9", "13", "9sus4", "°7", "ø7"};
        int index = 0;
        for (String chord : CHORDS.keySet()) SYMBOLS.put(chord, symbols[index++]);
    }

    static String chordSymbol(int root, String chord) {
        return PITCH_NAMES[Math.floorMod(root, 12)] + SYMBOLS.getOrDefault(chord, "");
    }

    static String degree(int semitones, String pattern) {
        if (pattern.equals("Diminished seventh") && semitones == 9) return "♭♭7";
        if (pattern.equals("Augmented") && semitones == 8) return "♯5";
        return switch (semitones) {
            case 0 -> "1"; case 2 -> "2"; case 3 -> "♭3"; case 4 -> "3";
            case 5 -> "4"; case 6 -> "♭5"; case 7 -> "5"; case 8 -> "♭6";
            case 9 -> "6"; case 10 -> "♭7"; case 11 -> "7"; case 12 -> "8";
            case 14 -> "9"; case 21 -> "13"; default -> "";
        };
    }

    static String spelledNote(int root, int semitones, String pattern) {
        String degree = degree(semitones, pattern).replace("♭", "").replace("♯", "");
        int letter = Math.floorMod("CDEFGAB".indexOf(PITCH_NAMES[root % 12].charAt(0)) + Integer.parseInt(degree) - 1, 7);
        int natural = new int[]{0, 2, 4, 5, 7, 9, 11}[letter];
        int accidental = Math.floorMod(root + semitones - natural + 6, 12) - 6;
        return "CDEFGAB".charAt(letter) + (accidental < 0 ? "♭".repeat(-accidental) : "♯".repeat(accidental));
    }

    static int soundingPitch(int displayedPitch, boolean tenor, boolean written) {
        return displayedPitch - (tenor && written ? 14 : 0);
    }

    static String name(int midi) {
        return NOTES[Math.floorMod(midi, 12)];
    }

    static int[] pitches(int root, int[] intervals) {
        return java.util.Arrays.stream(intervals).map(interval -> root + interval).toArray();
    }
}
