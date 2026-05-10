import ClientChapterPage from './ClientPage';

export function generateStaticParams() {
    return [
        { chapId: '1' },
        { chapId: '2' },
        { chapId: '3' },
        { chapId: '4' },
        { chapId: '5' },
        { chapId: '6' },
        { chapId: '7' },
    ];
}

export default async function ChapterGameplayPage({ params }: { params: Promise<{ chapId: string }> }) {
    const { chapId } = await params;
    return <ClientChapterPage chapIdStr={chapId} />;
}
