export interface StudyAssets {
    image(name: string): HTMLCanvasElement;
    source(name: string): string;
}
export async function loadAssets(): Promise<StudyAssets> {
    const raw: unknown = JSON.parse(document.getElementById('scene-assets')?.textContent ?? '{}');
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
        throw new Error('Invalid asset manifest');
    const sources = new Map<string, string>();
    const images = new Map<string, HTMLCanvasElement>();
    await Promise.all(Object.entries(raw).map(async ([name, source]: [
        string,
        unknown
    ]) => {
        if (typeof source !== 'string' || !source.startsWith('data:image/svg+xml;base64,')) {
            throw new Error(`Invalid asset: ${name}`);
        }
        const image = new Image();
        image.src = source;
        await image.decode();
        if (!image.naturalWidth || !image.naturalHeight)
            throw new Error(`Empty asset: ${name}`);
        sources.set(name, source);
        // Rasterize filtered vector artwork once; frames reuse pixels rather than SVG filters.
        const cached = document.createElement('canvas');
        cached.width = image.naturalWidth * 2;
        cached.height = image.naturalHeight * 2;
        const context = cached.getContext('2d');
        if (!context)
            throw new Error('Asset rasterization unavailable');
        context.drawImage(image, 0, 0, cached.width, cached.height);
        images.set(name, cached);
    }));
    return {
        image(name) {
            const image = images.get(name);
            if (!image)
                throw new Error(`Missing image: ${name}`);
            return image;
        },
        source(name) {
            const source = sources.get(name);
            if (!source)
                throw new Error(`Missing source: ${name}`);
            return source;
        },
    };
}
