/**
 * Footer Component
 * Minimal footer with copyright
 */

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-transparent mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600 dark:text-ivory">
        © {new Date().getFullYear()} BingeScore - Aggregate TV & Movie Ratings
      </div>
    </footer>
  );
}
