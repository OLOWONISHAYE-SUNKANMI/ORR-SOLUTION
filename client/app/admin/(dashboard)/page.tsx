"use client";

// The embedded admin dashboard has no analytics/posts endpoint wired yet, so
// "Recent Posts" and the analytics tiles render empty states instead of the
// fabricated blog rows and traffic figures they previously hardcoded. Bind
// these regions to real endpoints when they exist.

function page() {
  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
            <div>
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-2">Welcome back! Here&apos;s your overview</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="flex items-center gap-3">
                <button className="text-white bg-white/20 hover:bg-white/30 p-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                  Create Post
                </button>
                <button className="text-white bg-primary hover:bg-primary/80 p-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                  Upload Media
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Recent Posts</h2>
              <div className="overflow-x-auto border border-primary/30 rounded-xl shadow-lg bg-gradient-to-br from-white/15 to-white/5">
                <table className="w-full">
                  <thead className="border-b border-primary/30 bg-white/5">
                    <tr>
                      <th className="text-left p-4 text-primary font-semibold">Title</th>
                      <th className="text-left p-4 text-primary font-semibold">Status</th>
                      <th className="text-left p-4 text-primary font-semibold">Author</th>
                      <th className="text-left p-4 text-primary font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="py-10 px-4 text-center text-gray-400 text-sm">
                        No posts to show yet.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white">Analytics Overview</h2>
            <div className="flex flex-col md:flex-row items-stretch gap-6">
              {["Website Traffic", "User Engagement"].map((label) => (
                <div
                  key={label}
                  className="border border-primary/30 basis-full md:basis-1/2 p-6 rounded-xl flex flex-col gap-2 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg"
                >
                  <p className="text-lg text-white font-semibold">{label}</p>
                  <p className="text-3xl font-bold text-white mt-2">&mdash;</p>
                  <p className="text-gray-400 text-sm mt-1">No analytics data available yet</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
