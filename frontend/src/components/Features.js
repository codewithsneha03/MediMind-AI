export default function Features() {

  const features = [
    {
      title: "Disease Prediction",
      description: "Predict possible diseases using AI-powered symptom analysis."
    },
    {
      title: "AI Chatbot",
      description: "Chat with an intelligent healthcare assistant anytime."
    },
    {
      title: "Medicine Suggestions",
      description: "Receive basic medicine and precaution recommendations."
    },
    {
      title: "Doctor Recommendation",
      description: "Find the right specialist based on symptoms and predictions."
    }
  ];

  return (
    <section className="py-20 px-8 bg-white">

      <h2 className="text-4xl font-bold text-center text-blue-700 mb-14">
        Features
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-blue-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition"
          >

            <h3 className="text-2xl font-semibold mb-4 text-blue-700">
              {feature.title}
            </h3>

            <p className="text-gray-700">
              {feature.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}