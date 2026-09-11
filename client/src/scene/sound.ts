/** Optional locally synthesized cue. No autoplay, downloads or claimed sound production. */
export function shotSound(): {play: () => void; dispose: () => void} {
  let context: AudioContext | null = null;
  return { play: () => {
    const setting = document.getElementById("sound-enabled");
    if (!(setting instanceof HTMLInputElement) || !setting.checked) return;
    context ??= new AudioContext();
    void context.resume();
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.16), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / data.length * 9);
    const source = context.createBufferSource(); source.buffer = buffer;
    const filter = context.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1500;
    const gain = context.createGain(); gain.gain.value = 0.16;
    source.connect(filter); filter.connect(gain); gain.connect(context.destination);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start();
  }, dispose: () => { void context?.close(); } };
}
