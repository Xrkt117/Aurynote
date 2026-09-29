package notely;

import javax.sound.midi.*;
import java.util.concurrent.*;
import java.util.function.Consumer;

final class Audio implements AutoCloseable {
    private final ExecutorService worker = Executors.newSingleThreadExecutor(r -> {
        Thread thread = new Thread(r, "notely-audio");
        thread.setDaemon(true);
        return thread;
    });
    private Synthesizer synth;
    private Future<?> playing;

    synchronized void play(int[] notes, boolean tenor, boolean together, Consumer<String> error) {
        stop();
        playing = worker.submit(() -> {
            MidiChannel channel = null;
            try {
                if (synth == null) synth = MidiSystem.getSynthesizer();
                if (!synth.isOpen()) synth.open();
                channel = synth.getChannels()[0];
                channel.programChange(tenor ? 66 : 0);
                if (together) {
                    for (int note : notes) channel.noteOn(note, 85);
                    Thread.sleep(1400);
                } else {
                    for (int note : notes) {
                        if (Thread.currentThread().isInterrupted()) break;
                        channel.noteOn(note, 95);
                        Thread.sleep(notes.length == 1 ? 1000 : 330);
                        channel.noteOff(note);
                        Thread.sleep(65);
                    }
                }
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            } catch (Exception exception) {
                error.accept("Audio unavailable. Check your audio output and Java MIDI soundbank.");
            } finally {
                if (channel != null) channel.allSoundOff();
            }
        });
    }

    synchronized void stop() {
        if (playing != null) playing.cancel(true);
    }

    @Override public synchronized void close() {
        stop();
        worker.submit(() -> { if (synth != null) synth.close(); });
        worker.shutdown();
    }
}
