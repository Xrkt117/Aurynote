package aurynote;

import java.util.*;

final class PitchLesson {
    static final int[][] LEVELS = {{0, 7}, {0, 4, 7}, {0, 2, 4, 7, 9}, {0, 2, 4, 5, 7, 9, 11}, {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11}};
    static final String[] NAMES = {"C & G", "Add E", "Five notes", "All natural notes", "All twelve notes"};
    private final Random random;
    private final int[] mistakes = new int[12];
    private final Deque<Boolean> recent = new ArrayDeque<>();
    private final Set<Integer> learned = new HashSet<>();
    private int level;
    PitchLesson(Random random) { this.random = random; }
    int level() { return level; }
    int[] pool() { return LEVELS[level].clone(); }
    int goal() { return Math.max(10, pool().length * 2); }
    int answered() { return recent.size(); }
    int correct() { return (int)recent.stream().filter(Boolean::booleanValue).count(); }

    int choose(int[] pool) {
        int total = Arrays.stream(pool).map(n -> 1 + mistakes[n]).sum();
        int draw = random.nextInt(total);
        for (int note : pool) {
            draw -= 1 + mistakes[note];
            if (draw < 0) return note;
        }
        throw new IllegalStateException("Empty note pool");    //catches potential error messages
    }

    void record(int target, int choice) {
        boolean right = target == choice;
        mistakes[target] = right ? Math.max(0, mistakes[target] - 1) : Math.min(4, mistakes[target] + 1);
        if (!right) mistakes[choice] = Math.min(4, mistakes[choice] + 1);
        if (right) learned.add(target);
        recent.addLast(right);
        if (recent.size() > goal()) recent.removeFirst();
    }

    boolean mastered() {
        return recent.size() == goal() && correct() * 5 >= goal() * 4 && Arrays.stream(pool()).allMatch(learned::contains);
    }
    boolean advance() {
        if (!mastered() || level == LEVELS.length - 1) return false;
        level++;
        resetPractice();
        return true;
    }
    void resetPractice() { recent.clear(); learned.clear(); Arrays.fill(mistakes, 0); }
    void restart() { level = 0; resetPractice(); }
}
