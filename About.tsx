
const About = () => {

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">About LinguaLearner</h1>
        <p className="text-lg sm:text-xl">
          Your trusted companion for language learning
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-md space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Our Mission</h2>
          <p className="mt-2">
            To make language learning accessible, enjoyable, and effective for everyone through innovative technology and community-driven approaches.
          </p>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">What We Offer</h2>
          <ul className="mt-2 space-y-2">
            <li>• Comprehensive dictionary with examples and pronunciations</li>
            <li>• Active community forum for language exchange</li>
            <li>• Interactive quizzes to test your knowledge</li>
            <li>• Gamified learning experience to keep you motivated</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Get Started</h2>
          <p className="mt-2">
            Join our community today and begin your language learning journey with LinguaLearner. Whether you're a beginner or advanced learner, we have something for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
