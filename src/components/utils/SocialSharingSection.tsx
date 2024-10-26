import { FaTwitter, FaFacebookF, FaLinkedinIn, FaRedditAlien } from 'react-icons/fa';
import { HiOutlineClipboardCopy } from 'react-icons/hi';

const SocialSharingSection = ({ eventLink }: { eventLink: string }) => {
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(eventLink);
            alert("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };

    return (
        <div className="mt-6 text-center">
            <p className="font-semibold text-gray-500 text-xs">Don&apos;t forget to share:</p>
            <div className="flex justify-center space-x-2 mt-3">
                <a href={`https://twitter.com/intent/tweet?text=${eventLink}`} rel="noopener noreferrer"
                   className="flex items-center py-1 px-2 bg-blue-500 text-white text-xs font-semibold hover:text-blue-600 gap-1"
                >
                    <FaTwitter size={14}/>
                    <span>
                        Share
                    </span>
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${eventLink}`}
                   rel="noopener noreferrer"
                   target="_blank" className="flex items-center text-xs font-semibold gap-1 px-2 py-1 text-white bg-blue-700 hover:bg-blue-800"
                >

                    <FaFacebookF size={14} />
                    <span >
                        share
                    </span>
                </a>
                <a href={`https://www.linkedin.com/shareArticle?url=${eventLink}`}
                   rel="noopener noreferrer"
                   target="_blank" className="flex items-center text-xs font-semibold gap-1.5 px-2 py-1 text-white bg-blue-700 hover:bg-blue-800"
                >
                        <FaLinkedinIn size={14} />
                    <span>
                        Share
                    </span>
                </a>
                <a href={`http://www.reddit.com/submit?url=${eventLink}`}
                   rel="noopener noreferrer"
                   target="_blank" className="flex items-center text-xs font-semibold gap-1.5 px-2 py-1 text-white bg-orange-500 hover:bg-orange-600"
                >
                    <FaRedditAlien size={14} />
                    <span>
                        Share
                    </span>
                </a>
                {/* Copy Link Button */}
                <button
                    onClick={handleCopyLink}
                    className="flex items-center text-xs font-semibold gap-1 px-2 py-1 text-white bg-gray-500 hover:bg-gray-600 focus:outline-none"
                >
                    <HiOutlineClipboardCopy size={14} />
                    <span>Copy link</span>
                </button>
            </div>
        </div>
    );
};

export default SocialSharingSection;
