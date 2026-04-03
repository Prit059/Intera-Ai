import React from "react";
import { useDarkMode } from '../../context/DarkModeContext';
import SpotlightCard from "../../components/ReactBits/SpotlightCard";

const benefits = [
  {
    title: "Personalized Questions",
    desc: "Get interview questions tailored to your skills and experience.",
    icon: "🧑‍💻"
  },
  {
    title: "Instant Feedback",
    desc: "Receive actionable feedback to improve your answers.",
    icon: "⚡"
  },
  {
    title: "Real-world Scenarios",
    desc: "Practice with scenarios and coding challenges from real interviews.",
    icon: "🌐"
  },
  {
    title: "Progress Tracking",
    desc: "Monitor your improvement and readiness over time.",
    icon: "📈"
  },
  {
    title: "Anytime Access",
    desc: "Practice interviews whenever and wherever you want.",
    icon: "⏰"
  },
  {
    title: "Expert Insights",
    desc: "Learn from industry experts and get tips for success.",
    icon: "🎓"
  }
];

function KeyBenefits() {
  const { darkmode } = useDarkMode();

  React.useEffect(() => {
    document.documentElement.style.setProperty('--card-bg', darkmode ? '#fff' : '#18181b');
    document.documentElement.style.setProperty('--card-text', darkmode ? '#000' : '#fff');
  }, [darkmode]);

  return (
    <section className={`py-8 sm:py-14 px-4 ${!darkmode ? "bg-black text-white" : "bg-white text-black"}`}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-center">Key Benefits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, idx) => (
            <div className="animated-border" key={idx}>
              <SpotlightCard>
                <div className="animated-border-inner shadow-lg p-4 sm:p-6 h-full">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{benefit.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{benefit.title}</h3>
                  <p className="text-sm sm:text-base opacity-80">{benefit.desc}</p>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
    </section>
  );
}

export default KeyBenefits;