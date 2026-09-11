/** Optional synthetic study feedback. No audio starts before explicit user consent. */
export function createAudio(): {
    enable(value: boolean): Promise<void>;
    shot(): void;
    dispose(): void;
} {
    let context: AudioContext | null = null;
    let enabled = false;
    return {
        async enable(value) {
            enabled = value;
            if (value) {
                context ??= new AudioContext();
                await context.resume();
            }
            else if (context)
                await context.suspend();
        },
        shot() {
            if (!enabled || !context || context.state !== 'running')
                return;
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(130, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(34, context.currentTime + 0.12);
            gain.gain.setValueAtTime(0.15, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.19);
            oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        },
        dispose() { if (context)
            void context.close(); },
    };
}
