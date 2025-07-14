import { ChevronDown } from "lucide-react";
import { ReleaseNote } from "@/data/releaseNotes";
import { LoomEmbed } from "./LoomEmbed";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ReleaseNoteCardProps {
  releaseNote: ReleaseNote;
  isDefaultOpen?: boolean;
}

export const ReleaseNoteCard = ({ releaseNote, isDefaultOpen = false }: ReleaseNoteCardProps) => {
  return (
    <Collapsible defaultOpen={isDefaultOpen} className="group">
      <div className="bg-card border border-border rounded-lg shadow-subtle overflow-hidden transition-shadow duration-300 hover:shadow-card">
        <CollapsibleTrigger className="w-full p-6 text-left hover:bg-secondary/50 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-foreground font-system">
                Version {releaseNote.version}
              </h2>
              <p className="text-muted-foreground font-medium">
                {releaseNote.date}
              </p>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="px-6 pb-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground font-system">
                What's New
              </h3>
              <ul className="space-y-2">
                {releaseNote.changes.map((change, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground leading-relaxed">
                      {change}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground font-system">
                Walkthrough Video
              </h3>
              <LoomEmbed videoId={releaseNote.loomVideoId} />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};