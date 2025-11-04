import queue
import re
import sys
import time
import unicodedata

from google.cloud import speech
import pyaudio

import os
from dotenv import load_dotenv
load_dotenv()

# Audio recording parameters
STREAMING_LIMIT = 240000  # 4 minutes
SAMPLE_RATE = 16000
CHUNK_SIZE = int(SAMPLE_RATE / 10)  # 100ms

RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[0;33m"


def get_current_time() -> int:
    """Return Current Time in MS."""
    return int(round(time.time() * 1000))


class ResumableMicrophoneStream:
    """Opens a recording stream as a generator yielding the audio chunks."""

    def __init__(self, rate: int, chunk_size: int) -> None:
        """Creates a resumable microphone stream."""
        self._rate = rate
        self.chunk_size = chunk_size
        self._num_channels = 1
        self._buff = queue.Queue()
        self.closed = True
        self.start_time = get_current_time()
        self.restart_counter = 0
        self.audio_input = []
        self.last_audio_input = []
        self.result_end_time = 0
        self.is_final_end_time = 0
        self.final_request_end_time = 0
        self.bridging_offset = 0
        self.last_transcript_was_final = False
        self.new_stream = True
        self._audio_interface = pyaudio.PyAudio()
        self._audio_stream = self._audio_interface.open(
            format=pyaudio.paInt16,
            channels=self._num_channels,
            rate=self._rate,
            input=True,
            frames_per_buffer=self.chunk_size,
            stream_callback=self._fill_buffer,
        )
        # Accumule les segments finaux de transcription
        self.final_transcripts = []

    def __enter__(self) -> object:
        """Opens the stream."""
        self.closed = False
        return self

    def __exit__(self, type, value, traceback) -> object:
        """Closes the stream and releases resources."""
        self._audio_stream.stop_stream()
        self._audio_stream.close()
        self.closed = True
        self._buff.put(None)
        self._audio_interface.terminate()

    def _fill_buffer(self, in_data, *args, **kwargs) -> object:
        """Continuously collect data from the audio stream, into the buffer."""
        self._buff.put(in_data)
        return None, pyaudio.paContinue

    def generator(self) -> object:
        """Stream Audio from microphone to API and to local buffer"""
        while not self.closed:
            data = []

            if self.new_stream and self.last_audio_input:
                chunk_time = STREAMING_LIMIT / len(self.last_audio_input)

                if chunk_time != 0:
                    if self.bridging_offset < 0:
                        self.bridging_offset = 0

                    if self.bridging_offset > self.final_request_end_time:
                        self.bridging_offset = self.final_request_end_time

                    chunks_from_ms = round(
                        (self.final_request_end_time - self.bridging_offset) / chunk_time
                    )

                    self.bridging_offset = round(
                        (len(self.last_audio_input) - chunks_from_ms) * chunk_time
                    )

                    for i in range(chunks_from_ms, len(self.last_audio_input)):
                        data.append(self.last_audio_input[i])

                self.new_stream = False

            chunk = self._buff.get()
            self.audio_input.append(chunk)

            if chunk is None:
                return
            data.append(chunk)
            
            while True:
                try:
                    chunk = self._buff.get(block=False)
                    if chunk is None:
                        return
                    data.append(chunk)
                    self.audio_input.append(chunk)
                except queue.Empty:
                    break

            yield b"".join(data)


def listen_print_loop(responses, stream) -> None:
    """Iterates through server responses and prints them."""
    exit_pattern = re.compile(r"\b(exit|quit|arret|arrêt|stop|termine|fin)\b", re.I)
    for response in responses:
        if get_current_time() - stream.start_time > STREAMING_LIMIT:
            stream.start_time = get_current_time()
            break

        if not response.results:
            continue

        result = response.results[0]
        if not result.alternatives:
            continue
        transcript = result.alternatives[0].transcript
        # Normalise pour matcher sans accent
        normalized = unicodedata.normalize("NFD", transcript)
        normalized = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")

        result_seconds = 0
        result_micros = 0

        if result.result_end_time.seconds:
            result_seconds = result.result_end_time.seconds

        if result.result_end_time.microseconds:
            result_micros = result.result_end_time.microseconds

        stream.result_end_time = int((result_seconds * 1000) + (result_micros / 1000))

        corrected_time = (
            stream.result_end_time
            - stream.bridging_offset
            + (STREAMING_LIMIT * stream.restart_counter)
        )

        if result.is_final:
            sys.stdout.write(GREEN)
            sys.stdout.write("\033[K")
            sys.stdout.write(str(corrected_time) + ": " + transcript + "\n")

            # Sauvegarde ce segment final
            stream.final_transcripts.append(transcript.strip())

            stream.is_final_end_time = stream.result_end_time
            stream.last_transcript_was_final = True

            if exit_pattern.search(normalized):
                sys.stdout.write(YELLOW)
                sys.stdout.write("Exiting...\n")
                stream.closed = True
                return  # sortir de la boucle
        else:
            sys.stdout.write(RED)
            sys.stdout.write("\033[K")
            sys.stdout.write(str(corrected_time) + ": " + transcript + "\r")
            stream.last_transcript_was_final = False

            # Permet sortie même si mot clé apparait dans un résultat provisoire
            if exit_pattern.search(normalized):
                stream.final_transcripts.append(transcript.strip())
                sys.stdout.write(YELLOW)
                sys.stdout.write("\nExiting (interim)...\n")
                stream.closed = True
                return  # sortir de la boucle


def main() -> None:
    """Start bidirectional streaming from microphone input to speech API"""
    client = speech.SpeechClient()
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=SAMPLE_RATE,
        language_code="fr-FR",  # Français
        max_alternatives=1,
    )

    streaming_config = speech.StreamingRecognitionConfig(
        config=config, interim_results=True
    )

    mic_manager = ResumableMicrophoneStream(SAMPLE_RATE, CHUNK_SIZE)
    print(f"Chunk size: {mic_manager.chunk_size}")
    sys.stdout.write(YELLOW)
    sys.stdout.write('\nÉcoute en cours, dites "Arrêt" ou "Stop" pour quitter.\n\n')
    sys.stdout.write("Time (ms)      Transcription\n")
    sys.stdout.write("=" * 60 + "\n")

    with mic_manager as stream:
        while not stream.closed:
            sys.stdout.write(YELLOW)
            sys.stdout.write(
                "\n" + str(STREAMING_LIMIT * stream.restart_counter) + ": NOUVELLE REQUÊTE\n"
            )

            stream.audio_input = []
            audio_generator = stream.generator()

            requests = (
                speech.StreamingRecognizeRequest(audio_content=content)
                for content in audio_generator
            )

            responses = client.streaming_recognize(streaming_config, requests)
            listen_print_loop(responses, stream)

            if stream.result_end_time > 0:
                stream.final_request_end_time = stream.is_final_end_time
            stream.result_end_time = 0
            stream.last_audio_input = []
            stream.last_audio_input = stream.audio_input
            stream.audio_input = []
            stream.restart_counter = stream.restart_counter + 1

            if not stream.last_transcript_was_final:
                sys.stdout.write("\n")
            stream.new_stream = True

    # Construit et affiche la transcription finale complète
    full_transcription = " ".join(mic_manager.final_transcripts).strip()
    sys.stdout.write(YELLOW)
    sys.stdout.write("\nTranscription finale:\n")
    sys.stdout.write(full_transcription + "\n")
    return full_transcription


if __name__ == "__main__":
    main()
