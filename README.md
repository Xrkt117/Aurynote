# Notely

A small Java desktop app for musicians learning to recognize notes by ear and find their way around scales and chords. Made for piano and tenor sax players, including beginners learning to improvise.

Practice note recognition, hear scales and chords, and see their notes on a keyboard. Tenor sax mode supports written or concert pitch. Instrument sounds use Java MIDI, so their quality depends on your system's soundbank.

Note labels show equivalent sharp and flat names, rather than key-specific spelling. The dominant thirteenth voicing omits the eleventh.

Requires JDK 21 or newer. No libraries or downloads needed.

```sh
javac -d out src/notely/*.java
java -cp out notely.Notely
```

Run the music checks:

```sh
javac -d out src/notely/*.java test/notely/*.java
java -cp out notely.MusicTest
```
