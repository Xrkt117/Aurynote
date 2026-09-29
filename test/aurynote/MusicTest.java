package aurynote;

import java.util.Arrays;

public final class MusicTest {
    public static void main(String[] args) {
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
