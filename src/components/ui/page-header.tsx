export default function PageHeader({ title }: { title: string }) {
    return (
        <header className="h-16">
            <div className="flex flex-col">
                <h1 className="text-2xl">
                    {title}
                </h1>
            </div>
        </header>
    )
}   