import { Helmet } from 'react-helmet-async';
import HumanizeGenerator from "@/components/templates/HumanizeGenerator";

const Humanizer = () => {
  return (
    <>
      <Helmet>
        <title>AI Text Humanizer - Make AI Content Sound Natural | PeakDraft</title>
        <meta name="description" content="Transform AI-generated text into natural, human-sounding content. Bypass AI detectors and make your writing authentic with PeakDraft's free AI Text Humanizer." />
        <meta name="keywords" content="AI text humanizer, humanize AI text, AI content rewriter, bypass AI detection, natural writing, AI to human text, PeakDraft" />
        <link rel="canonical" href="https://peakdraft.netlify.app/app/humanizer" />
        <meta property="og:title" content="AI Text Humanizer | PeakDraft" />
        <meta property="og:description" content="Make AI-generated content sound natural and human. Free AI text humanizer tool." />
        <meta property="og:url" content="https://peakdraft.netlify.app/app/humanizer" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="max-w-5xl mx-auto">
        <HumanizeGenerator />
      </div>
    </>
  );
};

export default Humanizer;
