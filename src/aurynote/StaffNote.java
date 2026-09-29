package aurynote;

record StaffNote(int step, int accidental) {
    private static final int[] NATURALS = {0, 2, 4, 5, 7, 9, 11};
    String name() {
        return "CDEFGAB".charAt(Math.floorMod(step, 7)) + (accidental < 0 ? "♭" : accidental > 0 ? "♯" : "");
    }
    int midi() { return (Math.floorDiv(step, 7) + 1) * 12 + NATURALS[Math.floorMod(step, 7)] + accidental; }
    boolean matches(String answer) {
        String value = answer.strip();
        if (value.isEmpty()) return false;
        value = Character.toUpperCase(value.charAt(0)) + value.substring(1).replace("#", "♯").replace("b", "♭");
        return name().equals(value);
    }
}
