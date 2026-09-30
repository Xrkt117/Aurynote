# aurynote

A small Java desktop app for musicians learning to recognize notes by ear and find their way around scales and chords. Made for piano and tenor sax players, including beginners learning to improvise.

Guided ear lessons start with C and G and gradually add notes. Listen before testing, use a reference C, compare mistakes, and revisit notes you find difficult. Practice across two octaves or identify scale degrees in C major. Lesson progress lasts for the current session.

Read treble or bass clef notes and explore scales and chords with musical symbols, note degrees, and a keyboard. Correct answers advance after 1.4 seconds; wrong answers allow 3.2 seconds for review. Built with Java Swing. Tenor sax supports written or concert pitch. Sounds use Java MIDI and depend on your system's soundbank.

Scale and chord notes use key-specific spelling. Ear-training buttons show equivalent sharp and flat names. The dominant thirteenth voicing omits the eleventh.

In Scales and Chords, choose a concert key. Piano shows concert notes; tenor sax in Written pitch shows transposed notes to play (concert C major becomes written D major). Tenor scales use a lower sounding octave, and the starting note's octave is labeled. Sax chord tones play one at a time.
 
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
