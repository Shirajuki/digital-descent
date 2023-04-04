import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { chatAtom, roomIdAtom } from "../../atoms";
import { ChatPropsType, ChatType } from "../../types";
import { clearFocus } from "../../utils";

function Chat({ channel, className = "" }: ChatPropsType) {
	const roomId = useAtomValue(roomIdAtom);
	const [chat, setChat] = useAtom(chatAtom);
	const inputRef = useRef<HTMLInputElement>(null);
	const chatRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (channel && setChat && chatRef.current) {
			channel.on("message-update", (data: any) => {
				setChat((ochat) => [...ochat, data]);
				(window as any).test = chatRef.current;
				setTimeout(() => {
					chatRef?.current?.scrollTo({ top: chatRef?.current?.scrollHeight });
				}, 100);
			});
		}
	}, [channel, setChat, chatRef.current]);

	const sendMessage = (event: any, clearFocus = false) => {
		event.preventDefault();
		if (inputRef.current) {
			const message = inputRef.current.value;
			window.channel.emit("message-send", { roomId, message });
			inputRef.current.value = "";
			inputRef.current.focus();
		}
	};

	return (
		<div
			className={`bg-gray-800 z-20 bg-opacity-0 rounded-md p-4 max-w-md hover:bg-opacity-90 transition-all duration-300 ${className}`}
		>
			<div
				ref={chatRef}
				className="max-h-48 w-[26rem] overflow-hidden hover:overflow-auto mb-4"
			>
				{chat.map((msg: ChatType, index: number) => (
					<p key={index} className="pr-2 [overflow-wrap:break-word]">
						{msg.sender}: {msg.message}
					</p>
				))}
			</div>
			<div className="w-full flex justify-between gap-1">
				<form
					onSubmit={sendMessage}
					className="w-full flex justify-between gap-1"
				>
					<input
						ref={inputRef}
						className="text-black bg-gray-100 bg-opacity-90 w-full rounded-sm px-2"
						tabIndex={-1}
						type="text"
						id="message"
						name="message"
					/>
				</form>
				<button
					className="py-1 px-3 bg-slate-600 text-sm rounded-sm"
					tabIndex={-1}
					type="submit"
					onClick={(event) => {
						sendMessage(event);
						clearFocus();
					}}
				>
					Send
				</button>
			</div>
		</div>
	);
}
export default Chat;
