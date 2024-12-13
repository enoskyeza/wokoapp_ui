import Link from "next/link";

interface Prop {
    link: string
}
const BackButton = ({link}: Prop) => {
  return (
    <Link
      href={link}
      className="inline-flex items-center text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      <svg
        className="w-5 h-5 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 12H5m7-7l-7 7 7 7"
        />
      </svg>
      <span>Back</span>
    </Link>
  );
};

export default BackButton;
