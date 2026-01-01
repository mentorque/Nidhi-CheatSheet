const Welcome = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
            <div className="w-10 h-10 bg-black rounded-sm"></div>
          </div>
          <span className="text-white font-bold text-4xl">Mentorque</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-bold mb-6">
          Welcome to Mentorque
        </h1>

      </div>
    </div>
  );
};

export default Welcome;

