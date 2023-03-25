import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { chatAtom, roomIdAtom } from "../../atoms";
import { ChatType } from "../../types";

function Chat() {
	const roomId = useAtomValue(roomIdAtom);
	const [chat, setChat] = useAtom(chatAtom);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const channel = window.channel;
		if (channel && setChat) {
			channel.on("message-update", (data: any) => {
				setChat((ochat) => [...ochat, data]);
			});
		}
	}, [setChat]);

	const sendMessage = (event: any) => {
		event.preventDefault();
		const message = event.target.message.value;
		window.channel.emit("message-send", { roomId, message });
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div>
			<p className="text-3xl font-bold underline">Chat</p>
			<div>
				{chat.map((msg: ChatType, index: number) => (
					<p key={index}>
						{msg.sender}: {msg.message}
					</p>
				))}
			</div>
			<form onSubmit={sendMessage}>
				<input ref={inputRef} type="text" id="message" name="message" />
				<button type="submit"></button>
			</form>
		</div>
	);
}
export default Chat;
