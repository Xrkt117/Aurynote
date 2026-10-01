package aurynote;

import java.util.UUID;
import java.util.prefs.Preferences;

public final class ProgressTest {
    public static void main(String[] args) throws Exception {
        Preferences node = Preferences.userRoot().node("aurynote-test-" + UUID.randomUUID());
        try {
            PracticeProgress first = new PracticeProgress(node);
            first.record("ear", true);
            first.record("staff", false);

            PracticeProgress.Snapshot reloaded = new PracticeProgress(node).snapshot();
            check(reloaded.attempts() == 2, "Saved attempts must reload");
            check(reloaded.correct() == 1, "Saved accuracy must reload");
            check(reloaded.ear() == 1 && reloaded.staff() == 1, "Practice modes must be counted");
            System.out.println("Saved progress reload passed.");
        } finally {
            node.removeNode();
            node.flush();
        }
    }

    private static void check(boolean value, String message) {
        if (!value) throw new AssertionError(message);
    }
}
