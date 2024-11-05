import Image from 'next/image';
import contestantImg from '/public/contestant_boy.jpg';
import Link from "next/link";

const ContestantDetails = () => {
    // Sample data for illustration
    const contestant = {
        id: 'TF23001',
        firstName: 'Jane',
        lastName: 'Doe',
        age: 12,
        school: 'Bright Future Academy',
        gender: 'F',
        paymentStatus: 'NOT_PAID',
        parent: {
            name: 'John Doe',
            profession: 'Engineer',
            email: 'jondoe@example.com',
            phoneNumber: '+256 755 678901',
            address: 'Gulu City, Uganda',
        },
        toys: [
            {id: 1, name: 'Toy Car'},
            {id: 2, name: 'Doll House'},
            {id: 3, name: 'Action Figure'},
            {id: 4, name: 'Puzzle'},
        ],
    };

    return (
        <div className="max-w-5xl mx-auto px-6 space-y-6">
            {/* Top Card - Contestant Details */}
            <div className="bg-white shadow-lg rounded-lg p-6 ">
                <h2 className="text-xl font-semibold mb-4">Contestant Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-start justify-center">
                        <Image
                            src={contestantImg}
                            alt="Contestant"
                            className="rounded-md shadow-md object-cover"
                            width={150}
                            height={150}
                        />
                    </div>
                    <div className="sm:col-span-2 pl-4">
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {contestant.firstName} {contestant.lastName}</p>
                            <p><strong>ID No:</strong> {contestant.id}</p>
                            <p><strong>Age:</strong> {contestant.age}</p>
                            <p><strong>School:</strong> {contestant.school}</p>
                            <p><strong>Gender:</strong> {contestant.gender === 'M' ? 'Male' : 'Female'}</p>
                            <p className="flex items-center">
                                <strong>Payment Status:</strong>
                                <span className={`ml-2 px-2 py-1 text-xs rounded-md font-semibold ${
                                    contestant.paymentStatus === 'PAID' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                }`}>
                                {contestant.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                            </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower Left Card - Parent Details */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Parent Details</h2>
                <div className="space-y-2">
                    <p><strong>Name:</strong> {contestant.parent.name}</p>
                    <p><strong>Profession:</strong> {contestant.parent.profession}</p>
                    <p><strong>Email:</strong> {contestant.parent.email}</p>
                    <p><strong>Phone:</strong> {contestant.parent.phoneNumber}</p>
                    <p><strong>Address:</strong> {contestant.parent.address}</p>
                </div>
            </div>

            {/* Lower Right Card - Toy Gallery */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Toy Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {contestant.toys.map((toy) => (
                        <div
                            key={toy.id}
                            className="bg-gray-100 rounded-lg p-4 flex items-center justify-center text-center text-sm font-medium text-gray-700"
                        >
                            {toy.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Link href={'/dashboard'} className="underline cursor-pointer hover:text-red-500">Go back</Link>
                <button
                    className="w-full sm:w-auto bg-blue-300 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-blue-500 transition-colors">
                    Update Details
                </button>
                {contestant.paymentStatus === 'NOT_PAID' && (
                    <button
                        className="w-full sm:w-auto bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition-colors">
                        Approve Payment
                    </button>
                )}
            </div>
        </div>
    );
};

export default ContestantDetails;
