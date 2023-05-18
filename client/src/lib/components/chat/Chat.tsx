import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { chatAtom, roomIdAtom } from "../../atoms";
import { ChatPropsType, ChatType } from "../../types";
import { clearFocus } from "../../utils";

function Chat({
	channel,
	wrapperClassName = "",
	scale = false,
	className = "",
}: ChatPropsType) {
	const roomId = useAtomValue(roomIdAtom);
	const [chat, setChat] = useAtom(chatAtom);
	const [scaling, setScaling] = useState(1);
	const inputRef = useRef<HTMLInputElement>(null);
	const chatRef = useRef<HTMLDivElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (channel && setChat && chatRef.current) {
			channel.on("message-update", (data: any) => {
				setChat((ochat) => [...ochat, data]);
				setTimeout(() => {
					chatRef?.current?.scrollTo({ top: 1000000000 });
					if (!data.sender.includes("[")) {
						wrapperRef?.current?.classList?.add("trigger-animation");
					}
				}, 100);
			});
		}
		return () => {
			if (channel) {
				channel.off("message-update");
			}
		};
	}, [channel, setChat, chatRef.current, wrapperRef.current]);

	useEffect(() => {
		setScaling((document.querySelector("canvas")?.clientWidth ?? 1157) / 1157);
		window.addEventListener("resize", (event) => {
			setScaling(
				(document.querySelector("canvas")?.clientWidth ?? 1157) / 1157
			);
		});
	}, [setScaling]);

	const sendMessage = (event: any, clearFocus = false) => {
		event.preventDefault();
		if (inputRef.current) {
			const message = inputRef.current.value;
			window.channel.emit("message-send", {
				roomId,
				message,
				sender: window.playerName ?? window.channel.id,
			});
			inputRef.current.value = "";
			inputRef.current.focus();
		}
	};

	return (
		<div
			ref={wrapperRef}
			className={`bg-gray-800 z-20 bg-opacity-0 rounded-md p-4 max-w-md hover:bg-opacity-90 transition-all duration-300 ${wrapperClassName}`}
			style={{ zoom: scale ? scaling : 1 }}
			onAnimationEnd={() => {
				wrapperRef?.current?.classList?.remove("trigger-animation");
			}}
		>
			<div
				ref={chatRef}
				className={`max-h-48 w-[26rem] overflow-hidden hover:overflow-auto mb-4 ${className}`}
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
						autoComplete="off"
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
