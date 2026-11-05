// src/components/Main.tsx

import Footer from "../Footer";
import AboutHero from "./AboutHero";
import AboutOverview from "./AboutOverview";
import AboutServices from "./AboutServices";
import AboutTestimonials from "./AboutTestimonials";
import AboutTimeline from "./AboutTimeline";
import FeedbackSection from "../Feedback/FeedbackSection";


export default function Main() {
  return (
    <main className="flex flex-col min-h-screen">
<AboutHero />
<AboutOverview  />
<AboutTimeline />
<AboutServices />
{/* <AboutTestimonials /> */}
<FeedbackSection />
< Footer />

    </main>
  )
}
