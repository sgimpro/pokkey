"use client";
import { useState } from "react";
import BadgeGrid from "@/components/BadgeGrid";

interface ProfileBadgesProps {
  earnedIds: string[];
  activeTitle: string | null;
}

export default function ProfileBadges({ earnedIds, activeTitle: initialTitle }: ProfileBadgesProps) {
  const [activeTitle, setActiveTitle] = useState(initialTitle);

  return (
    <BadgeGrid
      earnedIds={earnedIds}
      activeTitle={activeTitle}
      onSetTitle={setActiveTitle}
    />
  );
}
