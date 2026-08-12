import Link from "next/link";

// No posts endpoint is wired into this embedded admin view yet, so the posts
// table renders an empty state instead of the fabricated blog rows it
// previously hardcoded. Bind to the CMS/blog endpoints when connecting it.

function page() {
  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-white">Posts</h1>
            <div className="flex items-center gap-3">
              <button className="text-white bg-white/20 p-3 rounded-xl">
                Create Post
              </button>
              <Link href="/admin/content-management/new">
                <button className="text-white bg-primary p-3 rounded-xl">
                  Upload Media
                </button>
              </Link>
            </div>
            <h2 className="text-2xl font-semibold text-white">All Posts</h2>
            <div className="overflow-x-auto border border-[#0ec277] rounded-2xl">
              <table className="w-full">
                <thead className="border-b border-[#0ec277]">
                  <tr>
                    <th className="text-left p-3">Title</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Author</th>
                    <th className="text-left p-3">Date</th>
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
        </div>
      </div>
    </div>
  );
}

export default page;
