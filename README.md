# Aurynote

A small Java desktop app for musicians learning to recognize notes by ear and find their way around scales and chords. Made for piano and tenor sax players, including beginners learning to improvise.

Practice by ear, read treble or bass clef notes with multiple-choice or typed answers, and explore scales and chords on a keyboard. Built with Java Swing and a simple black-and-white menu. Tenor sax mode supports written or concert pitch. Instrument sounds use Java MIDI, so their quality depends on your system's soundbank.

Note labels show equivalent sharp and flat names, rather than key-specific spelling. The dominant thirteenth voicing omits the eleventh.

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
