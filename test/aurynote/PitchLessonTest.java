package aurynote;

import java.util.*;

public final class PitchLessonTest {
    public static void main(String[] args) {
        PitchLesson lesson = new PitchLesson(new Random(7));
        check(Arrays.equals(lesson.pool(), new int[]{0, 7}), "Start with C and G");
        for (int i = 0; i < 10; i++) lesson.record(0, 0);
        check(!lesson.advance(), "Must identify every note before advancing");
        lesson.record(7, 7);
        check(lesson.advance(), "Accurate practice unlocks the next lesson");
        check(Arrays.equals(lesson.pool(), new int[]{0, 4, 7}), "Introduce E next");
        for (int i = 0; i < 10; i++) lesson.record(0, 4);
        check(!lesson.advance(), "Mistakes must not unlock a lesson");
        int missed = 0, easy = 0;
        for (int i = 0; i < 10000; i++) {
            int note = lesson.choose(lesson.pool());
            if (note == 0) missed++;
            if (note == 7) easy++;
        }
        check(missed > easy * 3 && easy > 0, "Weak notes recur while easier notes remain");
        lesson.restart();
        for (int level = 0; level < PitchLesson.LEVELS.length; level++) {
            int[] pool = lesson.pool();
            for (int i = 0; i < lesson.goal(); i++) lesson.record(pool[i % pool.length], pool[i % pool.length]);
            check(lesson.mastered(), "Each lesson can be mastered");
            check(lesson.advance() == (level < 4), "Advance only until the last lesson");
        }
        System.out.println("Lesson progression and adaptive practice checks passed.");
    }
    private static void check(boolean value, String message) { if (!value) throw new AssertionError(message); }
}
