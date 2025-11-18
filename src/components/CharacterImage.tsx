import { cn } from '../lib/utils';

interface CharacterImageProps {
    imageUrl: string;
    isLoading: boolean;
    isEditing?: boolean;
    errorMessage: string;
    className?: string;
}

export const CharacterImage = ({ imageUrl, isLoading, isEditing, errorMessage, className }: CharacterImageProps) => {
    return (
        <div className={cn("relative w-full aspect-video bg-black flex items-center justify-center rounded-lg overflow-hidden shadow-2xl", className)} style={{ 'boxShadow': '0 25px 50px -12px var(--shadow-color)' }}>
            {(isLoading || isEditing) && (
                <div className="absolute z-10 inset-0 flex flex-col items-center justify-center bg-black/50">
                    <div className="w-16 h-16 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
                    {isLoading && <span className="mt-4 text-sm text-muted-foreground">Altering reality...</span>}
                    {isEditing && <span className="mt-4 text-sm text-muted-foreground">Refining vision...</span>}
                </div>
            )}
            {imageUrl && <img src={imageUrl} className={cn("w-full h-full object-cover transition-opacity duration-1000", (isLoading || isEditing) ? 'opacity-50' : 'opacity-100')} alt="Generated scene or character portrait" />}
            {errorMessage && <div className="absolute bottom-2 left-2 text-xs text-red-400 bg-black/50 p-1 rounded">{errorMessage}</div>}
        </div>
    );
};
