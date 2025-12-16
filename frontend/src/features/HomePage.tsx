"use client";

import { useEffect } from "react";

import { useTutorial, homePageTutorial } from "@/src/components/tutorial";
import { Features, HowItWorks, CTA, Hero, Lessons } from "../components/home";
import { Footer } from "../components/navigations";

export const HomePage = () => {
  const { startTutorial } = useTutorial();

  useEffect(() => {
    startTutorial(homePageTutorial);
  }, [startTutorial]);

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
