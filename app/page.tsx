import Link from 'next/link';
import Nav from '@/components/Nav';
import { getAllBranchStats, getRepoMeta, REPO_OWNER, REPO_NAME, ROOT_USER, getBranch } from '@/lib/github';
import type { BranchStat } from '@/lib/github';
import { timeAgo, displayName, shortMsg } from '@/lib/utils';
import { IconBranch, IconCommit, IconFork, IconStar, IconEye, IconGroup } from '@/components/BranchIcon';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';

// ...

const branchName = params.branch;

if (branchName.toUpperCase() === 'MFDOGE' && branchName !== 'MFDOGE') {
  redirect('/MFDOGE');
}
// Add any other imports your full page needs (e.g. for iframe, metadata, etc.)

interface Props {
  params: { branch: string };
}

export default async function ProfilePage({ params }: Props) {
  const branchName = params.branch;

  const branchData = await getBranch(branchName);

  if (!branchData || !branchData.exists) {
    notFound();
  }

  // If you have repo-wide data fetches, keep them here
  const repoMeta = await getRepoMeta();
  const allStats = await getAllBranchStats();

  // Your main page content starts here — replace/add the rest as needed
  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        {/* Example: Profile header / branch info */}
        <h1 className="text-5xl font-bold mb-4">{displayName(branchName)}</h1>
        
        {/* Iframe for user index.html — adjust src/path as in your original */}
        <iframe
          src={`/api/profile-html/${branchName}`}
          className="w-full h-[80vh] border border-gray-800 rounded-xl"
          title={`${branchName}'s profile`}
        />

        {/* Branch stats, commits, etc. — add your existing UI components */}
        <section className="mt-12">
          <h2 className="text-3xl font-semibold mb-6">Recent Activity</h2>
          {/* Example placeholder — replace with your commit list or stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-900 rounded-xl">
              <IconCommit className="w-8 h-8 mb-2" />
              <p>Commits: {/* value from branchData */}</p>
            </div>
            {/* Add more stats cards */}
          </div>
        </section>

        {/* Links to GitHub */}
        <div className="mt-8 text-center">
          <a
            href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${branchName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            View on GitHub →
          </a>
        </div>
      </main>

      {/* Footer or other global elements */}
    </div>
  );
}
