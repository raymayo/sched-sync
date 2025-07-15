import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, message, type }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/75">
			<div className="relative w-full max-w-[500px] rounded-lg bg-white p-6 shadow-lg">
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-5 right-5 cursor-pointer text-lg text-zinc-400 transition-all duration-300 hover:text-gray-900">
					<X />
				</button>
				<div className="">
					<img
						src={type === 'success' ? '/UI/OK.svg' : '/UI/ERR.svg'}
						alt={type === 'success' ? 'Success Icon' : 'Error Icon'}
						className="mx-auto h-60 w-60"
					/>
				</div>

				<div className="flex flex-col items-center justify-center">
					<h2
						className={`text-2xl font-semibold ${
							type === 'success' ? 'text-green-600' : 'text-red-600'
						}`}>
						{title}
					</h2>

					<p className="text-gray-700">{message}</p>

					<button
						onClick={onClose}
						className="mt-8 w-full cursor-pointer rounded-md bg-zinc-950 px-3 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-zinc-900">
						Okay
					</button>
				</div>
			</div>
		</div>
	);
};

export default Modal;
