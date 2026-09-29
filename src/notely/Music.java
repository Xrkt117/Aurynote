package notely;

import java.util.LinkedHashMap;
import java.util.Map;

final class Music {
    static final String[] NOTES = {"C", "C♯ / D♭", "D", "D♯ / E♭", "E", "F", "F♯ / G♭", "G", "G♯ / A♭", "A", "A♯ / B♭", "B"};
    static final Map<String, int[]> SCALES = new LinkedHashMap<>();
    static final Map<String, int[]> CHORDS = new LinkedHashMap<>();
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
