import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { chatAtom, roomIdAtom } from "../../atoms";
import { ChatType } from "../../types";

function Chat() {
	const roomId = useAtomValue(roomIdAtom);
	const [chat, setChat] = useAtom(chatAtom);
	const inputRef = useRef<HTMLInputElement>(null);
	const chatRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const channel = window.channel;
		if (channel && setChat && chatRef.current) {
			console.log(chatRef.current);
			channel.on("message-update", (data: any) => {
				setChat((ochat) => [...ochat, data]);
				(window as any).test = chatRef.current;
				setTimeout(() => {
					chatRef?.current?.scrollTo({ top: chatRef?.current?.scrollHeight });
				}, 100);
			});
		}
	}, [setChat, chatRef.current]);

	const sendMessage = (event: any) => {
		event.preventDefault();
		const message = event.target.message.value;
		window.channel.emit("message-send", { roomId, message });
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div className="bg-slate-700 bg-opacity-70 rounded-md p-4 max-w-md">
			<div ref={chatRef} className="max-h-48 overflow-auto mb-4">
				{chat.map((msg: ChatType, index: number) => (
					<p key={index} className="pr-2">
						{msg.sender}: {msg.message}
					</p>
				))}
			</div>
			<form
				onSubmit={sendMessage}
				className="w-full flex justify-between gap-1"
			>
				<input
					ref={inputRef}
					className="text-black bg-gray-100 bg-opacity-90 w-full rounded-sm"
					type="text"
					id="message"
					name="message"
				/>
				<button
					className="py-1 px-3 bg-slate-600 text-sm rounded-sm"
					type="submit"
				>
					Send
				</button>
			</form>
		</div>
	);
}
export default Chat;
