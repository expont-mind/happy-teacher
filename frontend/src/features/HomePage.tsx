"use client";

import { useEffect } from "react";

import {
  useTutorial,
  childHomePageTutorial,
  adultHomePageTutorial,
} from "@/src/components/tutorial";
import { useAuth } from "@/src/components/auth";
import { Features, HowItWorks, CTA, Hero, Lessons } from "../components/home";
import { Footer } from "../components/navigations";

export const HomePage = () => {
  const { startTutorial } = useTutorial();
  const { activeProfile } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeProfile?.type === "child") {
        startTutorial(childHomePageTutorial);
      } else if (activeProfile?.type === "adult") {
        startTutorial(adultHomePageTutorial);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeProfile, startTutorial]);

  return (
    <div className="w-full">
      <Hero />
      <HowItWorks />
      <Lessons />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};
