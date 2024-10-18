import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-gray-900">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <Link href="/">game</Link>
        </div>
        <ul className="flex space-x-6 text-gray-300">
          <li>
            <Link href="/" className="hover:text-white transition duration-300">
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="hover:text-white transition duration-300"
            >
              Login
            </Link>
          </li>
          <li>
            <Link
              href="/signup"
              className="hover:text-white transition duration-300"
            >
              Signup
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;