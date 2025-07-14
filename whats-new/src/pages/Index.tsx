import { releaseNotes } from "@/data/releaseNotes";
import { ReleaseNoteCard } from "@/components/ReleaseNoteCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Release Notes */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <div className="space-y-6">
          {releaseNotes.map((releaseNote, index) => (
            <ReleaseNoteCard
              key={releaseNote.version}
              releaseNote={releaseNote}
              isDefaultOpen={index === 0} // First (most recent) version expanded by default
            />
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground">
            Have feedback? I'd love to{" "}
            <a 
              href="mailto:damir.stuhec@gmail.com" 
              className="text-primary hover:text-primary/80 transition-colors duration-200"
            >
              hear from you
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
