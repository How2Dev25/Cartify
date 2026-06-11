
// This component is a simple modal that displays user details. It takes in a user object, a boolean to determine if the modal is open, and a function to close the modal. If the modal is open and there is a user, it renders the user's email and first name, along with a close button.
type User  = {
    id: string;
    email: string;
    first_name: string;
}

// define the props for the modal component
type ModalProps = {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;

}


export default  function Modal ({ user, isOpen, onClose }: ModalProps) {

    // if the modal is not open or there is no user, return null to not render anything
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center shadow-md  bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg text-black">
                <h2 className="text-xl font-bold mb-4">User Details</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>First Name:</strong> {user.first_name}</p>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );

}