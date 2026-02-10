"use client";

import { useEffect } from "react";

import {
  useTutorial,
  childHomePageTutorialDesktop,
  childHomePageTutorialMobile,
  adultHomePageTutorialDesktop,
  adultHomePageTutorialMobile,
} from "@/src/components/tutorial";
import { useAuth } from "@/src/components/auth";
import {
  Hero,
  SocialProofBar,
  ProductShowcase,
  HowItWorks,
  Features,
  CTA,
} from "../components/home";
import { Footer } from "../components/navigations";

export const HomePage = () => {
  const { startTutorial } = useTutorial();
  const { activeProfile } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      const isMobile = window.innerWidth < 768;

      if (activeProfile?.type === "child") {
        startTutorial(
          isMobile ? childHomePageTutorialMobile : childHomePageTutorialDesktop
        );
      } else if (activeProfile?.type === "adult") {
        startTutorial(
          isMobile ? adultHomePageTutorialMobile : adultHomePageTutorialDesktop
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeProfile, startTutorial]);

  return (
    <div className="w-full">
      <Hero />
      <SocialProofBar />
      <ProductShowcase />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};
