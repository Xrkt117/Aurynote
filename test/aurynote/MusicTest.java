package aurynote;

import java.util.Arrays;

public final class MusicTest {
    public static void main(String[] args) {
        int[] cMajor = Music.SCALES.get("Major");
        check(Arrays.equals(Music.instrumentPitches(0, cMajor, true, true), new int[]{62, 64, 66, 67, 69, 71, 73, 74}), "Concert C major uses written D major on tenor");
        check(Arrays.equals(Music.instrumentPitches(0, cMajor, false, true), new int[]{60, 62, 64, 65, 67, 69, 71, 72}), "Piano stays in C major");
        for (int key = 0; key < 12; key++) {
            for (int[] intervals : Music.SCALES.values()) {
                int[] written = Music.instrumentPitches(key, intervals, true, true);
                int[] concert = Music.instrumentPitches(key, intervals, true, false);
                for (int i = 0; i < written.length; i++) {
                    check(Music.soundingPitch(written[i], true, true) == concert[i], "Written and concert views produce identical tenor audio");
                    check(written[i] >= 58 && written[i] <= 90, "Tenor scales stay in the normal written range");
                }
            }
        }
        check(Music.chordSymbol(0, "Major seventh").equals("Cmaj7"), "Major seventh symbol");
        check(Music.chordSymbol(10, "Half-diminished seventh").equals("B♭ø7"), "Half-diminished symbol");
        check(Music.spelledNote(8, 3, "Natural minor").equals("C♭"), "A-flat minor third spelling");
        check(Music.spelledNote(0, 9, "Diminished seventh").equals("B♭♭"), "Diminished seventh spelling");
        check(Music.spelledNote(0, 8, "Augmented").equals("G♯"), "Augmented fifth spelling");
        for (int root = 0; root < 12; root++) {
            for (var patterns : java.util.List.of(Music.SCALES, Music.CHORDS)) {
                for (var entry : patterns.entrySet()) {
                    for (int interval : entry.getValue()) {
                        String name = Music.spelledNote(root, interval, entry.getKey());
                        int natural = new int[]{0, 2, 4, 5, 7, 9, 11}["CDEFGAB".indexOf(name.charAt(0))];
                        int adjustment = (int)name.chars().filter(c -> c == '♯').count() - (int)name.chars().filter(c -> c == '♭').count();
                        check(Math.floorMod(natural + adjustment, 12) == (root + interval) % 12, "Spelling must match playback pitch");
                    }
                }
            }
        }
        check(new StaffNote(28, 0).midi() == 60, "Middle C ledger line");
        check(new StaffNote(30, 0).midi() == 64, "Treble bottom line is E4");
        check(new StaffNote(18, 0).midi() == 43, "Bass bottom line is G2");
        check(new StaffNote(26, 0).midi() == 57, "Bass top line is A3");
        check(new StaffNote(28, 1).matches(" c# "), "Typed sharp");
        check(new StaffNote(34, -1).matches("Bb"), "Typed flat");
        check(new StaffNote(34, 0).matches("b"), "Lowercase B natural");
        check(!new StaffNote(28, 1).matches("Db"), "Staff answers must match the spelling shown");
        check(Music.soundingPitch(60, true, true) == 46, "Tenor written C4 must sound B-flat2");
        check(Music.soundingPitch(60, true, false) == 60, "Concert pitch must not transpose");
        check(Music.soundingPitch(60, false, true) == 60, "Piano must not transpose");
        check(Arrays.equals(Music.pitches(60, Music.SCALES.get("Major")), new int[]{60, 62, 64, 65, 67, 69, 71, 72}), "C major pitches");
        check(Arrays.equals(Music.pitches(68, Music.SCALES.get("Natural minor")), new int[]{68, 70, 71, 73, 75, 76, 78, 80}), "A-flat minor pitches");
        check(Arrays.equals(Music.CHORDS.get("Dominant thirteenth"), new int[]{0, 4, 7, 10, 14, 21}), "Dominant thirteenth voicing");
        for (int root = 60; root < 72; root++) {
            for (int[] intervals : Music.SCALES.values()) {
                int[] pitches = Music.pitches(root, intervals);
                check(pitches[0] == root && pitches[pitches.length - 1] == root + 12, "Scale octave boundaries");
                for (int i = 1; i < pitches.length; i++) check(pitches[i] > pitches[i - 1], "Ascending scale");
            }
        }
        System.out.println("All music checks passed.");
    }

    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
