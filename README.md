# aurynote

A small Java desktop app for musicians learning to recognize notes by ear and find their way around scales and chords. Made for piano and tenor sax players, including beginners learning to improvise.

Practice by ear, read treble or bass clef notes, and explore scales and chords in labeled sections with musical symbols, note degrees, and a keyboard. Correct answers turn green and advance after a short pause. Built with Java Swing. Tenor sax mode supports written or concert pitch. Sounds use Java MIDI and depend on your system's soundbank.

Scale and chord notes use key-specific spelling. Ear-training buttons show equivalent sharp and flat names. The dominant thirteenth voicing omits the eleventh.

Requires JDK 21 or newer. No libraries or downloads needed.

```sh
javac -d out src/aurynote/*.java
java -cp out aurynote.Aurynote
```

Run the music checks:

```sh
javac -d out src/aurynote/*.java test/aurynote/*.java
java -cp out aurynote.MusicTest
```
