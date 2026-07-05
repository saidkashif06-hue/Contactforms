import React, { useState } from "react";
import axios from "axios";


const App = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    const { data } = await axios.post(
      "https://contactforms-4eb6.onrender.com",
      formData
    );

    alert(data.message);

    if (data.success) {
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    }
  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message || "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="bg-slate-950 py-20">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="font-poppins text-sm font-semibold uppercase tracking-[4px] text-cyan-400">
            Contact Us
          </span>

          <h2 className="mt-4 font-monst text-4xl font-bold text-white md:text-5xl">
            Let's Talk About Your Project
          </h2>

          <p className="mt-4 font-poppins text-gray-400">
            Have an idea? Send us a message and we'll get back to you.
          </p>
        </div>

        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-xl md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Full Name
              </label>

              <input
              
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Message
              </label>

              <textarea
                rows={6}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default App;