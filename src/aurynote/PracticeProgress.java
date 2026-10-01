package aurynote;

import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;

final class PracticeProgress {
    record Snapshot(int attempts, int correct, int ear, int staff, int play) {}

    private final Preferences store;

    PracticeProgress() {
        this(Preferences.userNodeForPackage(PracticeProgress.class).node("progress-v1"));
    }

    PracticeProgress(Preferences store) {
        this.store = store;
    }

    synchronized void record(String mode, boolean right) {
        store.putInt("attempts", store.getInt("attempts", 0) + 1);
        if (right) store.putInt("correct", store.getInt("correct", 0) + 1);
        store.putInt(mode, store.getInt(mode, 0) + 1);
        try {
            store.flush();
        } catch (BackingStoreException exception) {
            throw new IllegalStateException("Practice progress could not be saved.", exception);
        }
    }

    synchronized Snapshot snapshot() {
        return new Snapshot(
                store.getInt("attempts", 0),
                store.getInt("correct", 0),
                store.getInt("ear", 0),
                store.getInt("staff", 0),
                store.getInt("play", 0));
    }

    synchronized String summary() {
        Snapshot saved = snapshot();
        int accuracy = saved.attempts() == 0 ? 0 : Math.round(saved.correct() * 100f / saved.attempts());
        return saved.attempts() + " saved answers · " + accuracy + "% accuracy";
    }
}
